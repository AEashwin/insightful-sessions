import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const variables = [
  { v: "TV_GBP_Spend", transform: "Adstock", decay: 0.5, gamma: 0.7, sat: true },
  { v: "Digital_Display", transform: "Adstock", decay: 0.3, gamma: 0.6, sat: true },
  { v: "Paid_Social", transform: "Adstock", decay: 0.2, gamma: 0.5, sat: true },
  { v: "OOH_Panels", transform: "Adstock", decay: 0.4, gamma: 0.65, sat: true },
  { v: "Radio_Spots", transform: "Adstock", decay: 0.35, gamma: 0.55, sat: true },
  { v: "Promo_Depth", transform: "Direct", decay: null, gamma: null, sat: false },
  { v: "Price_Index", transform: "Direct", decay: null, gamma: null, sat: false },
];

// Simple S-curve sparkline using CSS
function Sparkline({ active }: { active: boolean }) {
  if (!active) return <span className="text-[10px] text-muted-foreground">—</span>;
  const points = Array.from({ length: 20 }, (_, i) => {
    const x = i / 19;
    const y = 1 - 1 / (1 + Math.exp(8 * (x - 0.5)));
    return `${i * 4},${20 - y * 18}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 80 20" className="w-16 h-5">
      <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    </svg>
  );
}

const cls = (t: string) =>
  t === "Adstock"
    ? "bg-primary/10 text-primary"
    : t === "Direct"
    ? "bg-muted text-foreground"
    : "bg-success/10 text-success";

export function ModelTransformationsCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Model Variables & Transformations
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5">
          Direct · Adstock · Gamma · Saturation
        </p>
      </div>
      <div className="p-3">
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-semibold px-3 py-1.5">Variable</th>
                <th className="text-left font-semibold px-3 py-1.5">Transform</th>
                <th className="text-right font-semibold px-3 py-1.5">Decay</th>
                <th className="text-right font-semibold px-3 py-1.5">Gamma</th>
                <th className="text-center font-semibold px-3 py-1.5">Saturation</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((r) => (
                <tr key={r.v} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-1.5 font-mono text-[11px]">{r.v}</td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${cls(r.transform)}`}>
                      {r.transform}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right text-muted-foreground">
                    {r.decay !== null ? r.decay.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right text-muted-foreground">
                    {r.gamma !== null ? r.gamma.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex justify-center">
                      <Sparkline active={r.sat} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">5 media · 2 non-media · saturation auto-fit</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-[11px]">Edit transforms</Button>
          <Button size="sm" className="h-7 text-[11px]">Run model</Button>
        </div>
      </div>
    </div>
  );
}
