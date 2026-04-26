import { Button } from "@/components/ui/button";

interface GuidedContinueCardProps {
  stepNumber?: number;
  stepName?: string;
  summary?: string;
  onContinue?: () => void;
  onPause?: () => void;
}

export function GuidedContinueCard({
  stepNumber = 1,
  stepName = "Data Quality & Setup",
  summary = "The previous step is complete and ready for your review.",
  onContinue,
  onPause,
}: GuidedContinueCardProps) {
  return (
    <div className="flex flex-col gap-3 bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">✅ Step {stepNumber} complete — {stepName}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{summary}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" className="h-8 text-xs" onClick={onContinue}>Yes, continue →</Button>
        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={onPause}>⏸ Pause here</Button>
      </div>
    </div>
  );
}
