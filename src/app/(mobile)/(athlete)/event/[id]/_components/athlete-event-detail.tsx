"use client";

import { CheckIcon, MapPinIcon, XIcon } from "@animateicons/react/lucide";
import { useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Calendar,
  Clock,
  Share2 as ShareIcon,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  cancelUserAttendance,
  confirmUserAttendance,
} from "@/actions/attendance.actions";
import { EventNoticeWall } from "@/components/arena/event-notice-wall";
import { JbBadge } from "@/components/arena/badge";
import { LocationMap } from "@/components/arena/location-map";
import {
  ParticipantRow,
  participantRowPosition,
} from "@/components/arena/participant-row";
import {
  type Participant,
  useEventAttendance,
} from "@/hooks/use-event-attendance";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { AthleteRsvpSheet } from "./athlete-rsvp-sheet";
import { CountdownTimer } from "./countdown-timer";
import { MyPaymentTab } from "./my-payment-tab";

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
  rosterOnly?: boolean;
  description?: string | null;
  images?: string[];
}

interface AthleteEventDetailProps {
  event: Event;
  userId: string;
  userName: string;
  initialMyStatus: string | null;
}

type Tab = "list" | "location" | "payment";
type AthleteEventTranslator = ReturnType<typeof useTranslations>;
type AttendanceLists = {
  confirmed: Participant[];
  reserves: Participant[];
  pending: Participant[];
};

function EventShare({
  eventTitle,
  t,
}: {
  eventTitle: string;
  t: AthleteEventTranslator;
}) {
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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4">
      <button
        type="button"
        onClick={handleShare}
        className="flex size-9 items-center justify-center rounded-xl text-arena-text-muted transition-colors hover:text-arena-text"
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
  const almost = !isFull && pct >= 80;

  return (
    <div className="rounded-[14px] border border-arena-border bg-arena-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-arena-text-muted">
          {t("filledSlots")}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[12px] font-black tabular-nums",
            isFull
              ? "bg-arena-danger/15 text-arena-danger"
              : almost
                ? "bg-arena-warning/15 text-arena-warning"
                : "bg-arena-success/15 text-arena-success",
          )}
        >
          {confirmed} / {total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-arena-border">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            isFull
              ? "bg-arena-danger"
              : almost
                ? "bg-arena-warning"
                : "bg-arena-success",
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
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("list");
  const [myStatus, setMyStatus] = useState<string | null>(initialMyStatus);
  const [guestReservationId, setGuestReservationId] = useState<number | null>(
    null,
  );
  const [showRsvpSheet, setShowRsvpSheet] = useState(false);
  const [resumePayment, setResumePayment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const { confirmed, reserves, pending, isLoading, refetch } =
    useEventAttendance(event.id);

  const isJogo = event.type === "partida" || event.type === "jogo";
  const isCancelled =
    event.status === "cancelled" || event.status === "canceled";
  const isRosterOnly = event.rosterOnly ?? false;
  const total = Number(event.maxParticipants) || 14;
  const isFull = confirmed.length >= total;
  const myPaymentStatus =
    confirmed.find(p => p.id === userId)?.paymentStatus ?? null;
  const canResumePayment =
    myStatus === "confirmed" &&
    !isCancelled &&
    !isLoading &&
    event.priceCents > 0 &&
    (!myPaymentStatus ||
      myPaymentStatus === "pending" ||
      myPaymentStatus === "rejected" ||
      myPaymentStatus === "refunded");

  function updateAttendanceCache(
    updater: (current: AttendanceLists) => AttendanceLists,
  ) {
    queryClient.setQueryData<AttendanceLists>(
      ["event", event.id, "attendance"],
      current => {
        const base =
          current ??
          ({
            confirmed: [],
            reserves: [],
            pending: [],
          } satisfies AttendanceLists);
        return updater(base);
      },
    );
  }

  function handleAttendanceSuccess(status: string, reservationId?: number) {
    if (reservationId && !userId) {
      setGuestReservationId(reservationId);
    }
    setMyStatus(status);
    setShowRsvpSheet(false);
    updateAttendanceCache(current => {
      const participant = { id: userId, name: userName, role: "Jogador" };
      const filteredConfirmed = current.confirmed.filter(p => p.id !== userId);
      const filteredReserves = current.reserves.filter(p => p.id !== userId);
      const filteredPending = current.pending.filter(p => p.id !== userId);

      return {
        confirmed: [participant, ...filteredConfirmed],
        reserves: filteredReserves,
        pending: filteredPending,
      };
    });
    void refetch();
  }

  async function handleConfirm() {
    if (isCancelled) return;
    setActionError("");

    // If not logged in OR if it's a paid event, use the RSVP sheet flow
    if (!userId || (event.priceCents && event.priceCents > 0)) {
      setResumePayment(false);
      setShowRsvpSheet(true);
      return;
    }

    // Direct confirmation only for free events when logged in
    setActionLoading(true);
    const res = await confirmUserAttendance(event.id);
    if (res.success) {
      handleAttendanceSuccess("confirmed");
    } else if (res.error === "EVENT_ROSTER_ONLY") {
      setActionError(t("rosterOnlyError"));
    } else {
      setActionError(t("errors.confirmAttendance"));
    }
    setActionLoading(false);
  }

  async function handleCancel() {
    setActionLoading(true);
    const res = await cancelUserAttendance(event.id);
    if (res.success) {
      setMyStatus(null);
      updateAttendanceCache(current => ({
        confirmed: current.confirmed.filter(p => p.id !== userId),
        reserves: current.reserves.filter(p => p.id !== userId),
        pending: current.pending.filter(p => p.id !== userId),
      }));
      void refetch();
    }
    setActionLoading(false);
  }

  const TABS = [
    { id: "list" as Tab, label: t("tabs.squad") },
    { id: "location" as Tab, label: t("tabs.location") },
  ];

  if (userId && event.priceCents > 0) {
    TABS.push({ id: "payment" as Tab, label: t("tabs.payment") });
  }

  return (
    <div className="flex min-h-screen flex-col bg-arena-bg">
      {/* Event Hero */}
      <div
        className="border-b border-arena-border/60 px-4 pb-5 pt-2"
        style={{
          background:
            "linear-gradient(170deg, #0d1e30 0%, var(--color-arena-bg) 100%)",
        }}
      >
        {/* Title row */}
        <div className="mb-5 flex items-start gap-3">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-[14px] border shadow-lg",
              isJogo
                ? "border-arena-primary/30 bg-arena-primary/10 shadow-arena-primary/10"
                : "border-arena-info/30 bg-arena-info/10 shadow-arena-info/10",
            )}
          >
            <Trophy
              size={22}
              className={isJogo ? "text-arena-primary" : "text-arena-info"}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.18em]",
                  isJogo ? "text-arena-primary" : "text-arena-info",
                )}
              >
                {isJogo ? t("type.game") : t("type.training")}
              </span>
              <StatusBadge status={event.status} t={t} />
            </div>
            <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-arena-text">
              {event.title}
            </h1>
          </div>
          <EventShare eventTitle={event.title} t={t} />
        </div>

        {/* Countdown */}
        <div className="mb-5 flex flex-col items-center justify-center rounded-[20px] border border-arena-border/50 bg-arena-surface-el/30 py-4 shadow-inner backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="size-1.5 animate-pulse rounded-full bg-arena-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-arena-text-muted">
              {t("countdown")}
            </p>
          </div>
          <CountdownTimer
            targetDate={event.startDate}
            forceZero={isCancelled}
          />
        </div>

        {/* Info grid — elegant card layout */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {/* Date + Time merged card */}
          <div className="col-span-2 flex items-center gap-3 rounded-[12px] border border-arena-border/60 bg-arena-surface/70 px-3.5 py-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] border border-arena-border bg-arena-bg text-arena-primary">
              <Calendar size={14} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-arena-text-muted">
                {t("labels.date")}
              </p>
              <p className="text-[14px] font-bold text-arena-text">
                {formatDate(event.startDate)}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-arena-border/60 bg-arena-bg/60 px-3 py-1.5">
              <Clock
                size={12}
                className="text-arena-text-muted"
                strokeWidth={2.2}
              />
              <span className="text-[13px] font-bold tabular-nums text-arena-text">
                {formatTime(event.startDate)}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="col-span-2 flex items-center gap-3 rounded-[12px] border border-arena-border/60 bg-arena-surface/70 px-3.5 py-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] border border-arena-border bg-arena-bg text-arena-info">
              <MapPinIcon size={14} color="currentColor" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-arena-text-muted">
                {t("labels.location")}
              </p>
              <p className="truncate text-[14px] font-bold text-arena-text">
                {event.location}
              </p>
            </div>
          </div>

          {/* Price */}
          {event.priceCents > 0 && (
            <div
              className={cn(
                "col-span-2 flex items-center gap-3 rounded-[12px] border px-3.5 py-3",
                event.priceCents > 0
                  ? "border-arena-warning/25 bg-arena-warning/5"
                  : "border-arena-success/20 bg-arena-success/5",
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-[9px] border",
                  event.priceCents > 0
                    ? "border-arena-warning/30 bg-arena-warning/10 text-arena-warning"
                    : "border-arena-success/30 bg-arena-success/10 text-arena-success",
                )}
              >
                <Banknote size={14} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-arena-text-muted">
                  {t("labels.price")}
                </p>
                <p
                  className={cn(
                    "text-[14px] font-extrabold",
                    event.priceCents > 0
                      ? "text-arena-warning"
                      : "text-arena-success",
                  )}
                >
                  {event.priceCents > 0
                    ? `${(event.priceCents / 100).toFixed(2).replace(".", ",")} ${event.currency}`
                    : t("price.free")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Attendance bar */}
        {!isLoading && (
          <AttendanceBar confirmed={confirmed.length} total={total} t={t} />
        )}

        {isRosterOnly && (
          <div className="mt-3 rounded-[12px] border border-arena-primary/25 bg-arena-primary/10 px-3.5 py-2.5 text-[12px] font-semibold text-arena-primary">
            {t("rosterOnlyNotice")}
          </div>
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
        {tab === "list" && (
          <div className="px-4 py-4">
            <EventNoticeWall eventId={event.id} isManager={false} />
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
                      <ParticipantRow
                        key={p.id}
                        participant={p}
                        index={i}
                        position={participantRowPosition(i, confirmed.length)}
                        currentUserId={userId}
                        showPayment={event.priceCents > 0}
                        trailing={
                          <span className="text-arena-success">
                            <CheckIcon size={15} color="currentColor" />
                          </span>
                        }
                      />
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
                        <ParticipantRow
                          key={p.id}
                          participant={p}
                          position={participantRowPosition(i, arr.length)}
                          currentUserId={userId}
                          showPayment={event.priceCents > 0}
                          dimmed
                          trailing={<JbBadge status={p.status} />}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {tab === "location" && (
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

        {tab === "payment" && userId && event.priceCents > 0 && (
          <MyPaymentTab eventId={event.id} />
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
        {actionError && (
          <div className="mb-2 rounded-[12px] border border-arena-danger/25 bg-arena-danger/10 px-3 py-2 text-center text-[12px] font-semibold text-arena-danger">
            {actionError}
          </div>
        )}
        {myStatus === "confirmed" ? (
          <div className="flex flex-col gap-2">
            {canResumePayment && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setResumePayment(true);
                  setShowRsvpSheet(true);
                }}
                className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] bg-arena-primary text-[15px] font-bold text-arena-bg shadow-[0_0_24px_rgba(124,255,79,0.25)] transition-all hover:bg-arena-primary/90 disabled:opacity-60"
              >
                <Banknote size={18} />
                {t("payNow")}
              </button>
            )}
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleCancel}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] border border-arena-border bg-arena-surface-el text-[14px] font-bold text-arena-text-sec transition-colors hover:bg-arena-surface disabled:opacity-60"
            >
              <XIcon size={18} color="currentColor" />
              {t("cancelPresence")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={actionLoading || isCancelled}
              onClick={handleConfirm}
              className={cn(
                "flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] text-[15px] font-bold transition-all disabled:opacity-60",
                isCancelled
                  ? "border border-arena-danger/30 bg-arena-danger/10 text-arena-danger"
                  : isFull
                    ? "border border-arena-border bg-arena-surface-el text-arena-text-sec hover:bg-arena-surface"
                    : "bg-arena-primary text-arena-bg shadow-[0_0_24px_rgba(124,255,79,0.25)] hover:bg-arena-primary/90",
              )}
            >
              {isCancelled ? (
                <XIcon size={18} color="currentColor" />
              ) : (
                <CheckIcon size={18} color="currentColor" />
              )}
              {isCancelled
                ? t("eventCancelledAction")
                : isFull
                  ? t("joinWaitlist")
                  : t("confirmPresence")}
            </button>
            {!userId && !isCancelled && (
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
          resumePayment={resumePayment}
          guestReservationId={guestReservationId}
          onClose={() => {
            setShowRsvpSheet(false);
            setResumePayment(false);
          }}
          onSuccess={handleAttendanceSuccess}
        />
      )}
    </div>
  );
}
