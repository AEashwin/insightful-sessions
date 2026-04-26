import { Sparkles, FolderOpen, Plus, BarChart3, Clock } from "lucide-react";

interface ChatLandingProps {
  userName: string;
  onSuggestion: (text: string) => void;
}

const tiles = [
  {
    icon: Plus,
    label: "Start a new MMM session",
    prompt: "Start a new MMM session.",
    accent: "text-primary",
  },
  {
    icon: FolderOpen,
    label: "Resume a previous project",
    prompt: "Resume a previous project.",
    accent: "text-emerald-500",
  },
  {
    icon: BarChart3,
    label: "Run the skill chain in autopilot",
    prompt: "Run the skill chain in autopilot.",
    accent: "text-amber-500",
  },
  {
    icon: Clock,
    label: "What can you help me with?",
    prompt: "What can you help me with?",
    accent: "text-violet-500",
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good night";
}

export function ChatLanding({ userName, onSuggestion }: ChatLandingProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-3 text-primary">
        <Sparkles size={18} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">DD Assistant</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight text-center">
        {greeting()}, <span className="text-primary">{userName}</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
        Where would you like to start? Ask me anything about your MMM workflow.
      </p>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-3xl">
        {tiles.map((t) => (
          <button
            key={t.label}
            onClick={() => onSuggestion(t.prompt)}
            className="group rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/40 transition-all p-4 text-left"
          >
            <t.icon size={16} className={`${t.accent} mb-2`} />
            <p className="text-xs font-semibold text-foreground leading-snug">{t.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
