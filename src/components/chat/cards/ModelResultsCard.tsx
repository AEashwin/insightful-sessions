import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const metrics = [
  { label: "R²", value: "0.94", tone: "success" },
  { label: "Adj R²", value: "0.92", tone: "success" },
  { label: "MAPE", value: "8.2%", tone: "success" },
  { label: "DW", value: "1.61", tone: "warning" },
];

const split = [
  { label: "Base", pct: 52, color: "hsl(var(--navy))" },
  { label: "Incremental", pct: 48, color: "hsl(var(--primary))" },
];

const channels = [
  { v: "TV", spend: "£2.4M", contrib: "18.2%", roi: 3.2 },
  { v: "Digital", spend: "£1.2M", contrib: "14.0%", roi: 2.6 },
  { v: "OOH", spend: "£380k", contrib: "4.2%", roi: 2.1 },
  { v: "Radio", spend: "£290k", contrib: "3.8%", roi: 1.8 },
  { v: "Promo", spend: "£1.1M", contrib: "9.0%", roi: 1.2 },
];

const roiCls = (r: number) =>
  r >= 2.5 ? "bg-success/10 text-success" : r >= 1.5 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";

// Donut chart
function Donut() {
  const total = split.reduce((a, b) => a + b.pct, 0);
  let cumulative = 0;
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
      {split.map((s) => {
        const dash = (s.pct / total) * circ;
        const offset = (cumulative / total) * circ;
        cumulative += s.pct;
        return (
          <circle
            key={s.label}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
          />
        );
      })}
    </svg>
  );
}

export function ModelResultsCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Model Results
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Batch 2 · Model 0</p>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">
          Converged
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={`rounded-lg p-2.5 ${m.tone === "success" ? "bg-success/5" : "bg-warning/5"}`}
            >
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {m.label}
              </p>
              <p className="text-lg font-bold text-foreground mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Donut />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Split</p>
              <p className="text-sm font-bold text-foreground">52/48</p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {split.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-[11px] font-medium text-foreground">{s.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">{s.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-foreground mb-2">ROI by channel</p>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-3 py-1.5">Channel</th>
                  <th className="text-right font-semibold px-3 py-1.5">Spend</th>
                  <th className="text-right font-semibold px-3 py-1.5">Contrib.</th>
                  <th className="text-right font-semibold px-3 py-1.5">ROI</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((c) => (
                  <tr key={c.v} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-1.5 font-medium">{c.v}</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{c.spend}</td>
                    <td className="px-3 py-1.5 text-right">{c.contrib}</td>
                    <td className="px-3 py-1.5 text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${roiCls(c.roi)}`}>
                        {c.roi}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">156 weeks · Jan 22 – Dec 24</span>
        <Button size="sm" className="h-7 text-[11px]">View summary</Button>
      </div>
    </div>
  );
}
