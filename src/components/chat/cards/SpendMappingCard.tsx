import { ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mapped = [
  { spend: "TV_GBP_Spend", target: "TV_Impressions", kind: "Impressions" },
  { spend: "Digital_Display", target: "Display_Impressions", kind: "Impressions" },
  { spend: "Paid_Social", target: "Social_Clicks", kind: "Clicks" },
  { spend: "OOH_Panels", target: "OOH_Impressions", kind: "Impressions" },
];

const unmapped = [
  { spend: "Radio_Spots", suggestion: "Radio_GRPs" },
  { spend: "Print_Insertions", suggestion: "Print_Circulation" },
];

export function SpendMappingCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Spend Mapping
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5">Map spend → impressions / clicks</p>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-[11px] font-semibold text-foreground mb-2">Mapped ({mapped.length})</p>
          <div className="space-y-1.5">
            {mapped.map((m) => (
              <div
                key={m.spend}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30 border border-border"
              >
                <span className="font-mono text-[11px] text-foreground flex-1">{m.spend}</span>
                <ArrowRight size={11} className="text-muted-foreground" />
                <span className="font-mono text-[11px] text-foreground flex-1">{m.target}</span>
                <Badge variant="outline" className="text-[9px] h-4">{m.kind}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-warning mb-2 flex items-center gap-1">
            <AlertCircle size={11} /> Unmapped ({unmapped.length})
          </p>
          <div className="space-y-1.5">
            {unmapped.map((u) => (
              <div
                key={u.spend}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-warning/5 border border-warning/20"
              >
                <span className="font-mono text-[11px] text-foreground flex-1">{u.spend}</span>
                <ArrowRight size={11} className="text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground flex-1">
                  Suggested: <span className="font-mono">{u.suggestion}</span>
                </span>
                <Button size="sm" variant="outline" className="h-6 text-[10px]">
                  Accept
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">4 of 6 spend variables mapped</span>
        <Button size="sm" className="h-7 text-[11px]">Apply AI mapping</Button>
      </div>
    </div>
  );
}
