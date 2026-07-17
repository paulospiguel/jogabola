import { Field, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EventSpotsProgressProps {
  filledSpots: number;
  totalSpots: number;
  label: string;
  className?: string;
}

export function EventSpotsProgress({
  filledSpots,
  totalSpots,
  label,
  className,
}: EventSpotsProgressProps) {
  const percentage = totalSpots > 0 ? (filledSpots / totalSpots) * 100 : 0;

  return (
    <Field className={cn("w-full", className)}>
      <FieldLabel
        htmlFor="event-spots-progress"
        className="flex justify-between w-full"
      >
        <div className="flex justify-between w-full">
          <span>{label}</span>
          <span className="text-muted-foreground">
            {filledSpots}/<b className="text-arena-primary">{totalSpots}</b>
          </span>
        </div>
      </FieldLabel>
      <Progress
        value={percentage}
        id="event-spots-progress"
        className="h-1.5 bg-arena-border [&_[data-slot=progress-indicator]]:bg-arena-primary [&_[data-slot=progress-indicator]]:shadow-[0_0_12px_rgba(124,255,79,0.3)]"
      />
    </Field>
  );
}
