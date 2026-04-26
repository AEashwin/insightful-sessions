import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ModelStatus = "qualified" | "disqualified";

interface CandidateModel {
  id: string;
  batch: number;
  rsq: number;
  mape: number;
  holdoutMape: number;
  status: ModelStatus;
  reason: string;
}

const allModels: CandidateModel[] = Array.from({ length: 64 }, (_, index) => {
  const n = index + 1;
  const rsq = Number((0.66 + ((n * 7) % 31) / 100 + (n % 5) / 200).toFixed(2));
  const mape = Number((4.8 + ((n * 11) % 76) / 10).toFixed(1));
  const holdoutMape = Number((5.2 + ((n * 13) % 92) / 10).toFixed(1));
  const status: ModelStatus = rsq >= 0.78 && mape <= 9.5 && holdoutMape <= 11.5 ? "qualified" : "disqualified";

  return {
    id: `M${String(n).padStart(3, "0")}`,
    batch: Math.ceil(n / 16),
    rsq,
    mape,
    holdoutMape,
    status,
    reason: status === "qualified" ? "Passes QC thresholds" : rsq < 0.78 ? "Low R²" : mape > 9.5 ? "High MAPE" : "High holdout MAPE",
  };
});

export function ModelGenerationCard() {
  const [processed, setProcessed] = useState(5);
  const [activeTab, setActiveTab] = useState("qualified");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [showOutput, setShowOutput] = useState(false);
  const visibleModels = allModels.slice(0, processed);
  const progress = Math.round((processed / allModels.length) * 100);
  const complete = processed >= allModels.length;

  useEffect(() => {
    if (complete) {
      setActiveTab("recommended");
      return;
    }

    const timer = window.setInterval(() => {
      setProcessed((current) => Math.min(allModels.length, current + 4));
    }, 850);

    return () => window.clearInterval(timer);
  }, [complete]);

  const partitions = useMemo(() => {
    const qualified = visibleModels.filter((model) => model.status === "qualified");
    const disqualified = visibleModels.filter((model) => model.status === "disqualified");
    const recommended = [...allModels]
      .filter((model) => model.status === "qualified")
      .sort((a, b) => b.rsq - a.rsq || a.holdoutMape - b.holdoutMape || a.mape - b.mape)
      .slice(0, complete ? 8 : 0);

    return { qualified, disqualified, recommended };
  }, [visibleModels, complete]);

  const outputModels = allModels.filter((model) => selectedModels.includes(model.id));

  const toggleModel = (id: string) => {
    setSelectedModels((current) => {
      if (current.includes(id)) return current.filter((modelId) => modelId !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
    setShowOutput(false);
  };

  return (
    <div className="overflow-hidden rounded-lg bg-card">
      <div className="border-b border-primary/20 bg-gradient-to-r from-primary/12 via-sidebar-accent to-accent px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Model Generation</h3>
            <p className="text-xs text-muted-foreground">64 candidate models running one after another · Batch 1–4</p>
          </div>
          <Badge variant="outline" className={complete ? "border-success/30 bg-success/10 text-success" : "border-primary/30 bg-primary/10 text-primary"}>
            {complete ? <CheckCircle2 size={13} /> : <Clock3 size={13} />} {complete ? "100% complete" : "Running"}
          </Badge>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{processed} / {allModels.length} models generated</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2.5 bg-background/80" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Metric label="Qualified" value={partitions.qualified.length} tone="success" />
            <Metric label="Disqualified" value={partitions.disqualified.length} tone="destructive" />
            <Metric label="Recommended" value={partitions.recommended.length} tone="primary" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-b from-sidebar-accent/40 to-card p-3">
        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-primary/20 bg-background/85 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Select models to view output</p>
            <p className="text-[11px] text-muted-foreground">Choose 1 to 3 qualified or recommended models for side-by-side output comparison.</p>
          </div>
          <Button size="sm" className="h-8 text-xs" disabled={selectedModels.length === 0} onClick={() => setShowOutput(true)}>
            View output ({selectedModels.length}/3)
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid h-10 w-full grid-cols-3 bg-background/80 p-1">
            <TabsTrigger value="qualified" className="text-xs">Qualified</TabsTrigger>
            <TabsTrigger value="disqualified" className="text-xs">Disqualified</TabsTrigger>
            <TabsTrigger value="recommended" disabled={!complete} className="text-xs">Recommended</TabsTrigger>
          </TabsList>

          <TabsContent value="qualified" className="mt-3">
            <ModelTable models={partitions.qualified} empty="Qualified models will appear here as QC thresholds are met." selectedModels={selectedModels} onToggleModel={toggleModel} />
          </TabsContent>
          <TabsContent value="disqualified" className="mt-3">
            <ModelTable models={partitions.disqualified} empty="Disqualified models will appear here with QC reason codes." showStatus />
          </TabsContent>
          <TabsContent value="recommended" className="mt-3">
            <div className="mb-2 flex items-center gap-2 rounded-md border border-success/25 bg-success/10 px-3 py-2 text-xs text-success">
              <Sparkles size={14} /> Recommended tab is available after all candidate models are complete.
            </div>
            <ModelTable models={partitions.recommended} empty="Recommendations unlock at 100% completion." recommended selectedModels={selectedModels} onToggleModel={toggleModel} />
          </TabsContent>
        </Tabs>

        {showOutput && outputModels.length > 0 && <ModelOutputComparison models={outputModels} />}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "success" | "destructive" | "primary" }) {
  const toneClass = tone === "success" ? "bg-success/10 text-success" : tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary";
  return (
    <div className={`rounded-md border border-border/70 px-2 py-2 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase">{label}</p>
      <p className="text-lg font-bold leading-tight">{value}</p>
    </div>
  );
}

function ModelTable({ models, empty, recommended = false, showStatus = false, selectedModels = [], onToggleModel }: { models: CandidateModel[]; empty: string; recommended?: boolean; showStatus?: boolean; selectedModels?: string[]; onToggleModel?: (id: string) => void }) {
  if (!models.length) {
    return <div className="rounded-lg border border-dashed border-border bg-background/70 p-5 text-center text-xs text-muted-foreground">{empty}</div>;
  }

  return (
    <div className="max-h-[340px] overflow-auto rounded-lg border border-border bg-background/85">
      <table className="w-full min-w-[680px] text-xs">
        <thead className="sticky top-0 bg-primary/10 text-primary">
          <tr>
            {onToggleModel && <th className="px-3 py-2 text-left font-semibold">Select</th>}
            {recommended && <th className="px-3 py-2 text-left font-semibold">Rank</th>}
            <th className="px-3 py-2 text-left font-semibold">Model</th>
            <th className="px-3 py-2 text-left font-semibold">Batch</th>
            <th className="px-3 py-2 text-right font-semibold">R² / Rsq</th>
            <th className="px-3 py-2 text-right font-semibold">MAPE</th>
            <th className="px-3 py-2 text-right font-semibold">Holdout MAPE</th>
            {showStatus && <th className="px-3 py-2 text-left font-semibold">Status</th>}
          </tr>
        </thead>
        <tbody>
          {models.map((model, index) => (
            <tr key={model.id} className="border-t border-border odd:bg-card even:bg-sidebar-accent/35 hover:bg-primary/10">
              {onToggleModel && <td className="px-3 py-2"><Checkbox checked={selectedModels.includes(model.id)} disabled={!selectedModels.includes(model.id) && selectedModels.length >= 3} onCheckedChange={() => onToggleModel(model.id)} /></td>}
              {recommended && <td className="px-3 py-2 font-semibold text-primary">#{index + 1}</td>}
              <td className="px-3 py-2 font-mono font-semibold text-foreground">{model.id}</td>
              <td className="px-3 py-2 text-muted-foreground">Batch {model.batch}</td>
              <td className="px-3 py-2 text-right font-semibold text-foreground">{model.rsq.toFixed(2)}</td>
              <td className="px-3 py-2 text-right text-foreground">{model.mape.toFixed(1)}%</td>
              <td className="px-3 py-2 text-right text-foreground">{model.holdoutMape.toFixed(1)}%</td>
              {showStatus && <td className="px-3 py-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${model.status === "qualified" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {model.status === "qualified" ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {recommended ? "Recommended" : model.reason}
                </span>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const contributionRows = [
  { label: "Base contribution", base: 46 },
  { label: "TV contribution", base: 18 },
  { label: "Digital contribution", base: 14 },
  { label: "Promo contribution", base: 9 },
  { label: "Seasonality contribution", base: 5 },
  { label: "TV ROI", base: 3.1, suffix: "x" },
  { label: "Digital ROI", base: 2.6, suffix: "x" },
  { label: "Promo ROI", base: 1.3, suffix: "x" },
];

function ModelOutputComparison({ models }: { models: CandidateModel[] }) {
  return (
    <section className="mt-3 rounded-lg border border-primary/20 bg-background/90 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-foreground">Model output comparison</p>
          <p className="text-[11px] text-muted-foreground">Statistical parameters, contribution mix, and ROI across selected models.</p>
        </div>
        <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">{models.length} selected</Badge>
      </div>

      <div className="overflow-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[620px] text-xs">
          <thead className="bg-primary/10 text-primary">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Metric</th>
              {models.map((model) => <th key={model.id} className="px-3 py-2 text-right font-semibold">{model.id}</th>)}
            </tr>
          </thead>
          <tbody>
            <ComparisonRow label="R² / Rsq" values={models.map((model) => model.rsq.toFixed(2))} strong />
            <ComparisonRow label="MAPE" values={models.map((model) => `${model.mape.toFixed(1)}%`)} />
            <ComparisonRow label="Holdout MAPE" values={models.map((model) => `${model.holdoutMape.toFixed(1)}%`)} />
            {contributionRows.map((row, rowIndex) => (
              <ComparisonRow
                key={row.label}
                label={row.label}
                values={models.map((model, modelIndex) => {
                  const value = row.base + ((model.rsq * 100 + rowIndex * 3 + modelIndex * 2) % 7) - 3;
                  return row.suffix ? `${value.toFixed(1)}${row.suffix}` : `${Math.max(1, Math.round(value))}%`;
                })}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ComparisonRow({ label, values, strong = false }: { label: string; values: string[]; strong?: boolean }) {
  return (
    <tr className="border-t border-border odd:bg-background even:bg-sidebar-accent/35">
      <td className="px-3 py-2 font-medium text-foreground">{label}</td>
      {values.map((value, index) => <td key={`${label}-${index}`} className={`px-3 py-2 text-right ${strong ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{value}</td>)}
    </tr>
  );
}
