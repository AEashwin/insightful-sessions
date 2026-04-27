import { useRef, useState } from "react";
import { ChevronDown, Download, ExternalLink, Maximize2, SlidersHorizontal, Table2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const metrics = [
  { label: "R²", value: "0.94", tone: "success" },
  { label: "Adj R²", value: "0.92", tone: "success" },
  { label: "MAPE", value: "8.2%", tone: "success" },
  { label: "DW", value: "1.61", tone: "warning" },
];

const split = [
  { label: "Base", pct: 52, color: "hsl(var(--navy))" },
  { label: "Incremental", pct: 48, color: "hsl(var(--primary))" },
];

const channels = [
  { v: "TV", spend: "£2.4M", contrib: "18.2%", roi: 3.2 },
  { v: "Digital", spend: "£1.2M", contrib: "14.0%", roi: 2.6 },
  { v: "OOH", spend: "£380k", contrib: "4.2%", roi: 2.1 },
  { v: "Radio", spend: "£290k", contrib: "3.8%", roi: 1.8 },
  { v: "Promo", spend: "£1.1M", contrib: "9.0%", roi: 1.2 },
];

const fitPoints = [
  { x: 0, actual: 52, predicted: 50 },
  { x: 18, actual: 57, predicted: 56 },
  { x: 36, actual: 55, predicted: 57 },
  { x: 54, actual: 64, predicted: 62 },
  { x: 72, actual: 68, predicted: 69 },
  { x: 90, actual: 73, predicted: 72 },
  { x: 108, actual: 70, predicted: 71 },
  { x: 126, actual: 79, predicted: 78 },
  { x: 144, actual: 83, predicted: 82 },
  { x: 162, actual: 86, predicted: 84 },
  { x: 180, actual: 88, predicted: 87 },
];

const decomposition = [
  { label: "Base", value: 52, color: "hsl(var(--navy))" },
  { label: "TV", value: 18, color: "hsl(var(--primary))" },
  { label: "Digital", value: 14, color: "hsl(var(--accent-foreground))" },
  { label: "Promo", value: 9, color: "hsl(var(--warning))" },
  { label: "Other", value: 7, color: "hsl(var(--muted-foreground))" },
];

const responseCurves = [
  { label: "TV", color: "hsl(var(--primary))", points: [8, 28, 47, 62, 72, 78] },
  { label: "Digital", color: "hsl(var(--success))", points: [5, 24, 41, 54, 63, 70] },
  { label: "Promo", color: "hsl(var(--warning))", points: [3, 16, 25, 32, 36, 39] },
];

const periodOptions = ["All periods", "Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"];

const responseCurveByPeriod: Record<string, typeof responseCurves> = {
  "All periods": responseCurves,
  "Q1 2024": [
    { label: "TV", color: "hsl(var(--primary))", points: [6, 22, 38, 51, 60, 66] },
    { label: "Digital", color: "hsl(var(--success))", points: [7, 25, 39, 48, 55, 60] },
    { label: "Promo", color: "hsl(var(--warning))", points: [4, 15, 23, 29, 33, 35] },
  ],
  "Q2 2024": [
    { label: "TV", color: "hsl(var(--primary))", points: [9, 29, 49, 64, 74, 80] },
    { label: "Digital", color: "hsl(var(--success))", points: [6, 27, 44, 57, 66, 73] },
    { label: "Promo", color: "hsl(var(--warning))", points: [3, 18, 28, 35, 40, 43] },
  ],
  "Q3 2024": [
    { label: "TV", color: "hsl(var(--primary))", points: [10, 31, 50, 66, 76, 81] },
    { label: "Digital", color: "hsl(var(--success))", points: [5, 23, 41, 56, 67, 75] },
    { label: "Promo", color: "hsl(var(--warning))", points: [2, 13, 21, 28, 31, 34] },
  ],
  "Q4 2024": [
    { label: "TV", color: "hsl(var(--primary))", points: [7, 26, 45, 60, 70, 77] },
    { label: "Digital", color: "hsl(var(--success))", points: [6, 24, 43, 58, 68, 76] },
    { label: "Promo", color: "hsl(var(--warning))", points: [5, 20, 31, 39, 45, 49] },
  ],
};

const periodComparison = [
  { period: "Q1 2024", tv: 16, digital: 12, promo: 8, other: 6, effectiveness: 68, roi: 2.1, spend: "£1.0M", contribution: "42%" },
  { period: "Q2 2024", tv: 19, digital: 15, promo: 9, other: 7, effectiveness: 76, roi: 2.5, spend: "£1.2M", contribution: "50%" },
  { period: "Q3 2024", tv: 21, digital: 16, promo: 7, other: 8, effectiveness: 82, roi: 2.8, spend: "£1.4M", contribution: "52%" },
  { period: "Q4 2024", tv: 17, digital: 14, promo: 11, other: 6, effectiveness: 74, roi: 2.4, spend: "£1.1M", contribution: "48%" },
];

const fullPeriod = { period: "Full period", tv: 18, digital: 14, promo: 9, other: 7, effectiveness: 74, roi: 2.4, spend: "£5.2M", contribution: "48%" };

const effectiveness = [
  { label: "TV", value: 86 },
  { label: "Digital", value: 74 },
  { label: "OOH", value: 58 },
  { label: "Radio", value: 51 },
  { label: "Promo", value: 34 },
];

const topChannels = channels.slice(0, 3);

const roiCls = (r: number) =>
  r >= 2.5 ? "bg-success/10 text-success" : r >= 1.5 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";

// Donut chart
function Donut() {
  const total = split.reduce((a, b) => a + b.pct, 0);
  let cumulative = 0;
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
      {split.map((s) => {
        const dash = (s.pct / total) * circ;
        const offset = (cumulative / total) * circ;
        cumulative += s.pct;
        return (
          <circle
            key={s.label}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
          />
        );
      })}
    </svg>
  );
}

function linePath(values: number[], width = 180, height = 76) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / Math.max(1, max - min)) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function ChartPanel({ title, children, onExpand }: { title: string; children: React.ReactNode; onExpand?: () => void }) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        {onExpand ? (
          <button type="button" className="text-left text-[11px] font-semibold text-foreground underline-offset-2 hover:underline" onClick={onExpand}>
            {title}
          </button>
        ) : (
          <p className="text-[11px] font-semibold text-foreground">{title}</p>
        )}
        {onExpand && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={onExpand}>
            <Maximize2 size={11} /> Expand
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

function ModelFitChart() {
  return (
    <div>
      <svg viewBox="0 0 220 100" className="h-28 w-full overflow-visible">
        <line x1="24" y1="10" x2="24" y2="88" stroke="hsl(var(--border))" />
        <line x1="24" y1="88" x2="212" y2="88" stroke="hsl(var(--border))" />
        <path d={linePath(fitPoints.map((p) => p.actual), 180, 70)} transform="translate(26 13)" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
        <path d={linePath(fitPoints.map((p) => p.predicted), 180, 70)} transform="translate(26 13)" fill="none" stroke="hsl(var(--success))" strokeWidth="2.5" strokeDasharray="4 3" />
      </svg>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary" />Actual</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-success" />Predicted</span>
      </div>
    </div>
  );
}

function DecompositionChart() {
  return (
    <div className="space-y-2">
      {decomposition.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="text-muted-foreground">{item.value}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResponseCurveChart({ period = "All periods" }: { period?: string }) {
  const curves = responseCurveByPeriod[period] ?? responseCurves;
  return (
    <div>
      <svg viewBox="0 0 220 100" className="h-28 w-full overflow-visible">
        <line x1="22" y1="88" x2="212" y2="88" stroke="hsl(var(--border))" />
        <line x1="22" y1="12" x2="22" y2="88" stroke="hsl(var(--border))" />
        {curves.map((curve) => (
          <path key={curve.label} d={linePath(curve.points, 180, 70)} transform="translate(26 13)" fill="none" stroke={curve.color} strokeWidth="2.4" strokeLinecap="round" />
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {curves.map((curve) => (
          <span key={curve.label} className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: curve.color }} />{curve.label}</span>
        ))}
      </div>
    </div>
  );
}

function RoiChart() {
  return (
    <div className="space-y-2">
      {channels.map((channel) => (
        <div key={channel.v} className="grid grid-cols-[52px_1fr_32px] items-center gap-2 text-[10px]">
          <span className="font-medium text-foreground">{channel.v}</span>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(channel.roi / 3.4) * 100}%` }} />
          </div>
          <span className="text-right font-semibold text-foreground">{channel.roi}x</span>
        </div>
      ))}
    </div>
  );
}

function EffectivenessChart() {
  return (
    <div className="flex h-28 items-end gap-2 border-b border-border px-1">
      {effectiveness.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t bg-success/70" style={{ height: `${item.value}%` }} />
          <span className="text-[9px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniContributionPie({ period }: { period: typeof periodComparison[number] }) {
  const items = [
    { label: "TV", value: period.tv, color: "hsl(var(--primary))" },
    { label: "Digital", value: period.digital, color: "hsl(var(--success))" },
    { label: "Promo", value: period.promo, color: "hsl(var(--warning))" },
    { label: "Other", value: period.other, color: "hsl(var(--muted-foreground))" },
  ];
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cumulative = 0;
  const radius = 34;
  const circ = 2 * Math.PI * radius;
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="mb-2 text-[11px] font-semibold text-foreground">{period.period}</p>
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
          {items.map((item) => {
            const dash = (item.value / total) * circ;
            const offset = (cumulative / total) * circ;
            cumulative += item.value;
            return <circle key={item.label} cx="50" cy="50" r={radius} fill="none" stroke={item.color} strokeWidth="16" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} />;
          })}
        </svg>
        <div className="min-w-0 flex-1 space-y-1">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2 text-[10px]">
              <span className="inline-flex items-center gap-1 text-muted-foreground"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />{item.label}</span>
              <span className="font-semibold text-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonGrid({ metric }: { metric: "effectiveness" | "roi" | "scroi" }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {periodComparison.map((period) => (
        <div key={period.period} className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{period.period}</p>
          {metric === "scroi" ? (
            <div className="mt-3 space-y-2 text-[11px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Spend</span><span className="font-semibold text-foreground">{period.spend}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Contribution</span><span className="font-semibold text-foreground">{period.contribution}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ROI</span><span className="font-semibold text-foreground">{period.roi}x</span></div>
            </div>
          ) : (
            <>
              <p className="mt-2 text-2xl font-bold text-foreground">{metric === "roi" ? `${period.roi}x` : `${period.effectiveness}%`}</p>
              <div className="mt-3 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${metric === "roi" ? (period.roi / 3) * 100 : period.effectiveness}%` }} /></div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ExpandedInsight({ type, responsePeriod, comparePeriods, onToggleCompare }: { type: string; responsePeriod: string; comparePeriods: boolean; onToggleCompare: () => void }) {
  const canCompare = ["Contribution pie", "Effectiveness", "ROI", "S+C+ROI", "Response curves"].includes(type);
  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-background p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Table2 size={14} /> Expanded {type}</div>
        {canCompare && (
          <Button variant={comparePeriods ? "default" : "outline"} size="sm" className="h-8 text-[11px]" onClick={onToggleCompare}>
            {comparePeriods ? "Full period" : "Compare periods"}
          </Button>
        )}
      </div>
      {type === "Model fit" && <><ModelFitChart /><DataTable headers={["Week", "Actual", "Predicted", "Variance", "Variance %"]} rows={fitPoints.map((p, i) => [`W${i + 1}`, p.actual, p.predicted, p.actual - p.predicted, `${(((p.actual - p.predicted) / p.actual) * 100).toFixed(1)}%`])} /></>}
      {type === "Decomposition" && <><DecompositionChart /><DataTable headers={["Component", "Contribution %", "Value", "Category"]} rows={decomposition.map((d) => [d.label, `${d.value}%`, `£${(d.value * 42).toLocaleString()}k`, d.label === "Base" ? "Baseline" : "Incremental"])} /></>}
      {type === "Contribution pie" && (comparePeriods ? <div className="grid gap-3 md:grid-cols-2">{periodComparison.map((period) => <MiniContributionPie key={period.period} period={period} />)}</div> : <MiniContributionPie period={{ period: "Full period", tv: 18, digital: 14, promo: 9, other: 7, effectiveness: 74, roi: 2.4, spend: "£5.2M", contribution: "48%" }} />)}
      {type === "Effectiveness" && (comparePeriods ? <ComparisonGrid metric="effectiveness" /> : <EffectivenessChart />)}
      {type === "ROI" && (comparePeriods ? <ComparisonGrid metric="roi" /> : <RoiChart />)}
      {type === "S+C+ROI" && (comparePeriods ? <ComparisonGrid metric="scroi" /> : <ComparisonGrid metric="scroi" />)}
      {type === "Response curves" && <><ResponseCurveChart period={comparePeriods ? responsePeriod : "All periods"} /><DataTable headers={["Channel", "Period", "Low spend", "Mid spend", "High spend"]} rows={(responseCurveByPeriod[comparePeriods ? responsePeriod : "All periods"] ?? responseCurves).map((c) => [c.label, comparePeriods ? responsePeriod : "Full period", c.points[1], c.points[3], c.points[5]])} /></>}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: Array<Array<string | number>> }) {
  return (
    <div className="mt-3 overflow-hidden rounded-md border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/40"><tr>{headers.map((h) => <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i} className="border-t border-border">{row.map((cell, idx) => <td key={`${i}-${idx}`} className="px-3 py-2 text-foreground">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function FullResultsDashboard({ onOpenPopout, showPopout = true, variant = "inline" }: { onOpenPopout?: () => void; showPopout?: boolean; variant?: "inline" | "drawer" | "page" }) {
  const [expandedInsight, setExpandedInsight] = useState("Model fit");
  const [responsePeriod, setResponsePeriod] = useState("All periods");
  const expandedRef = useRef<HTMLDivElement>(null);
  const expandToInsight = (insight: string) => {
    setExpandedInsight(insight);
    window.setTimeout(() => expandedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };
  const openInNewTab = () => {
    window.open(`${window.location.origin}/model-results-dashboard`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`${variant === "inline" ? "border-t border-primary/20 animate-accordion-down" : ""} bg-background/80 p-4`}>
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <span>Model 1</span>
            <span>›</span>
            <span className="text-foreground">Full Results</span>
          </div>
          <p className="text-sm font-semibold text-foreground">Expanded model dashboard</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
            <SlidersHorizontal size={12} /> Channel group
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[11px]">Due-to view</Button>
          <Button variant="outline" size="sm" className="h-8 text-[11px]">Include base</Button>
          {showPopout && (
            <>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Pop out dashboard" onClick={onOpenPopout}>
                <Maximize2 size={13} />
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={openInNewTab}>
                <ExternalLink size={13} /> New tab
              </Button>
            </>
          )}
          <Button size="sm" className="h-8 gap-1.5 text-[11px]">
            <Download size={12} /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ChartPanel title="Model fit" onExpand={() => expandToInsight("Model fit")}>
          <ModelFitChart />
        </ChartPanel>
        <ChartPanel title="Decomposition" onExpand={() => expandToInsight("Decomposition")}>
          <DecompositionChart />
        </ChartPanel>
        <ChartPanel title="Contribution pie" onExpand={() => expandToInsight("Contribution pie")}>
          <div className="grid grid-cols-2 gap-2">
            {periodComparison.slice(0, 4).map((period) => <MiniContributionPie key={period.period} period={period} />)}
          </div>
        </ChartPanel>
        <ChartPanel title="Response curves" onExpand={() => expandToInsight("Response curves")}>
          <div className="mb-2 flex justify-end">
            <select value={responsePeriod} onChange={(event) => setResponsePeriod(event.target.value)} className="h-7 rounded-md border border-input bg-background px-2 text-[11px] text-foreground">
              {periodOptions.map((period) => <option key={period}>{period}</option>)}
            </select>
          </div>
          <ResponseCurveChart period={responsePeriod} />
        </ChartPanel>
        <ChartPanel title="ROI" onExpand={() => expandToInsight("ROI")}>
          <RoiChart />
        </ChartPanel>
        <ChartPanel title="S+C+ROI" onExpand={() => expandToInsight("S+C+ROI")}>
          <ComparisonGrid metric="scroi" />
        </ChartPanel>
        <div className="md:col-span-2">
          <ChartPanel title="Effectiveness" onExpand={() => expandToInsight("Effectiveness")}>
            <EffectivenessChart />
          </ChartPanel>
        </div>
      </div>

      <div ref={expandedRef}>
        <ExpandedInsight type={expandedInsight} responsePeriod={responsePeriod} />
      </div>

      <div className="mt-3">
        <p className="mb-2 text-[11px] font-semibold text-foreground">Full ROI table</p>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-1.5 text-left font-semibold">Channel</th>
                <th className="px-3 py-1.5 text-right font-semibold">Spend</th>
                <th className="px-3 py-1.5 text-right font-semibold">Contrib.</th>
                <th className="px-3 py-1.5 text-right font-semibold">ROI</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.v} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-1.5 font-medium">{c.v}</td>
                  <td className="px-3 py-1.5 text-right text-muted-foreground">{c.spend}</td>
                  <td className="px-3 py-1.5 text-right">{c.contrib}</td>
                  <td className="px-3 py-1.5 text-right">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${roiCls(c.roi)}`}>{c.roi}x</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ModelResultsCard() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [popoutOpen, setPopoutOpen] = useState(false);

  return (
    <>
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Model Results
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Batch 2 · Model 0</p>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">
          Converged
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={`rounded-lg p-2.5 ${m.tone === "success" ? "bg-success/5" : "bg-warning/5"}`}
            >
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {m.label}
              </p>
              <p className="text-lg font-bold text-foreground mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Donut />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Split</p>
              <p className="text-sm font-bold text-foreground">52/48</p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {split.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-[11px] font-medium text-foreground">{s.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">{s.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-foreground mb-2">Top ROI summary</p>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-3 py-1.5">Channel</th>
                  <th className="text-right font-semibold px-3 py-1.5">Spend</th>
                  <th className="text-right font-semibold px-3 py-1.5">Contrib.</th>
                  <th className="text-right font-semibold px-3 py-1.5">ROI</th>
                </tr>
              </thead>
              <tbody>
                {topChannels.map((c) => (
                  <tr key={c.v} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-1.5 font-medium">{c.v}</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{c.spend}</td>
                    <td className="px-3 py-1.5 text-right">{c.contrib}</td>
                    <td className="px-3 py-1.5 text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${roiCls(c.roi)}`}>
                        {c.roi}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">156 weeks · Jan 22 – Dec 24</span>
        <Button size="sm" className="h-7 gap-1.5 text-[11px]" onClick={() => setDashboardOpen((open) => !open)}>
          View Dashboard
          <ChevronDown size={12} className={`transition-transform ${dashboardOpen ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {dashboardOpen && <FullResultsDashboard onOpenPopout={() => setPopoutOpen(true)} />}
    </div>
    {popoutOpen && (
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          aria-label="Close full results panel"
          className="absolute inset-0 bg-foreground/15 backdrop-blur-[1px]"
          onClick={() => setPopoutOpen(false)}
        />
        <div className="absolute inset-y-0 right-0 flex h-full w-[min(60vw,920px)] max-w-[calc(100vw-24px)] min-w-[320px] flex-col border-l border-border bg-background shadow-2xl animate-in slide-in-from-right">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <span>Model 1</span>
                <span>›</span>
                <span className="text-foreground">Full Results</span>
              </div>
              <p className="text-sm font-semibold text-foreground">Expanded model dashboard</p>
            </div>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setPopoutOpen(false)}>
              <X size={14} />
            </Button>
          </div>
          <div className="h-full overflow-y-auto">
            <FullResultsDashboard showPopout={false} variant="drawer" />
          </div>
        </div>
      </div>
    )}
    </>
  );
}
