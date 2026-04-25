import { useRef, useState, KeyboardEvent, ChangeEvent } from "react";
import { ArrowUp, Paperclip, Sparkles } from "lucide-react";

interface ChatComposerProps {
  onSend: (text: string) => void;
  suggestions?: string[];
  maxWidthClass?: string;
}

const defaultSuggestions = [
  "Show projects",
  "Upload data",
  "Variable groups",
  "Spend mapping",
  "Transformations",
  "Run model",
  "Model results",
  "Summarise model",
  "Optimise spends",
  "Flighting plan",
];

export function ChatComposer({ onSend, suggestions = defaultSuggestions, maxWidthClass = "max-w-3xl" }: ChatComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "42px";
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="px-6 pb-3 pt-1 bg-gradient-to-t from-background via-background to-transparent">
      <div className={`${maxWidthClass} mx-auto transition-[max-width] duration-200 ease-linear`}>
        <div className="rounded-xl border border-border bg-card shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all overflow-hidden">
          <div className="flex gap-1.5 px-3 py-2 border-b border-border/60 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSend(s)}
                className="shrink-0 px-2.5 py-1 rounded-full border border-border bg-muted/30 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onTextareaChange}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about your MMM workflow..."
            rows={1}
            className="w-full min-h-[42px] resize-none overflow-y-auto bg-transparent px-4 pt-3 pb-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center justify-between px-2 pb-1.5">
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
