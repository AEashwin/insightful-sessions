import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, AlertTriangle, Sparkles, Download } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Variable {
  id: string;
  name: string;
  displayName: string;
  group: string;
  subGroup: string;
  bucket: string;
  expectedSign: "+" | "−";
  flagged: boolean;
  flagNote: string;
}

const initialVariables: Variable[] = [
  { id: "1", name: "TV_GBP_Spend", displayName: "TV Spend £", group: "Media", subGroup: "TV", bucket: "TV", expectedSign: "+", flagged: false, flagNote: "" },
  { id: "2", name: "Digital_Display_Imp", displayName: "Digital Display Impressions", group: "Media", subGroup: "Digital", bucket: "Digital", expectedSign: "+", flagged: false, flagNote: "" },
  { id: "3", name: "Paid_Social_Clicks", displayName: "Paid Social Clicks", group: "Media", subGroup: "Digital", bucket: "Digital", expectedSign: "+", flagged: false, flagNote: "" },
  { id: "4", name: "OOH_Panels", displayName: "OOH Panels", group: "Media", subGroup: "OOH", bucket: "OOH", expectedSign: "+", flagged: false, flagNote: "" },
  { id: "5", name: "Radio_Spots", displayName: "Radio Spots", group: "Media", subGroup: "Radio", bucket: "Radio", expectedSign: "+", flagged: false, flagNote: "" },
  { id: "6", name: "Print_Insertions", displayName: "Print Insertions", group: "Media", subGroup: "Print", bucket: "Print", expectedSign: "+", flagged: false, flagNote: "" },
  { id: "7", name: "Price_Index", displayName: "Price Index", group: "Pricing", subGroup: "Price", bucket: "Price", expectedSign: "+", flagged: true, flagNote: "Expected sign should be negative" },
  { id: "8", name: "Distribution_WD", displayName: "Weighted Distribution", group: "Base", subGroup: "Other", bucket: "Other", expectedSign: "+", flagged: false, flagNote: "" },
  { id: "9", name: "Promo_Depth", displayName: "Promotion Depth", group: "Pricing", subGroup: "Promo", bucket: "Promo", expectedSign: "+", flagged: false, flagNote: "" },
  { id: "10", name: "Seasonality_Christmas", displayName: "Christmas Seasonality", group: "Seasonality", subGroup: "Holiday", bucket: "Holiday", expectedSign: "+", flagged: false, flagNote: "" },
  { id: "11", name: "Competitor_TV_GRP", displayName: "Competitor TV GRPs", group: "Media", subGroup: "TV", bucket: "TV", expectedSign: "−", flagged: true, flagNote: "Should be in Competitive group, not Media" },
  { id: "12", name: "Base_Trend", displayName: "Base Trend", group: "Base", subGroup: "Other", bucket: "Other", expectedSign: "+", flagged: false, flagNote: "" },
];

const groups = ["Media", "Pricing", "Distribution", "Seasonality", "Competitive", "Base"];
const subGroups = ["TV", "Digital", "OOH", "Radio", "Print", "Promo", "Price", "Weather", "Holiday", "Other"];

type FilterKey = "All" | "Media" | "Base" | "Pricing" | "Seasonality" | "Flagged";

export default function Classification() {
  const [variables, setVariables] = useState(initialVariables);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const navigate = useNavigate();

  const flaggedCount = variables.filter((v) => v.flagged).length;
  const classifiedCount = variables.filter((v) => !v.flagged).length;

  const filterCounts: Record<FilterKey, number> = {
    All: variables.length,
    Media: variables.filter((v) => v.group === "Media").length,
    Base: variables.filter((v) => v.group === "Base").length,
    Pricing: variables.filter((v) => v.group === "Pricing").length,
    Seasonality: variables.filter((v) => v.group === "Seasonality").length,
    Flagged: flaggedCount,
  };

  const filtered = useMemo(() => {
    let result = variables;
    if (activeFilter === "Flagged") result = result.filter((v) => v.flagged);
    else if (activeFilter !== "All") result = result.filter((v) => v.group === activeFilter);
    if (search) result = result.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [variables, activeFilter, search]);

  const updateVar = (id: string, updates: Partial<Variable>) => {
    setVariables((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const applyAISuggestions = () => {
    setVariables((prev) =>
      prev.map((v) => {
        if (v.id === "11") return { ...v, group: "Competitive", flagged: false, flagNote: "" };
        if (v.id === "7") return { ...v, expectedSign: "−" as const, flagged: false, flagNote: "" };
        return v;
      })
    );
  };

  return (
    <AppShell>
      {/* Breadcrumb */}
      <button onClick={() => navigate("/workflow")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Workflow
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Variable Classification</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review how your datacube variables have been classified. Flag any that need correction.
          </p>
        </div>
        <Button disabled={flaggedCount > 0} onClick={() => navigate("/workflow")} className="h-9 text-sm gap-1.5">
          Continue to Model Config <ArrowRight size={14} />
        </Button>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5 pb-5 border-b">
        <span>{variables.length} variables total</span>
        <span className="w-1 h-1 bg-border rounded-full" />
        <span>{classifiedCount} classified</span>
        <span className="w-1 h-1 bg-border rounded-full" />
        <span className="text-warning font-medium">{flaggedCount} flagged for correction</span>
        <span className="w-1 h-1 bg-border rounded-full" />
        <span>1 unclassified</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {(Object.keys(filterCounts) as FilterKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              activeFilter === key
                ? "bg-primary text-primary-foreground border-primary"
                : key === "Flagged"
                ? "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                : "bg-muted text-muted-foreground border-border hover:bg-accent"
            }`}
          >
            {key} ({filterCounts[key]})
          </button>
        ))}
        <div className="flex-1" />
        <Input
          placeholder="Search variables..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 h-8 text-xs"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden mb-20">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-[180px]">Variable</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Display Name</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-[130px]">Group</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-[120px]">Sub-group</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-[70px] text-center">Sign</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-[50px] text-center">Flag</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v, i) => (
              <>
                <TableRow
                  key={v.id}
                  className={`transition-colors ${v.flagged ? "bg-warning/5" : i % 2 === 0 ? "" : "bg-muted/20"} hover:bg-muted/40`}
                >
                  <TableCell className="font-mono text-xs text-foreground font-medium">{v.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{v.displayName}</TableCell>
                  <TableCell>
                    <Select value={v.group} onValueChange={(val) => updateVar(v.id, { group: val })}>
                      <SelectTrigger className="h-7 text-xs w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {groups.map((g) => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={v.subGroup} onValueChange={(val) => updateVar(v.id, { subGroup: val })}>
                      <SelectTrigger className="h-7 text-xs w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {subGroups.map((g) => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => updateVar(v.id, { expectedSign: v.expectedSign === "+" ? "−" : "+" })}
                      className={`w-7 h-7 rounded-md border text-sm font-bold transition-colors ${
                        v.expectedSign === "+"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      {v.expectedSign}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={v.flagged}
                      onCheckedChange={(checked) => updateVar(v.id, { flagged: !!checked, flagNote: checked ? v.flagNote : "" })}
                    />
                  </TableCell>
                </TableRow>
                {v.flagged && (
                  <TableRow key={`${v.id}-note`} className="bg-warning/5">
                    <TableCell colSpan={6} className="py-2 px-6">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={12} className="text-warning shrink-0" />
                        <Input
                          value={v.flagNote}
                          onChange={(e) => updateVar(v.id, { flagNote: e.target.value })}
                          placeholder="Add correction note..."
                          className="h-7 text-xs flex-1 bg-background"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-6 py-3 flex items-center gap-3 z-40">
        {flaggedCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-warning font-medium">
            <AlertTriangle size={14} />
            {flaggedCount} items flagged — resolve before continuing
          </div>
        )}
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Download size={12} /> Export corrections
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-primary text-primary hover:bg-primary/5" onClick={applyAISuggestions}>
          <Sparkles size={12} /> Apply AI suggestions
        </Button>
        <Button size="sm" disabled={flaggedCount > 0} className="h-8 text-xs">
          Save & Continue
        </Button>
      </div>
    </AppShell>
  );
}
