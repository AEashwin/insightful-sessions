import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const detected = [
  { name: "Date", type: "Date", coverage: "100%" },
  { name: "Sales_Volume", type: "Numeric", coverage: "100%" },
  { name: "TV_GBP_Spend", type: "Numeric", coverage: "98%" },
  { name: "Digital_Display", type: "Numeric", coverage: "100%" },
  { name: "Paid_Social", type: "Numeric", coverage: "96%" },
  { name: "Promo_Depth", type: "Numeric", coverage: "100%" },
];

interface DataUploadCardProps {
  onProceed?: () => void;
}

export function DataUploadCard({ onProceed }: DataUploadCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Data Upload
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Datacube · Brand4 UK</p>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">
          <CheckCircle2 size={10} className="mr-1" /> Validated
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        <div className="border-2 border-dashed border-border rounded-lg p-4 flex items-center gap-3 bg-muted/20">
          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">brand4_uk_weekly.csv</p>
            <p className="text-[10px] text-muted-foreground">156 weeks · 42 columns · 2.1 MB</p>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1">
            <Upload size={11} /> Replace
          </Button>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-foreground mb-2">Auto-detected columns (6 of 42)</p>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-3 py-1.5">Column</th>
                  <th className="text-left font-semibold px-3 py-1.5">Type</th>
                  <th className="text-right font-semibold px-3 py-1.5">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {detected.map((d) => (
                  <tr key={d.name} className="border-t border-border">
                    <td className="px-3 py-1.5 font-mono text-[11px]">{d.name}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{d.type}</td>
                    <td className="px-3 py-1.5 text-right text-success">{d.coverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">No issues found</span>
        <Button size="sm" className="h-7 text-[11px]" onClick={onProceed}>Proceed to classification</Button>
      </div>
    </div>
  );
}
