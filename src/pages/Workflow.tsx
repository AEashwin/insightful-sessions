import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Circle, AlertTriangle, ArrowRight, Send } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { WorkflowSidebar, workflowStages, type WorkflowStage } from "@/components/workflow/WorkflowSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const stageContent: Record<number, { title: string; subtitle: string; tasks: { label: string; done: boolean; warning?: string }[] }> = {
  1: { title: "Project Setup", subtitle: "Configure project parameters, brand details, and market settings.", tasks: [{ label: "Brand and market configured", done: true }, { label: "Date range set", done: true }, { label: "Data source connected", done: true }] },
  2: { title: "Data Upload & QC", subtitle: "Upload datacube and run quality checks.", tasks: [{ label: "Datacube uploaded", done: true }, { label: "Quality checks passed", done: true }, { label: "Missing data reviewed", done: true }] },
  3: { title: "Variable Classification", subtitle: "Classify and review datacube variables.", tasks: [{ label: "Auto-classification run", done: true }, { label: "Manual review completed", done: true }, { label: "Flagged items resolved", done: true }] },
  4: { title: "DRD Generation", subtitle: "Generate dependent response decomposition.", tasks: [{ label: "DRD parameters set", done: true }, { label: "DRD generated", done: true }, { label: "DRD validated", done: true }] },
  5: { title: "Model Configuration", subtitle: "Configure model parameters and variable selections.", tasks: [{ label: "Variables selected", done: true }, { label: "Priors configured", done: true }, { label: "Iterations set", done: true }] },
  6: { title: "Model Run", subtitle: "Execute model and review convergence.", tasks: [{ label: "Model executed", done: true }, { label: "Convergence achieved", done: true }, { label: "Results saved", done: true }] },
  7: { title: "Model Interpretation", subtitle: "Review model outputs and validate coefficients before proceeding to simulation.", tasks: [{ label: "Model metrics reviewed (R² 0.94, MAPE 8.2%)", done: true }, { label: "Contribution splits validated", done: true }, { label: "ROI and spend effectiveness reviewed", done: false, warning: "Manual step required in DD platform" }] },
  8: { title: "Simulation & Optimisation", subtitle: "Run scenario simulations and optimise budget allocation.", tasks: [{ label: "Scenario parameters defined", done: false }, { label: "Simulation executed", done: false }, { label: "Optimisation reviewed", done: false }] },
  9: { title: "Outputs & Reporting", subtitle: "Generate final outputs, charts, and client reports.", tasks: [{ label: "Charts generated", done: false }, { label: "Report compiled", done: false }, { label: "Client deliverables exported", done: false }] },
};

export default function Workflow() {
  const [activeStageId, setActiveStageId] = useState(7);
  const [chatInput, setChatInput] = useState("");
  const navigate = useNavigate();

  const handleStageClick = (stage: WorkflowStage) => {
    setActiveStageId(stage.id);
  };

  const content = stageContent[activeStageId] || stageContent[7];
  const nextStage = workflowStages.find((s) => s.id === activeStageId + 1);

  return (
    <AppShell fullWidth>
      <WorkflowSidebar activeStageId={activeStageId} onStageClick={handleStageClick} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Stage Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-foreground">{content.title}</h1>
              <Badge variant="outline" className="text-[10px] font-medium">
                Stage {activeStageId} of 9
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{content.subtitle}</p>
          </div>

          {/* Sub-tasks */}
          <Card className="border shadow-sm mb-6">
            <CardContent className="p-5 space-y-3">
              {content.tasks.map((task, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-md transition-colors ${
                    task.done ? "bg-success/5" : "bg-muted/30"
                  }`}
                >
                  {task.done ? (
                    <span className="w-5 h-5 rounded-full bg-success flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-success-foreground" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-border shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className={`text-sm ${task.done ? "text-foreground" : "text-muted-foreground"}`}>
                      {task.label}
                    </span>
                    {task.warning && (
                      <Badge className="ml-2 text-[10px] px-1.5 py-0 bg-warning/10 text-warning border-warning/20" variant="outline">
                        <AlertTriangle size={10} className="mr-1" />
                        {task.warning}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next Step */}
          {nextStage && (
            <Card className="border shadow-sm mb-8">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Next step</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeStageId === 7
                    ? "Once ROI review is complete, proceed to Simulation & Optimisation."
                    : `Continue to ${nextStage.name} when all tasks are complete.`}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    const stage = workflowStages.find((s) => s.id === activeStageId);
                    if (stage?.route) navigate(stage.route);
                    else setActiveStageId(activeStageId + 1);
                  }}
                  className="h-9 text-sm gap-1.5"
                >
                  Continue to {nextStage.name}
                  <ArrowRight size={14} />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Chat Input */}
          <div className="relative">
            <Input
              placeholder="Ask anything about this stage..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="pr-10 h-10 bg-muted/30 border-border"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
              <Send size={13} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
