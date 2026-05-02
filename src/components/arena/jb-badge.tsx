import { AlertCircle, Check, Clock, Hourglass, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type BadgeStatus =
  | "confirmed"
  | "reserve"
  | "pending"
  | "refused"
  | "highlight"
  | "waiting"
  | "validating"
  | "low"
  | "medium"
  | "high";

interface JbBadgeProps {
  status: BadgeStatus;
  animate?: boolean;
}

const STATUS_MAP: Record<
  BadgeStatus,
  { label: string; Icon: React.ElementType; className: string }
> = {
  confirmed: {
    label: "confirmed",
    Icon: Check,
    className: "border-arena-success/20 bg-arena-success/10 text-arena-success",
  },
  reserve: {
    label: "reserve",
    Icon: Clock,
    className: "border-arena-warning/20 bg-arena-warning/10 text-arena-warning",
  },
  pending: {
    label: "pending",
    Icon: AlertCircle,
    className:
      "border-arena-text-muted/20 bg-arena-text-muted/10 text-arena-text-muted",
  },
  refused: {
    label: "refused",
    Icon: X,
    className: "border-arena-danger/20 bg-arena-danger/10 text-arena-danger",
  },
  validating: {
    label: "validating",
    Icon: Hourglass,
    className: "border-arena-warning/20 bg-arena-warning/10 text-arena-warning",
  },
  waiting: {
    label: "waiting",
    Icon: Hourglass,
    className: "border-arena-warning/20 bg-arena-warning/10 text-arena-warning",
  },
  highlight: {
    label: "highlight",
    Icon: Star,
    className:
      "border-arena-highlight/20 bg-arena-highlight/10 text-arena-highlight",
  },
  low: {
    label: "low",
    Icon: Check,
    className: "border-arena-success/20 bg-arena-success/10 text-arena-success",
  },
  medium: {
    label: "medium",
    Icon: AlertCircle,
    className: "border-arena-warning/20 bg-arena-warning/10 text-arena-warning",
  },
  high: {
    label: "high",
    Icon: X,
    className: "border-arena-danger/20 bg-arena-danger/10 text-arena-danger",
  },
};

export function JbBadge({ status, animate }: JbBadgeProps) {
  const t = useTranslations("arenaBadges");

  const m = STATUS_MAP[status] ?? STATUS_MAP.pending;
  const { Icon } = m;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-lg border px-2 py-[3px] text-[11px] font-bold tracking-[0.2px]",
        animate && "animate-[badgePop_.4s_ease]",
        m.className,
      )}
    >
      <Icon size={10} strokeWidth={2.5} />
      {t(m.label)}
    </span>
  );
}
