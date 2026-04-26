interface ModeSelectionCardProps {
  onSelect?: (mode: "autopilot" | "guided") => void;
}

const modes = [
  {
    id: "autopilot" as const,
    icon: "🤖",
    title: "Autopilot",
    subtitle: "I run end-to-end. You only step in when needed.",
  },
  {
    id: "guided" as const,
    icon: "🧭",
    title: "Guided",
    subtitle: "I pause after each step and wait for your go-ahead.",
  },
];

export function ModeSelectionCard({ onSelect }: ModeSelectionCardProps) {
  return (
    <div className="grid gap-3 bg-card p-3 sm:grid-cols-2">
      {modes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          onClick={() => onSelect?.(mode.id)}
          className="group rounded-lg border border-border bg-background p-4 text-left transition-all hover:border-primary/45 hover:bg-primary/5 hover:shadow-[0_14px_32px_-24px_hsl(var(--primary)/0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-2xl" aria-hidden>
            {mode.icon}
          </span>
          <span className="mt-3 block text-sm font-semibold text-foreground group-hover:text-primary">{mode.title}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">{mode.subtitle}</span>
        </button>
      ))}
    </div>
  );
}
