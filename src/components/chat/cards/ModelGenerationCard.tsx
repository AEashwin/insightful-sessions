import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid h-10 w-full grid-cols-3 bg-background/80 p-1">
            <TabsTrigger value="qualified" className="text-xs">Qualified</TabsTrigger>
            <TabsTrigger value="disqualified" className="text-xs">Disqualified</TabsTrigger>
            <TabsTrigger value="recommended" disabled={!complete} className="text-xs">Recommended</TabsTrigger>
          </TabsList>

          <TabsContent value="qualified" className="mt-3">
            <ModelTable models={partitions.qualified} empty="Qualified models will appear here as QC thresholds are met." />
          </TabsContent>
          <TabsContent value="disqualified" className="mt-3">
            <ModelTable models={partitions.disqualified} empty="Disqualified models will appear here with QC reason codes." />
          </TabsContent>
          <TabsContent value="recommended" className="mt-3">
            <div className="mb-2 flex items-center gap-2 rounded-md border border-success/25 bg-success/10 px-3 py-2 text-xs text-success">
              <Sparkles size={14} /> Recommended tab is available after all candidate models are complete.
            </div>
            <ModelTable models={partitions.recommended} empty="Recommendations unlock at 100% completion." recommended />
          </TabsContent>
        </Tabs>
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

function ModelTable({ models, empty, recommended = false }: { models: CandidateModel[]; empty: string; recommended?: boolean }) {
  if (!models.length) {
    return <div className="rounded-lg border border-dashed border-border bg-background/70 p-5 text-center text-xs text-muted-foreground">{empty}</div>;
  }

  return (
    <div className="max-h-[340px] overflow-auto rounded-lg border border-border bg-background/85">
      <table className="w-full min-w-[680px] text-xs">
        <thead className="sticky top-0 bg-primary/10 text-primary">
          <tr>
            {recommended && <th className="px-3 py-2 text-left font-semibold">Rank</th>}
            <th className="px-3 py-2 text-left font-semibold">Model</th>
            <th className="px-3 py-2 text-left font-semibold">Batch</th>
            <th className="px-3 py-2 text-right font-semibold">R² / Rsq</th>
            <th className="px-3 py-2 text-right font-semibold">MAPE</th>
            <th className="px-3 py-2 text-right font-semibold">Holdout MAPE</th>
            <th className="px-3 py-2 text-left font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model, index) => (
            <tr key={model.id} className="border-t border-border odd:bg-card even:bg-sidebar-accent/35 hover:bg-primary/10">
              {recommended && <td className="px-3 py-2 font-semibold text-primary">#{index + 1}</td>}
              <td className="px-3 py-2 font-mono font-semibold text-foreground">{model.id}</td>
              <td className="px-3 py-2 text-muted-foreground">Batch {model.batch}</td>
              <td className="px-3 py-2 text-right font-semibold text-foreground">{model.rsq.toFixed(2)}</td>
              <td className="px-3 py-2 text-right text-foreground">{model.mape.toFixed(1)}%</td>
              <td className="px-3 py-2 text-right text-foreground">{model.holdoutMape.toFixed(1)}%</td>
              <td className="px-3 py-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${model.status === "qualified" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {model.status === "qualified" ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {recommended ? "Recommended" : model.reason}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
