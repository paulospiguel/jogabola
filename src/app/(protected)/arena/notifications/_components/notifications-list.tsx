"use client";

import { formatDistanceToNow } from "date-fns";
import { enUS, es, pt } from "date-fns/locale";
import { Bell, Calendar, Check, CreditCard, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import {
  markAllAsRead,
  markNotificationAsRead,
} from "@/actions/notifications.actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationsListProps {
  initialNotifications: Notification[];
}

const dateLocales: Record<string, typeof pt> = { pt, es, en: enUS };

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "event_created":
      return <Calendar size={16} />;
    case "player_joined":
      return <UserPlus size={16} />;
    case "payment_received":
      return <CreditCard size={16} />;
    default:
      return <Bell size={16} />;
  }
};

const TypeColor = (type: string) => {
  switch (type) {
    case "event_created":
      return "text-arena-primary bg-arena-primary/10";
    case "player_joined":
      return "text-arena-info bg-arena-info/10";
    case "payment_received":
      return "text-arena-success bg-arena-success/10";
    default:
      return "text-arena-text-sec bg-arena-surface-el";
  }
};

export function NotificationsList({
  initialNotifications,
}: NotificationsListProps) {
  const t = useTranslations("notificationsPage");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      await markNotificationAsRead(id);
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllAsRead();
    });
  };

  if (initialNotifications.length === 0) {
    return (
      <div className="jb-card flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-arena-surface-el text-arena-text-muted">
          <Bell size={32} />
        </div>
        <h3 className="text-lg font-bold text-arena-text">
          {t("empty.title")}
        </h3>
        <p className="mt-1 max-w-xs text-sm text-arena-text-sec">
          {t("empty.description")}
        </p>
      </div>
    );
  }

  const unreadCount = initialNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-medium text-arena-text-sec">
          {unreadCount > 0 ? (
            <span>{t("unreadCount", { count: unreadCount })}</span>
          ) : (
            <span>{t("allRead")}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            variant="ghost"
            size="sm"
            className="h-auto gap-1.5 p-0 text-xs font-bold text-arena-primary hover:bg-transparent hover:underline"
          >
            <Check size={14} />
            {t("actions.markAllRead")}
          </Button>
        )}
      </div>

      <div className="jb-stack">
        {initialNotifications.map(notification => (
          <button
            type="button"
            key={notification.id}
            onClick={() =>
              !notification.read && handleMarkAsRead(notification.id)
            }
            className={cn(
              "jb-card group relative flex w-full gap-4 border-l-4 p-4 text-left transition-all duration-200",
              notification.read
                ? "border-transparent opacity-70"
                : "border-arena-primary bg-arena-surface-el/20 hover:bg-arena-surface-el/30",
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                TypeColor(notification.type),
              )}
            >
              <TypeIcon type={notification.type} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4
                  className={cn(
                    "truncate text-sm font-bold transition-colors",
                    notification.read
                      ? "text-arena-text-sec"
                      : "text-arena-text",
                  )}
                >
                  {notification.title}
                </h4>
                <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: dateLocales[locale] || pt,
                  })}
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 text-sm leading-relaxed",
                  notification.read
                    ? "text-arena-text-muted"
                    : "text-arena-text-sec",
                )}
              >
                {notification.message}
              </p>
            </div>

            {!notification.read && (
              <div className="absolute right-4 top-4 flex items-center">
                <div className="h-2 w-2 rounded-full bg-arena-primary shadow-[0_0_8px_rgba(124,255,79,0.5)]" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
