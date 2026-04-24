import { useState, useMemo } from "react";
import { Search, Plus, FolderOpen, Layers, Activity, Users, Calendar, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Project {
  id: string;
  name: string;
  brand: string;
  market: string;
  bu: string;
  stage: string;
  created: string;
  updated: string;
  ownerName: string;
  ownerInitials: string;
  sharedBy?: string;
}

const allProjects: Project[] = [
  { id: "1", name: "Demo_Brand4_2025",   brand: "Brand4",    market: "UK",        bu: "Europe",      stage: "Model Interp.",   created: "12 Mar 2025", updated: "2m ago",  ownerName: "John Doe",   ownerInitials: "JD" },
  { id: "2", name: "UK_Chocolate_2026",  brand: "Chocolate", market: "UK",        bu: "Europe",      stage: "Data Upload",     created: "02 Apr 2025", updated: "1d ago",  ownerName: "Priya Shah", ownerInitials: "PS", sharedBy: "Priya Shah" },
  { id: "3", name: "AUS_Beverage_Q1",    brand: "Beverage",  market: "Australia", bu: "Asia-Pac",    stage: "Optimisation",    created: "18 Jan 2025", updated: "5d ago",  ownerName: "John Doe",   ownerInitials: "JD" },
  { id: "4", name: "FR_Skincare_H2",     brand: "Skincare",  market: "France",    bu: "Europe",      stage: "Classification",  created: "07 Feb 2025", updated: "1w ago",  ownerName: "Marc Petit",  ownerInitials: "MP", sharedBy: "Marc Petit" },
  { id: "5", name: "US_Snacks_2025",     brand: "Snacks",    market: "US",        bu: "NorthAmerica", stage: "Variable Review", created: "21 Mar 2025", updated: "6h ago",  ownerName: "John Doe",   ownerInitials: "JD" },
  { id: "6", name: "DE_Pharma_Annual",   brand: "Pharma",    market: "Germany",   bu: "Europe",      stage: "Modeling",        created: "30 Dec 2024", updated: "3d ago",  ownerName: "Lena Krug",  ownerInitials: "LK", sharedBy: "Lena Krug" },
  { id: "7", name: "JP_Coffee_2025",     brand: "Coffee",    market: "Japan",     bu: "Asia-Pac",    stage: "Modeling",        created: "11 Jan 2025", updated: "2d ago",  ownerName: "John Doe",   ownerInitials: "JD" },
  { id: "8", name: "IN_Cereal_Pilot",    brand: "Cereal",    market: "India",     bu: "Asia-Pac",    stage: "Data Upload",     created: "05 Apr 2025", updated: "12h ago", ownerName: "Anita Rao",  ownerInitials: "AR", sharedBy: "Anita Rao" },
];

const bus = ["All", "NorthAmerica", "Europe", "Asia-Pac"];

interface Props {
  onPick?: (projectId: string, projectName: string) => void;
}

export function ProjectSelectorCard({ onPick }: Props = {}) {
  const [query, setQuery] = useState("");
  const [bu, setBu] = useState("All");
  const [country, setCountry] = useState("All");
  const [brand, setBrand] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const countries = useMemo(() => {
    const filtered = bu === "All" ? allProjects : allProjects.filter((p) => p.bu === bu);
    return ["All", ...Array.from(new Set(filtered.map((p) => p.market)))];
  }, [bu]);

  const brands = useMemo(() => {
    const base = allProjects.filter(
      (p) => (bu === "All" || p.bu === bu) && (country === "All" || p.market === country),
    );
    return ["All", ...Array.from(new Set(base.map((p) => p.brand)))];
  }, [bu, country]);

  const filtered = allProjects.filter(
    (p) =>
      (bu === "All" || p.bu === bu) &&
      (country === "All" || p.market === country) &&
      (brand === "All" || p.brand === brand) &&
      (query === "" ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(query.toLowerCase())),
  );

  const selected = filtered.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Project Picker
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {filtered.length} project{filtered.length === 1 ? "" : "s"} match your filters
          </p>
        </div>
        <button className="p-1 rounded hover:bg-muted transition-colors">
          <MoreHorizontal size={14} className="text-muted-foreground" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <FacetRow label="BU" options={bus} value={bu} onChange={(v) => { setBu(v); setCountry("All"); setBrand("All"); }} />
        <FacetRow label="Country" options={countries} value={country} onChange={(v) => { setCountry(v); setBrand("All"); }} />
        <FacetRow label="Brand" options={brands} value={brand} onChange={setBrand} />

        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="h-9 text-xs pl-7"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map((p) => {
            const isSelected = selectedId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`group text-left rounded-lg border p-3 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs font-semibold text-foreground truncate flex-1">{p.name}</p>
                  <Avatar className="h-5 w-5 shrink-0">
                    <AvatarFallback className="bg-primary/15 text-primary text-[8px] font-semibold">
                      {p.ownerInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{p.bu}</Badge>
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{p.market}</Badge>
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{p.brand}</Badge>
                </div>
                <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={9} />
                    {p.created}
                  </span>
                  {p.sharedBy && (
                    <span className="flex items-center gap-1 text-primary/80">
                      <Users size={9} /> Shared by {p.sharedBy.split(" ")[0]}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full px-3 py-8 text-center text-xs text-muted-foreground">
              No projects match. Try clearing filters.
            </p>
          )}
        </div>

        {selected && (
          <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{selected.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Stage: {selected.stage} · Updated {selected.updated}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                className="h-7 text-[11px] gap-1"
                onClick={() => onPick?.(selected.id, selected.name)}
              >
                <FolderOpen size={11} /> Open project
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1">
                <Layers size={11} /> View batches
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1">
                <Activity size={11} /> View models
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-center pt-1">
          <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1 text-muted-foreground">
            <Plus size={11} /> New project
          </Button>
        </div>
      </div>
    </div>
  );
}

function FacetRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-14 shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${
              value === opt
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
