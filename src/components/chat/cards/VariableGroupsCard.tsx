import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Node {
  name: string;
  count?: number;
  children?: Node[];
}

const tree: Node[] = [
  {
    name: "Base",
    count: 14,
    children: [
      { name: "Trend", count: 1 },
      { name: "Seasonality", count: 4 },
      { name: "Pricing", count: 3 },
      { name: "Distribution", count: 2 },
      { name: "Competitor", count: 4 },
    ],
  },
  {
    name: "Incremental",
    count: 22,
    children: [
      {
        name: "Media",
        count: 14,
        children: [
          { name: "TV", count: 3 },
          { name: "Digital", count: 5 },
          { name: "OOH", count: 2 },
          { name: "Radio", count: 2 },
          { name: "Print", count: 2 },
        ],
      },
      {
        name: "Non-Media",
        count: 8,
        children: [
          { name: "Promo", count: 4 },
          { name: "Sponsorships", count: 2 },
          { name: "Sampling", count: 2 },
        ],
      },
    ],
  },
  {
    name: "Dependent",
    count: 1,
    children: [{ name: "Sales_Volume" }],
  },
  {
    name: "Dimension",
    count: 5,
    children: [
      { name: "Date" },
      { name: "Region" },
      { name: "Channel" },
      { name: "SKU" },
      { name: "Pack_Size" },
    ],
  },
];

const colors: Record<string, string> = {
  Base: "hsl(var(--navy))",
  Incremental: "hsl(var(--primary))",
  Dependent: "hsl(var(--success))",
  Dimension: "hsl(var(--muted-foreground))",
};

function TreeNode({ node, depth, rootName }: { node: Node; depth: number; rootName: string }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = !!node.children?.length;
  const color = colors[rootName] ?? "hsl(var(--primary))";

  return (
    <div>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/40 transition-colors text-left"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown size={11} className="text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight size={11} className="text-muted-foreground shrink-0" />
          )
        ) : (
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
        )}
        <span className="text-xs font-medium text-foreground">{node.name}</span>
        {node.count !== undefined && (
          <Badge variant="outline" className="h-4 text-[9px] ml-auto">
            {node.count}
          </Badge>
        )}
      </button>
      {hasChildren && open && (
        <div>
          {node.children!.map((c) => (
            <TreeNode key={c.name} node={c} depth={depth + 1} rootName={rootName} />
          ))}
        </div>
      )}
    </div>
  );
}

export function VariableGroupsCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Variable Groups
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">6-level hierarchy · 42 variables</p>
        </div>
        <Badge variant="outline" className="text-[10px]">L1 · L2 · L3</Badge>
      </div>
      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        {tree.map((root) => (
          <div key={root.name} className="rounded-md border border-border bg-muted/10 p-1">
            <TreeNode node={root} depth={0} rootName={root.name} />
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Auto-grouped by AI · 3 manual overrides</span>
        <Button size="sm" variant="outline" className="h-7 text-[11px]">Edit groups</Button>
      </div>
    </div>
  );
}
