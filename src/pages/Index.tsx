import { useState, useRef, useEffect } from "react";
import { BarChart3, Check, ChevronRight, LineChart, Lock, Mail, Moon, Pencil, Sparkles, Sun, X } from "lucide-react";
import { QubeSidebar, ToolRail, type ChatThread, type Project } from "@/components/chat/QubeSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatLanding } from "@/components/chat/ChatLanding";
import { ProjectSummaryCard } from "@/components/chat/cards/ProjectSummaryCard";
import { ProjectSelectorCard } from "@/components/chat/cards/ProjectSelectorCard";
import { NewProjectCard } from "@/components/chat/cards/NewProjectCard";
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
import { Input } from "@/components/ui/input";
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

const renderCard = (
  key: CardKey,
  ctx: {
    onPickProject?: (id: string, name: string) => void;
    onCreateProject?: (p: { name: string; brand: string; market: string; bu: string }) => void;
    onNewProject?: () => void;
    prefill?: Partial<{ name: string; brand: string; market: string; bu: string }>;
  },
) => {
  switch (key) {
    case "project": return <ProjectSummaryCard />;
    case "selector": return <ProjectSelectorCard onPick={ctx.onPickProject} onNewProject={ctx.onNewProject} />;
    case "newProject": return <NewProjectCard onCreate={ctx.onCreateProject} initial={ctx.prefill} />;
    case "upload": return <DataUploadCard />;
    case "groups": return <VariableGroupsCard />;
    case "properties": return <VariablePropertiesCard />;
    case "mapping": return <SpendMappingCard />;
    case "transformations": return <ModelTransformationsCard />;
    case "results": return <ModelResultsCard />;
    case "summary": return <ModelSummaryCard />;
    case "optimisation": return <OptimisationCard />;
    case "flighting": return <FlightingCard />;
    case "workflow": return <WorkflowCard />;
    case "classification": return <ClassificationCard />;
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
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
  }, [theme]);

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

      const validCards: CardKey[] = ["project","selector","newProject","upload","groups","properties","mapping","transformations","results","summary","optimisation","flighting","workflow","classification"];
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
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
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
  onCreateProject: (p: { name: string; brand: string; market: string; bu: string; kpi: string }) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
  userName,
}: ChatStageProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const widthClass = collapsed ? "max-w-5xl" : "max-w-3xl";
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
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className={`${widthClass} mx-auto px-6 py-5 space-y-6 transition-[max-width] duration-200 ease-linear`}>
              {messages.map((m) => (
                <ChatMessage key={m.id} role={m.role}>
                  {m.text && <p>{renderText(m.text)}</p>}
                  {m.card && <div className="mt-2">{renderCard(m.card, { onPickProject, onCreateProject, prefill: m.prefill })}</div>}
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

