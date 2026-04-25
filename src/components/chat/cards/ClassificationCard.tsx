import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRightLeft, Bot, Check, ChevronDown, GripVertical, Layers3, MousePointer2, Plus, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface GroupNode {
  name: string;
  level?: number;
  variables?: string[];
  children?: GroupNode[];
}

interface Bucket {
  id: string;
  title: string;
  count: number;
  confidence: number;
  tone: "primary" | "success" | "warning" | "muted";
  nodes: GroupNode[];
}

const buckets: Bucket[] = [
  {
    id: "time",
    title: "Time",
    count: 2,
    confidence: 99,
    tone: "muted",
    nodes: [{ name: "Date grain", variables: ["weekEnding", "monthEnding"] }],
  },
  {
    id: "dependent",
    title: "Dependent",
    count: 2,
    confidence: 96,
    tone: "primary",
    nodes: [{ name: "Sales outcome", variables: ["Sales_Volume", "Revenue"] }],
  },
  {
    id: "dimension",
    title: "Dimension",
    count: 3,
    confidence: 94,
    tone: "success",
    nodes: [{ name: "Cuts", variables: ["Region", "Brand", "SKU"] }],
  },
  {
    id: "incremental",
    title: "Incremental",
    count: 34,
    confidence: 88,
    tone: "primary",
    nodes: [
      {
        name: "Media",
        level: 1,
        children: [
          { name: "TV", level: 2, variables: ["TV_SBI_GRPs", "TV_SB1_Imps", "TV_SB1_Spnd", "Halo_TV_GRPs"] },
          { name: "Meta", level: 2, variables: ["Meta_SB1_Imps", "Meta_SB1_Clicks", "Meta_SB1_Spnd", "Meta_SB2_Spnd"] },
          { name: "DV360", level: 2, variables: ["DV360_SB1_YTProg_Imps", "DV360_SB1_Display_Imps", "DV360_SB1_YTProg_Spnd"] },
          { name: "YouTube", level: 2, variables: ["YouTube_Views", "YouTube_Spend"] },
        ],
      },
      {
        name: "Non Media",
        level: 1,
        children: [
          { name: "Trade", level: 2, variables: ["TradeScheme_Nts_Amt", "TradeScheme_Nts_Vol"] },
          { name: "Promo", level: 2, variables: ["Promo_Flag", "Leaflet_Drops", "Display_Weeks"] },
        ],
      },
    ],
  },
  {
    id: "base",
    title: "Base",
    count: 29,
    confidence: 83,
    tone: "warning",
    nodes: [
      {
        name: "Price",
        level: 1,
        children: [
          { name: "Nielsen", level: 2, variables: ["Nielsen_Price_SB1", "Nielsen_Price_SB2", "Promo_Depth"] },
        ],
      },
      {
        name: "Distribution",
        level: 1,
        children: [{ name: "Weighted distribution", level: 2, variables: ["Nielsen_WD_SB1", "Nielsen_WD_SB2"] }],
      },
      {
        name: "Baseline",
        level: 1,
        children: [
          { name: "Events", level: 2, variables: ["Holiday_Flag", "Election_Flag", "Covid_Flag"] },
          { name: "Trend", level: 2, variables: ["Category_Trend", "Base_Trend"] },
          { name: "Competitive", level: 2, variables: ["Comp_TV_GRPs", "Comp_TV_Spnd", "Competitor_Price"] },
        ],
      },
    ],
  },
];

const unclassified = ["Unknown_Var_1", "New_Campaign_X", "Test_Metric_A", "Regional_OOH_04", "OOS_Flag"];

const toneClasses: Record<Bucket["tone"], string> = {
  primary: "border-primary/30 bg-primary/5 text-primary",
  success: "border-success/30 bg-success/5 text-success",
  warning: "border-warning/35 bg-warning/10 text-warning",
  muted: "border-border bg-muted/40 text-muted-foreground",
};

export function ClassificationCard() {
  const [selected, setSelected] = useState("TV_SB1_Spnd");
  const [command, setCommand] = useState("");
  const total = useMemo(() => buckets.reduce((sum, b) => sum + b.count, 0) + unclassified.length, []);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Variable Classification</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{total} datacube columns · 5 unresolved</h3>
              <Badge variant="outline" className="h-5 border-warning/30 bg-warning/10 text-[10px] text-warning">
                <AlertTriangle size={10} className="mr-1" /> Review needed
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-52">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search variables..." className="h-8 pl-7 text-xs" />
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1 text-[11px]"><MousePointer2 size={12} /> Point select</Button>
            <Button size="sm" variant="outline" className="h-8 gap-1 text-[11px]"><ArrowRightLeft size={12} /> Move</Button>
            <Button size="sm" className="h-8 gap-1 text-[11px]"><Sparkles size={12} /> Apply AI pass</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-border lg:grid-cols-12">
        <section className="bg-card p-3 lg:col-span-7">
          <div className="grid gap-2 md:grid-cols-3">
            {buckets.slice(0, 3).map((bucket) => <BucketPanel key={bucket.id} bucket={bucket} compact selected={selected} onSelect={setSelected} />)}
          </div>
          <div className="mt-2 grid gap-2 xl:grid-cols-2">
            {buckets.slice(3).map((bucket) => <BucketPanel key={bucket.id} bucket={bucket} selected={selected} onSelect={setSelected} />)}
          </div>
          <div className="mt-2 rounded-lg border border-dashed border-warning/40 bg-warning/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-warning">Unclassified</p>
              <Badge variant="outline" className="h-5 border-warning/30 bg-card text-[10px] text-warning">{unclassified.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unclassified.map((v) => <VariableChip key={v} name={v} selected={selected === v} onClick={() => setSelected(v)} />)}
            </div>
          </div>
        </section>

        <aside className="bg-card p-3 lg:col-span-5">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Selected column</p>
                <p className="mt-1 font-mono text-xs font-semibold text-foreground">{selected}</p>
              </div>
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-[10px] text-primary">Media › TV</Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Metric label="Match" value="91%" />
              <Metric label="Sign" value="+" />
              <Metric label="Level" value="L3" />
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-semibold text-foreground">Shared hierarchy</p>
              <Badge variant="outline" className="h-5 text-[10px]">up to L6</Badge>
            </div>
            <div className="divide-y divide-border text-xs">
              {[
                ["L1", "Base / Incremental"],
                ["L2", "Media / Price / Distribution / Baseline"],
                ["L3", "TV / Meta / Nielsen / Events"],
                ["L4", "Sub-brand / channel family"],
                ["L5", "Metric type: spend, GRP, clicks, price"],
                ["L6", "Raw datacube column"],
              ].map(([level, text]) => (
                <div key={level} className="flex items-center gap-3 px-3 py-2">
                  <span className="w-8 rounded bg-muted px-1.5 py-0.5 text-center text-[10px] font-semibold text-muted-foreground">{level}</span>
                  <span className="text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border bg-card p-3">
            <div className="mb-2 flex items-center gap-2">
              <Bot size={13} className="text-primary" />
              <p className="text-[11px] font-semibold text-foreground">Classification command</p>
            </div>
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g. Move all Meta spend variables to Incremental › Media › Meta and create L4 Paid Social"
              className="min-h-[74px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground">Drag chips, point-select, or type a group instruction.</span>
              <Button size="sm" className="h-7 gap-1 text-[11px]" disabled={!command.trim()}><Check size={11} /> Run</Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function BucketPanel({ bucket, compact = false, selected, onSelect }: { bucket: Bucket; compact?: boolean; selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className={`flex items-center justify-between border-b px-3 py-2 ${toneClasses[bucket.tone]}`}>
        <div className="flex items-center gap-2">
          <Layers3 size={13} />
          <p className="text-[11px] font-semibold">{bucket.title}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="h-5 bg-card/80 text-[10px]">{bucket.count}</Badge>
          {!compact && <Button variant="ghost" size="sm" className="h-5 w-5 p-0"><Plus size={11} /></Button>}
        </div>
      </div>
      <div className={`space-y-2 p-3 ${compact ? "min-h-[86px]" : "min-h-[260px]"}`}>
        {bucket.nodes.map((node) => <GroupBlock key={node.name} node={node} selected={selected} onSelect={onSelect} />)}
      </div>
      {!compact && <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">AI confidence {bucket.confidence}% · manual edits allowed</div>}
    </div>
  );
}

function GroupBlock({ node, selected, onSelect }: { node: GroupNode; selected: string; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(true);
  const hasChildren = Boolean(node.children?.length);
  return (
    <div>
      <button type="button" onClick={() => hasChildren && setOpen(!open)} className="mb-1 flex w-full items-center gap-1.5 text-left text-[11px] font-semibold text-foreground hover:text-primary">
        {hasChildren && <ChevronDown size={11} className={`text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />}
        {!hasChildren && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />}
        <span>{node.name}</span>
        {node.level && <span className="text-[9px] font-medium text-muted-foreground">L{node.level}</span>}
      </button>
      {node.variables && (
        <div className="mb-2 flex flex-wrap gap-1.5 pl-3">
          {node.variables.map((v) => <VariableChip key={v} name={v} selected={selected === v} onClick={() => onSelect(v)} />)}
        </div>
      )}
      {hasChildren && open && <div className="space-y-1.5 border-l border-border pl-3">{node.children!.map((child) => <GroupBlock key={child.name} node={child} selected={selected} onSelect={onSelect} />)}</div>}
    </div>
  );
}

function VariableChip({ name, selected, onClick }: { name: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" draggable onClick={onClick} className={`group inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-1 font-mono text-[10px] transition-colors ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/50"}`}>
      <GripVertical size={9} className={selected ? "text-primary-foreground/70" : "text-muted-foreground"} />
      <span className="truncate">{name}</span>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-2 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}