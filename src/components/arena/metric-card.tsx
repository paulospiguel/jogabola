import { cn } from "@/lib/utils";

type MetricCardTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  tone?: MetricCardTone;
};

const toneStyles: Record<MetricCardTone, string> = {
  primary: "border-arena-primary/20 bg-arena-primary/10 text-arena-primary",
  success: "border-arena-success/20 bg-arena-success/10 text-arena-success",
  warning: "border-arena-warning/20 bg-arena-warning/10 text-arena-warning",
  danger: "border-arena-danger/20 bg-arena-danger/10 text-arena-danger",
  info: "border-arena-info/20 bg-arena-info/10 text-arena-info",
  neutral: "border-arena-border bg-arena-surface-el text-arena-text-muted",
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: MetricCardProps) {
  return (
    <div className="flex min-h-[92px] min-w-0 flex-col justify-between rounded-[14px] border border-arena-border bg-arena-surface/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[11px] font-semibold text-arena-text-muted">
          {label}
        </span>
        {Icon && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-xl border",
              toneStyles[tone],
            )}
          >
            <Icon size={15} strokeWidth={2.4} />
          </span>
        )}
      </div>
      <strong className="block truncate text-2xl font-black leading-none text-arena-text">
        {value}
      </strong>
    </div>
  );
}
