import { Brain, Layers, Calendar, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: Brain, label: "Models Run", value: "3" },
  { icon: Layers, label: "Last Model", value: "Batch 2" },
  { icon: Calendar, label: "Data Coverage", value: "Jan 22 – Dec 24" },
  { icon: GitBranch, label: "Stage", value: "Model Interp." },
];

export function ProjectSummaryCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Project Snapshot
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5">Demo_Brand4_2025 · Brand4 · UK</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon size={11} className="text-primary" />
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-7 text-[11px]">Resume workflow</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]">
            Start fresh
          </Button>
        </div>
      </div>
    </div>
  );
}
