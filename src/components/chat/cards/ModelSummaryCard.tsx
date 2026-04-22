import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const insights = [
  {
    icon: TrendingUp,
    tone: "success",
    title: "TV is the strongest channel",
    body: "TV delivers 3.2x ROI and 18.2% contribution — the highest of all media. Consider protecting or modestly increasing TV in the next planning cycle.",
  },
  {
    icon: TrendingDown,
    tone: "destructive",
    title: "Promo_Depth is dragging efficiency",
    body: "Promo at 1.2x ROI is below break-even when factoring overheads. Reducing depth by 15% could free £165k for media reinvestment.",
  },
  {
    icon: AlertTriangle,
    tone: "warning",
    title: "Borderline autocorrelation (DW = 1.61)",
    body: "Suggests mild residual structure. Consider adding a lag term or revisiting seasonality before signing off.",
  },
  {
    icon: Lightbulb,
    tone: "primary",
    title: "Headroom in Digital",
    body: "Digital is operating in the linear region of its saturation curve — additional spend should yield near-proportional returns.",
  },
];

const toneClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
  success: { bg: "bg-success/5", text: "text-success", iconBg: "bg-success/10" },
  destructive: { bg: "bg-destructive/5", text: "text-destructive", iconBg: "bg-destructive/10" },
  warning: { bg: "bg-warning/5", text: "text-warning", iconBg: "bg-warning/10" },
  primary: { bg: "bg-primary/5", text: "text-primary", iconBg: "bg-primary/10" },
};

export function ModelSummaryCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Model Summary
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5">AI-generated insights · Batch 2</p>
      </div>
      <div className="p-3 space-y-2">
        {insights.map((i) => {
          const t = toneClasses[i.tone];
          const Icon = i.icon;
          return (
            <div key={i.title} className={`rounded-lg ${t.bg} p-3 flex gap-3`}>
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
        <span className="text-[11px] text-muted-foreground">4 insights · grounded in model coefficients</span>
        <Button size="sm" className="h-7 text-[11px]">Proceed to optimisation</Button>
      </div>
    </div>
  );
}
