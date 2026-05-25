"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Bell,
  Check,
  Clock,
  CreditCard,
  UserPlus,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
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

type FilterKey = "todas" | "confirmadas" | "recusas" | "sistema";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "confirmadas", label: "Confirm." },
  { key: "recusas", label: "Recusas" },
  { key: "sistema", label: "Sistema" },
];

const DESPORTIVA_TEXTS: Record<
  string,
  {
    now: string;
    min: string;
    hour: string;
    day: string;
    days: string;
  }
> = {
  pt: {
    now: "agora mesmo",
    min: "min atrás",
    hour: "h atrás",
    day: "1 dia atrás",
    days: "dias atrás",
  },
  en: {
    now: "just now",
    min: "min ago",
    hour: "h ago",
    day: "1 day ago",
    days: "days ago",
  },
  es: {
    now: "ahora mismo",
    min: "min antes",
    hour: "h antes",
    day: "hace 1 día",
    days: "días antes",
  },
  fr: {
    now: "à l'instant",
    min: "min de ça",
    hour: "h de ça",
    day: "il y a 1 jour",
    days: "jours de ça",
  },
};

function formatDesportivaTime(
  dateInput: Date | string,
  locale: string,
): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / (60 * 1000));
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  const texts = DESPORTIVA_TEXTS[locale] ?? DESPORTIVA_TEXTS.pt;

  if (diffMin < 1) {
    return texts.now;
  }
  if (diffMin < 60) {
    return `${diffMin} ${texts.min}`;
  }
  if (diffHours < 24) {
    return `${diffHours}${texts.hour}`;
  }
  if (diffDays === 1) {
    return texts.day;
  }
  return `${diffDays} ${texts.days}`;
}

const MOCK_NOTIFICATIONS = (locale: string): Notification[] => {
  const isPt = locale === "pt";
  const isEs = locale === "es";
  const isFr = locale === "fr";

  return [
    {
      id: "mock-1",
      type: "attendance_confirmed",
      title: isPt
        ? "**Ricardo Pinto** confirmou presença em **Jogo vs Benfica B**"
        : isEs
          ? "**Ricardo Pinto** confirmó su asistencia en **Partido vs Benfica B**"
          : isFr
            ? "**Ricardo Pinto** a confirmé sa présence pour le **Match vs Benfica B**"
            : "**Ricardo Pinto** confirmed attendance for **Match vs Benfica B**",
      message: "",
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
    },
    {
      id: "mock-2",
      type: "attendance_confirmed",
      title: isPt
        ? "**Diogo Ferreira** confirmou presença em **Jogo vs Benfica B**"
        : isEs
          ? "**Diogo Ferreira** confirmó su asistencia en **Partido vs Benfica B**"
          : isFr
            ? "**Diogo Ferreira** a confirmé sa présence pour le **Match vs Benfica B**"
            : "**Diogo Ferreira** confirmed attendance for **Match vs Benfica B**",
      message: "",
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    },
    {
      id: "mock-3",
      type: "attendance_refused",
      title: isPt
        ? "**Paulo Fernandes** recusou presença em **Jogo vs Benfica B**"
        : isEs
          ? "**Paulo Fernandes** rechazó la asistencia en **Partido vs Benfica B**"
          : isFr
            ? "**Paulo Fernandes** a décliné la présence pour le **Match vs Benfica B**"
            : "**Paulo Fernandes** declined attendance for **Match vs Benfica B**",
      message: "",
      read: false,
      createdAt: new Date(Date.now() - 12 * 60 * 1000), // 12 min ago
    },
    {
      id: "mock-4",
      type: "attendance_reserve",
      title: isPt
        ? "**João Martins** ficou em reserva em **Jogo vs Benfica B**"
        : isEs
          ? "**João Martins** quedó en reserva en **Partido vs Benfica B**"
          : isFr
            ? "**João Martins** a été mis en réserve pour le **Match vs Benfica B**"
            : "**João Martins** was put in reserve for **Match vs Benfica B**",
      message: "",
      read: false,
      createdAt: new Date(Date.now() - 18 * 60 * 1000), // 18 min ago
    },
    {
      id: "mock-5",
      type: "attendance_no_response",
      title: isPt
        ? "**Miguel Pereira** não respondeu a **Treino Tático**"
        : isEs
          ? "**Miguel Pereira** no respondió a **Entrenamiento Táctico**"
          : isFr
            ? "**Miguel Pereira** n'a pas répondu à l'**Entraînement Tactique**"
            : "**Miguel Pereira** did not respond to **Tactical Training**",
      message: "",
      read: true,
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
    },
    {
      id: "mock-6",
      type: "event_created",
      title: isPt
        ? "**Treino Técnico** criado e convocatória enviada a **14 jogadores**"
        : isEs
          ? "**Entrenamiento Técnico** creado y convocatoria enviada a **14 jugadores**"
          : isFr
            ? "**Entraînement Technique** créé et convocation envoyée à **14 joueurs**"
            : "**Technical Training** created and callup sent to **14 players**",
      message: "",
      read: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    },
    {
      id: "mock-7",
      type: "attendance_confirmed",
      title: isPt
        ? "**Bruno Alves** confirmou presença em **Treino Técnico**"
        : isEs
          ? "**Bruno Alves** confirmó su asistencia en **Entrenamiento Técnico**"
          : isFr
            ? "**Bruno Alves** a confirmé sa présence pour l'**Entraînement Technique**"
            : "**Bruno Alves** confirmed attendance for **Technical Training**",
      message: "",
      read: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
    },
    {
      id: "mock-8",
      type: "player_added",
      title: isPt
        ? "**Marco Carvalho** adicionado ao plantel"
        : isEs
          ? "**Marco Carvalho** añadido a la plantilla"
          : isFr
            ? "**Marco Carvalho** ajouté à l'effectif"
            : "**Marco Carvalho** added to the squad",
      message: "",
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];
};

function isSystemType(type: string) {
  return (
    type === "event_created" ||
    type === "player_joined" ||
    type === "player_added" ||
    type === "payment_received" ||
    type.includes("reserve") ||
    type.includes("no_response")
  );
}

function matchesFilter(n: Notification, filter: FilterKey): boolean {
  if (filter === "todas") return true;
  if (filter === "confirmadas") return n.type.includes("confirmed");
  if (filter === "recusas") return n.type.includes("refused");
  if (filter === "sistema") return isSystemType(n.type);
  return true;
}

function resolveIcon(type: string): {
  Icon: React.ElementType;
  cls: string;
} {
  if (type.includes("confirmed") || type === "attendance_confirmed")
    return {
      Icon: Check,
      cls: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
    };
  if (type.includes("refused") || type === "attendance_refused")
    return {
      Icon: X,
      cls: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
    };
  if (type.includes("reserve") || type === "attendance_reserve")
    return {
      Icon: Clock,
      cls: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
    };
  if (type.includes("no_response") || type === "attendance_no_response")
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

function renderFormattedText(text: string, isRead: boolean) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const clean = part.slice(2, -2);
      return (
        <span
          key={`${index}-${clean}`}
          className={cn(
            "font-extrabold",
            isRead ? "text-arena-text-sec" : "text-arena-text",
          )}
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

export function NotificationsList({
  initialNotifications,
}: NotificationsListProps) {
  const t = useTranslations("notificationsPage");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>("todas");

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const mocks = MOCK_NOTIFICATIONS(locale);
    if (initialNotifications.length === 0) {
      return mocks;
    }
    const combined = [...initialNotifications, ...mocks];
    const unique = combined.filter(
      (n, index, self) => self.findIndex(t => t.id === n.id) === index,
    );
    return unique.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });

  useEffect(() => {
    const mocks = MOCK_NOTIFICATIONS(locale);
    const combined = [...initialNotifications, ...mocks];
    const unique = combined.filter(
      (n, index, self) => self.findIndex(t => t.id === n.id) === index,
    );
    setNotifications(
      unique.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }, [initialNotifications, locale]);

  const handleMarkAsRead = (id: string) => {
    if (id.startsWith("mock-")) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n)),
      );
      return;
    }

    startTransition(async () => {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n)),
      );
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
  const filtered = notifications.filter(n => matchesFilter(n, filter));

  return (
    <div className="flex h-full flex-col bg-arena-bg">
      {/* Page header */}
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

      {/* Filter tabs */}
      <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-arena-border/20 px-5 py-3.5 scrollbar-none">
        {FILTERS.map(({ key, label }) => {
          const isActive = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "press shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all duration-150 border",
                isActive
                  ? "border-arena-primary text-arena-primary bg-arena-primary/5 font-extrabold shadow-[0_0_8px_rgba(124,255,79,0.15)]"
                  : "border-arena-border bg-[#151C26] text-arena-text-sec hover:border-arena-primary/30",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* List */}
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
  const { Icon, cls } = resolveIcon(notification.type);
  const timeAgo = formatDesportivaTime(notification.createdAt, locale);

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
      {/* Icon */}
      <div
        className={cn(
          "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[10px]",
          cls,
        )}
      >
        <Icon size={18} strokeWidth={2.2} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] leading-snug",
            notification.read ? "text-arena-text-muted" : "text-arena-text",
          )}
        >
          {renderFormattedText(notification.title, notification.read)}
        </p>
        <span className="mt-1.5 block text-[11px] text-arena-text-muted/70 font-medium">
          {timeAgo}
        </span>
      </div>

      {/* Unread dot */}
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
          {hasFilter ? "Sem notificações nesta categoria" : t("empty.title")}
        </p>
        <p className="mt-1 text-[13px] text-arena-text-muted">
          {hasFilter
            ? "Tenta outra categoria ou aguarda novas notificações."
            : t("empty.description")}
        </p>
      </div>
    </div>
  );
}
