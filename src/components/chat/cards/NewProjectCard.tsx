import { useMemo, useState } from "react";
import { FolderPlus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const hierarchy: Record<string, Record<string, string[]>> = {
  Europe: {
    UK: ["Brand4", "Chocolate"],
    France: ["Skincare"],
    Germany: ["Pharma"],
  },
  NorthAmerica: {
    US: ["Snacks"],
  },
  "Asia-Pac": {
    Australia: ["Beverage"],
    Japan: ["Coffee"],
    India: ["Cereal"],
  },
  LATAM: {
    Brazil: ["Beverage", "Skincare"],
  },
};

const bus = Object.keys(hierarchy);

function buForMarket(market: string) {
  return bus.find((bu) => Object.keys(hierarchy[bu]).includes(market)) ?? "Europe";
}

interface Props {
  onCreate?: (project: { name: string; brand: string; market: string; bu: string }) => void;
  initial?: Partial<{ name: string; brand: string; market: string; bu: string }>;
}

export function NewProjectCard({ onCreate, initial }: Props = {}) {
  const initialBu = initial?.market ? buForMarket(initial.market) : initial?.bu ?? "Europe";
  const initialMarket = initial?.market && hierarchy[initialBu]?.[initial.market] ? initial.market : Object.keys(hierarchy[initialBu])[0];
  const [name, setName] = useState(initial?.name ?? "");
  const [bu, setBu] = useState(initialBu);
  const [market, setMarket] = useState(initialMarket);
  const [brand, setBrand] = useState(
    initial?.brand && hierarchy[initialBu]?.[initialMarket]?.includes(initial.brand)
      ? initial.brand
      : hierarchy[initialBu][initialMarket][0],
  );

  const markets = useMemo(() => Object.keys(hierarchy[bu]), [bu]);
  const brands = hierarchy[bu][market] ?? [];

  const canCreate = name.trim() && brand.trim();

  const handleBuChange = (nextBu: string) => {
    const nextMarket = Object.keys(hierarchy[nextBu])[0];
    setBu(nextBu);
    setMarket(nextMarket);
    setBrand(hierarchy[nextBu][nextMarket][0]);
  };

  const handleMarketChange = (nextMarket: string) => {
    const nextBu = buForMarket(nextMarket);
    setBu(nextBu);
    setMarket(nextMarket);
    setBrand(hierarchy[nextBu][nextMarket][0]);
  };

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
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Project name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. UK_Chocolate_2026"
            className="h-8 text-xs"
          />
        </div>

        <ChipRow label="BU" options={bus} value={bu} onChange={handleBuChange} />
        <ChipRow label="Market" options={markets} value={market} onChange={handleMarketChange} />
        <ChipRow label="Brand" options={brands} value={brand} onChange={setBrand} />

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
          onClick={() => onCreate?.({ name, brand, market, bu })}
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
