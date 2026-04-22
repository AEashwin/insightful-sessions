import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessageProps {
  role: "user" | "assistant";
  children: React.ReactNode;
}

export function ChatMessage({ role, children }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex gap-4 group">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-foreground text-background text-[11px] font-semibold">
            JD
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 pt-1">
          <p className="text-xs font-semibold text-foreground mb-1">You</p>
          <div className="text-sm text-foreground leading-relaxed">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 group">
      <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles size={14} className="text-primary" />
      </div>
      <div className="flex-1 pt-1 min-w-0">
        <p className="text-xs font-semibold text-primary mb-1">DD Assistant</p>
        <div className="text-sm text-foreground leading-relaxed space-y-3">{children}</div>
      </div>
    </div>
  );
}
