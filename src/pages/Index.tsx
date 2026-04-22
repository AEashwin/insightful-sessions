import { useState, useRef, useEffect } from "react";
import { Share2, MoreHorizontal } from "lucide-react";
import { ChatSidebar, type ChatThread, type Project } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ProjectSummaryCard } from "@/components/chat/cards/ProjectSummaryCard";
import { WorkflowCard } from "@/components/chat/cards/WorkflowCard";
import { ClassificationCard } from "@/components/chat/cards/ClassificationCard";
import { ModelOutputCard } from "@/components/chat/cards/ModelOutputCard";

type CardKey = "project" | "workflow" | "classification" | "modelOutput";

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
  { id: "t1", projectId: "1", title: "Review Batch 2 model output", updatedAgo: "2m ago" },
  { id: "t2", projectId: "1", title: "Variable classification fixes", updatedAgo: "1h ago" },
  { id: "t3", projectId: "1", title: "Initial data QC + setup", updatedAgo: "3d ago" },
  { id: "t4", projectId: "2", title: "Datacube upload", updatedAgo: "1d ago" },
  { id: "t5", projectId: "3", title: "Optimisation scenarios", updatedAgo: "5d ago" },
  { id: "t6", projectId: "5", title: "Variable review pass", updatedAgo: "6h ago" },
];

const seededMessages: Message[] = [
  {
    id: "m1",
    role: "user",
    text: "Resume Demo_Brand4_2025 — where am I in the workflow?",
  },
  {
    id: "m2",
    role: "assistant",
    text: "Welcome back. Here's a snapshot of the project and where you left off:",
    card: "project",
  },
  {
    id: "m3",
    role: "assistant",
    text: "You're on **stage 7 of 9 — Model Interpretation**. Stages 1–6 are complete. Want me to walk you through the workflow tracker?",
    card: "workflow",
  },
  {
    id: "m4",
    role: "user",
    text: "Show me the variable classifications — I think a couple need correcting.",
  },
  {
    id: "m5",
    role: "assistant",
    text: "Two variables are flagged. Click **Apply AI fixes** to auto-correct, or edit them manually:",
    card: "classification",
  },
  {
    id: "m6",
    role: "user",
    text: "Looks good. Now show me the latest model output.",
  },
  {
    id: "m7",
    role: "assistant",
    text: "Batch 2 · Model 0 has converged. Fit metrics are strong, though Durbin-Watson is borderline. TV is the standout channel at 3.2x ROI:",
    card: "modelOutput",
  },
  {
    id: "m8",
    role: "assistant",
    text: "Overall the model is healthy. **Promo_Depth** at 1.2x is dragging efficiency — worth flagging in client narrative. Ready to move to Simulation & Optimisation when you are.",
  },
];

const cardMap: Record<CardKey, React.FC> = {
  project: ProjectSummaryCard,
  workflow: WorkflowCard,
  classification: ClassificationCard,
  modelOutput: ModelOutputCard,
};

const Index = () => {
  const [activeProjectId, setActiveProjectId] = useState("1");
  const [activeThreadId, setActiveThreadId] = useState("t1");
  const [messages, setMessages] = useState<Message[]>(seededMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const handleSend = (text: string) => {
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let card: CardKey | undefined;
      let response = "Got it — let me pull that up for you.";

      if (lower.includes("workflow") || lower.includes("stage") || lower.includes("progress")) {
        card = "workflow";
        response = "Here's the current workflow status:";
      } else if (lower.includes("classif") || lower.includes("variable") || lower.includes("flag")) {
        card = "classification";
        response = "Here are the variable classifications. Two need attention:";
      } else if (lower.includes("model") || lower.includes("output") || lower.includes("roi") || lower.includes("result")) {
        card = "modelOutput";
        response = "Latest model output for Batch 2:";
      } else if (lower.includes("project") || lower.includes("snapshot") || lower.includes("summary")) {
        card = "project";
        response = "Project snapshot below:";
      }

      const aiMsg: Message = {
        id: `a${Date.now()}`,
        role: "assistant",
        text: response,
        card,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: "New chat started. Ask me anything about your MMM workflow — I can show the workflow tracker, classification table, or model output inline.",
      },
    ]);
  };

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    if (id === "t1") setMessages(seededMessages);
    else handleNewChat();
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        projects={projects}
        threads={threads}
        activeThreadId={activeThreadId}
        activeProjectId={activeProjectId}
        onSelectThread={handleSelectThread}
        onSelectProject={setActiveProjectId}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/80 backdrop-blur-sm">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {activeThread?.title || "New chat"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {projects.find((p) => p.id === activeProjectId)?.name}
            </p>
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

        {/* Chat thread */}
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
          </div>
        </div>

        {/* Composer */}
        <ChatComposer onSend={handleSend} />
      </main>
    </div>
  );
};

// Minimal markdown bolding for **text**
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export default Index;
