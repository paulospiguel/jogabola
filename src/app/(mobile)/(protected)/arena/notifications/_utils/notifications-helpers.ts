import {
  AlertCircle,
  Bell,
  Check,
  Clock,
  CreditCard,
  UserPlus,
  X,
} from "lucide-react";

export type FilterKey = "todas" | "confirmadas" | "recusas" | "sistema";

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "confirmadas", label: "Confirm." },
  { key: "recusas", label: "Recusas" },
  { key: "sistema", label: "Sistema" },
];

const RELATIVE_TIME_LABELS: Record<string, { now: string; min: string; hour: string; day: string; days: string }> = {
  pt: { now: "agora mesmo", min: "min atrás", hour: "h atrás", day: "1 dia atrás", days: "dias atrás" },
  en: { now: "just now", min: "min ago", hour: "h ago", day: "1 day ago", days: "days ago" },
  es: { now: "ahora mismo", min: "min antes", hour: "h antes", day: "hace 1 día", days: "días antes" },
  fr: { now: "à l'instant", min: "min de ça", hour: "h de ça", day: "il y a 1 jour", days: "jours de ça" },
};

export function formatRelativeTime(dateInput: Date | string, locale: string): string {
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / (60 * 1000));
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  const labels = RELATIVE_TIME_LABELS[locale] ?? RELATIVE_TIME_LABELS.pt;
  if (diffMin < 1) return labels.now;
  if (diffMin < 60) return `${diffMin} ${labels.min}`;
  if (diffHours < 24) return `${diffHours}${labels.hour}`;
  if (diffDays === 1) return labels.day;
  return `${diffDays} ${labels.days}`;
}

export function isSystemType(type: string): boolean {
  return (
    type === "event_created" ||
    type === "player_joined" ||
    type === "player_added" ||
    type === "payment_received" ||
    type.includes("reserve") ||
    type.includes("no_response")
  );
}

export function matchesFilter(notificationType: string, read: boolean, filter: FilterKey): boolean {
  void read;
  if (filter === "todas") return true;
  if (filter === "confirmadas") return notificationType.includes("confirmed");
  if (filter === "recusas") return notificationType.includes("refused");
  if (filter === "sistema") return isSystemType(notificationType);
  return true;
}

export function resolveNotificationIcon(type: string): { Icon: React.ElementType; cls: string } {
  if (type.includes("confirmed"))
    return { Icon: Check, cls: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20" };
  if (type.includes("refused"))
    return { Icon: X, cls: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20" };
  if (type.includes("reserve"))
    return { Icon: Clock, cls: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20" };
  if (type.includes("no_response"))
    return { Icon: AlertCircle, cls: "bg-[#6B7280]/15 text-[#A7B0BE] border border-[#263244]" };
  if (type === "event_created")
    return { Icon: Bell, cls: "bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20" };
  if (type === "player_joined" || type === "player_added")
    return { Icon: UserPlus, cls: "bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/20" };
  if (type === "payment_received")
    return { Icon: CreditCard, cls: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20" };
  return { Icon: Bell, cls: "bg-arena-surface-el text-arena-text-muted border border-arena-border" };
}
