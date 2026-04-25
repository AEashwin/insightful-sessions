import { ArrowRight, Check, Download, FileSpreadsheet, Info, Upload, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const channels = [
  { id: "tv", name: "TV", vars: 4, status: "Auto-mapped", tone: "success", rows: [{ metric: "TV_S21_GRPs", spend: "TV_S21_Spend" }, { metric: "TV_S31_Imps", spend: "TV_S31_Spend" }, { metric: "TV_S43_TRPs", spend: "TV_S43_Spend" }, { metric: "TV_S53_Spend", spend: "Spend source" }] },
  { id: "halo", name: "Halo TV", vars: 2, status: "Auto-mapped", tone: "success", rows: [{ metric: "Halo_TV_GRPs", spend: "Halo_TV_Spend" }, { metric: "Halo_TV_Spend", spend: "Spend source" }] },
  { id: "meta", name: "Meta", vars: 5, status: "Needs review", tone: "warning", rows: [{ metric: "Meta_SB1_Imps", spend: "Meta_SB1_Spend" }, { metric: "Meta_SB1_Clicks", spend: "Meta_SB1_Spend" }, { metric: "Meta_SB2_Imps", spend: "Meta_SB2_Spend" }, { metric: "Meta_SB1_Spend", spend: "Spend source" }, { metric: "Meta_SB2_Spend", spend: "Spend source" }] },
  { id: "dv360", name: "DV360", vars: 4, status: "Auto-mapped", tone: "success", rows: [{ metric: "DV360_YTProg_Imps", spend: "DV360_YTProg_Spend" }, { metric: "DV360_Display_Imps", spend: "DV360_Display_Spend" }] },
  { id: "youtube", name: "YouTube", vars: 1, status: "Spend only", tone: "primary", rows: [{ metric: "YouTube_Spend", spend: "Spend only" }] },
  { id: "trade", name: "Trade scheme", vars: 1, status: "Spend only", tone: "primary", rows: [{ metric: "TradeScheme_Nts_Amt", spend: "Spend only" }] },
  { id: "promo", name: "Promotions", vars: 2, status: "Missing spend", tone: "destructive", rows: [{ metric: "Promo_Flag", spend: "No spend" }, { metric: "Leaflet_Drops", spend: "No spend" }] },
];

const tabs = ["All 19", "Mapped 14", "Missing 3", "Spend only 2"];

export function SpendMappingCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Spend Upload & Mapping</h3>
          <p className="text-[11px] text-muted-foreground">Map spend source columns to impressions, clicks, GRPs, and promo variables</p>
        </div>
        <div className="flex items-center gap-1.5">
          <IconButton label="Download template"><Download size={13} /></IconButton>
          <IconButton label="Upload spend file"><Upload size={13} /></IconButton>
          <Button size="sm" className="h-8 gap-1 text-[11px]"><Check size={12} /> Confirm</Button>
        </div>
      </div>

      <div className="grid gap-3 bg-muted/20 p-3 lg:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-card p-1">
            {tabs.map((tab, index) => (
              <button key={tab} type="button" className={`h-8 rounded-md text-[11px] font-semibold transition-colors ${index === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-warning/25 bg-warning/10 px-3 py-2 text-[11px] text-foreground">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2"><Info size={12} className="text-warning" /> 3 groups are missing spend data. Download template, fill spend, and upload.</span>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px]"><FileSpreadsheet size={11} /> Template</Button>
            </div>
          </div>

          <div className="space-y-1.5">
            {channels.map((channel) => (
              <ChannelPanel key={channel.id} channel={channel} />
            ))}
          </div>
        </div>

        <aside className="space-y-2">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Coverage</p>
            <div className="mt-2 space-y-2">
              <Metric label="Mapped" value="14" note="74%" />
              <Metric label="Missing spend" value="3" note="Promotions" />
              <Metric label="Spend only" value="2" note="Allowed" />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI checks</p>
            <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
              <p className="flex items-center gap-1.5 text-success"><Check size={11} /> Spend periodicity matches weekly</p>
              <p className="flex items-center gap-1.5 text-success"><Check size={11} /> Currency detected as GBP</p>
              <p className="flex items-center gap-1.5 text-warning"><Wand2 size={11} /> Meta split needs approval</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-2 border-t border-border bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] text-muted-foreground">Single-view review: mapping, missing spend, spend-only exceptions, upload action, and AI checks.</span>
        <Button size="sm" className="h-8 gap-1 text-[11px]"><ArrowRight size={12} /> Proceed to variable properties</Button>
      </div>
    </div>
  );
}

function ChannelPanel({ channel }: { channel: typeof channels[number] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">{channel.name.slice(0, 2)}</span>
          <p className="text-[11px] font-semibold text-foreground">{channel.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{channel.vars} vars</span>
          <StatusBadge tone={channel.tone} label={channel.status} />
        </div>
      </div>
      <div className="divide-y divide-border">
        {channel.rows.map((row) => (
          <div key={`${channel.id}-${row.metric}-${row.spend}`} className="grid grid-cols-[minmax(0,1fr)_16px_minmax(120px,0.9fr)] items-center gap-2 px-3 py-1.5 text-[11px]">
            <span className="truncate font-mono text-foreground">{row.metric}</span>
            <ArrowRight size={10} className="text-muted-foreground" />
            <button type="button" className="min-w-0 truncate rounded-md border border-border bg-background px-2 py-1 text-left font-mono text-[10px] text-foreground hover:border-primary/40 hover:bg-muted">
              {row.spend}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ tone, label }: { tone: string; label: string }) {
  const classes = tone === "success" ? "border-success/25 bg-success/10 text-success" : tone === "warning" ? "border-warning/25 bg-warning/10 text-warning" : tone === "destructive" ? "border-destructive/25 bg-destructive/10 text-destructive" : "border-primary/25 bg-primary/10 text-primary";
  return <Badge variant="outline" className={`h-5 text-[9px] ${classes}`}>{label}</Badge>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-2 py-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-semibold text-foreground">{value} <span className="text-[10px] font-normal text-muted-foreground">{note}</span></span>
    </div>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">{children}</button>;
}
