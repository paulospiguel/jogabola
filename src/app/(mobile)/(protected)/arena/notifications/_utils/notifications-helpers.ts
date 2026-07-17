import {
  AlertCircle,
  Bell,
  Check,
  Clock,
  CreditCard,
  UserPlus,
  X,
} from "lucide-react";

export type NotificationFilterKey = "all" | "confirmed" | "declined" | "system";

export const NOTIFICATION_FILTER_KEYS: NotificationFilterKey[] = [
  "all",
  "confirmed",
  "declined",
  "system",
];

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

export function matchesFilter(
  notificationType: string,
  read: boolean,
  filter: NotificationFilterKey,
): boolean {
  void read;
  if (filter === "all") return true;
  if (filter === "confirmed") return notificationType.includes("confirmed");
  if (filter === "declined") return notificationType.includes("refused");
  if (filter === "system") return isSystemType(notificationType);
  return true;
}

export function resolveNotificationIcon(type: string): {
  Icon: React.ElementType;
  cls: string;
} {
  if (type.includes("confirmed"))
    return {
      Icon: Check,
      cls: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
    };
  if (type.includes("refused"))
    return {
      Icon: X,
      cls: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
    };
  if (type.includes("reserve"))
    return {
      Icon: Clock,
      cls: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
    };
  if (type.includes("no_response"))
    return {
      Icon: AlertCircle,
      cls: "bg-[#6B7280]/15 text-[#A7B0BE] border border-[#263244]",
    };
  if (type === "event_created")
    return {
      Icon: Bell,
      cls: "bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20",
    };
  if (type === "player_joined" || type === "player_added")
    return {
      Icon: UserPlus,
      cls: "bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/20",
    };
  if (type === "payment_received")
    return {
      Icon: CreditCard,
      cls: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
    };
  return {
    Icon: Bell,
    cls: "bg-arena-surface-el text-arena-text-muted border border-arena-border",
  };
}
