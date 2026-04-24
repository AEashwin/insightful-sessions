import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Insight {
  tone: "success" | "destructive" | "warning" | "primary";
  title: string;
  body: string;
}

const fallback: Insight[] = [
  { tone: "success", title: "TV is the strongest channel", body: "TV delivers 3.2x ROI and 18.2% contribution — the highest of all media." },
  { tone: "destructive", title: "Promo_Depth is dragging efficiency", body: "Promo at 1.2x ROI is below break-even when factoring overheads." },
  { tone: "warning", title: "Borderline autocorrelation (DW = 1.61)", body: "Suggests mild residual structure. Consider adding a lag term." },
  { tone: "primary", title: "Headroom in Digital", body: "Digital is operating in the linear region of its saturation curve." },
];

const iconFor = { success: TrendingUp, destructive: TrendingDown, warning: AlertTriangle, primary: Lightbulb } as const;

const toneClasses: Record<Insight["tone"], { bg: string; text: string; iconBg: string }> = {
  success: { bg: "bg-success/5", text: "text-success", iconBg: "bg-success/10" },
  destructive: { bg: "bg-destructive/5", text: "text-destructive", iconBg: "bg-destructive/10" },
  warning: { bg: "bg-warning/5", text: "text-warning", iconBg: "bg-warning/10" },
  primary: { bg: "bg-primary/5", text: "text-primary", iconBg: "bg-primary/10" },
};

const modelContext = {
  rsq: 0.87,
  mape: 0.082,
  durbin_watson: 1.61,
  channels: [
    { name: "TV", roi: 3.2, contribution_pct: 18.2, spend_k: 2400 },
    { name: "Digital", roi: 2.4, contribution_pct: 12.5, spend_k: 1200, note: "linear region of saturation" },
    { name: "OOH", roi: 1.8, contribution_pct: 4.1, spend_k: 380 },
    { name: "Radio", roi: 1.5, contribution_pct: 2.8, spend_k: 290 },
    { name: "Promo", roi: 1.2, contribution_pct: 8.6, spend_k: 1100, note: "below break-even after overheads" },
  ],
  base_pct: 53.8,
};

export function ModelSummaryCard() {
  const [insights, setInsights] = useState<Insight[]>(fallback);
  const [loading, setLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("card-insights", {
        body: { kind: "model_summary", context: modelContext },
      });
      if (error || data?.error) throw new Error(data?.error ?? error?.message);
      if (Array.isArray(data?.insights) && data.insights.length > 0) {
        setInsights(data.insights.slice(0, 4));
        setAiGenerated(true);
      }
    } catch (e) {
      console.error("model summary AI failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Model Summary
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-2">
            {aiGenerated ? "AI-generated insights" : "Insights"} · Batch 2
            {loading && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
          </p>
        </div>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={generate} disabled={loading}>
          <RefreshCw size={12} />
        </Button>
      </div>
      <div className="p-3 space-y-2">
        {insights.map((i, idx) => {
          const t = toneClasses[i.tone];
          const Icon = iconFor[i.tone];
          return (
            <div key={`${i.title}-${idx}`} className={`rounded-lg ${t.bg} p-3 flex gap-3`}>
              <div className={`h-7 w-7 rounded-md ${t.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={13} className={t.text} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${t.text}`}>{i.title}</p>
                <p className="text-[11px] text-foreground/80 mt-0.5 leading-relaxed">{i.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {insights.length} insights · {aiGenerated ? "grounded by AI on model outputs" : "loading…"}
        </span>
        <Button size="sm" className="h-7 text-[11px]">Proceed to optimisation</Button>
      </div>
    </div>
  );
}
