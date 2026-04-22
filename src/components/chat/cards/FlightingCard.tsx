import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Spend in £k per channel per month (rows × 12)
const flighting: { channel: string; values: number[] }[] = [
  { channel: "TV",      values: [320, 280, 200,  80,   0,   0, 120, 240, 320, 360, 400, 440] },
  { channel: "Digital", values: [120, 120, 140, 160, 180, 180, 160, 140, 140, 160, 180, 200] },
  { channel: "OOH",     values: [ 40,  40,  60,  60,  20,   0,   0,  40,  60,  40,  60,  60] },
  { channel: "Radio",   values: [ 30,  30,  20,   0,   0,  20,  30,  30,  30,  20,  30,  20] },
  { channel: "Promo",   values: [  0,   0, 100, 200, 100,   0,   0, 100, 100,   0,   0,  70] },
];

const max = Math.max(...flighting.flatMap((r) => r.values));

const heat = (v: number) => {
  if (v === 0) return "bg-muted/40";
  const intensity = v / max;
  if (intensity > 0.75) return "bg-primary text-primary-foreground";
  if (intensity > 0.5) return "bg-primary/70 text-primary-foreground";
  if (intensity > 0.25) return "bg-primary/40 text-foreground";
  return "bg-primary/20 text-foreground";
};

export function FlightingCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Flighting Pattern
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Monthly spend (£k) · 2025 plan</p>
        </div>
        <Badge variant="outline" className="text-[10px]">12 mo</Badge>
      </div>

      <div className="p-3 overflow-x-auto">
        <table className="w-full text-[10px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider px-1 w-16">
                Channel
              </th>
              {months.map((m) => (
                <th key={m} className="text-center font-medium text-muted-foreground uppercase">
                  {m}
                </th>
              ))}
              <th className="text-right font-semibold text-muted-foreground uppercase tracking-wider px-1 w-12">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {flighting.map((row) => {
              const total = row.values.reduce((a, b) => a + b, 0);
              return (
                <tr key={row.channel}>
                  <td className="text-xs font-medium text-foreground px-1">{row.channel}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="p-0">
                      <div
                        className={`h-7 w-full rounded flex items-center justify-center text-[9px] font-semibold transition-transform hover:scale-110 ${heat(v)}`}
                        title={`${row.channel} · ${months[i]} · £${v}k`}
                      >
                        {v > 0 ? v : ""}
                      </div>
                    </td>
                  ))}
                  <td className="text-xs font-semibold text-foreground text-right px-1 tabular-nums">
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Intensity</span>
          <div className="flex items-center gap-0.5">
            <div className="w-3 h-3 rounded bg-muted/40" />
            <div className="w-3 h-3 rounded bg-primary/20" />
            <div className="w-3 h-3 rounded bg-primary/40" />
            <div className="w-3 h-3 rounded bg-primary/70" />
            <div className="w-3 h-3 rounded bg-primary" />
          </div>
        </div>
        <Button size="sm" className="h-7 text-[11px]">Export plan</Button>
      </div>
    </div>
  );
}
