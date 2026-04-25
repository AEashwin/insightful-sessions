import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, GripVertical, MousePointer2, Plus, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Group {
  name: string;
  variables: string[];
}

interface Bucket {
  id: string;
  title: string;
  role: string;
  groups: Group[];
}

const buckets: Bucket[] = [
  {
    id: "time",
    title: "Time",
    role: "Date columns",
    groups: [{ name: "Week / Month", variables: ["weekEnding", "monthEnding"] }],
  },
  {
    id: "dependent",
    title: "Dependent",
    role: "Outcome to model",
    groups: [{ name: "Sales", variables: ["Sales_Volume", "Revenue"] }],
  },
  {
    id: "dimension",
    title: "Dimension",
    role: "Cuts, not drivers",
    groups: [{ name: "Market structure", variables: ["Region", "Brand", "SKU"] }],
  },
  {
    id: "base",
    title: "Base drivers",
    role: "Price, distribution, events, trend",
    groups: [
      { name: "Price", variables: ["Nielsen_Price_SB1", "Nielsen_Price_SB2", "Promo_Depth"] },
      { name: "Distribution", variables: ["Nielsen_WD_SB1", "Nielsen_WD_SB2"] },
      { name: "Events / Trend", variables: ["Holiday_Flag", "Category_Trend", "Base_Trend"] },
      { name: "Competition", variables: ["Comp_TV_GRPs", "Comp_TV_Spnd", "Competitor_Price"] },
    ],
  },
  {
    id: "incremental",
    title: "Incremental drivers",
    role: "Media and activation variables",
    groups: [
      { name: "TV", variables: ["TV_SB1_GRPs", "TV_SB1_Imps", "TV_SB1_Spnd", "Halo_TV_GRPs"] },
      { name: "Meta", variables: ["Meta_SB1_Imps", "Meta_SB1_Clicks", "Meta_SB1_Spnd", "Meta_SB2_Spnd"] },
      { name: "DV360", variables: ["DV360_YTProg_Imps", "DV360_Display_Imps", "DV360_YTProg_Spnd"] },
      { name: "YouTube", variables: ["YouTube_Views", "YouTube_Spend"] },
    ],
  },
];

const unclassified = ["Unknown_Var_1", "New_Campaign_X", "Regional_OOH_04", "OOS_Flag"];
const moveTargets = ["Time", "Dependent", "Dimension", "Base drivers", "Incremental drivers"];

export function ClassificationCard() {
  const [selected, setSelected] = useState("Meta_SB1_Spnd");
  const total = useMemo(
    () => buckets.reduce((sum, bucket) => sum + bucket.groups.reduce((inner, group) => inner + group.variables.length, 0), 0) + unclassified.length,
    [],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Variable Classification</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{total} datacube columns · {unclassified.length} unresolved</h3>
              <Badge variant="outline" className="h-5 border-warning/30 bg-warning/10 text-[10px] text-warning">
                <AlertTriangle size={10} className="mr-1" /> Needs review
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search datacube columns" className="h-8 pl-7 text-xs" />
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1 text-[11px]"><MousePointer2 size={12} /> Select</Button>
            <Button size="sm" className="h-8 gap-1 text-[11px]"><Sparkles size={12} /> Accept AI suggestions</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-border xl:grid-cols-12">
        <section className="bg-card p-3 xl:col-span-8">
          <div className="grid gap-2 lg:grid-cols-3">
            {buckets.slice(0, 3).map((bucket) => (
              <SimpleBucket key={bucket.id} bucket={bucket} selected={selected} onSelect={setSelected} compact />
            ))}
          </div>

          <div className="mt-2 grid gap-2 lg:grid-cols-2">
            {buckets.slice(3).map((bucket) => (
              <SimpleBucket key={bucket.id} bucket={bucket} selected={selected} onSelect={setSelected} />
            ))}
          </div>
        </section>

        <aside className="bg-card p-3 xl:col-span-4">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Selected column</p>
            <p className="mt-1 font-mono text-xs font-semibold text-foreground">{selected}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Metric label="Current bucket" value="Incremental" />
              <Metric label="Group" value="Meta" />
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border">
            <div className="border-b border-border bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-semibold text-foreground">Move selected column</p>
            </div>
            <div className="space-y-2 p-3">
              {moveTargets.map((target) => (
                <button
                  key={target}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-muted/50"
                >
                  <span>{target}</span>
                  <ArrowRight size={12} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-dashed border-warning/40 bg-warning/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-warning">Unclassified columns</p>
              <Badge variant="outline" className="h-5 border-warning/30 bg-card text-[10px] text-warning">{unclassified.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unclassified.map((variable) => (
                <VariableChip key={variable} name={variable} selected={selected === variable} onClick={() => setSelected(variable)} />
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg border border-success/25 bg-success/5 px-3 py-2 text-[11px] text-success">
            <CheckCircle2 size={13} />
            Drag a chip into a bucket, or select it and use the move panel.
          </div>
        </aside>
      </div>
    </div>
  );
}

function SimpleBucket({ bucket, selected, onSelect, compact = false }: { bucket: Bucket; selected: string; onSelect: (v: string) => void; compact?: boolean }) {
  const count = bucket.groups.reduce((sum, group) => sum + group.variables.length, 0);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <div>
          <p className="text-[11px] font-semibold text-foreground">{bucket.title}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{bucket.role}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="h-5 bg-card text-[10px]">{count}</Badge>
          {!compact && <Button variant="ghost" size="sm" className="h-5 w-5 p-0"><Plus size={11} /></Button>}
        </div>
      </div>
      <div className={`space-y-2 p-3 ${compact ? "min-h-[94px]" : "min-h-[265px]"}`}>
        {bucket.groups.map((group) => (
          <div key={group.name} className="rounded-md border border-border bg-card p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-foreground">{group.name}</p>
              {!compact && <button type="button" className="text-[10px] font-medium text-primary hover:underline">Rename</button>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.variables.map((variable) => (
                <VariableChip key={variable} name={variable} selected={selected === variable} onClick={() => onSelect(variable)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VariableChip({ name, selected, onClick }: { name: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      draggable
      onClick={onClick}
      className={`group inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-1 font-mono text-[10px] transition-colors ${
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50"
      }`}
    >
      <GripVertical size={9} className={selected ? "text-primary-foreground/70" : "text-muted-foreground"} />
      <span className="truncate">{name}</span>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-2 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}
