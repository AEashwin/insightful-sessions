import { useMemo, useState } from "react";
import { Check, ChevronDown, Download, GripVertical, Plus, Search, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GroupNode {
  id: string;
  name: string;
  variables?: string[];
  children?: GroupNode[];
}

interface Bucket {
  id: string;
  title: string;
  icon: string;
  groups: GroupNode[];
}

const initialBuckets: Bucket[] = [
  { id: "time", title: "Time", icon: "◷", groups: [{ id: "time-week", name: "", variables: ["monthEnding", "weekEnding"] }] },
  { id: "dimension", title: "Dimension", icon: "◩", groups: [{ id: "dim-core", name: "", variables: ["Region", "Brand"] }] },
  { id: "dependent", title: "Dependent variable", icon: "🎯", groups: [{ id: "dep-sales", name: "", variables: ["Sales_Volume", "Revenue"] }] },
  {
    id: "base",
    title: "Base",
    icon: "▣",
    groups: [
      { id: "base-price", name: "Price", variables: ["Nielsen_Price_SB1", "Nielsen_Price_SB2"] },
      { id: "base-dist", name: "Distribution", variables: ["Nielsen_WD_SB1", "Nielsen_WD_SB2"] },
      {
        id: "base-baseline",
        name: "Baseline",
        children: [
          { id: "base-events", name: "Events", variables: ["Holiday_Flag", "Election_Flag"] },
          { id: "base-trend", name: "Trend", variables: ["Category_Trend"] },
          { id: "base-comp", name: "Comp", variables: ["Comp_TV_GRPs", "Comp_TV_Spnd"] },
        ],
      },
    ],
  },
  {
    id: "incremental",
    title: "Incremental",
    icon: "↗",
    groups: [
      {
        id: "inc-media",
        name: "Media",
        children: [
          {
            id: "inc-traditional",
            name: "Traditional",
            children: [
              { id: "inc-tv", name: "TV", variables: ["TV_SB1_GRPs", "TV_SB1_Imps", "TV_SB1_Spnd", "Halo_TV_GRPs", "Halo_TV_Spnd"] },
              { id: "inc-print", name: "Print", variables: ["Print_Insertions", "Print_Spnd"] },
            ],
          },
          {
            id: "inc-digital",
            name: "Digital",
            children: [
              { id: "inc-meta", name: "Meta", variables: ["Meta_SB1_Imps", "Meta_SB1_Clicks", "Meta_SB1_Spnd", "Meta_SB2_Imps", "Meta_SB2_Spnd"] },
              { id: "inc-youtube", name: "YouTube", variables: ["YouTube_Views", "YouTube_Spnd"] },
              { id: "inc-dv360", name: "DV360", variables: ["DV360_SB1_YTProg_Imps", "DV360_SB1_YTProg_Spnd", "DV360_SB1_Display_Imps"] },
            ],
          },
        ],
      },
      {
        id: "inc-non-media",
        name: "Non_Media",
        children: [
          { id: "inc-trade", name: "Trade", variables: ["TradeScheme_Nts_Amt", "TradeScheme_Nts_Vol"] },
          { id: "inc-promo", name: "Promo", variables: ["Promo_Flag", "Leaflet_Drops"] },
        ],
      },
    ],
  },
  {
    id: "unclassified",
    title: "Unclassified",
    icon: "⚠",
    groups: [{ id: "unclassified-core", name: "", variables: ["Unknown_Var_1", "New_Campaign_X", "Test_Metric_A", "Regional_04", "OOS_Flag"] }],
  },
];

const parentOptions = [
  "Incremental",
  "Incremental > Media",
  "Incremental > Media > Traditional",
  "Incremental > Media > Digital",
  "Incremental > Non_Media",
  "Base",
  "Base > Baseline",
];

const countNode = (node: GroupNode): number => (node.variables?.length ?? 0) + (node.children?.reduce((sum, child) => sum + countNode(child), 0) ?? 0);
const countBucket = (bucket: Bucket) => bucket.groups.reduce((sum, group) => sum + countNode(group), 0);

const removeVariables = (nodes: GroupNode[], variables: string[]): GroupNode[] =>
  nodes.map((node) => ({
    ...node,
    variables: node.variables?.filter((variable) => !variables.includes(variable)),
    children: node.children ? removeVariables(node.children, variables) : undefined,
  }));

const addVariablesToGroup = (nodes: GroupNode[], groupId: string, variables: string[]): GroupNode[] =>
  nodes.map((node) =>
    node.id === groupId
      ? { ...node, variables: Array.from(new Set([...(node.variables ?? []), ...variables])) }
      : { ...node, children: node.children ? addVariablesToGroup(node.children, groupId, variables) : undefined },
  );

const groupLabel = (nodes: GroupNode[], groupId: string): string | null => {
  for (const node of nodes) {
    if (node.id === groupId) return node.name || "root";
    const child = node.children ? groupLabel(node.children, groupId) : null;
    if (child) return `${node.name}${node.name ? " > " : ""}${child}`;
  }
  return null;
};

export function ClassificationCard() {
  const [buckets, setBuckets] = useState(initialBuckets);
  const [selected, setSelected] = useState<string[]>([]);
  const [newGroupFor, setNewGroupFor] = useState<string | null>(null);
  const [newGroupParent, setNewGroupParent] = useState(parentOptions[1]);
  const [newGroupName, setNewGroupName] = useState("");
  const [changeLog, setChangeLog] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  const counts = useMemo(() => {
    const total = buckets.reduce((sum, bucket) => sum + countBucket(bucket), 0);
    const unresolved = countBucket(buckets.find((bucket) => bucket.id === "unclassified")!);
    return { total, classified: total - unresolved, unresolved, bucketCount: countBucket };
  }, [buckets]);

  const toggleVariable = (name: string) => {
    setSelected((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]));
  };

  const moveVariables = (targetBucketId: string, targetGroupId: string, incoming?: string[]) => {
    const variables = incoming?.length ? incoming : selected;
    if (!variables.length) return;

    const targetBucket = buckets.find((bucket) => bucket.id === targetBucketId);
    const targetLabel = targetBucket ? groupLabel(targetBucket.groups, targetGroupId) : targetGroupId;

    setBuckets((current) =>
      current.map((bucket) => ({
        ...bucket,
        groups: addVariablesToGroup(removeVariables(bucket.groups, variables), bucket.id === targetBucketId ? targetGroupId : "", variables),
      })),
    );
    setChangeLog((current) => [...current, `Moved ${variables.length} column${variables.length > 1 ? "s" : ""} to ${targetLabel}`]);
    setSelected([]);
    setConfirmed(false);
  };

  const createGroup = () => {
    const name = newGroupName.trim();
    if (!newGroupFor || !name) return;

    setBuckets((current) =>
      current.map((bucket) =>
        bucket.id === newGroupFor
          ? { ...bucket, groups: [...bucket.groups, { id: `${bucket.id}-${Date.now()}`, name: `${newGroupParent.split(" > ").slice(1).join(" > ")} > ${name}`.replace(/^ > /, ""), variables: [] }] }
          : bucket,
      ),
    );
    setChangeLog((current) => [...current, `Created group ${name} under ${newGroupParent}`]);
    setNewGroupFor(null);
    setNewGroupName("");
    setConfirmed(false);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-background px-3 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Variable Classification</h3>
            <p className="text-[11px] text-muted-foreground">
              {counts.classified} classified · {counts.unresolved} unclassified · {counts.total} total
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative w-48">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search variables..." className="h-8 rounded-md pl-7 text-xs" />
            </div>
            <IconButton label="Import"><Upload size={13} /></IconButton>
            <IconButton label="Export"><Download size={13} /></IconButton>
            <Button size="sm" className="h-8 gap-1 text-[11px]" onClick={() => setConfirmed(true)}>
              Confirm <Check size={12} />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-2 bg-muted/30 p-3 lg:grid-cols-3">
        {[buckets[0], buckets[1], buckets[2]].map((bucket) => (
          <BucketPanel key={bucket.id} bucket={bucket} count={counts.bucketCount(bucket)} selected={selected} onToggle={toggleVariable} onMove={moveVariables} compact />
        ))}
      </div>

      <div className="grid gap-2 bg-muted/30 px-3 pb-2 lg:grid-cols-2">
        {[buckets[3], buckets[4]].map((bucket) => (
          <BucketPanel
            key={bucket.id}
            bucket={bucket}
            count={counts.bucketCount(bucket)}
            selected={selected}
            onToggle={toggleVariable}
            onMove={moveVariables}
            onNewGroup={() => {
              setNewGroupFor(bucket.id);
              setNewGroupParent(bucket.title === "Incremental" ? parentOptions[1] : parentOptions[5]);
            }}
          />
        ))}
      </div>

      <div className="bg-muted/30 px-3 pb-3">
        <BucketPanel bucket={buckets[5]} count={counts.unresolved} selected={selected} onToggle={toggleVariable} onMove={moveVariables} compact />
      </div>

      {newGroupFor && (
        <div className="border-t border-border bg-card px-3 py-3">
          <div className="grid gap-2 rounded-lg border border-border bg-background p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
            <label className="text-[11px] font-medium text-foreground">
              Within which group?
              <select value={newGroupParent} onChange={(event) => setNewGroupParent(event.target.value)} className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground">
                {parentOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="text-[11px] font-medium text-foreground">
              New group name
              <Input value={newGroupName} onChange={(event) => setNewGroupName(event.target.value)} placeholder="e.g. Retail media" className="mt-1 h-8 text-xs" />
            </label>
            <Button size="sm" className="h-8 text-[11px]" onClick={createGroup}>Create</Button>
            <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => setNewGroupFor(null)}><X size={12} /></Button>
          </div>
        </div>
      )}

      {(selected.length > 0 || confirmed) && (
        <div className="border-t border-border bg-background px-3 py-2 text-[11px] text-muted-foreground">
          {selected.length > 0 && <span>{selected.length} selected. Click any group title, or drag the selected chips into a group.</span>}
          {confirmed && (
            <div className="space-y-1">
              <p className="font-semibold text-foreground">DD assistant: Confirmed. Changes made:</p>
              {(changeLog.length ? changeLog : ["No manual classification changes were made."]).map((item, index) => <p key={`${item}-${index}`}>• {item}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BucketPanel({ bucket, count, selected, onToggle, onMove, onNewGroup, compact = false }: { bucket: Bucket; count: number; selected: string[]; onToggle: (name: string) => void; onMove: (bucketId: string, groupId: string, variables?: string[]) => void; onNewGroup?: () => void; compact?: boolean }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs" aria-hidden>{bucket.icon}</span>
          <p className="text-[11px] font-semibold text-foreground">{bucket.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {onNewGroup && <button type="button" onClick={onNewGroup} className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-background px-2 text-[10px] font-medium text-foreground hover:bg-muted"><Plus size={10} /> New group</button>}
          <Badge variant="outline" className="h-5 bg-muted/40 text-[10px]">{count}</Badge>
        </div>
      </div>
      <div className={`space-y-1 p-2 ${compact ? "min-h-[70px]" : "min-h-[324px]"}`}>
        {bucket.groups.map((group) => (
          <GroupBlock key={group.id} bucketId={bucket.id} group={group} selected={selected} onToggle={onToggle} onMove={onMove} compact={compact} depth={0} />
        ))}
      </div>
    </section>
  );
}

function GroupBlock({ bucketId, group, selected, onToggle, onMove, compact, depth }: { bucketId: string; group: GroupNode; selected: string[]; onToggle: (name: string) => void; onMove: (bucketId: string, groupId: string, variables?: string[]) => void; compact: boolean; depth: number }) {
  const hasChildren = !!group.children?.length;
  const count = countNode(group);

  return (
    <div
      className="rounded-md border border-transparent p-1 transition-colors hover:border-primary/30 hover:bg-muted/30"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const payload = event.dataTransfer.getData("text/plain");
        onMove(bucketId, group.id, payload ? payload.split("||") : selected);
      }}
    >
      {group.name && (
        <button type="button" onClick={() => onMove(bucketId, group.id)} className="mb-1 flex w-full items-center gap-1 rounded-sm py-0.5 text-left text-[11px] font-semibold text-foreground hover:text-primary" style={{ paddingLeft: `${depth * 10}px` }}>
          <ChevronDown size={10} className="text-muted-foreground" /> {group.name} <span className="ml-auto text-muted-foreground">{count}</span>
        </button>
      )}
      {hasChildren && (
        <div className="space-y-1">
          {group.children!.map((child) => (
            <GroupBlock key={child.id} bucketId={bucketId} group={child} selected={selected} onToggle={onToggle} onMove={onMove} compact={compact} depth={depth + 1} />
          ))}
        </div>
      )}
      {!!group.variables?.length && (
        <div className="flex flex-wrap gap-1.5" style={{ paddingLeft: group.name ? `${(depth + 1) * 10}px` : undefined }}>
          {group.variables.map((variable) => (
            <VariableChip key={variable} name={variable} selected={selected.includes(variable)} onToggle={onToggle} compact={compact} selectedSet={selected} />
          ))}
        </div>
      )}
    </div>
  );
}

function VariableChip({ name, selected, onToggle, compact, selectedSet }: { name: string; selected: boolean; onToggle: (name: string) => void; compact: boolean; selectedSet: string[] }) {
  return (
    <button
      type="button"
      draggable
      onClick={() => onToggle(name)}
      onDragStart={(event) => event.dataTransfer.setData("text/plain", (selectedSet.length && selected ? selectedSet : [name]).join("||"))}
      className={`inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-1 font-mono text-[9px] transition-colors ${
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/50 text-foreground hover:border-primary/40 hover:bg-muted"
      } ${compact ? "max-w-[132px]" : "max-w-[150px]"}`}
    >
      <GripVertical size={8} className={selected ? "text-primary-foreground/70" : "text-muted-foreground"} />
      <span className="truncate">{name}</span>
    </button>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
      {children}
    </button>
  );
}
