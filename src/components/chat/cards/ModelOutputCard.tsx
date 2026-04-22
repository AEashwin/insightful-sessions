import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const metrics = [
  { label: "R²", value: "0.94", note: "Strong fit", tone: "success" as const },
  { label: "MAPE", value: "8.2%", note: "Good accuracy", tone: "success" as const },
  { label: "DW", value: "1.61", note: "Borderline", tone: "warning" as const },
];

const contributions = [
  { label: "Base", pct: 52, color: "hsl(var(--navy))" },
  { label: "TV", pct: 18, color: "hsl(var(--primary))" },
  { label: "Digital", pct: 14, color: "hsl(249 42% 70%)" },
  { label: "Promo", pct: 9, color: "hsl(174 60% 45%)" },
  { label: "Seasonality", pct: 4, color: "hsl(var(--success))" },
  { label: "Other", pct: 3, color: "hsl(var(--border))" },
];

const rows = [
  { v: "TV_GBP_Spend", g: "TV", c: "18.2%", s: "£2,400k", roi: 3.2 },
  { v: "Digital_Display", g: "Digital", c: "8.4%", s: "£680k", roi: 2.8 },
  { v: "Paid_Social", g: "Digital", c: "5.6%", s: "£520k", roi: 2.4 },
  { v: "OOH_Panels", g: "OOH", c: "4.2%", s: "£380k", roi: 2.1 },
  { v: "Radio_Spots", g: "Radio", c: "3.8%", s: "£290k", roi: 1.8 },
  { v: "Promo_Depth", g: "Promo", c: "9.0%", s: "£1,100k", roi: 1.2 },
  { v: "Print_Insertions", g: "Print", c: "1.4%", s: "£180k", roi: 0.9 },
];

const roiCls = (roi: number) =>
  roi >= 2.5
    ? "bg-success/10 text-success"
    : roi >= 1.5
    ? "bg-warning/10 text-warning"
    : "bg-destructive/10 text-destructive";

export function ModelOutputCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Model Output
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Batch 2 · Model 0</p>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">
          Run Complete
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={`rounded-lg p-3 ${
                m.tone === "success" ? "bg-success/5" : "bg-warning/5"
              }`}
            >
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {m.label}
              </p>
              <p className="text-xl font-bold text-foreground mt-0.5">{m.value}</p>
              <p
                className={`text-[10px] mt-1 ${
                  m.tone === "success" ? "text-success" : "text-warning"
                }`}
              >
                {m.note}
              </p>
            </div>
          ))}
        </div>

        {/* Contribution bar */}
        <div>
          <p className="text-[11px] font-semibold text-foreground mb-2">
            Volume Contribution Decomposition
          </p>
          <div className="h-7 rounded-md overflow-hidden flex">
            {contributions.map((c) => (
              <div
                key={c.label}
                style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                className="flex items-center justify-center"
              >
                {c.pct >= 9 && (
                  <span className="text-[10px] font-semibold text-white">{c.pct}%</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {contributions.map((c) => (
              <div key={c.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: c.color }} />
                <span className="text-[10px] text-muted-foreground">
                  {c.label} {c.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top variables */}
        <div>
          <p className="text-[11px] font-semibold text-foreground mb-2">Top variables by ROI</p>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-3 py-1.5">Variable</th>
                  <th className="text-left font-semibold px-3 py-1.5">Group</th>
                  <th className="text-right font-semibold px-3 py-1.5">Contrib.</th>
                  <th className="text-right font-semibold px-3 py-1.5">Spend</th>
                  <th className="text-right font-semibold px-3 py-1.5">ROI</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.v} className="border-t border-border">
                    <td className="px-3 py-1.5 font-mono text-[11px]">{r.v}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{r.g}</td>
                    <td className="px-3 py-1.5 text-right">{r.c}</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{r.s}</td>
                    <td className="px-3 py-1.5 text-right">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${roiCls(
                          r.roi
                        )}`}
                      >
                        {r.roi}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
        <span className="text-[11px] text-muted-foreground">
          Jan 2022 – Dec 2024 · 156 weeks
        </span>
        <Button size="sm" className="h-7 text-[11px] gap-1">
          Proceed to Simulation <ArrowRight size={11} />
        </Button>
      </div>
    </div>
  );
}
