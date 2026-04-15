import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, AlertTriangle, MessageSquare, Send, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const metrics = [
  { label: "R-squared", value: "0.94", note: "✓ Strong fit — above 0.90 threshold", color: "success" },
  { label: "MAPE", value: "8.2%", note: "✓ Good accuracy — below 10% threshold", color: "success" },
  { label: "Durbin-Watson", value: "1.61", note: "⚡ Borderline — acceptable but monitor", color: "warning" },
];

const contributions = [
  { label: "Base", pct: 52, color: "hsl(var(--navy))" },
  { label: "TV", pct: 18, color: "hsl(var(--primary))" },
  { label: "Digital", pct: 14, color: "hsl(249 42% 70%)" },
  { label: "Promo", pct: 9, color: "hsl(174 60% 45%)" },
  { label: "Seasonality", pct: 4, color: "hsl(var(--success))" },
  { label: "Other", pct: 3, color: "hsl(var(--border))" },
];

const tableData = [
  { variable: "TV_GBP_Spend", group: "TV", contribution: "18.2%", spend: "£2,400k", roi: 3.2, effectiveness: "High" },
  { variable: "Digital_Display", group: "Digital", contribution: "8.4%", spend: "£680k", roi: 2.8, effectiveness: "High" },
  { variable: "Paid_Social", group: "Digital", contribution: "5.6%", spend: "£520k", roi: 2.4, effectiveness: "Medium" },
  { variable: "OOH_Panels", group: "OOH", contribution: "4.2%", spend: "£380k", roi: 2.1, effectiveness: "Medium" },
  { variable: "Radio_Spots", group: "Radio", contribution: "3.8%", spend: "£290k", roi: 1.8, effectiveness: "Medium" },
  { variable: "Promo_Depth", group: "Promo", contribution: "9.0%", spend: "£1,100k", roi: 1.2, effectiveness: "Low" },
  { variable: "Print_Insertions", group: "Print", contribution: "1.4%", spend: "£180k", roi: 0.9, effectiveness: "Low" },
  { variable: "Competitor_TV", group: "Competitive", contribution: "—", spend: "—", roi: 0, effectiveness: "N/A" },
];

const roiColor = (roi: number) => {
  if (roi === 0) return "bg-muted text-muted-foreground";
  if (roi >= 2.5) return "bg-success/10 text-success";
  if (roi >= 1.5) return "bg-warning/10 text-warning";
  return "bg-destructive/10 text-destructive";
};

const effectColor: Record<string, string> = {
  High: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-destructive/10 text-destructive border-destructive/20",
  "N/A": "bg-muted text-muted-foreground border-border",
};

export default function ModelOutput() {
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const navigate = useNavigate();

  return (
    <AppShell>
      {/* Breadcrumb */}
      <button onClick={() => navigate("/workflow")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Workflow
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-foreground">Model Output — Batch 2 · Model 0</h1>
            <Badge className="bg-success/10 text-success border-success/20 text-[10px] font-medium" variant="outline">
              Run Complete
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Jan 2022 – Dec 2024 · 156 weeks · Converged</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => (
          <Card key={m.label} className={`border shadow-sm ${m.color === "success" ? "bg-success/5" : "bg-warning/5"}`}>
            <CardContent className="p-5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
              <p className="text-3xl font-bold text-foreground mb-2">{m.value}</p>
              <p className={`text-xs ${m.color === "success" ? "text-success" : "text-warning"}`}>{m.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contribution chart */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-foreground mb-4">Volume Contribution Decomposition</h2>
        <div className="h-10 rounded-lg overflow-hidden flex">
          {contributions.map((c) => (
            <div
              key={c.label}
              style={{ width: `${c.pct}%`, backgroundColor: c.color }}
              className="flex items-center justify-center transition-all hover:opacity-80"
            >
              {c.pct >= 8 && <span className="text-[10px] font-semibold text-white">{c.pct}%</span>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-5 mt-3 flex-wrap">
          {contributions.map((c) => (
            <div key={c.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
              <span className="text-xs text-muted-foreground">{c.label} ({c.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance table */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-foreground mb-4">Variable Performance</h2>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Variable</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Group</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">Contribution%</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">Spend</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">ROI</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-center">Effectiveness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, i) => (
                <TableRow key={row.variable} className={`hover:bg-muted/40 transition-colors ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                  <TableCell className="font-mono text-xs font-medium">{row.variable}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.group}</TableCell>
                  <TableCell className="text-sm text-right">{row.contribution}</TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">{row.spend}</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${roiColor(row.roi)}`}>
                      {row.roi > 0 ? `${row.roi}x` : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[10px] font-medium ${effectColor[row.effectiveness]}`}>
                      {row.effectiveness}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Limitation banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-warning/5 border border-warning/20 mb-6">
        <Zap size={14} className="text-warning shrink-0" />
        <span className="text-xs text-warning">
          ROI fields require a publish report step in the DD platform before populating. See known issues.
        </span>
      </div>

      {/* AI Interpretation */}
      <Card className="border-l-4 border-l-primary shadow-sm mb-8">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-foreground mb-3">AI Interpretation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Model fit is strong with R² of 0.94 and MAPE of 8.2%, both within acceptable thresholds.
            TV remains the highest-performing paid media channel at 3.2x ROI. Promotional spend shows
            relatively low efficiency at 1.2x — consider reviewing promotional depth strategy. Note:
            ROI and spend effectiveness fields require a publish report step before they populate
            fully — this is a known platform limitation.
          </p>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowChat(!showChat)}>
              <MessageSquare size={12} /> Ask a follow-up question
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5">
              Proceed to Simulation <ArrowRight size={14} />
            </Button>
          </div>

          {showChat && (
            <div className="mt-4 relative animate-slide-down">
              <Input
                placeholder="Ask about the model results..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="pr-10 h-9 text-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Send size={12} className="text-primary-foreground" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
