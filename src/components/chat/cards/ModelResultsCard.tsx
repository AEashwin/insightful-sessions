import { useState } from "react";
import { ChevronDown, Download, ExternalLink, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";

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

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-3">
      <p className="mb-3 text-[11px] font-semibold text-foreground">{title}</p>
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

function ResponseCurveChart() {
  return (
    <div>
      <svg viewBox="0 0 220 100" className="h-28 w-full overflow-visible">
        <line x1="22" y1="88" x2="212" y2="88" stroke="hsl(var(--border))" />
        <line x1="22" y1="12" x2="22" y2="88" stroke="hsl(var(--border))" />
        {responseCurves.map((curve) => (
          <path key={curve.label} d={linePath(curve.points, 180, 70)} transform="translate(26 13)" fill="none" stroke={curve.color} strokeWidth="2.4" strokeLinecap="round" />
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {responseCurves.map((curve) => (
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

function FullResultsDashboard({ onOpenPopout, showPopout = true, variant = "inline" }: { onOpenPopout?: () => void; showPopout?: boolean; variant?: "inline" | "drawer" }) {
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
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Open in full screen" onClick={onOpenPopout}>
              <ExternalLink size={13} />
            </Button>
          )}
          <Button size="sm" className="h-8 gap-1.5 text-[11px]">
            <Download size={12} /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ChartPanel title="Model fit">
          <ModelFitChart />
        </ChartPanel>
        <ChartPanel title="Decomposition">
          <DecompositionChart />
        </ChartPanel>
        <ChartPanel title="Response curves">
          <ResponseCurveChart />
        </ChartPanel>
        <ChartPanel title="ROI">
          <RoiChart />
        </ChartPanel>
        <div className="md:col-span-2">
          <ChartPanel title="Effectiveness">
            <EffectivenessChart />
          </ChartPanel>
        </div>
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
    <Drawer open={popoutOpen} onOpenChange={setPopoutOpen} direction="right">
      <DrawerContent className="inset-y-0 right-0 left-auto mt-0 h-screen w-[min(60vw,920px)] max-w-[calc(100vw-24px)] rounded-none border-l border-border">
        <div className="sr-only">
          <DrawerTitle>Model 1 Full Results</DrawerTitle>
          <DrawerDescription>Expanded model dashboard popout</DrawerDescription>
        </div>
        <div className="h-full overflow-y-auto">
          <FullResultsDashboard showPopout={false} variant="drawer" />
        </div>
      </DrawerContent>
    </Drawer>
    </>
  );
}
