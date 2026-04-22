import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const rows = [
  { v: "TV_GBP_Spend", type: "Spend", unit: "£", agg: "Sum", fill: "0", flag: null },
  { v: "TV_Impressions", type: "Impression", unit: "000s", agg: "Sum", fill: "0", flag: null },
  { v: "Digital_Display", type: "Spend", unit: "£", agg: "Sum", fill: "0", flag: null },
  { v: "Paid_Social_Clicks", type: "Click", unit: "count", agg: "Sum", fill: "0", flag: "missing 2 wks" },
  { v: "Price_Index", type: "Index", unit: "ratio", agg: "Mean", fill: "carry", flag: null },
  { v: "Promo_Depth", type: "Promo", unit: "%", agg: "Mean", fill: "0", flag: null },
];

export function VariablePropertiesCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Variable Properties
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5">Type · Unit · Aggregation · Fill</p>
      </div>
      <div className="p-3">
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-semibold px-3 py-1.5">Variable</th>
                <th className="text-left font-semibold px-3 py-1.5">Type</th>
                <th className="text-left font-semibold px-3 py-1.5">Unit</th>
                <th className="text-left font-semibold px-3 py-1.5">Agg</th>
                <th className="text-left font-semibold px-3 py-1.5">Missing</th>
                <th className="text-right font-semibold px-3 py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.v} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-1.5 font-mono text-[11px]">{r.v}</td>
                  <td className="px-3 py-1.5">
                    <Badge variant="outline" className="text-[9px] h-4">{r.type}</Badge>
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">{r.unit}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{r.agg}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{r.fill}</td>
                  <td className="px-3 py-1.5 text-right">
                    {r.flag ? (
                      <span className="text-[10px] text-warning">{r.flag}</span>
                    ) : (
                      <span className="text-[10px] text-success">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">1 variable needs review</span>
        <Button size="sm" className="h-7 text-[11px]">Save properties</Button>
      </div>
    </div>
  );
}
