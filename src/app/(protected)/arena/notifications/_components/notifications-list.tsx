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
        <div className="h-16 w-16 rounded-full bg-arena-surface-el flex items-center justify-center text-arena-text-muted mb-4">
          <Bell size={32} />
        </div>
        <h3 className="text-lg font-bold text-arena-text">
          {t("empty.title")}
        </h3>
        <p className="text-sm text-arena-text-sec mt-1 max-w-xs">
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
          <button
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="text-xs font-bold text-arena-primary hover:underline flex items-center gap-1.5"
          >
            <Check size={14} />
            {t("actions.markAllRead")}
          </button>
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
              "jb-card group relative p-4 flex gap-4 text-left w-full transition-all duration-200 border-l-4",
              notification.read
                ? "border-transparent opacity-70"
                : "border-arena-primary bg-arena-surface-el/20 hover:bg-arena-surface-el/30",
            )}
          >
            <div
              className={cn(
                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center",
                TypeColor(notification.type),
              )}
            >
              <TypeIcon type={notification.type} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4
                  className={cn(
                    "text-sm font-bold truncate transition-colors",
                    notification.read
                      ? "text-arena-text-sec"
                      : "text-arena-text",
                  )}
                >
                  {notification.title}
                </h4>
                <span className="text-[10px] whitespace-nowrap text-arena-text-muted uppercase font-bold tracking-wider">
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
              <div className="absolute top-4 right-4 flex items-center">
                <div className="h-2 w-2 rounded-full bg-arena-primary shadow-[0_0_8px_rgba(124,255,79,0.5)]" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
