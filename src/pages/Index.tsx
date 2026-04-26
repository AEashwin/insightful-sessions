import { useState, useRef, useEffect } from "react";
import { BarChart3, Check, ChevronRight, LineChart, Lock, Mail, Moon, Palette, Pencil, Sparkles, Sun, X } from "lucide-react";
import { QubeSidebar, ToolRail, type ChatThread, type Project } from "@/components/chat/QubeSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatLanding } from "@/components/chat/ChatLanding";
import { ProjectSummaryCard } from "@/components/chat/cards/ProjectSummaryCard";
import { ProjectSelectorCard } from "@/components/chat/cards/ProjectSelectorCard";
import { NewProjectCard } from "@/components/chat/cards/NewProjectCard";
import { DataUploadCard } from "@/components/chat/cards/DataUploadCard";
import { VariablePropertiesCard } from "@/components/chat/cards/VariablePropertiesCard";
import { SpendMappingCard } from "@/components/chat/cards/SpendMappingCard";
import { ModelConfigurationCard } from "@/components/chat/cards/ModelConfigurationCard";
import { ModelGenerationCard } from "@/components/chat/cards/ModelGenerationCard";
import { ModeSelectionCard } from "@/components/chat/cards/ModeSelectionCard";
import { GuidedContinueCard } from "@/components/chat/cards/GuidedContinueCard";
import { ModelTransformationsCard } from "@/components/chat/cards/ModelTransformationsCard";
import { ModelResultsCard } from "@/components/chat/cards/ModelResultsCard";
import { ModelSummaryCard } from "@/components/chat/cards/ModelSummaryCard";
import { OptimisationCard } from "@/components/chat/cards/OptimisationCard";
import { FlightingCard } from "@/components/chat/cards/FlightingCard";
import { WorkflowCard } from "@/components/chat/cards/WorkflowCard";
import { ClassificationCard } from "@/components/chat/cards/ClassificationCard";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "@/hooks/use-toast";
import brandLogo from "@/assets/analytic-edge-qube-logo.png";

type CardKey =
  | "project"
  | "selector"
  | "newProject"
  | "upload"
  | "groups"
  | "properties"
  | "mapping"
  | "configuration"
  | "generation"
  | "modeSelection"
  | "guidedContinue"
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
  prefill?: Partial<{ name: string; brand: string; market: string; bu: string }>;
  guidedStep?: { stepNumber: number; stepName: string; summary: string };
}

type ThemeMode = "light" | "dark";
type ColorPalette = "purple" | "analyst" | "cockpit";
type RunMode = "guided" | "autopilot";
type ChainGate = "mode" | "datacube" | "classification" | "drd" | "modelReady" | "checkpoint" | "complete";

interface SkillChainState {
  active: boolean;
  runMode?: RunMode;
  step: number;
  currentBatch: number;
  waitingFor?: ChainGate;
}

const paletteOptions: Array<{ id: ColorPalette; name: string; note: string }> = [
  { id: "purple", name: "Enterprise Purple Plus", note: "Navy shell, purple core, crisp enterprise accents" },
  { id: "analyst", name: "Colorful Analyst", note: "Teal-led workspace with warmer workflow highlights" },
  { id: "cockpit", name: "Dark Data Cockpit", note: "Charcoal-blue platform with electric data accents" },
];

const projectContext = {
  tenant: "Analytic Edge Demo",
  project: "Demo_Brand4_2025",
  brand: "Brand4",
  subBrand: "Brand4 Core",
  country: "UK",
};

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
  {
    id: "m1",
    role: "assistant",
    text: "Welcome back, John. I'm your MMM assistant on Demand Drivers.\n\nWould you like to resume an existing project or start a new one?"
  },
  { id: "m2", role: "user", text: "Resume Demo_Brand4_2025." },
  {
    id: "m3",
    role: "assistant",
    text: "Resuming **Demo_Brand4_2025** — Brand4 · UK.\n\nYou're at Step 4 of 7 — Model Interpretation, Batch 2 complete. Health score is 14/19. R² is 80.1%.\n\nShall I show a full snapshot or jump straight to next steps?"
  },
];

const renderCard = (
  key: CardKey,
  ctx: {
    onPickProject?: (id: string, name: string) => void;
    onCreateProject?: (p: { name: string; brand: string; market: string; bu: string }) => void;
    onNewProject?: () => void;
    onClassificationConfirm?: () => void;
    onVariablePropertiesSave?: () => void;
    onRunModel?: () => void;
    onModeSelect?: (mode: RunMode) => void;
    onGuidedContinue?: () => void;
    onGuidedPause?: () => void;
    prefill?: Partial<{ name: string; brand: string; market: string; bu: string }>;
    guidedStep?: Message["guidedStep"];
  },
) => {
  switch (key) {
    case "project": return <ProjectSummaryCard />;
    case "selector": return <ProjectSelectorCard onPick={ctx.onPickProject} onNewProject={ctx.onNewProject} />;
    case "newProject": return <NewProjectCard onCreate={ctx.onCreateProject} initial={ctx.prefill} />;
    case "upload": return <DataUploadCard />;
    case "groups": return <ClassificationCard onConfirm={ctx.onClassificationConfirm} />;
    case "properties": return <VariablePropertiesCard onSave={ctx.onVariablePropertiesSave} />;
    case "mapping": return <SpendMappingCard />;
    case "configuration": return <ModelConfigurationCard onRunModel={ctx.onRunModel} />;
    case "generation": return <ModelGenerationCard />;
    case "modeSelection": return <ModeSelectionCard onSelect={ctx.onModeSelect} />;
    case "guidedContinue": return <GuidedContinueCard stepNumber={ctx.guidedStep?.stepNumber} stepName={ctx.guidedStep?.stepName} summary={ctx.guidedStep?.summary} onContinue={ctx.onGuidedContinue} onPause={ctx.onGuidedPause} />;
    case "transformations": return <ModelTransformationsCard />;
    case "results": return <ModelResultsCard />;
    case "summary": return <ModelSummaryCard />;
    case "optimisation": return <OptimisationCard />;
    case "flighting": return <FlightingCard />;
    case "workflow": return <WorkflowCard />;
    case "classification": return <ClassificationCard onConfirm={ctx.onClassificationConfirm} />;
  }
};

const toolNames: Record<string, string> = {
  dd: "Demand Drivers",
  ps: "PriceSense",
  fc: "Forecaster",
};

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeToolId, setActiveToolId] = useState("dd");
  const [activeProjectId, setActiveProjectId] = useState("1");
  const [activeThreadId, setActiveThreadId] = useState("t1");
  const [messages, setMessages] = useState<Message[]>(seededMessages);
  const [threadTitles, setThreadTitles] = useState<Record<string, string>>({});
  const [thinking, setThinking] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [palette, setPalette] = useState<ColorPalette>("purple");
  const [chain, setChain] = useState<SkillChainState>({ active: false, step: 0, currentBatch: 1 });
  const [modelRunPending, setModelRunPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session));
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session));
      setAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.palette = palette;
  }, [theme, palette]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeThreadTitle = activeThreadId ? (threadTitles[activeThreadId] ?? activeThread?.title) : "New chat";
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleSend = async (text: string) => {
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);

    if (/\b(show me|show snapshot|full snapshot|snapshot)\b/i.test(text)) {
      setMessages([
        ...history,
        { id: `a${Date.now() + 1}`, role: "assistant", text: "Here’s the current project snapshot.", card: "project" },
      ]);
      setThinking(false);
      return;
    }

    if (/\b(next steps|jump.*next|where i left off)\b/i.test(text)) {
      setMessages([
        ...history,
        { id: `a${Date.now() + 1}`, role: "assistant", text: "Here’s the workflow position and the next step I recommend.", card: "workflow" },
      ]);
      setThinking(false);
      return;
    }

    if (modelRunPending && /\b(ok|okay|yes|approve|approved|confirm|confirmed|go ahead|proceed)\b/i.test(text)) {
      setModelRunPending(false);
      setMessages([
        ...history,
        {
          id: `a${Date.now() + 1}`,
          role: "assistant",
          text: "Model triggered. It will take approximately **10 minutes** to complete. I’ll track candidate generation below and surface recommendations once all models are complete.",
          card: "generation",
        },
      ]);
      setChain((current) => current.active ? { ...current, step: Math.max(current.step, 5), waitingFor: "checkpoint" } : current);
      setThinking(false);
      return;
    }

    const isSpendConfirmation = /\b(confirm|confirmed|approve|approved|done|proceed)\b/i.test(text)
      && messages.slice().reverse().some((message) => message.role === "assistant" && message.card === "mapping");
    if (isSpendConfirmation) {
      setMessages([
        ...history,
        {
          id: `a${Date.now() + 1}`,
          role: "assistant",
          text: "Spend mapping confirmed. I’m checking the selected variables before opening properties...",
        },
      ]);
      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `a${Date.now()}`,
            role: "assistant",
            text: "After your corrections, coverage moved to **17 mapped columns (89%)**, **0 critical missing spend inputs**, and **2 approved spend-only variables**. Meta split is now approved, so the next logical step is **Variable Properties**.",
            card: "properties",
          },
        ]);
      }, 600);
      setChain((current) => current.active ? { ...current, step: Math.max(current.step, 3), waitingFor: "drd" } : current);
      setThinking(false);
      return;
    }

    const isModelRunRequest = /\b(run model|start model|execute model|run it|model run)\b/i.test(text)
      && messages.slice().reverse().some((message) => message.role === "assistant" && message.card === "configuration");
    if (isModelRunRequest) {
      handleRunModel(history);
      return;
    }

    if (/\b(model config|model configuration|configure model|model setup)\b/i.test(text)) {
      setMessages([
        ...history,
        {
          id: `a${Date.now() + 1}`,
          role: "assistant",
          text: "Here is **Model Configuration**. You can edit KPI, model type/form, duration, holdout, selected variables, role, transformations, saturation, priors, and QC directly in the UI. Use View transformations / saturation / priors / QC to expose those editable settings.",
          card: "configuration",
        },
      ]);
      setChain((current) => current.active ? { ...current, step: Math.max(current.step, 4), waitingFor: "modelReady" } : current);
      setThinking(false);
      return;
    }

    const chainReply = getSkillChainReply(text, chain);
    if (chainReply) {
      setChain(chainReply.nextState);
      setMessages([...history, ...chainReply.messages]);
      setThinking(false);
      return;
    }

    if (/\b(create|start|set up)\b.*\bnew project\b/i.test(text)) {
      setActiveThreadId("");
      setMessages([
        userMsg,
        {
          id: `a${Date.now() + 1}`,
          role: "assistant",
          text: activeProjectId
            ? "I'll create the new project in a new chat window so it stays separate from this project session."
            : "Let's create the new project in this new chat window.",
          card: "newProject",
        },
      ]);
      setThinking(false);
      return;
    }

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

      const validCards: CardKey[] = ["project","selector","newProject","upload","groups","properties","mapping","configuration","generation","modeSelection","guidedContinue","transformations","results","summary","optimisation","flighting","workflow","classification"];
      const card = (data?.card ?? null) as CardKey | null;
      const aiMsg: Message = {
        id: `a${Date.now()}`,
        role: "assistant",
        text: data?.preamble ?? "Got it.",
        card: card && validCards.includes(card) ? card : undefined,
        prefill: data?.prefill ?? undefined,
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
    setMessages([]); // empty -> ChatLanding renders
  };

  const handleNewProject = () => {
    setActiveThreadId("");
    setMessages([
      {
        id: "np1",
        role: "assistant",
        text: "Let's set up a new project. Fill in the basics below — or just describe it to me and I'll fill it in.",
        card: "newProject",
      },
    ]);
  };

  const handleCreateProject = (p: { name: string; brand: string; market: string; bu: string }) => {
    setMessages((prev) => [
      ...prev,
      { id: `u${Date.now()}`, role: "user", text: `Create project ${p.name}` },
      {
        id: `a${Date.now() + 1}`,
        role: "assistant",
        text: `Created **${p.name}** (${p.bu} · ${p.market} · ${p.brand}). Let's start with **stage 1 — Data Upload**. Drop your datacube CSV below.`,
        card: "upload",
      },
    ]);
  };

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    if (id === "t1") setMessages(seededMessages);
    else handleNewChat();
  };

  const handlePickProject = (projectId: string, projectName: string) => {
    setActiveProjectId(projectId);
    // Simulate the AI handoff — in production this comes from chat-route.
    setMessages((prev) => [
      ...prev,
      { id: `u${Date.now()}`, role: "user", text: `Open ${projectName}` },
      {
        id: `a${Date.now() + 1}`,
        role: "assistant",
        text: `Switching you into **${projectName}**. You're at **stage 7 of 9 — Model Interpretation**, with 3 models run on Batch 2. Here's a snapshot — ready to resume, or want to start something fresh?`,
        card: "project",
      },
    ]);
  };

  const handleClassificationConfirm = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `a${Date.now()}`,
        role: "assistant",
        text: "Great — classification locked. Let me pull up spend mapping...",
      },
    ]);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          role: "assistant",
          text: "Coverage is 14 mapped columns (74%), 3 missing spend inputs in Promotions, and 2 approved spend-only variables. AI checks show weekly periodicity and GBP currency are aligned; Meta split needs approval after upload.",
        card: "mapping",
      },
    ]);
    }, 600);
    setChain((current) => current.active ? { ...current, step: Math.max(current.step, 2), waitingFor: "drd" } : current);
  };

  const handleVariablePropertiesSave = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `a${Date.now()}`,
        role: "assistant",
        text: "Variable properties saved. I’m preparing the model configuration now...",
      },
    ]);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          role: "assistant",
          text: "I selected **19 of 40 classified variables** for modelling based on classification, spend readiness, missingness, and business relevance. The model configuration is ready below — transformations, priors, and QC are pre-filled but hidden unless you choose View.",
        card: "configuration",
      },
    ]);
    }, 600);
    setChain((current) => current.active ? { ...current, step: Math.max(current.step, 4), waitingFor: "modelReady" } : current);
  };

  const handleRunModel = (baseMessages = messages) => {
    setModelRunPending(true);
    setMessages([
      ...baseMessages,
      {
        id: `a${Date.now()}`,
        role: "assistant",
        text: "Model run will be triggered shortly. Please confirm the below selections before I proceed.\n\n**Configuration summary**\n\n| Item | Selection |\n|---|---:|\n| KPI | Sales |\n| Model type | Unpooled |\n| Model form | Additive |\n| Model duration | 2022-01-08 – 2025-02-22 |\n| Holdout | On · 2024-07-08 – 2025-02-22 |\n| Variables selected | 9 of 40 |\n| Mandatory / optional | 7 / 2 |\n| Transformations | Adstock, Gamma, Direct |\n| Saturation | S-curve, Gamma, None |\n| Priors | Contribution and co-efficient ranges set |\n| QC gates | R², Adj-R², MAPE, Holdout MAPE, Durbin-Watson |\n\nCan I go ahead and trigger the model?",
      },
    ]);
    setChain((current) => current.active ? { ...current, step: Math.max(current.step, 4), waitingFor: "modelReady" } : current);
    setThinking(false);
  };

  const handleModeSelect = (mode: RunMode) => {
    handleSend(mode === "autopilot" ? "Autopilot" : "Guided");
  };

  const handleGuidedContinue = () => {
    handleSend("continue");
  };

  const handleGuidedPause = () => {
    handleSend("pause");
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!authenticated) {
    return <AuthScreen onDemoSignIn={() => setAuthenticated(true)} />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <ToolRail activeToolId={activeToolId} onSelectTool={setActiveToolId} />
        <QubeSidebar
          projects={projects}
          threads={threads}
          activeThreadId={activeThreadId}
          activeProjectId={activeProjectId}
          activeToolId={activeToolId}
          onSelectThread={handleSelectThread}
          onSelectProject={setActiveProjectId}
          onNewChat={handleNewChat}
          onNewProject={handleNewProject}
        />

        <ChatStage
          messages={messages}
          thinking={thinking}
          scrollRef={scrollRef}
          activeToolName={toolNames[activeToolId]}
          activeProjectName={activeProject?.name}
          activeThreadTitle={activeThreadTitle}
          onRenameThread={(title) => activeThreadId && setThreadTitles((prev) => ({ ...prev, [activeThreadId]: title }))}
          onSend={handleSend}
          onPickProject={handlePickProject}
          onCreateProject={handleCreateProject}
          onNewProject={handleNewProject}
          onClassificationConfirm={handleClassificationConfirm}
          onVariablePropertiesSave={handleVariablePropertiesSave}
          onRunModel={() => handleRunModel()}
          onModeSelect={handleModeSelect}
          onGuidedContinue={handleGuidedContinue}
          onGuidedPause={handleGuidedPause}
          theme={theme}
          palette={palette}
          onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          onThemeChange={setTheme}
          onPaletteChange={setPalette}
          userName="John"
        />
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

function chainMessage(text: string, card?: CardKey): Message {
  return { id: `chain-${Date.now()}-${Math.random().toString(16).slice(2)}`, role: "assistant", text, card };
}

function guidedMessage(stepNumber: number, stepName: string, summary: string): Message {
  return { id: `guided-${Date.now()}-${Math.random().toString(16).slice(2)}`, role: "assistant", text: `✅ Step ${stepNumber} complete — ${stepName}`, card: "guidedContinue", guidedStep: { stepNumber, stepName, summary } };
}

function getSkillChainReply(text: string, state: SkillChainState): { nextState: SkillChainState; messages: Message[] } | null {
  const input = text.trim().toLowerCase();
  const isStart = /\b(skill chain|mmm chain|autopilot|guided|datacube uploaded|data cube uploaded|start mmm)\b/i.test(text);
  if (!state.active && !isStart) return null;

  if (/\b(stop|pause)\b/.test(input)) {
    return { nextState: { ...state, active: true }, messages: [chainMessage(`⏸ Chain paused — Project: ${projectContext.project} | Step ${state.step} | Batch ${state.currentBatch}. Say continue, autopilot, guided, or switch project when ready.`)] };
  }

  if (!state.active || state.waitingFor === "mode") {
    if (/\b(b|autopilot)\b/.test(input)) {
      return { nextState: { active: true, runMode: "autopilot", step: 1, currentBatch: 1, waitingFor: "datacube" }, messages: [chainMessage(`✅ Project ready — ${projectContext.project}\nClient: ${projectContext.tenant} | Brand: ${projectContext.subBrand} | Market: ${projectContext.country} | Mode: DD MCP | Run: Autopilot\n\nNext up is Step 1 — Data Quality & Setup. ⏸ Please upload your datacube to continue — I can't do this on your behalf.`, "workflow")] };
    }
    if (/\b(a|guided)\b/.test(input)) {
      return { nextState: { active: true, runMode: "guided", step: 1, currentBatch: 1, waitingFor: "datacube" }, messages: [chainMessage(`✅ Project ready — ${projectContext.project}\nClient: ${projectContext.tenant} | Brand: ${projectContext.subBrand} | Market: ${projectContext.country} | Mode: DD MCP | Run: Guided\n\nNext up is Step 1 — Data Quality & Setup. ⏸ Please upload your datacube to continue — I can't do this on your behalf.`, "workflow")] };
    }
    return { nextState: { active: true, step: 0, currentBatch: 1, waitingFor: "mode" }, messages: [chainMessage("Welcome to the MMM Skill Chain. How would you like to run this session?", "modeSelection")] };
  }

  if (state.waitingFor === "datacube" && /\b(datacube uploaded|data cube uploaded|uploaded|continue)\b/.test(input)) {
    const messages = [chainMessage("Datacube received. Running Step 1 automatically: QC passed, columns detected, classification lock prepared, spend periodicity checked, holidays matched.\n\nPlease review and approve the variable classification hierarchy.", "upload"), chainMessage("I've rendered the classification widget with the proposed Base, Incremental, Media, Traditional, Digital, and variable-level hierarchy for approval.", "classification")];
    if (state.runMode === "guided") messages.push(guidedMessage(1, "Data Quality & Setup", "Classification is locked. 47 of 50 variables classified, 3 flagged for review."));
    return { nextState: { ...state, step: 1, waitingFor: "classification" }, messages };
  }

  if (state.waitingFor === "classification" && /\b(continue|approved|approve|yes|go|next)\b/.test(input)) {
    const messages = [chainMessage(`Moving to Step 2 — DRD. Starting brand and market Q&A now.\n\nShare any brand, market, competitor, seasonality, or business context I should include in the DRD.`)];
    if (state.runMode === "guided") messages.unshift(guidedMessage(1, "Data Quality & Setup", "Classification is locked. 47 of 50 variables classified, 3 flagged for review."));
    return { nextState: { ...state, step: 2, waitingFor: "drd" }, messages };
  }

  if (state.waitingFor === "drd" && input.length > 8) {
    return { nextState: { ...state, step: 4, currentBatch: 1, waitingFor: "modelReady" }, messages: [chainMessage(`✅ Step 2 complete — DRD | Project: ${projectContext.project}\nGenerated DRD summary and captured your market context.\n\n✅ Step 3 complete — Config (Batch 1) | Project: ${projectContext.project}\n⏸ Autopilot paused — model needs to run. Triggering the model run in DD now — I'll continue once results are available. Say ready when results are available.`, "transformations")] };
  }

  if (state.waitingFor === "modelReady" && /\b(ready|results available|continue)\b/.test(input)) {
    return { nextState: { ...state, step: 4, currentBatch: 3, waitingFor: "checkpoint" }, messages: [chainMessage(`⚠️ Batch 1 — Issues found. Health: 11/19\n- Incremental contribution is low at 14.3%\n- TV prior is too tight for observed response\n- Online coupon is over-attributing base demand\n\nAuto-generating revised config (Batch 2)...\n\n⚠️ Batch 2 — Issues found. Health: 14/19\n- R² improved to 80.1%\n- Incremental moved to 16.2%\n- Remaining issue: digital saturation still too flat\n\nAuto-generating revised config (Batch 3)...\n\n⏸ Autopilot checkpoint — Batch 3 Project: ${projectContext.project}\n\n| Batch | R² | MAPE | Health | Incremental% | Key change made |\n|---|---:|---:|---:|---:|---|\n| 1 | 78.2% | 6.8% | 11 / 19 | 14.3% | Initial config |\n| 2 | 80.1% | 6.1% | 14 / 19 | 16.2% | Loosened TV prior |\n| 3 | 81.4% | 5.9% | 17 / 19 | 18.1% | Tightened Online Coupon |\n\nOptions: continue — keep iterating automatically; sign off — accept this model and move to summary sheet; stop — pause autopilot and review manually.`, "results")] };
  }

  if (state.waitingFor === "checkpoint" && /\b(sign off|good model|this is fine|summary|continue|yes)\b/.test(input)) {
    return { nextState: { ...state, step: 6, waitingFor: "complete" }, messages: [chainMessage(`✅ Step 4 complete — Model signed off (Batch 3) | Project: ${projectContext.project}\nHealth: 17/19 | R²: 81.4% | Incremental: 18.1%\n\nSkipping optimization and moving to summary sheet now.\n\n✅ Step 5 complete — Summary Sheet | Project: ${projectContext.project}\nMoving to final presentation now.\n\nStep 6 — mmm-final-presentation hasn't been built yet. The chain will pause here. All other outputs are ready.`, "summary")] };
  }

  return null;
}

interface ChatStageProps {
  messages: Message[];
  thinking: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  activeToolName: string;
  activeProjectName?: string;
  activeThreadTitle?: string;
  onRenameThread: (title: string) => void;
  onSend: (text: string) => void;
  onPickProject: (id: string, name: string) => void;
  onCreateProject: (p: { name: string; brand: string; market: string; bu: string }) => void;
  onNewProject: () => void;
  onClassificationConfirm: () => void;
  onVariablePropertiesSave: () => void;
  onRunModel: () => void;
  onModeSelect: (mode: RunMode) => void;
  onGuidedContinue: () => void;
  onGuidedPause: () => void;
  theme: ThemeMode;
  palette: ColorPalette;
  onToggleTheme: () => void;
  onThemeChange: (theme: ThemeMode) => void;
  onPaletteChange: (palette: ColorPalette) => void;
  userName: string;
}

function ChatStage({
  messages,
  thinking,
  scrollRef,
  activeToolName,
  activeProjectName,
  activeThreadTitle,
  onRenameThread,
  onSend,
  onPickProject,
  onCreateProject,
  onNewProject,
  onClassificationConfirm,
  onVariablePropertiesSave,
  onRunModel,
  onModeSelect,
  onGuidedContinue,
  onGuidedPause,
  theme,
  palette,
  onToggleTheme,
  onThemeChange,
  onPaletteChange,
  userName,
}: ChatStageProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const widthClass = collapsed ? "max-w-6xl" : "max-w-5xl";
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(activeThreadTitle || "New chat");

  useEffect(() => {
    setDraftTitle(activeThreadTitle || "New chat");
    setEditingTitle(false);
  }, [activeThreadTitle]);

  const saveTitle = () => {
    const nextTitle = draftTitle.trim() || "New chat";
    onRenameThread(nextTitle);
    setDraftTitle(nextTitle);
    setEditingTitle(false);
  };

  // Landing mode: no messages yet — show centered greeting + tiles + composer.
  const isLanding = messages.length === 0;

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <header className="h-10 border-b border-border flex items-center justify-between px-3 shrink-0 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <nav className="flex items-center gap-1.5 text-xs min-w-0">
            <span className="text-muted-foreground">{activeToolName}</span>
            <ChevronRight size={12} className="text-muted-foreground shrink-0" />
            <span className="text-muted-foreground truncate">{activeProjectName}</span>
            <ChevronRight size={12} className="text-muted-foreground shrink-0" />
            {editingTitle ? (
              <span className="flex items-center gap-1 min-w-0">
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") setEditingTitle(false);
                  }}
                  autoFocus
                  className="h-7 w-56 max-w-[36vw] rounded-md border border-input bg-background px-2 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button onClick={saveTitle} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="Save chat name">
                  <Check size={13} />
                </button>
                <button onClick={() => setEditingTitle(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="Cancel rename">
                  <X size={13} />
                </button>
              </span>
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="group/title flex items-center gap-1 min-w-0 rounded-md px-1 py-0.5 hover:bg-muted transition-colors"
                aria-label="Rename chat"
              >
                <span className="font-semibold text-foreground truncate">{activeThreadTitle || "New chat"}</span>
                <Pencil size={11} className="text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
              </button>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <PaletteMenu palette={palette} theme={theme} onPaletteChange={onPaletteChange} onThemeChange={onThemeChange} />
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {isLanding ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <ChatLanding userName={userName} onSuggestion={onSend} />
          </div>
          <ChatComposer onSend={onSend} maxWidthClass={widthClass} />
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-sidebar-accent/35 via-background to-accent/25">
            <div className={`${widthClass} mx-auto px-6 py-5 space-y-6 transition-[max-width] duration-200 ease-linear`}>
              {messages.map((m) => (
                <ChatMessage key={m.id} role={m.role}>
                  {m.text && <p className="whitespace-pre-wrap">{renderText(m.text)}</p>}
                  {m.card && <McpAppFrame>{renderCard(m.card, { onPickProject, onCreateProject, onNewProject, onClassificationConfirm, onVariablePropertiesSave, onRunModel, onModeSelect, onGuidedContinue, onGuidedPause, prefill: m.prefill, guidedStep: m.guidedStep })}</McpAppFrame>}
                </ChatMessage>
              ))}
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
          <ChatComposer onSend={onSend} maxWidthClass={widthClass} />
        </>
      )}
    </main>
  );
}

function McpAppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/12 via-card to-accent/45 p-1 shadow-[0_18px_45px_-30px_hsl(var(--primary)/0.65)]">
      <div className="overflow-hidden rounded-lg border border-border/80 bg-card ring-1 ring-primary/10">{children}</div>
    </div>
  );
}

function PaletteMenu({
  palette,
  theme,
  onPaletteChange,
  onThemeChange,
}: {
  palette: ColorPalette;
  theme: ThemeMode;
  onPaletteChange: (palette: ColorPalette) => void;
  onThemeChange: (theme: ThemeMode) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Open platform palette settings"
        >
          <Palette size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs">Platform palette</DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-1 px-2 pb-2">
          {(["light", "dark"] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onThemeChange(mode)}
              className={`h-8 rounded-md border text-xs font-medium transition-colors ${
                theme === mode ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              {mode === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
        <DropdownMenuSeparator />
        {paletteOptions.map((option) => (
          <DropdownMenuItem key={option.id} onClick={() => onPaletteChange(option.id)} className="items-start gap-3 py-2">
            <span className={`mt-0.5 flex h-4 w-4 rounded-full border border-border palette-dot-${option.id}`} />
            <span className="flex-1">
              <span className="flex items-center justify-between gap-2 text-sm font-medium">
                {option.name}
                {palette === option.id && <Check size={13} className="text-primary" />}
              </span>
              <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">{option.note}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AuthScreen({ onDemoSignIn }: { onDemoSignIn: () => void }) {
  const [mode, setMode] = useState<"signup" | "signin">("signin");
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Davies");
  const [organization, setOrganization] = useState("Analytic Edge");
  const [email, setEmail] = useState("john.davies@analyticedge.com");
  const [password, setPassword] = useState("DemoPassword123!");
  const [license, setLicense] = useState<"modeler" | "viewer">("modeler");
  const [selectedTools, setSelectedTools] = useState(["demand-drivers"]);
  const [submitting, setSubmitting] = useState(false);

  const tools = [
    { id: "demand-drivers", name: "Demand Drivers", subtitle: "Marketing Mix Modelling", price: "$499/mo", tone: "bg-primary/10 text-primary", icon: BarChart3 },
    { id: "pricesense", name: "PriceSense", subtitle: "Price elasticity modelling", price: "$299/mo", tone: "bg-warning/15 text-warning", icon: LineChart },
    { id: "portfolio", name: "Portfolio Optimisation", subtitle: "Cross-brand budget allocation", price: "$399/mo", tone: "bg-success/15 text-success", icon: Sparkles },
  ];

  const total = selectedTools.reduce((sum, id) => sum + (id === "demand-drivers" ? 499 : id === "pricesense" ? 299 : 399), 0) + (license === "modeler" ? 150 : 0);

  const toggleTool = (id: string) => {
    setSelectedTools((current) => current.includes(id) ? current.filter((tool) => tool !== id) : [...current, id]);
  };

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password || (mode === "signup" && selectedTools.length === 0)) {
      toast({ title: "Complete the form", description: "Add your email, password, and at least one selected tool." });
      return;
    }

    setSubmitting(true);

    const isJohnDemo = cleanEmail.toLowerCase() === "john.davies@analyticedge.com" && password === "DemoPassword123!";
    if (mode === "signin" && isJohnDemo) {
      setSubmitting(false);
      onDemoSignIn();
      return;
    }

    const { error } = mode === "signup"
      ? await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
      : await supabase.auth.signInWithPassword({ email: cleanEmail, password });

    setSubmitting(false);
    if (error) {
      toast({ title: mode === "signup" ? "Account creation failed" : "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }

    if (mode === "signup") {
      toast({ title: "Check your email", description: "Confirm your account, then sign in to continue." });
      setMode("signin");
    }
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast({ title: "Google sign-in failed", description: String(result.error.message ?? result.error), variant: "destructive" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className="bg-navy text-navy-foreground px-8 py-10 lg:px-14 flex flex-col justify-between min-h-[42vh] lg:min-h-screen">
        <div>
          <div className="inline-flex items-center rounded-md bg-background px-4 py-2 shadow-sm">
            <img src={brandLogo} alt="Analytic Edge Qube" className="h-10 w-auto" />
          </div>
          <div className="mt-20 max-w-md">
            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight tracking-normal">
              Analytics that thinks with you
            </h1>
            <p className="mt-5 text-sm leading-6 text-navy-foreground/70">
              A SaaS workspace for MMM, pricing, and portfolio optimisation with guided multi-agent analysis.
            </p>
          </div>
        </div>
        <div className="grid gap-3 max-w-lg text-xs text-navy-foreground/75">
          {tools.map((tool) => (
            <div key={tool.id} className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-md bg-background/10 flex items-center justify-center"><tool.icon size={14} /></span>
              <span><strong className="text-navy-foreground">{tool.name}</strong> · {tool.subtitle}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-8 lg:px-16 flex items-center justify-center">
        <form onSubmit={handleAuth} className="w-full max-w-xl space-y-5">
          <div className="grid grid-cols-2 rounded-lg border border-border bg-muted p-1">
            <button type="button" onClick={() => setMode("signin")} className={`h-9 rounded-md text-sm font-medium transition-colors ${mode === "signin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>Sign in</button>
            <button type="button" onClick={() => setMode("signup")} className={`h-9 rounded-md text-sm font-medium transition-colors ${mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>Create account</button>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your account</p>
            {mode === "signup" && (
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" maxLength={80} />
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" maxLength={80} />
              </div>
            )}
            <div className="mt-3 space-y-3">
              <div className="relative"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" type="email" className="pl-9" maxLength={255} /></div>
              {mode === "signup" && <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Organization" maxLength={120} />}
              <div className="relative"><Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="pl-9" minLength={8} maxLength={128} /></div>
            </div>
          </div>

          {mode === "signup" && (
            <>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">License type</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button type="button" onClick={() => setLicense("modeler")} className={`rounded-lg border p-3 text-left transition-colors ${license === "modeler" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}><span className="text-sm font-semibold">Modeler</span><span className="block text-xs text-muted-foreground mt-1">Build, run, and interpret models</span></button>
                  <button type="button" onClick={() => setLicense("viewer")} className={`rounded-lg border p-3 text-left transition-colors ${license === "viewer" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}><span className="text-sm font-semibold">Viewer</span><span className="block text-xs text-muted-foreground mt-1">Read-only results access</span></button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Select your tools</p>
                <div className="space-y-2">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    const checked = selectedTools.includes(tool.id);
                    return (
                      <button type="button" key={tool.id} onClick={() => toggleTool(tool.id)} className={`w-full rounded-lg border p-3 flex items-center gap-3 text-left transition-colors ${checked ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
                        <span className={`h-5 w-5 rounded border flex items-center justify-center ${checked ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>{checked && <Check size={12} />}</span>
                        <span className={`h-8 w-8 rounded-md flex items-center justify-center ${tool.tone}`}><Icon size={15} /></span>
                        <span className="flex-1 min-w-0"><span className="block text-sm font-semibold">{tool.name}</span><span className="block text-xs text-muted-foreground">{tool.subtitle}</span></span>
                        <span className="text-xs font-semibold text-primary">{tool.price}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 rounded-lg border border-border bg-muted/60 p-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly total</span>
                  <span className="font-semibold">${total}/mo</span>
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={submitting} className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
            {submitting ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>
          <button type="button" onClick={handleGoogle} className="w-full h-10 rounded-md border border-border bg-background text-sm font-semibold hover:bg-muted transition-colors">
            Continue with Google
          </button>
        </form>
      </section>
    </main>
  );
}

export default Index;

