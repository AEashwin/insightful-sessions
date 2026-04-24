import { useState } from "react";
import { FolderPlus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const bus = ["NorthAmerica", "Europe", "Asia-Pac", "LATAM"];
const markets = ["UK", "US", "France", "Germany", "Australia", "Japan", "India", "Brazil"];
const kpis = ["Sales Volume", "Revenue", "Market Share", "Brand Awareness", "Conversions"];

interface Props {
  onCreate?: (project: { name: string; brand: string; market: string; bu: string; kpi: string }) => void;
}

export function NewProjectCard({ onCreate }: Props = {}) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [bu, setBu] = useState("Europe");
  const [market, setMarket] = useState("UK");
  const [kpi, setKpi] = useState("Sales Volume");
  const [notes, setNotes] = useState("");

  const canCreate = name.trim() && brand.trim();

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            New Project
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
            <FolderPlus size={13} className="text-primary" /> Set up a new analysis
          </p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Project name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. UK_Chocolate_2026"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Brand</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Chocolate"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <ChipRow label="BU" options={bus} value={bu} onChange={setBu} />
        <ChipRow label="Market" options={markets} value={market} onChange={setMarket} />
        <ChipRow label="KPI" options={kpis} value={kpi} onChange={setKpi} />

        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything specific about this engagement..."
            rows={2}
            className="text-xs resize-none"
          />
        </div>

        <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 flex items-start gap-2">
          <Sparkles size={11} className="text-primary mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-snug">
            After creation you'll move straight into <span className="font-semibold text-foreground">stage 1 — Data Upload</span>.
          </p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{canCreate ? "Ready to create" : "Name + brand required"}</span>
        <Button
          size="sm"
          className="h-7 text-[11px] gap-1"
          disabled={!canCreate}
          onClick={() => onCreate?.({ name, brand, market, bu, kpi })}
        >
          <FolderPlus size={11} /> Create project
        </Button>
      </div>
    </div>
  );
}

function ChipRow({
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
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-14 shrink-0 pt-1">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
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
