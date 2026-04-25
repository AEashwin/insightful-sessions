import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronRight, Play, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const selectedVariables = [
  { name: "TV_TotalGRPs_Own", group: "Traditional", role: "Mandatory", transform: "Adstock", decay: "0.10 · 0.90 · 0.10", curve: "S Curve · α 2.0 · β 88.94", prior: "Contribution 0–80%", qc: "OK" },
  { name: "Total_Digital_Display_Impressions", group: "Digital", role: "Mandatory", transform: "Adstock", decay: "0.10 · 0.90 · 0.10", curve: "S Curve · α 2.0 · β 74,663", prior: "Contribution 0–80%", qc: "OK" },
  { name: "Total_Youtube_Impressions", group: "Digital", role: "Mandatory", transform: "Adstock", decay: "0.10 · 0.90 · 0.10", curve: "S Curve · α 2.0 · β 21,480", prior: "Contribution 0–80%", qc: "OK" },
  { name: "Comp1_TV_Spend", group: "Competition", role: "Optional", transform: "Direct", decay: "—", curve: "—", prior: "Contribution -80–80%", qc: "OK" },
  { name: "Online_Coupon", group: "Promotion", role: "Mandatory", transform: "Adstock", decay: "0.10 · 0.90 · 0.20", curve: "S Curve · α 2.0 · β 10,957", prior: "Contribution 0–80%", qc: "Review" },
  { name: "Promo_Leaflets", group: "Promotion", role: "Optional", transform: "Direct", decay: "—", curve: "Saturation", prior: "Contribution 0–80%", qc: "OK" },
  { name: "Election_Day", group: "Events", role: "Mandatory", transform: "Direct", decay: "—", curve: "—", prior: "Fixed event", qc: "OK" },
  { name: "Holiday_Event1", group: "Events", role: "Mandatory", transform: "Direct", decay: "—", curve: "—", prior: "Fixed event", qc: "OK" },
  { name: "Avg_Price_Comp5", group: "Competition", role: "Optional", transform: "Direct", decay: "—", curve: "—", prior: "Contribution -80–80%", qc: "OK" },
];

const qcRows = [
  { name: "R²", criteria: "≥ 60%", weight: "20%", enabled: true },
  { name: "Adj-R²", criteria: "≥ 55%", weight: "20%", enabled: true },
  { name: "MAPE", criteria: "≤ 15%", weight: "20%", enabled: true },
  { name: "Holdout MAPE", criteria: "≤ 15%", weight: "20%", enabled: true },
  { name: "Durbin-Watson", criteria: "1.2–2.5", weight: "—", enabled: true },
];

type DetailView = "none" | "transformations" | "priors" | "qc";

export function ModelConfigurationCard({ onRunModel }: { onRunModel?: () => void }) {
  const [detail, setDetail] = useState<DetailView>("none");
  const [variables, setVariables] = useState(selectedVariables.map((row) => ({ ...row, selected: true })));
  const [duration, setDuration] = useState({ start: "2022-01-08", end: "2025-02-22", holdoutStart: "2024-07-08", holdoutEnd: "2025-02-22" });
  const selectedCount = variables.filter((row) => row.selected).length;

  const updateVariable = (name: string, patch: Partial<(typeof variables)[number]>) => {
    setVariables((current) => current.map((row) => (row.name === name ? { ...row, ...patch } : row)));
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Model Configuration</h3>
          <p className="text-[11px] text-muted-foreground">System-selected variables, model-level settings, transformations, priors, and QC gates</p>
        </div>
        <Button size="sm" className="h-8 gap-1 text-[11px]" onClick={onRunModel}><Play size={12} /> Run model</Button>
      </div>

      <div className="space-y-3 bg-muted/20 p-3">
        <section className="grid gap-2 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-foreground"><SlidersHorizontal size={13} className="text-primary" /> Model parameters</div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="KPI"><Select defaultValue="sales"><SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sales">Sales</SelectItem><SelectItem value="volume">Volume</SelectItem><SelectItem value="revenue">Revenue</SelectItem></SelectContent></Select></Field>
              <Field label="Model type"><Select defaultValue="unpooled"><SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unpooled">Unpooled</SelectItem><SelectItem value="pooled">Pooled</SelectItem><SelectItem value="hierarchical">Hierarchical</SelectItem></SelectContent></Select></Field>
              <Field label="Model form"><Select defaultValue="additive"><SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="additive">Additive</SelectItem><SelectItem value="multiplicative">Multiplicative</SelectItem><SelectItem value="log-linear">Log-linear</SelectItem></SelectContent></Select></Field>
              <Field label="Dependent variable"><Select defaultValue="sales"><SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sales">Sales</SelectItem><SelectItem value="volume">Volume</SelectItem><SelectItem value="revenue">Revenue</SelectItem></SelectContent></Select></Field>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-foreground"><CalendarDays size={13} className="text-primary" /> Duration & holdout</div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Model duration"><div className="grid grid-cols-2 gap-1"><Input type="date" value={duration.start} onChange={(event) => setDuration({ ...duration, start: event.target.value })} className="h-8 text-[11px]" /><Input type="date" value={duration.end} onChange={(event) => setDuration({ ...duration, end: event.target.value })} className="h-8 text-[11px]" /></div></Field>
              <Field label="Holdout period"><div className="grid grid-cols-2 gap-1"><Input type="date" value={duration.holdoutStart} onChange={(event) => setDuration({ ...duration, holdoutStart: event.target.value })} className="h-8 text-[11px]" /><Input type="date" value={duration.holdoutEnd} onChange={(event) => setDuration({ ...duration, holdoutEnd: event.target.value })} className="h-8 text-[11px]" /></div></Field>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-2 border-b border-border bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground">Selected modelling variables</p>
              <p className="text-[10px] text-muted-foreground">{selectedCount} of 40 classified variables selected · edit inclusion, role, transformations, priors, and QC inline</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <DetailButton active={detail === "transformations"} label="View transformations" onClick={() => setDetail(detail === "transformations" ? "none" : "transformations")} />
              <DetailButton active={detail === "priors"} label="View priors" onClick={() => setDetail(detail === "priors" ? "none" : "priors")} />
              <DetailButton active={detail === "qc"} label="View QC" onClick={() => setDetail(detail === "qc" ? "none" : "qc")} />
            </div>
          </div>
          <div className="max-h-[300px] overflow-auto">
            <table className="w-full text-[11px]">
              <thead className="sticky top-0 bg-muted/60 text-[10px] uppercase text-muted-foreground">
                <tr><th className="px-3 py-2 text-left font-semibold">Variable</th><th className="px-3 py-2 text-left font-semibold">Group</th><th className="px-3 py-2 text-left font-semibold">Role</th>{detail === "transformations" && <><th className="px-3 py-2 text-left font-semibold">Transform</th><th className="px-3 py-2 text-left font-semibold">Adstock</th><th className="px-3 py-2 text-left font-semibold">Media curve</th></>}{detail === "priors" && <th className="px-3 py-2 text-left font-semibold">Priors</th>}{detail === "qc" && <th className="px-3 py-2 text-left font-semibold">QC</th>}</tr>
              </thead>
              <tbody>
                {variables.map((row) => (
                  <tr key={row.name} className="border-t border-border odd:bg-background even:bg-muted/25 hover:bg-primary/5">
                    <td className="px-3 py-2"><div className="flex items-center gap-2"><Checkbox checked={row.selected} onCheckedChange={(checked) => updateVariable(row.name, { selected: checked === true })} /><span className="font-mono text-[10px] text-foreground">{row.name}</span></div></td><td className="px-3 py-2 text-muted-foreground">{row.group}</td><td className="px-3 py-2"><Select value={row.role.toLowerCase()} onValueChange={(value) => updateVariable(row.name, { role: value === "mandatory" ? "Mandatory" : "Optional" })}><SelectTrigger className="h-7 w-[98px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mandatory">Mandatory</SelectItem><SelectItem value="optional">Optional</SelectItem></SelectContent></Select></td>
                    {detail === "transformations" && <><td className="px-3 py-2"><Select value={row.transform.toLowerCase()} onValueChange={(value) => updateVariable(row.name, { transform: value === "adstock" ? "Adstock" : "Direct" })}><SelectTrigger className="h-7 w-[96px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="adstock">Adstock</SelectItem><SelectItem value="direct">Direct</SelectItem></SelectContent></Select></td><td className="px-3 py-2"><Input value={row.decay} onChange={(event) => updateVariable(row.name, { decay: event.target.value })} className="h-7 min-w-[130px] text-[10px]" /></td><td className="px-3 py-2"><Input value={row.curve} onChange={(event) => updateVariable(row.name, { curve: event.target.value })} className="h-7 min-w-[160px] text-[10px]" /></td></>}
                    {detail === "priors" && <td className="px-3 py-2"><Input value={row.prior} onChange={(event) => updateVariable(row.name, { prior: event.target.value })} className="h-7 min-w-[180px] text-[10px]" /></td>}
                    {detail === "qc" && <td className="px-3 py-2"><Select value={row.qc.toLowerCase()} onValueChange={(value) => updateVariable(row.name, { qc: value === "ok" ? "OK" : "Review" })}><SelectTrigger className="h-7 w-[90px] text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ok">OK</SelectItem><SelectItem value="review">Review</SelectItem></SelectContent></Select></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {detail === "qc" && <section className="rounded-lg border border-border bg-card p-3"><p className="mb-2 text-[11px] font-semibold text-foreground">Qualifying criteria</p><div className="grid gap-1 sm:grid-cols-5">{qcRows.map((row) => <div key={row.name} className="rounded-md bg-muted/35 p-2"><p className="text-[10px] font-semibold text-foreground">{row.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{row.criteria} · {row.weight}</p></div>)}</div></section>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-1"><span className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</span>{children}</label>; }
function DetailButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[10px] font-semibold transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{active ? <ChevronDown size={11} /> : <ChevronRight size={11} />}{label}</button>; }