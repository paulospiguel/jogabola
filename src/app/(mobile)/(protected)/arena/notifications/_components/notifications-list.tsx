"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import {
  markAllAsRead,
  markNotificationAsRead,
} from "@/actions/notifications.actions";
import { cn } from "@/lib/utils";
import { buildMockNotifications } from "../_fixtures/notifications-mock";
import {
  FILTER_KEYS,
  type FilterKey,
  formatRelativeTime,
  matchesFilter,
  resolveNotificationIcon,
} from "../_utils/notifications-helpers";

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

function renderFormattedText(text: string, isRead: boolean) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const clean = part.slice(2, -2);
      return (
        <span
          key={`${index}-${clean}`}
          className={cn("font-extrabold", isRead ? "text-arena-text-sec" : "text-arena-text")}
        >
          {clean}
        </span>
      );
    }
    return (
      <span
        key={`${index}-${part}`}
        className={isRead ? "text-arena-text-muted/80" : "text-arena-text-sec"}
      >
        {part}
      </span>
    );
  });
}

function mergeWithMocks(initial: Notification[], locale: string): Notification[] {
  const mocks = buildMockNotifications(locale);
  const combined = initial.length === 0 ? mocks : [...initial, ...mocks];
  const unique = combined.filter((n, i, arr) => arr.findIndex(x => x.id === n.id) === i);
  return unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const t = useTranslations("notificationsPage");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>("todas");
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    mergeWithMocks(initialNotifications, locale),
  );

  useEffect(() => {
    setNotifications(mergeWithMocks(initialNotifications, locale));
  }, [initialNotifications, locale]);

  const handleMarkAsRead = (id: string) => {
    if (id.startsWith("mock-")) {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      return;
    }
    startTransition(async () => {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    startTransition(async () => {
      await markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = notifications.filter(n => matchesFilter(n.type, n.read, filter));

  return (
    <div className="flex h-full flex-col bg-arena-bg">
      <div className="flex shrink-0 items-center justify-between border-b border-arena-border/30 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-extrabold text-arena-text tracking-tight">
            {t("header.title")}
          </span>
          {unreadCount > 0 && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            type="button"
            className="press text-[13px] font-extrabold text-[#38BDF8] hover:text-[#38BDF8]/90 transition-all disabled:opacity-50"
          >
            {t("actions.markAllRead")}
          </button>
        )}
      </div>

      <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-arena-border/20 px-5 py-3.5 scrollbar-none">
        {FILTER_KEYS.map(key => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "press shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all duration-150 border",
              filter === key
                ? "border-arena-primary text-arena-primary bg-arena-primary/5 font-extrabold shadow-[0_0_8px_rgba(124,255,79,0.15)]"
                : "border-arena-border bg-[#151C26] text-arena-text-sec hover:border-arena-primary/30",
            )}
          >
            {t(`filters.${key}`)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState t={t} hasFilter={filter !== "todas"} />
        ) : (
          <ul className="divide-y divide-arena-border/20">
            {filtered.map(notification => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                locale={locale}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NotificationRow({
  notification,
  locale,
  onMarkAsRead,
}: {
  notification: Notification;
  locale: string;
  onMarkAsRead: (id: string) => void;
}) {
  const { Icon, cls } = resolveNotificationIcon(notification.type);
  const timeAgo = formatRelativeTime(notification.createdAt, locale);

  return (
    <li
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
      onKeyDown={e => {
        if ((e.key === "Enter" || e.key === " ") && !notification.read) {
          onMarkAsRead(notification.id);
        }
      }}
      className={cn(
        "press flex items-start gap-3.5 px-5 py-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-arena-primary select-none",
        notification.read
          ? "cursor-default opacity-60 hover:bg-arena-surface/10"
          : "cursor-pointer hover:bg-arena-surface/20 bg-[#0B0F14]",
      )}
    >
      <div className={cn("mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[10px]", cls)}>
        <Icon size={18} strokeWidth={2.2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn("text-[13px] leading-snug", notification.read ? "text-arena-text-muted" : "text-arena-text")}>
          {renderFormattedText(notification.title, notification.read)}
        </p>
        <span className="mt-1.5 block text-[11px] text-arena-text-muted/70 font-medium">
          {timeAgo}
        </span>
      </div>

      {!notification.read && (
        <div className="mt-2 shrink-0 pl-2">
          <div className="size-2 rounded-full bg-arena-primary shadow-[0_0_8px_#7CFF4F] animate-pulse" />
        </div>
      )}
    </li>
  );
}

function EmptyState({
  t,
  hasFilter,
}: {
  t: ReturnType<typeof useTranslations<"notificationsPage">>;
  hasFilter: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-[14px] border border-arena-border bg-arena-surface text-arena-text-muted">
        <Bell size={24} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[15px] font-bold text-arena-text">
          {hasFilter ? t("emptyFilter.title") : t("empty.title")}
        </p>
        <p className="mt-1 text-[13px] text-arena-text-muted">
          {hasFilter ? t("emptyFilter.description") : t("empty.description")}
        </p>
      </div>
    </div>
  );
}
