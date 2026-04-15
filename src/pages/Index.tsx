import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Brain, Layers, Calendar, GitBranch } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  brand: string;
  market: string;
  status: "Active" | "In Progress" | "Draft";
  updatedAgo: string;
  modelsRun: number;
  lastModel: string;
  dataCoverage: string;
  workflowStage: string;
}

const projects: Project[] = [
  { id: "1", name: "Demo_Brand4_2025", brand: "Brand4", market: "UK", status: "Active", updatedAgo: "3 days ago", modelsRun: 3, lastModel: "Batch 2", dataCoverage: "Jan 2022 – Dec 2024", workflowStage: "Model Interpretation" },
  { id: "2", name: "UK_Chocolate_2026", brand: "Chocolate", market: "UK", status: "In Progress", updatedAgo: "1 day ago", modelsRun: 1, lastModel: "Batch 1", dataCoverage: "Mar 2023 – Feb 2025", workflowStage: "Data Upload & QC" },
  { id: "3", name: "AUS_Beverage_Q1", brand: "Beverage", market: "Australia", status: "Active", updatedAgo: "5 days ago", modelsRun: 5, lastModel: "Batch 4", dataCoverage: "Jun 2021 – Dec 2024", workflowStage: "Simulation & Optimisation" },
  { id: "4", name: "FR_Skincare_H2", brand: "Skincare", market: "France", status: "Draft", updatedAgo: "2 weeks ago", modelsRun: 0, lastModel: "—", dataCoverage: "—", workflowStage: "Project Setup" },
  { id: "5", name: "US_Snacks_2025", brand: "Snacks", market: "US", status: "In Progress", updatedAgo: "6 hours ago", modelsRun: 2, lastModel: "Batch 2", dataCoverage: "Jan 2023 – Dec 2024", workflowStage: "Variable Classification" },
  { id: "6", name: "DE_Pharma_Annual", brand: "Pharma", market: "Germany", status: "Active", updatedAgo: "12 hours ago", modelsRun: 7, lastModel: "Batch 6", dataCoverage: "Jan 2020 – Dec 2024", workflowStage: "Outputs & Reporting" },
];

const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  "In Progress": "bg-warning/10 text-warning border-warning/20",
  Draft: "bg-muted text-muted-foreground border-border",
};

const statCards = [
  { icon: Brain, label: "Models Run", key: "modelsRun" as const },
  { icon: Layers, label: "Last Model", key: "lastModel" as const },
  { icon: Calendar, label: "Data Coverage", key: "dataCoverage" as const },
  { icon: GitBranch, label: "Workflow Stage", key: "workflowStage" as const },
];

export default function Index() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("1");
  const navigate = useNavigate();

  const filtered = useMemo(
    () => projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const selected = projects.find((p) => p.id === selectedId);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Start a session</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a project to begin or resume your MMM workflow.
          </p>
        </div>

        {/* Project List Card */}
        <Card className="overflow-hidden border shadow-sm">
          {/* Search */}
          <div className="p-4 border-b bg-muted/30">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-background border-border"
              />
            </div>
          </div>

          {/* List */}
          <div className="divide-y">
            {filtered.map((project) => {
              const isSelected = project.id === selectedId;
              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedId(project.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all hover:bg-muted/50 ${
                    isSelected
                      ? "bg-primary/5 border-l-[3px] border-l-primary"
                      : "border-l-[3px] border-l-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className={`text-sm font-semibold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {project.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground border-border">
                        {project.brand} · {project.market}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">Updated {project.updatedAgo}</span>
                  </div>

                  <Badge className={`text-[10px] px-2 py-0.5 font-medium border ${statusColor[project.status]} bg-opacity-10`} variant="outline">
                    {project.status}
                  </Badge>

                  <ChevronRight size={16} className="text-muted-foreground/50 shrink-0" />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No projects matching "{search}"
              </div>
            )}
          </div>
        </Card>

        {/* Summary Panel */}
        {selected && (
          <div className="mt-6 animate-slide-down">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-5">{selected.name}</h2>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {statCards.map(({ icon: Icon, label, key }) => (
                    <div key={key} className="rounded-lg border bg-muted/30 p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon size={14} className="text-primary" />
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{String(selected[key])}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mb-4">
                  <Button onClick={() => navigate("/workflow")} className="h-9 px-5 text-sm font-medium">
                    Resume workflow
                  </Button>
                  <Button variant="outline" className="h-9 px-5 text-sm font-medium">
                    Start fresh session
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  AI assistant will load your project context and DD platform connection automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
