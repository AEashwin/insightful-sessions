import { Check, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const stages = [
  { id: 1, name: "Project Setup", status: "complete" },
  { id: 2, name: "Data Upload & QC", status: "complete" },
  { id: 3, name: "Variable Classification", status: "complete" },
  { id: 4, name: "DRD Generation", status: "complete" },
  { id: 5, name: "Model Configuration", status: "complete" },
  { id: 6, name: "Model Run", status: "complete" },
  { id: 7, name: "Model Interpretation", status: "active" },
  { id: 8, name: "Simulation & Optimisation", status: "pending" },
  { id: 9, name: "Outputs & Reporting", status: "pending" },
] as const;

export function WorkflowCard() {
  const completed = stages.filter((s) => s.status === "complete").length;
  const pct = Math.round((completed / stages.length) * 100);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            MMM Workflow
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Demo_Brand4_2025</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Progress</p>
          <p className="text-sm font-semibold text-primary">{pct}%</p>
        </div>
      </div>

      <div className="px-4 pt-3">
        <Progress value={pct} className="h-1 bg-border [&>div]:bg-primary" />
      </div>

      {/* Stages */}
      <div className="p-2">
        {stages.map((s) => {
          const isComplete = s.status === "complete";
          const isActive = s.status === "active";
          return (
            <div
              key={s.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                isActive ? "bg-primary/5" : ""
              }`}
            >
              <span className="shrink-0">
                {isComplete ? (
                  <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                    <Check size={11} className="text-success-foreground" />
                  </span>
                ) : isActive ? (
                  <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-border" />
                )}
              </span>
              <span
                className={`flex-1 ${
                  isActive
                    ? "font-semibold text-primary"
                    : isComplete
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {s.name}
              </span>
              {isComplete && (
                <span className="text-[10px] text-success font-medium">Complete</span>
              )}
              {isActive && (
                <span className="text-[10px] text-primary font-medium">In Progress</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[11px] text-muted-foreground">DD Platform connected</span>
        </div>
        <button className="text-[11px] text-primary font-medium flex items-center gap-1 hover:underline">
          Open stage <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}
