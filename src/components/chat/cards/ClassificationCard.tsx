import { useState } from "react";
import { AlertTriangle, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Variable {
  id: string;
  name: string;
  group: string;
  sign: "+" | "−";
  flagged: boolean;
  note?: string;
}

const initial: Variable[] = [
  { id: "1", name: "TV_GBP_Spend", group: "Media", sign: "+", flagged: false },
  { id: "2", name: "Digital_Display_Imp", group: "Media", sign: "+", flagged: false },
  { id: "3", name: "Paid_Social_Clicks", group: "Media", sign: "+", flagged: false },
  { id: "4", name: "OOH_Panels", group: "Media", sign: "+", flagged: false },
  { id: "5", name: "Radio_Spots", group: "Media", sign: "+", flagged: false },
  { id: "6", name: "Print_Insertions", group: "Media", sign: "+", flagged: false },
  { id: "7", name: "Price_Index", group: "Pricing", sign: "+", flagged: true, note: "Sign should be negative" },
  { id: "8", name: "Promo_Depth", group: "Pricing", sign: "+", flagged: false },
  { id: "9", name: "Seasonality_Christmas", group: "Seasonality", sign: "+", flagged: false },
  { id: "10", name: "Competitor_TV_GRP", group: "Media", sign: "−", flagged: true, note: "Should be Competitive group" },
  { id: "11", name: "Distribution_WD", group: "Base", sign: "+", flagged: false },
  { id: "12", name: "Base_Trend", group: "Base", sign: "+", flagged: false },
];

export function ClassificationCard() {
  const [vars, setVars] = useState(initial);
  const [applied, setApplied] = useState(false);
  const flagged = vars.filter((v) => v.flagged).length;

  const applyAI = () => {
    setVars((prev) =>
      prev.map((v) => {
        if (v.id === "10") return { ...v, group: "Competitive", flagged: false, note: undefined };
        if (v.id === "7") return { ...v, sign: "−" as const, flagged: false, note: undefined };
        return v;
      })
    );
    setApplied(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Variable Classification
            </p>
            <p className="text-sm font-semibold text-foreground mt-0.5">12 variables · {flagged} flagged</p>
          </div>
          {flagged > 0 ? (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px]">
              <AlertTriangle size={10} className="mr-1" />
              Needs review
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">
              <Check size={10} className="mr-1" />
              All resolved
            </Badge>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[280px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 sticky top-0">
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left font-semibold px-4 py-2">Variable</th>
              <th className="text-left font-semibold px-3 py-2">Group</th>
              <th className="text-center font-semibold px-3 py-2 w-12">Sign</th>
              <th className="text-center font-semibold px-3 py-2 w-16">Flag</th>
            </tr>
          </thead>
          <tbody>
            {vars.map((v) => (
              <FragmentRow key={v.id}>
                <tr
                  className={`border-t border-border ${v.flagged ? "bg-warning/5" : ""}`}
                >
                  <td className="px-4 py-2 font-mono text-[11px] font-medium text-foreground">
                    {v.name}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{v.group}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`inline-block w-6 h-6 rounded text-[11px] font-bold leading-6 ${
                        v.sign === "+"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {v.sign}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {v.flagged ? (
                      <AlertTriangle size={12} className="text-warning inline" />
                    ) : (
                      <Check size={12} className="text-success/60 inline" />
                    )}
                  </td>
                </tr>
                {v.flagged && v.note && (
                  <tr className="bg-warning/5">
                    <td colSpan={4} className="px-4 pb-2 pt-0">
                      <span className="text-[10px] text-warning italic">↳ {v.note}</span>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
        {flagged > 0 ? (
          <span className="text-[11px] text-warning font-medium flex items-center gap-1">
            <AlertTriangle size={11} /> {flagged} items need correction
          </span>
        ) : (
          <span className="text-[11px] text-success font-medium flex items-center gap-1">
            <Check size={11} /> {applied ? "AI suggestions applied" : "Ready to continue"}
          </span>
        )}
        {flagged > 0 ? (
          <Button
            size="sm"
            variant="outline"
            onClick={applyAI}
            className="h-7 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/5"
          >
            <Sparkles size={10} /> Apply AI fixes
          </Button>
        ) : (
          <Button size="sm" className="h-7 text-[11px]">
            Save & Continue
          </Button>
        )}
      </div>
    </div>
  );
}
