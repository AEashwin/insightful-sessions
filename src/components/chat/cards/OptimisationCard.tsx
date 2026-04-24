import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Channel {
  name: string;
  current: number; // £k
  optimised: number; // £k
}

const initial: Channel[] = [
  { name: "TV", current: 2400, optimised: 2760 },
  { name: "Digital", current: 1200, optimised: 1440 },
  { name: "OOH", current: 380, optimised: 360 },
  { name: "Radio", current: 290, optimised: 240 },
  { name: "Promo", current: 1100, optimised: 570 },
];

export function OptimisationCard() {
  const [channels, setChannels] = useState(initial);
  const [narration, setNarration] = useState<string>("");
  const [narrating, setNarrating] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const totalCurrent = channels.reduce((s, c) => s + c.current, 0);
  const totalOpt = channels.reduce((s, c) => s + c.optimised, 0);
  const max = Math.max(...channels.map((c) => Math.max(c.current, c.optimised)));

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setNarrating(true);
      try {
        const { data, error } = await supabase.functions.invoke("card-insights", {
          body: { kind: "optimisation_narration", context: { channels, totalCurrent, totalOpt } },
        });
        if (error || data?.error) throw new Error(data?.error ?? error?.message);
        if (data?.narration) setNarration(data.narration);
      } catch (e) {
        console.error("optimisation narration failed", e);
      } finally {
        setNarrating(false);
      }
    }, 600);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [channels, totalCurrent, totalOpt]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Spend Optimisation
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Optimised vs current allocation</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
          +12.4% ROI
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-muted/40 p-2.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current</p>
            <p className="text-sm font-bold text-foreground mt-0.5">£{(totalCurrent / 1000).toFixed(2)}M</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-2.5">
            <p className="text-[10px] text-primary uppercase tracking-wider">Optimised</p>
            <p className="text-sm font-bold text-foreground mt-0.5">£{(totalOpt / 1000).toFixed(2)}M</p>
          </div>
          <div className="rounded-lg bg-success/5 p-2.5">
            <p className="text-[10px] text-success uppercase tracking-wider">Forecast lift</p>
            <p className="text-sm font-bold text-foreground mt-0.5">+£540k</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {channels.map((c, i) => {
            const delta = c.optimised - c.current;
            const deltaPct = ((delta / c.current) * 100).toFixed(0);
            const up = delta > 0;
            return (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className={`flex items-center gap-0.5 font-semibold ${up ? "text-success" : "text-destructive"}`}>
                    {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {Math.abs(parseInt(deltaPct))}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground w-12 shrink-0">Current</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-muted-foreground/40"
                        style={{ width: `${(c.current / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-12 text-right tabular-nums">
                      £{c.current}k
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-primary w-12 shrink-0">Optimised</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(c.optimised / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-foreground w-12 text-right tabular-nums">
                      £{c.optimised}k
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={max * 1.2}
                  step={10}
                  value={c.optimised}
                  onChange={(e) => {
                    const next = [...channels];
                    next[i] = { ...c, optimised: parseInt(e.target.value) };
                    setChannels(next);
                  }}
                  className="w-full accent-primary h-1"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Constraints: total ±10%, min per channel</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-[11px]">Reset</Button>
          <Button size="sm" className="h-7 text-[11px]">Save scenario</Button>
        </div>
      </div>
    </div>
  );
}
