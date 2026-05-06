"use client";

import {
  CheckIcon,
  MapPinIcon,
  ShareIcon,
  XIcon,
} from "@animateicons/react/lucide";
import { ArrowLeft, Banknote, Calendar, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  cancelUserAttendance,
  confirmUserAttendance,
} from "@/actions/attendance.actions";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBadge } from "@/components/arena/jb-badge";
import { LocationMap } from "@/components/arena/location-map";
import { Logo } from "@/components/logo";
import { useEventAttendance } from "@/hooks/use-event-attendance";
import { cn } from "@/lib/utils";
import { AthleteRsvpSheet } from "./athlete-rsvp-sheet";
import { CountdownTimer } from "./countdown-timer";

interface Event {
  id: number;
  teamId: number;
  title: string;
  type: string;
  location: string;
  startDate: Date;
  status: string;
  recurrence: string;
  maxParticipants?: string | null;
  priceCents: number;
  currency: string;
  description?: string | null;
  images?: string[];
}

interface AthleteEventDetailProps {
  event: Event;
  userId: string;
  userName: string;
  initialMyStatus: string | null;
}

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Tab = "lista" | "local";
type AthleteEventTranslator = ReturnType<typeof useTranslations>;

function EventHeader({
  eventTitle,
  t,
}: {
  eventTitle: string;
  t: AthleteEventTranslator;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: eventTitle, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-arena-border bg-arena-bg/90 px-4 backdrop-blur-md">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex size-9 items-center justify-center rounded-xl text-arena-text-muted transition-colors hover:bg-arena-surface hover:text-arena-text"
        aria-label={t("back")}
      >
        <ArrowLeft size={20} />
      </button>

      <Logo href="/" size="mini" variant="white" className="opacity-80" />

      <button
        type="button"
        onClick={handleShare}
        className="flex size-9 items-center justify-center rounded-xl text-arena-text-muted transition-colors hover:bg-arena-surface hover:text-arena-text"
        aria-label={t("share")}
      >
        {copied ? (
          <CheckIcon size={18} color="var(--color-arena-primary)" />
        ) : (
          <ShareIcon size={18} color="currentColor" />
        )}
      </button>
    </header>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: string;
  t: AthleteEventTranslator;
}) {
  const map: Record<string, { key: string; color: string }> = {
    scheduled: {
      key: "scheduled",
      color: "text-arena-info border-arena-info/30 bg-arena-info/10",
    },
    ongoing: {
      key: "ongoing",
      color: "text-arena-success border-arena-success/30 bg-arena-success/10",
    },
    completed: {
      key: "completed",
      color: "text-arena-text-muted border-arena-border bg-arena-surface",
    },
    cancelled: {
      key: "cancelled",
      color: "text-arena-danger border-arena-danger/30 bg-arena-danger/10",
    },
  };
  const s = map[status] ?? map.scheduled;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        s.color,
      )}
    >
      {t(`status.${s.key}`)}
    </span>
  );
}

function AttendanceBar({
  confirmed,
  total,
  t,
}: {
  confirmed: number;
  total: number;
  t: AthleteEventTranslator;
}) {
  const pct = Math.min((confirmed / total) * 100, 100);
  const isFull = confirmed >= total;

  return (
    <div className="rounded-[14px] border border-arena-border bg-arena-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-arena-text-sec">
          {t("filledSlots")}
        </span>
        <span className="text-[13px] font-bold text-arena-text">
          <span className={isFull ? "text-arena-danger" : "text-arena-success"}>
            {confirmed}
          </span>{" "}
          / {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-arena-border">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isFull ? "bg-arena-danger" : "bg-arena-success",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isFull && (
        <p className="mt-2 text-center text-[11px] font-semibold text-arena-danger">
          {t("slotsFull")}
        </p>
      )}
    </div>
  );
}

export function AthleteEventDetail({
  event,
  userId,
  userName,
  initialMyStatus,
}: AthleteEventDetailProps) {
  const t = useTranslations("athleteEventPublic");
  const [tab, setTab] = useState<Tab>("lista");
  const [myStatus, setMyStatus] = useState<string | null>(initialMyStatus);
  const [showRsvpSheet, setShowRsvpSheet] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { confirmed, reserves, pending, isLoading, refetch } =
    useEventAttendance(event.id);

  const isJogo = event.type === "partida" || event.type === "jogo";
  const total = Number(event.maxParticipants) || 14;
  const isFull = confirmed.length >= total;

  async function handleConfirm() {
    // If not logged in OR if it's a paid event, use the RSVP sheet flow
    if (!userId || (event.priceCents && event.priceCents > 0)) {
      setShowRsvpSheet(true);
      return;
    }

    // Direct confirmation only for free events when logged in
    setActionLoading(true);
    const res = await confirmUserAttendance(event.id);
    if (res.success) {
      setMyStatus("confirmed");
      refetch();
    }
    setActionLoading(false);
  }

  async function handleCancel() {
    setActionLoading(true);
    const res = await cancelUserAttendance(event.id);
    if (res.success) {
      setMyStatus(null);
      refetch();
    }
    setActionLoading(false);
  }

  const TABS = [
    { id: "lista" as Tab, label: t("tabs.squad") },
    { id: "local" as Tab, label: t("tabs.location") },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-arena-bg">
      <EventHeader eventTitle={event.title} t={t} />

      {/* Event Hero */}
      <div
        className="border-b border-arena-border px-4 pb-5 pt-4"
        style={{
          background:
            "linear-gradient(180deg, #0F1E2E 0%, var(--color-arena-bg) 100%)",
        }}
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-[13px] border",
              isJogo
                ? "border-arena-primary/30 bg-arena-primary/10"
                : "border-arena-info/30 bg-arena-info/10",
            )}
          >
            <Trophy
              size={20}
              className={isJogo ? "text-arena-primary" : "text-arena-info"}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isJogo ? "text-arena-primary" : "text-arena-info",
                )}
              >
                {isJogo ? t("type.game") : t("type.training")}
              </span>
              <StatusBadge status={event.status} t={t} />
            </div>
            <h1 className="text-[18px] font-bold leading-snug text-arena-text">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="mb-6 flex flex-col items-center justify-center rounded-[24px] border border-arena-border/50 bg-arena-surface-el/30 py-5 shadow-inner backdrop-blur-sm">
          <div className="mb-3.5 flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-arena-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-arena-text-muted">
              {t("countdown")}
            </p>
          </div>
          <CountdownTimer targetDate={event.startDate} />
        </div>

        <div className="mb-4 flex flex-col gap-2">
          {[
            {
              Icon: <Calendar size={14} className="text-arena-text-muted" />,
              label: formatDate(event.startDate),
            },
            {
              Icon: <Clock size={14} className="text-arena-text-muted" />,
              label: formatTime(event.startDate),
            },
            {
              Icon: <MapPinIcon size={14} color="currentColor" />,
              label: event.location,
            },
            {
              Icon: <Banknote size={14} className="text-arena-text-muted" />,
              label:
                event.priceCents > 0
                  ? `${(event.priceCents / 100).toFixed(2).replace(".", ",")} ${event.currency}`
                  : t("price.free"),
            },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-arena-surface text-arena-text-muted">
                {Icon}
              </div>
              <span className="text-[13px] text-arena-text-sec">{label}</span>
            </div>
          ))}
        </div>

        {!isLoading && (
          <AttendanceBar confirmed={confirmed.length} total={total} t={t} />
        )}

        {/* My status card */}
        {myStatus === "confirmed" && (
          <div className="mt-3 flex items-center gap-2.5 rounded-[12px] border border-arena-success/30 bg-arena-success/10 px-3.5 py-2.5">
            <div className="flex size-7 items-center justify-center rounded-full bg-arena-success/20 text-arena-success">
              <CheckIcon size={14} color="currentColor" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-arena-success">
                {t("presenceConfirmed")}
              </p>
              <p className="text-[11px] text-arena-text-muted">
                {userName
                  ? t("greetingWithName", { name: userName })
                  : t("onConfirmedList")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-arena-border bg-arena-bg">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center border-b-2 py-3 text-[13px] font-semibold transition-colors",
              tab === t.id
                ? "border-arena-primary text-arena-primary"
                : "border-transparent text-arena-text-muted hover:text-arena-text-sec",
            )}
            style={{ marginBottom: -1 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto pb-5">
        {tab === "lista" && (
          <div className="px-4 py-4">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-arena-text-muted text-sm">
                {t("loading")}
              </div>
            ) : (
              <>
                {/* Confirmed */}
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-arena-text-muted">
                    {t("confirmed")}
                  </span>
                  <span className="text-[11px] font-bold text-arena-success">
                    {confirmed.length}
                  </span>
                </div>
                <div className="mb-4 flex flex-col">
                  {confirmed.length === 0 ? (
                    <div className="rounded-[14px] border border-arena-border bg-arena-surface px-4 py-5 text-center text-[13px] text-arena-text-muted">
                      {t("noOneConfirmed")}
                    </div>
                  ) : (
                    confirmed.map((p, i) => (
                      <div
                        key={p.id}
                        className={cn(
                          "flex items-center gap-3 border border-arena-border bg-arena-surface px-3.5 py-3",
                          i === 0
                            ? "rounded-t-[14px] rounded-b-[4px]"
                            : i === confirmed.length - 1
                              ? "rounded-t-[4px] rounded-b-[14px] border-t-0"
                              : "rounded-[4px] border-t-0",
                        )}
                      >
                        <span className="w-5 text-center text-[11px] font-bold text-arena-text-muted">
                          {i + 1}
                        </span>
                        <JbAvatar name={p.name} size={32} id={p.id} />
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-[13px] font-semibold text-arena-text">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-arena-text-muted">
                            {p.role}
                          </div>
                        </div>
                        <span className="text-arena-success">
                          <CheckIcon size={15} color="currentColor" />
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Waiting list */}
                {(reserves.length > 0 || pending.length > 0) && (
                  <>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-arena-text-muted">
                        {t("waitingList")}
                      </span>
                      <span className="text-[11px] font-bold text-arena-text-muted">
                        {reserves.length + pending.length}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      {[
                        ...reserves.map(p => ({
                          ...p,
                          status: "reserve" as const,
                        })),
                        ...pending.map(p => ({
                          ...p,
                          status: "pending" as const,
                        })),
                      ].map((p, i, arr) => (
                        <div
                          key={p.id}
                          className={cn(
                            "flex items-center gap-3 border border-arena-border bg-arena-surface px-3.5 py-3 opacity-70",
                            i === 0
                              ? "rounded-t-[14px] rounded-b-[4px]"
                              : i === arr.length - 1
                                ? "rounded-t-[4px] rounded-b-[14px] border-t-0"
                                : "rounded-[4px] border-t-0",
                          )}
                        >
                          <JbAvatar name={p.name} size={32} id={p.id} />
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-[13px] font-semibold text-arena-text">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-arena-text-muted">
                              {p.role}
                            </div>
                          </div>
                          <JbBadge status={p.status} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {tab === "local" && (
          <div className="px-4 py-4">
            <LocationMap location={event.location} />

            {event.description && (
              <div className="mt-4 rounded-[14px] border border-arena-border bg-arena-surface p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
                  {t("notes")}
                </p>
                <p className="text-[13px] text-arena-text-sec">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky RSVP bar */}
      <div
        className="sticky bottom-0 z-20 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4"
        style={{
          background:
            "linear-gradient(0deg, var(--color-arena-bg) 60%, transparent)",
        }}
      >
        {myStatus === "confirmed" ? (
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleCancel}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] border border-arena-border bg-arena-surface-el text-[14px] font-bold text-arena-text-sec transition-colors hover:bg-arena-surface disabled:opacity-60"
          >
            <XIcon size={18} color="currentColor" />
            {t("cancelPresence")}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleConfirm}
              className={cn(
                "flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] text-[15px] font-bold transition-all disabled:opacity-60",
                isFull
                  ? "border border-arena-border bg-arena-surface-el text-arena-text-sec hover:bg-arena-surface"
                  : "bg-arena-primary text-arena-bg shadow-[0_0_24px_rgba(124,255,79,0.25)] hover:bg-arena-primary/90",
              )}
            >
              <CheckIcon size={18} color="currentColor" />
              {isFull ? t("joinWaitlist") : t("confirmPresence")}
            </button>
            {!userId && (
              <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3.5">
                <p className="mb-2.5 text-center text-[12px] font-semibold text-arena-text-sec">
                  {t("hasAccount")}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/auth?callbackURL=/event/${event.id}`}
                    className="flex h-10 flex-1 items-center justify-center rounded-[10px] border border-arena-border bg-arena-surface-el text-[13px] font-bold text-arena-text-sec no-underline transition-colors hover:bg-arena-surface hover:text-arena-text"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href={`/auth?mode=register&callbackURL=/event/${event.id}`}
                    className="flex h-10 flex-1 items-center justify-center rounded-[10px] bg-arena-primary text-[13px] font-bold text-arena-bg no-underline transition-colors hover:bg-arena-primary/90"
                  >
                    {t("register")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showRsvpSheet && (
        <AthleteRsvpSheet
          eventId={event.id}
          userId={userId}
          onClose={() => setShowRsvpSheet(false)}
          onSuccess={status => {
            setMyStatus(status);
            refetch();
          }}
        />
      )}
    </div>
  );
}
