import { Check, Circle, Dot } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface WorkflowStage {
  id: number;
  name: string;
  status: "complete" | "active" | "pending";
  route?: string;
}

export const workflowStages: WorkflowStage[] = [
  { id: 1, name: "Project Setup", status: "complete" },
  { id: 2, name: "Data Upload & QC", status: "complete" },
  { id: 3, name: "Variable Classification", status: "complete", route: "/classification" },
  { id: 4, name: "DRD Generation", status: "complete" },
  { id: 5, name: "Model Configuration", status: "complete" },
  { id: 6, name: "Model Run", status: "complete" },
  { id: 7, name: "Model Interpretation", status: "active", route: "/model-output" },
  { id: 8, name: "Simulation & Optimisation", status: "pending" },
  { id: 9, name: "Outputs & Reporting", status: "pending" },
];

interface WorkflowSidebarProps {
  activeStageId: number;
  onStageClick: (stage: WorkflowStage) => void;
}

export function WorkflowSidebar({ activeStageId, onStageClick }: WorkflowSidebarProps) {
  const completedCount = workflowStages.filter((s) => s.status === "complete").length;
  const progressPercent = Math.round((completedCount / workflowStages.length) * 100);

  return (
    <aside className="w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 h-[calc(100vh-3.5rem)]">
      {/* Project Info */}
      <div className="p-5 border-b border-sidebar-border">
        <h2 className="text-sm font-bold text-foreground">Demo_Brand4_2025</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Session started 14 mins ago</p>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Progress</span>
            <span className="text-[10px] font-semibold text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-border [&>div]:bg-primary" />
        </div>
      </div>

      {/* Stages */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {workflowStages.map((stage) => {
          const isActive = stage.id === activeStageId;
          const isComplete = stage.status === "complete";
          const isPending = stage.status === "pending";
          const isClickable = isComplete || isActive;

          return (
            <button
              key={stage.id}
              onClick={() => isClickable && onStageClick(stage)}
              disabled={isPending}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm transition-all mb-0.5 ${
                isActive
                  ? "bg-sidebar-accent text-primary font-semibold"
                  : isComplete
                  ? "hover:bg-sidebar-accent/50 text-foreground"
                  : "text-muted-foreground cursor-default"
              }`}
            >
              {/* Status icon */}
              <span className="shrink-0">
                {isComplete ? (
                  <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                    <Check size={12} className="text-success-foreground" />
                  </span>
                ) : isActive ? (
                  <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Dot size={18} className="text-primary-foreground" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-border" />
                )}
              </span>

              <span className="flex-1 truncate">{stage.name}</span>

              {isComplete && (
                <span className="text-[10px] text-success font-medium">Complete</span>
              )}
              {isActive && (
                <span className="text-[10px] text-primary font-medium">In Progress</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">DD Platform: Connected</span>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">Token usage</span>
            <span className="text-[10px] text-muted-foreground font-medium">12,400 / 100,000</span>
          </div>
          <Progress value={12.4} className="h-1 bg-border [&>div]:bg-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
