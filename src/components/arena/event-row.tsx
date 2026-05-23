import { Calendar, ChevronRight, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type EventRowType = "game" | "training" | "event";

type EventRowProps = {
  href: string;
  title: string;
  type: EventRowType;
  dateLabel?: string;
  timeLabel?: string;
  location?: string;
  statusLabel?: string;
  resultLabel?: string;
};

const typeStyles: Record<
  EventRowType,
  { Icon: React.ElementType; className: string }
> = {
  game: {
    Icon: Trophy,
    className: "border-arena-primary/25 bg-arena-primary/10 text-arena-primary",
  },
  training: {
    Icon: Shield,
    className: "border-arena-info/25 bg-arena-info/10 text-arena-info",
  },
  event: {
    Icon: Calendar,
    className:
      "border-arena-text-muted/20 bg-arena-text-muted/10 text-arena-text-muted",
  },
};

export function EventRow({
  href,
  title,
  type,
  dateLabel,
  timeLabel,
  location,
  statusLabel,
  resultLabel,
}: EventRowProps) {
  const { Icon, className } = typeStyles[type];
  const metadata = [dateLabel, timeLabel, location].filter(Boolean).join(" - ");

  return (
    <Link className="jb-card jb-list-row group" href={href}>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl border",
          className,
        )}
      >
        <Icon size={16} strokeWidth={2.4} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-arena-text">
          {title}
        </span>
        {metadata && (
          <span className="mt-0.5 block truncate text-[11px] text-arena-text-muted">
            {metadata}
          </span>
        )}
      </span>
      {(resultLabel || statusLabel) && (
        <span className="shrink-0 text-right">
          {resultLabel && (
            <span className="block text-xs font-bold text-arena-text">
              {resultLabel}
            </span>
          )}
          {statusLabel && (
            <span className="block text-[10px] font-semibold text-arena-text-muted">
              {statusLabel}
            </span>
          )}
        </span>
      )}
      <ChevronRight
        className="shrink-0 text-arena-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-arena-text"
        size={16}
        strokeWidth={2.4}
      />
    </Link>
  );
}
