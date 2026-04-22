import { useState } from "react";
import { Search, Plus, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
  brand: string;
  market: string;
  stage: string;
  updated: string;
}

const allProjects: Project[] = [
  { id: "1", name: "Demo_Brand4_2025", brand: "Brand4", market: "UK", stage: "Model Interp.", updated: "2m ago" },
  { id: "2", name: "UK_Chocolate_2026", brand: "Chocolate", market: "UK", stage: "Data Upload", updated: "1d ago" },
  { id: "3", name: "AUS_Beverage_Q1", brand: "Beverage", market: "Australia", stage: "Optimisation", updated: "5d ago" },
  { id: "4", name: "FR_Skincare_H2", brand: "Skincare", market: "France", stage: "Classification", updated: "1w ago" },
  { id: "5", name: "US_Snacks_2025", brand: "Snacks", market: "US", stage: "Variable Review", updated: "6h ago" },
  { id: "6", name: "DE_Pharma_Annual", brand: "Pharma", market: "Germany", stage: "Modeling", updated: "3d ago" },
];

const markets = ["All", "UK", "US", "France", "Germany", "Australia"];

export function ProjectSelectorCard() {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("All");

  const filtered = allProjects.filter(
    (p) =>
      (market === "All" || p.market === market) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Project Selector
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Pick a project or create one</p>
        </div>
        <Button size="sm" className="h-7 text-[11px] gap-1">
          <Plus size={11} /> New project
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by project or brand…"
              className="h-8 text-xs pl-7"
            />
          </div>
          <div className="flex items-center gap-1">
            {markets.map((m) => (
              <button
                key={m}
                onClick={() => setMarket(m)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  market === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border divide-y divide-border max-h-64 overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/40 transition-colors text-left"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {p.brand} · {p.market} · updated {p.updated}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-[9px] h-5">
                  {p.stage}
                </Badge>
                <ArrowRight size={12} className="text-muted-foreground" />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No projects match. Try different filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
