import { useState, useRef, useEffect } from "react";
import { Share2, MoreHorizontal, PanelLeft, ChevronRight, Sparkles } from "lucide-react";
import { QubeSidebar, type ChatThread, type Project } from "@/components/chat/QubeSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ProjectSummaryCard } from "@/components/chat/cards/ProjectSummaryCard";
import { ProjectSelectorCard } from "@/components/chat/cards/ProjectSelectorCard";
import { DataUploadCard } from "@/components/chat/cards/DataUploadCard";
import { VariableGroupsCard } from "@/components/chat/cards/VariableGroupsCard";
import { VariablePropertiesCard } from "@/components/chat/cards/VariablePropertiesCard";
import { SpendMappingCard } from "@/components/chat/cards/SpendMappingCard";
import { ModelTransformationsCard } from "@/components/chat/cards/ModelTransformationsCard";
import { ModelResultsCard } from "@/components/chat/cards/ModelResultsCard";
import { ModelSummaryCard } from "@/components/chat/cards/ModelSummaryCard";
import { OptimisationCard } from "@/components/chat/cards/OptimisationCard";
import { FlightingCard } from "@/components/chat/cards/FlightingCard";
import { WorkflowCard } from "@/components/chat/cards/WorkflowCard";
import { ClassificationCard } from "@/components/chat/cards/ClassificationCard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type CardKey =
  | "project"
  | "selector"
  | "upload"
  | "groups"
  | "properties"
  | "mapping"
  | "transformations"
  | "results"
  | "summary"
  | "optimisation"
  | "flighting"
  | "workflow"
  | "classification";

interface Message {
  id: string;
  role: "user" | "assistant";
  text?: string;
  card?: CardKey;
}

const projects: Project[] = [
  { id: "1", name: "Demo_Brand4_2025", brand: "Brand4", market: "UK" },
  { id: "2", name: "UK_Chocolate_2026", brand: "Chocolate", market: "UK" },
  { id: "3", name: "AUS_Beverage_Q1", brand: "Beverage", market: "Australia" },
  { id: "4", name: "FR_Skincare_H2", brand: "Skincare", market: "France" },
  { id: "5", name: "US_Snacks_2025", brand: "Snacks", market: "US" },
  { id: "6", name: "DE_Pharma_Annual", brand: "Pharma", market: "Germany" },
];

const threads: ChatThread[] = [
  { id: "t1", projectId: "1", title: "Full MMM workflow walkthrough", updatedAgo: "2m ago" },
  { id: "t2", projectId: "1", title: "Variable classification fixes", updatedAgo: "1h ago" },
  { id: "t3", projectId: "1", title: "Initial data QC + setup", updatedAgo: "3d ago" },
  { id: "t4", projectId: "2", title: "Datacube upload", updatedAgo: "1d ago" },
  { id: "t5", projectId: "3", title: "Optimisation scenarios", updatedAgo: "5d ago" },
  { id: "t6", projectId: "5", title: "Variable review pass", updatedAgo: "6h ago" },
];

const seededMessages: Message[] = [
  { id: "m1", role: "user", text: "Let's start a new MMM session." },
  {
    id: "m2",
    role: "assistant",
    text: "Welcome to Demand Drivers. Pick a project to resume or create a new one — you can filter by market.",
    card: "selector",
  },
  { id: "m3", role: "user", text: "Resume Demo_Brand4_2025." },
  {
    id: "m4",
    role: "assistant",
    text: "Loaded **Demo_Brand4_2025**. You're at stage 7 of 9 (Model Interpretation). Snapshot below:",
    card: "project",
  },
  {
    id: "m5",
    role: "assistant",
    text: "Here's the full workflow tracker — ask for any step at any time.",
    card: "workflow",
  },
];

const cardMap: Record<CardKey, React.FC> = {
  project: ProjectSummaryCard,
  selector: ProjectSelectorCard,
  upload: DataUploadCard,
  groups: VariableGroupsCard,
  properties: VariablePropertiesCard,
  mapping: SpendMappingCard,
  transformations: ModelTransformationsCard,
  results: ModelResultsCard,
  summary: ModelSummaryCard,
  optimisation: OptimisationCard,
  flighting: FlightingCard,
  workflow: WorkflowCard,
  classification: ClassificationCard,
};

const toolNames: Record<string, string> = {
  dd: "Demand Drivers",
  ps: "PriceSense",
  fc: "Forecaster",
};

const Index = () => {
  const [activeToolId, setActiveToolId] = useState("dd");
  const [activeProjectId, setActiveProjectId] = useState("1");
  const [activeThreadId, setActiveThreadId] = useState("t1");
  const [messages, setMessages] = useState<Message[]>(seededMessages);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleSend = async (text: string) => {
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setThinking(true);

    try {
      const apiHistory = history
        .filter((m) => m.text)
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.text! }));

      const { data, error } = await supabase.functions.invoke("chat-route", {
        body: { messages: apiHistory },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.error.toLowerCase().includes("rate")) {
          toast({ title: "Slow down", description: "Too many requests — try again in a moment." });
        } else if (data.error.toLowerCase().includes("credit")) {
          toast({ title: "AI credits exhausted", description: "Add credits in Workspace settings.", variant: "destructive" });
        } else {
          toast({ title: "AI error", description: data.error, variant: "destructive" });
        }
        return;
      }

      const card = (data?.card ?? null) as CardKey | null;
      const aiMsg: Message = {
        id: `a${Date.now()}`,
        role: "assistant",
        text: data?.preamble ?? "Got it.",
        card: card && cardMap[card] ? card : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      toast({ title: "Couldn't reach AI", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setThinking(false);
    }
  };

  const handleNewChat = () => {
    setActiveThreadId("");
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: `New chat in **${activeProject?.name}**. What would you like to do? I can show projects, upload data, set variable groups, run a model, or jump to optimisation.`,
        card: "selector",
      },
    ]);
  };

  const handleNewProject = () => {
    setActiveThreadId("");
    setMessages([
      {
        id: "np1",
        role: "assistant",
        text: "Let's set up a new project. Pick a brand, market and KPI to get started — or describe it to me in chat.",
        card: "selector",
      },
    ]);
  };

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    if (id === "t1") setMessages(seededMessages);
    else handleNewChat();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <QubeSidebar
          projects={projects}
          threads={threads}
          activeThreadId={activeThreadId}
          activeProjectId={activeProjectId}
          activeToolId={activeToolId}
          onSelectThread={handleSelectThread}
          onSelectProject={setActiveProjectId}
          onSelectTool={setActiveToolId}
          onNewChat={handleNewChat}
          onNewProject={handleNewProject}
        />

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" />
              <div className="h-5 w-px bg-border mx-1" />
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs min-w-0">
                <span className="text-muted-foreground">{toolNames[activeToolId]}</span>
                <ChevronRight size={12} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground truncate">{activeProject?.name}</span>
                <ChevronRight size={12} className="text-muted-foreground shrink-0" />
                <span className="font-semibold text-foreground truncate">
                  {activeThread?.title || "New chat"}
                </span>
              </nav>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-md hover:bg-muted transition-colors">
                <Share2 size={14} className="text-muted-foreground" />
              </button>
              <button className="p-2 rounded-md hover:bg-muted transition-colors">
                <MoreHorizontal size={14} className="text-muted-foreground" />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
              {messages.map((m) => {
                const CardComp = m.card ? cardMap[m.card] : null;
                return (
                  <ChatMessage key={m.id} role={m.role}>
                    {m.text && <p>{renderText(m.text)}</p>}
                    {CardComp && (
                      <div className="mt-2">
                        <CardComp />
                      </div>
                    )}
                  </ChatMessage>
                );
              })}
              {thinking && (
                <div className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles size={14} className="text-primary animate-pulse" />
                  </div>
                  <div className="flex-1 pt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <ChatComposer onSend={handleSend} />
        </main>
      </div>
    </SidebarProvider>
  );
};

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export default Index;
