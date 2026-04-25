import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronRight, Play, Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const selectedVariables = [
  { name: "TV_TotalGRPs_Own", group: "Traditional", transform: "Adstock", decay: ["0.10", "0.90", "0.10"], gamma: ["0.50", "3.00", "0.25"], period: ["1", "8", "1"], prior: ["0", "80"] },
  { name: "Total_Digital_Display_Impressions", group: "Digital", transform: "Adstock", decay: ["0.10", "0.90", "0.10"], gamma: ["0.50", "3.00", "0.25"], period: ["1", "6", "1"], prior: ["0", "80"] },
  { name: "Total_Youtube_Impressions", group: "Digital", transform: "Adstock", decay: ["0.10", "0.90", "0.10"], gamma: ["0.50", "3.00", "0.25"], period: ["1", "6", "1"], prior: ["0", "80"] },
  { name: "Comp1_TV_Spend", group: "Competition", transform: "Direct", decay: ["—", "—", "—"], gamma: ["—", "—", "—"], period: ["—", "—", "—"], prior: ["-80", "80"] },
  { name: "Online_Coupon", group: "Promotion", transform: "Adstock", decay: ["0.10", "0.90", "0.20"], gamma: ["0.50", "2.50", "0.25"], period: ["1", "4", "1"], prior: ["0", "80"] },
  { name: "Promo_Leaflets", group: "Promotion", transform: "Gamma", decay: ["0.10", "0.70", "0.10"], gamma: ["0.50", "2.00", "0.25"], period: ["1", "5", "1"], prior: ["0", "80"] },
  { name: "Election_Day", group: "Events", transform: "Direct", decay: ["—", "—", "—"], gamma: ["—", "—", "—"], period: ["—", "—", "—"], prior: ["Fixed", "Fixed"] },
  { name: "Holiday_Event1", group: "Events", transform: "Direct", decay: ["—", "—", "—"], gamma: ["—", "—", "—"], period: ["—", "—", "—"], prior: ["Fixed", "Fixed"] },
  { name: "Avg_Price_Comp5", group: "Competition", transform: "Direct", decay: ["—", "—", "—"], gamma: ["—", "—", "—"], period: ["—", "—", "—"], prior: ["-80", "80"] },
];

const availableVariables = [
  "Paid_Search_Clicks", "Meta_Impressions", "TikTok_Impressions", "Retail_Display_Spend", "OOH_Panels",
  "Radio_Spots", "Email_Campaigns", "Sampling_Events", "Instore_Coupon", "Feature_Display",
  "Price_Index", "Base_Price", "Discount_Depth", "Distribution_ACV", "Seasonality_Index",
  "Weather_Temp", "GDP_Index", "Consumer_Confidence", "Competitor_Price_Index", "Comp2_TV_Spend",
  "Comp3_Digital_Spend", "Comp4_Promo", "Holiday_Event2", "School_Break", "Black_Friday",
  "Payday_Flag", "Stockout_Flag", "Search_Trends", "Website_Visits", "Organic_Social", "PR_Mentions",
].map((name, index) => ({
  name,
  group: index < 7 ? "Digital" : index < 11 ? "Promotion" : index < 18 ? "Control" : index < 23 ? "Competition" : "Events",
  transform: index % 4 === 0 ? "Gamma" : index % 3 === 0 ? "Adstock" : "Direct",
  decay: index % 3 === 0 ? ["0.10", "0.80", "0.10"] : ["—", "—", "—"],
  gamma: index % 4 === 0 ? ["0.50", "2.50", "0.25"] : ["—", "—", "—"],
  period: index % 3 === 0 || index % 4 === 0 ? ["1", "6", "1"] : ["—", "—", "—"],
  prior: index > 17 && index < 23 ? ["-80", "80"] : ["0", "80"],
}));

const qcRows = [
  { name: "R²", min: "60", max: "", weight: "20", enabled: true },
  { name: "Adj-R²", min: "55", max: "", weight: "20", enabled: true },
  { name: "MAPE", min: "", max: "15", weight: "20", enabled: true },
  { name: "Holdout MAPE", min: "", max: "15", weight: "20", enabled: true },
  { name: "Durbin-Watson", min: "1.2", max: "2.5", weight: "", enabled: true },
];

type DetailView = "none" | "transformations" | "priors" | "qc";

export function ModelConfigurationCard({ onRunModel }: { onRunModel?: () => void }) {
  const [detail, setDetail] = useState<DetailView>("none");
  const [variables, setVariables] = useState([
    ...selectedVariables.map((row) => ({ ...row, selected: true })),
    ...availableVariables.map((row) => ({ ...row, selected: false })),
  ]);
  const [duration, setDuration] = useState({ start: "2022-01-08", end: "2025-02-22", holdoutStart: "2024-07-08", holdoutEnd: "2025-02-22" });
  const [holdoutEnabled, setHoldoutEnabled] = useState(true);
  const [showAllVariables, setShowAllVariables] = useState(false);
  const [criteria, setCriteria] = useState(qcRows);
  const selectedCount = variables.filter((row) => row.selected).length;
  const visibleVariables = showAllVariables ? variables : variables.filter((row) => row.selected);

  const updateVariable = (name: string, patch: Partial<(typeof variables)[number]>) => {
    setVariables((current) => current.map((row) => (row.name === name ? { ...row, ...patch } : row)));
  };

  const updateRange = (name: string, key: "decay" | "gamma" | "period" | "prior", index: number, value: string) => {
    setVariables((current) => current.map((row) => {
      if (row.name !== name) return row;
      const next = [...row[key]] as string[];
      next[index] = value;
      return { ...row, [key]: next };
    }));
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Model Configuration</h3>
          <p className="text-[11px] text-muted-foreground">System-selected variables, model-level settings, transformations, priors, and QC gates</p>
        </div>
      </div>

      <div className="space-y-3 bg-muted/20 p-3">
        <section className="grid gap-2 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-foreground"><SlidersHorizontal size={13} className="text-primary" /> Model parameters</div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Field label="KPI"><Select defaultValue="sales"><SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sales">Sales</SelectItem><SelectItem value="volume">Volume</SelectItem><SelectItem value="revenue">Revenue</SelectItem></SelectContent></Select></Field>
              <Field label="Model type"><Select defaultValue="unpooled"><SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unpooled">Unpooled</SelectItem><SelectItem value="pooled">Pooled</SelectItem><SelectItem value="hierarchical">Hierarchical</SelectItem></SelectContent></Select></Field>
              <Field label="Model form"><Select defaultValue="additive"><SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="additive">Additive</SelectItem><SelectItem value="multiplicative">Multiplicative</SelectItem><SelectItem value="log-linear">Log-linear</SelectItem></SelectContent></Select></Field>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-semibold text-foreground"><span className="inline-flex items-center gap-2"><CalendarDays size={13} className="text-primary" /> Duration & holdout</span><label className="flex items-center gap-2 text-[10px] text-muted-foreground"><Switch checked={holdoutEnabled} onCheckedChange={setHoldoutEnabled} /> Holdout on</label></div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md bg-muted/25 p-2"><p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Model duration</p><div className="grid grid-cols-2 gap-2"><Field label="Start date"><Input type="date" value={duration.start} onChange={(event) => setDuration({ ...duration, start: event.target.value })} className="h-9 min-w-[132px] text-[12px]" /></Field><Field label="End date"><Input type="date" value={duration.end} onChange={(event) => setDuration({ ...duration, end: event.target.value })} className="h-9 min-w-[132px] text-[12px]" /></Field></div></div>
              <div className="rounded-md bg-muted/25 p-2"><p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Holdout period</p><div className="grid grid-cols-2 gap-2 opacity-100 data-[disabled=true]:opacity-45" data-disabled={!holdoutEnabled}><Field label="Start date"><Input disabled={!holdoutEnabled} type="date" value={duration.holdoutStart} onChange={(event) => setDuration({ ...duration, holdoutStart: event.target.value })} className="h-9 min-w-[132px] text-[12px]" /></Field><Field label="End date"><Input disabled={!holdoutEnabled} type="date" value={duration.holdoutEnd} onChange={(event) => setDuration({ ...duration, holdoutEnd: event.target.value })} className="h-9 min-w-[132px] text-[12px]" /></Field></div></div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-2 border-b border-border bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground">Selected modelling variables</p>
              <p className="text-[10px] text-muted-foreground">{selectedCount} of 40 classified variables selected · add remaining variables and edit transformations or priors inline</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <DetailButton active={showAllVariables} label={showAllVariables ? "Show selected" : "Add variables"} icon="plus" onClick={() => setShowAllVariables(!showAllVariables)} />
              <DetailButton active={detail === "transformations"} label="View transformations" onClick={() => setDetail(detail === "transformations" ? "none" : "transformations")} />
              <DetailButton active={detail === "priors"} label="View priors" onClick={() => setDetail(detail === "priors" ? "none" : "priors")} />
              <DetailButton active={detail === "qc"} label="View QC" onClick={() => setDetail(detail === "qc" ? "none" : "qc")} />
            </div>
          </div>
          <div className="max-h-[300px] overflow-auto">
            <table className="w-full text-[11px]">
              <thead className="sticky top-0 bg-muted/60 text-[10px] uppercase text-muted-foreground">
                <tr><th className="px-3 py-2 text-left font-semibold">Variable</th><th className="px-3 py-2 text-left font-semibold">Group</th>{detail === "transformations" && <><th className="px-3 py-2 text-left font-semibold">Transform</th><th className="px-3 py-2 text-left font-semibold">Decay min / max / inc</th><th className="px-3 py-2 text-left font-semibold">Gamma min / max / inc</th><th className="px-3 py-2 text-left font-semibold">Period min / max / inc</th></>}{detail === "priors" && <><th className="px-3 py-2 text-left font-semibold">Prior min %</th><th className="px-3 py-2 text-left font-semibold">Prior max %</th></>}</tr>
              </thead>
              <tbody>
                {visibleVariables.map((row) => (
                  <tr key={row.name} className={`border-t border-border odd:bg-background even:bg-muted/25 hover:bg-primary/5 ${row.selected ? "" : "opacity-70"}`}>
                    <td className="px-3 py-2"><div className="flex items-center gap-2"><Checkbox checked={row.selected} onCheckedChange={(checked) => updateVariable(row.name, { selected: checked === true })} /><span className="font-mono text-[10px] text-foreground">{row.name}</span></div></td><td className="px-3 py-2 text-muted-foreground">{row.group}</td>
                    {detail === "transformations" && <><td className="px-3 py-2"><Select value={row.transform.toLowerCase()} onValueChange={(value) => updateVariable(row.name, { transform: value === "adstock" ? "Adstock" : value === "gamma" ? "Gamma" : "Direct" })}><SelectTrigger className="h-7 w-[96px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="adstock">Adstock</SelectItem><SelectItem value="gamma">Gamma</SelectItem><SelectItem value="direct">Direct</SelectItem></SelectContent></Select></td><td className="px-3 py-2"><RangeInputs values={row.decay} onChange={(index, value) => updateRange(row.name, "decay", index, value)} /></td><td className="px-3 py-2"><RangeInputs values={row.gamma} onChange={(index, value) => updateRange(row.name, "gamma", index, value)} /></td><td className="px-3 py-2"><RangeInputs values={row.period} onChange={(index, value) => updateRange(row.name, "period", index, value)} /></td></>}
                    {detail === "priors" && <><td className="px-3 py-2"><Input value={row.prior[0]} onChange={(event) => updateRange(row.name, "prior", 0, event.target.value)} className="h-7 min-w-[90px] text-[10px]" /></td><td className="px-3 py-2"><Input value={row.prior[1]} onChange={(event) => updateRange(row.name, "prior", 1, event.target.value)} className="h-7 min-w-[90px] text-[10px]" /></td></>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {detail === "qc" && <section className="rounded-lg border border-border bg-card p-3"><p className="mb-2 text-[11px] font-semibold text-foreground">Qualifying criteria</p><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{criteria.map((row) => <div key={row.name} className="rounded-md bg-muted/35 p-2"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-[10px] font-semibold text-foreground">{row.name}</p><Checkbox checked={row.enabled} onCheckedChange={(checked) => setCriteria((current) => current.map((item) => item.name === row.name ? { ...item, enabled: checked === true } : item))} /></div><div className="grid grid-cols-2 gap-1"><Field label="Min"><Input value={row.min} placeholder="—" onChange={(event) => setCriteria((current) => current.map((item) => item.name === row.name ? { ...item, min: event.target.value } : item))} className="h-7 text-[10px]" /></Field><Field label="Max"><Input value={row.max} placeholder="—" onChange={(event) => setCriteria((current) => current.map((item) => item.name === row.name ? { ...item, max: event.target.value } : item))} className="h-7 text-[10px]" /></Field></div><Field label="Weight %"><Input value={row.weight} placeholder="—" onChange={(event) => setCriteria((current) => current.map((item) => item.name === row.name ? { ...item, weight: event.target.value } : item))} className="mt-1 h-7 text-[10px]" /></Field></div>)}</div></section>}

        <div className="flex justify-end border-t border-border pt-3">
          <Button size="sm" className="h-8 gap-1 text-[11px]" onClick={onRunModel}><Play size={12} /> Run model</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-1"><span className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</span>{children}</label>; }
function RangeInputs({ values, onChange }: { values: string[]; onChange: (index: number, value: string) => void }) { return <div className="grid min-w-[170px] grid-cols-3 gap-1">{["Min", "Max", "Inc"].map((label, index) => <Input key={label} aria-label={label} value={values[index]} onChange={(event) => onChange(index, event.target.value)} className="h-7 text-[10px]" />)}</div>; }
function DetailButton({ active, label, icon, onClick }: { active: boolean; label: string; icon?: "plus"; onClick: () => void }) { return <button type="button" onClick={onClick} className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[10px] font-semibold transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{icon === "plus" ? <Plus size={11} /> : active ? <ChevronDown size={11} /> : <ChevronRight size={11} />}{label}</button>; }