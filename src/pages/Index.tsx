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
type ChainGate = "projectPick" | "mode" | "projectExplain" | "datacube" | "classification" | "spendConfirm" | "modelConfig" | "modelResults" | "drd" | "modelReady" | "checkpoint" | "complete";

interface SkillChainState {
  active: boolean;
  runMode?: RunMode;
  step: number;
  currentBatch: number;
  waitingFor?: ChainGate;
  projectName?: string;
  brand?: string;
  market?: string;
  bu?: string;
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
    text: "Hi John 👋 I'm your MMM assistant on Demand Drivers.\n\nWould you like to start a new project or continue with a previous one?"
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

  const appendStaggeredMessages = (base: Message[], replyMessages: Message[]) => {
    setMessages(base);
    replyMessages.forEach((message, index) => {
      const delay = index === 0 ? 0 : index === 1 ? 1200 : 2000;
      window.setTimeout(() => {
        setMessages((prev) => [...prev, { ...message, id: `${message.id}-${index}-${Date.now()}` }]);
      }, delay);
    });
  };

  const handleSend = async (text: string) => {
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);

    const chainReply = getSkillChainReply(text, chain);
    if (chainReply) {
      setChain(chainReply.nextState);
      appendStaggeredMessages(history, chainReply.messages);
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
    const createdState: SkillChainState = {
      ...chain,
      active: true,
      step: 1,
      waitingFor: "datacube",
      projectName: p.name,
      brand: p.brand,
      market: p.market,
      bu: p.bu,
      currentBatch: chain.currentBatch || 1,
    };
    setChain(createdState);
    appendStaggeredMessages(messages, [
      { id: `u${Date.now()}`, role: "user", text: `Create project ${p.name}` },
      chainMessage(`✅ Project **${p.name}** created — ${p.bu} · ${p.market} · ${p.brand}.\n\nNow I need your datacube. This is the input data file — a time-series spreadsheet with your KPI (sales or volume) and all media, price, promotion, and macro variables across your modelling period.\n\nDrop your file below. While you get it ready, feel free to ask me anything about what the datacube should look like.`),
      chainMessage("", "upload"),
    ]);
  };

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    if (id === "t1") setMessages(seededMessages);
    else handleNewChat();
  };

  const handlePickProject = (projectId: string, projectName: string) => {
    const pickedProject = projects.find((project) => project.id === projectId);
    setActiveProjectId(projectId);
    setChain((current) => ({
      ...current,
      active: true,
      step: 4,
      waitingFor: "modelResults",
      projectName,
      brand: pickedProject?.brand ?? "Brand4",
      market: pickedProject?.market ?? "UK",
      currentBatch: 2,
    }));
    setMessages((prev) => [
      ...prev,
      { id: `u${Date.now()}`, role: "user", text: `Open ${projectName}` },
      {
        id: `a${Date.now() + 1}`,
        role: "assistant",
        text: `Resuming **${projectName}** — ${pickedProject?.brand ?? "Brand4"} · ${pickedProject?.market ?? "UK"}.\n\nYou're at Step 4 — Model Interpretation, Batch 2 complete. Health: 14/19 | R²: 80.1%.\n\nWant a full snapshot or shall we jump straight to next steps?`,
        card: "project",
      },
    ]);
  };

  const handleClassificationConfirm = () => {
    handleSend("confirm");
  };

  const handleVariablePropertiesSave = () => {
    handleSend("continue");
  };

  const handleRunModel = () => {
    handleSend("go ahead");
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

function isDatacubeQuestion(input: string) {
  return /\?/.test(input) || /^(what|how|why|do|can|should|is|which)\b/.test(input.trim());
}

function datacubeAnswer(input: string) {
  if (/format|csv|excel/.test(input)) return "CSV or Excel. Columns are your variables, rows are time periods — weekly is standard.";
  if (/years|history|long|period/.test(input)) return "Minimum 2 years of weekly data. 3+ years gives the model more to work with.";
  if (/variables|columns|include/.test(input)) return "Your KPI (sales or volume), all media spend and volume metrics (GRPs, impressions, clicks), price, promotions, distribution, and any macro variables like seasonality or economic indicators.";
  if (/what.*datacube|datacube/.test(input)) return "It's your input data file — a time-series table where each row is a week and each column is a variable you want the model to consider.";
  return "For the datacube, send a weekly CSV or Excel time-series: one date column, one KPI column, and columns for media, price, promotions, distribution, and macro factors. Keep naming consistent and avoid merged cells.";
}

function stepLabel(state: SkillChainState) {
  const labels: Record<number, string> = {
    0: "Project setup",
    1: "Datacube upload and validation",
    3: "Classification and spend mapping",
    4: "Model configuration",
    5: "Model results",
    6: "Model output review",
  };
  return labels[state.step] ?? "MMM workflow";
}

function getSkillChainReply(text: string, state: SkillChainState): { nextState: SkillChainState; messages: Message[] } | null {
  const input = text.trim().toLowerCase();
  const baseState: SkillChainState = { ...state, currentBatch: state.currentBatch || 1 };

  if (/\b(start over|restart)\b/.test(input)) {
    return { nextState: { active: false, step: 0, currentBatch: 1 }, messages: [...seededMessages] };
  }

  if (/\b(stop|pause)\b/.test(input)) {
    return {
      nextState: { ...baseState, active: true },
      messages: [chainMessage(`⏸ Paused. You're at **${stepLabel(baseState)}**${baseState.runMode ? ` in ${baseState.runMode} mode` : ""}${baseState.projectName ? ` for **${baseState.projectName}**` : ""}. Say continue when you're ready.`)],
    };
  }

  if (/switch to guided/.test(input)) {
    return { nextState: { ...baseState, active: true, runMode: "guided" }, messages: [chainMessage("Switched to **Guided** mode. I'll pause after each step and wait for your go-ahead.")] };
  }

  if (/switch to autopilot/.test(input)) {
    return { nextState: { ...baseState, active: true, runMode: "autopilot" }, messages: [chainMessage("Switched to **Autopilot** mode. I'll keep the workflow moving and only stop when I need your input.")] };
  }

  if (/\bwhere are we\b/.test(input)) {
    return {
      nextState: baseState,
      messages: [chainMessage(`You're at **${stepLabel(baseState)}**. Mode: **${baseState.runMode ?? "not selected"}**. Project: **${baseState.projectName ?? projectContext.project}**. Current batch: **${baseState.currentBatch}**.`)],
    };
  }

  if (!baseState.waitingFor) {
    if (/\b(continue|resume|previous)\b/.test(input)) {
      return {
        nextState: { active: true, step: 0, currentBatch: 1, waitingFor: "projectPick" },
        messages: [chainMessage("Sure — here are your existing projects. You can filter by market or brand and pick one to resume.", "selector")],
      };
    }

    if (/\b(new|start|start new|new project|new session|skill chain|mmm session|autopilot|guided)\b/.test(input)) {
      return {
        nextState: { active: true, step: 0, currentBatch: 1, waitingFor: "mode" },
        messages: [chainMessage("Before we begin, how would you like to run this session?\n\n**Guided** — I pause after every step and wait for your go-ahead. Best if you want full control or are new to the workflow.\n\n**Autopilot** — I run the full workflow end to end with live updates in chat. I only stop when I genuinely need your input — uploads, approvals, DRD context. You can say stop any time.\n\nWhich would you prefer?")],
      };
    }
  }

  if (baseState.waitingFor === "projectPick") return null;

  if (baseState.waitingFor === "mode") {
    if (/\b(guided|a)\b/.test(input)) {
      return {
        nextState: { ...baseState, active: true, runMode: "guided", step: 0, waitingFor: "projectExplain" },
        messages: [
          chainMessage("Great — Guided mode it is. I'll check in with you at every step.\n\nFirst things first — we need to set up a **project**.\n\nIn Demand Drivers, a project is a container for one brand in one market. It holds your datacube, variable classifications, model configurations, and all outputs. Everything is tied to a project so you can resume, compare, and share work cleanly.\n\nLet's create one now. You can fill in the form below, or just tell me the business unit, country, and a name for the project and I'll fill it in for you."),
          chainMessage("", "newProject"),
        ],
      };
    }
    if (/\b(autopilot|b)\b/.test(input)) {
      return {
        nextState: { ...baseState, active: true, runMode: "autopilot", step: 0, waitingFor: "projectExplain" },
        messages: [
          chainMessage("Autopilot it is — I'll keep you moving. You just step in when I need you.\n\nFirst we need a **project**. A project in Demand Drivers is a container for one brand and market — it holds your data, classifications, model runs, and outputs. Everything lives here so work is reusable and shareable.\n\nFill in the details below, or describe the project to me and I'll set it up."),
          chainMessage("", "newProject"),
        ],
      };
    }
  }

  if (baseState.waitingFor === "datacube") {
    if (isDatacubeQuestion(input)) return { nextState: baseState, messages: [chainMessage(datacubeAnswer(input))] };
    if (/\b(uploaded|done|here it is|file uploaded|continue)\b/.test(input)) {
      const messages = [
        chainMessage("Got it — let me run a quick data check..."),
        chainMessage("✅ All data looks good.\n\n- 156 weekly observations detected (Jan 2022 – Dec 2024)\n- 43 variables identified\n- No missing values in KPI column\n- Date column parsed correctly\n- Currency: GBP · Periodicity: Weekly"),
      ];
      if (baseState.runMode === "guided") messages.push(chainMessage("Ready to move to variable classification?"));
      if (baseState.runMode === "autopilot") {
        messages.push(chainMessage("Moving to classification now."));
        messages.push(...classificationMessages(baseState.runMode));
        return { nextState: { ...baseState, step: 3, waitingFor: "spendConfirm" }, messages };
      }
      return { nextState: { ...baseState, step: 1, waitingFor: "classification" }, messages };
    }
  }

  if (baseState.waitingFor === "classification") {
    if (baseState.runMode === "guided" && /\b(yes|ready|go|next|continue)\b/.test(input)) {
      return { nextState: { ...baseState, step: 3, waitingFor: "spendConfirm" }, messages: classificationMessages(baseState.runMode) };
    }
    if (baseState.runMode === "autopilot") {
      return { nextState: { ...baseState, step: 3, waitingFor: "spendConfirm" }, messages: classificationMessages(baseState.runMode) };
    }
  }

  if (baseState.waitingFor === "spendConfirm" && /\b(confirm|confirmed|done|looks good|proceed|approve)\b/.test(input)) {
    const messages = baseState.runMode === "guided"
      ? [chainMessage("✅ Spend mapping confirmed. Input module complete.\n\nHere is the model configuration I've prepared. Review the settings and trigger the run when you're ready.", "configuration")]
      : [
          chainMessage("✅ Spend mapping confirmed. Input module complete.\n\nI have everything I need to configure the model. Setting it up now..."),
          chainMessage("Model configuration is ready. Here's a summary of what I've set up — you can review and edit any setting in the UI. If you'd like to make no changes, just say go ahead and I'll trigger the model run.", "configuration"),
        ];
    return { nextState: { ...baseState, step: 4, waitingFor: "modelConfig" }, messages };
  }

  if (baseState.waitingFor === "modelConfig" && /\b(go ahead|run|trigger|run model|confirmed|looks good|yes)\b/.test(input)) {
    return {
      nextState: { ...baseState, step: 5, waitingFor: "modelResults" },
      messages: [
        chainMessage("✅ Model run triggered.\n\nThis typically takes 8–12 minutes. I'll update you as results come in."),
        chainMessage("Results are in. Here's the model output — qualified models are ranked by health score, disqualified models show the reason, and I've highlighted my recommended model based on R², MAPE, and incremental contribution.", "results"),
        chainMessage("You can view a detailed output for any model or compare multiple. Just say **show model 1** or **compare models 1 and 2**."),
      ],
    };
  }

  if (baseState.waitingFor === "modelResults") {
    const match = input.match(/(?:show|view|open)?\s*model\s*(\d+)/);
    if (match) {
      const modelNumber = match[1];
      return {
        nextState: { ...baseState, step: 6, waitingFor: "complete" },
        messages: [
          chainMessage(`Here's the full output for Model ${modelNumber}.`, "summary"),
          chainMessage(`**Model ${modelNumber} summary**\n\nR² is 81.4% — the model explains a strong share of sales variance. Incremental contribution is 18.1%, meaning roughly 18 pence in every pound of sales is driven by paid media activity. The remaining 81.9% is base — driven by brand equity, distribution, and structural factors.\n\n**Top contributors:**\n- TV (Traditional): 7.2% incremental share — highest single channel\n- Paid Search: 4.8% — strong efficiency relative to spend\n- Meta: 3.1% — solid volume driver, ROI slightly below average\n\nHoldout MAPE is 5.9% — model generalises well to unseen data. Health score 17/19.\n\nThis model is ready to sign off. Want me to run budget optimisation next, or move to the summary sheet?`),
        ],
      };
    }
  }

  if (/\bwhat can you help me with\b/.test(input)) {
    return { nextState: baseState, messages: [chainMessage("I can run the MMM skill chain with you: project setup, datacube checks, variable classification, spend mapping, model configuration, model runs, interpretation, comparisons, and next-step recommendations.")] };
  }

  return null;
}

function classificationMessages(runMode?: RunMode): Message[] {
  return [
    chainMessage("Based on your data, I've autoclassified all 43 variables into the required structure for a meaningful model.\n\nI've selected **Sales** as the KPI. The remaining variables are grouped into Base, Media (Traditional and Digital), Price, Promotions, Distribution, and Macro.\n\nYou can review and correct any classification in the UI below — changes take effect immediately.", "classification"),
    chainMessage("You can correct classifications at any point — I'll keep track of changes. Now, before we map spends, let me explain why this matters.\n\nAfter the model runs, to view **response curves and ROIs** for each media variable, we need spend data mapped to each metric — impressions, GRPs, clicks, and so on. Without spend, the model can measure effectiveness but not efficiency. Let me map what I can find automatically.", "mapping"),
    chainMessage(`I've auto-mapped spends to most variables. A few notes:\n\n⚠️ **3 variables have no corresponding spend data** — TV_GRP, Print_Imps, and OOH_Imps. You'll need to upload spend files for these to unlock ROI calculations.\n\n🔍 **2 mappings I'm less confident on** — Meta_VideoViews and YouTube_Completions. Please review those rows in the UI above before confirming.\n\n${runMode === "guided" ? "Take a look and confirm when you're happy with the mappings." : "Review the mappings above. When you're ready, say confirm and I'll lock spend mapping and move to model configuration."}`),
  ];
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

