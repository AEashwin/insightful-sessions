import { useState, KeyboardEvent } from "react";
import { ArrowUp, Paperclip, Sparkles } from "lucide-react";

interface ChatComposerProps {
  onSend: (text: string) => void;
}

export function ChatComposer({ onSend }: ChatComposerProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="px-6 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about your MMM workflow..."
            rows={1}
            className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-40"
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                <Paperclip size={14} />
              </button>
              <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted transition-colors text-[11px] text-muted-foreground">
                <Sparkles size={11} />
                Tools
              </button>
            </div>
            <button
              onClick={submit}
              disabled={!value.trim()}
              className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          DD Assistant can make mistakes. Verify model outputs before client delivery.
        </p>
      </div>
    </div>
  );
}
