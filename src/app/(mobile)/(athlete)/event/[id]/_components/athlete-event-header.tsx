"use client";

import { CheckIcon, MapPinIcon } from "@animateicons/react/lucide";
import {
  Banknote,
  Calendar,
  Clock,
  Share as ShareIcon,
  Trophy,
} from "lucide-react";
import type { useTranslations } from "next-intl";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { ATTENDANCE_STATUS } from "@/constants/attendance";
import { EVENT_STATUS } from "@/constants/event-status";
import { PAYMENT_STATUS } from "@/constants/payments";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { CountdownTimer } from "./countdown-timer";

type T = ReturnType<typeof useTranslations<"athleteEventPublic">>;

interface AttendanceBarProps {
  confirmed: number;
  total: number;
  t: T;
}

function AttendanceBar({ confirmed, total, t }: AttendanceBarProps) {
  const pct = Math.min(Math.round((confirmed / total) * 100), 100);
  const isFull = confirmed >= total;
  const isAlmostFull = !isFull && pct >= 80;

  return (
    <div className="rounded-[14px] border border-arena-border bg-arena-surface p-4">
      <Field className="gap-1.5">
        <div className="flex items-center justify-between">
          <FieldLabel className="text-[11px] font-semibold uppercase tracking-wider text-arena-text-muted">
            {t("slots")}
          </FieldLabel>
          <FieldDescription
            className={cn(
              "text-[12px] font-bold",
              isFull
                ? "text-arena-danger"
                : isAlmostFull
                  ? "text-arena-warning"
                  : "text-arena-success",
            )}
          >
            {confirmed} / {total}
          </FieldDescription>
        </div>
        <Progress
          value={pct}
          className={cn(
            "h-1.5",
            isFull
              ? "[&>[data-slot=progress-indicator]]:bg-arena-danger"
              : isAlmostFull
                ? "[&>[data-slot=progress-indicator]]:bg-arena-warning"
                : "[&>[data-slot=progress-indicator]]:bg-arena-success",
          )}
        />
        {isFull && (
          <p className="mt-0.5 text-center text-[11px] font-semibold text-arena-danger">
            {t("slotsFull")}
          </p>
        )}
      </Field>
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: T }) {
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

function EventShareButton({ eventTitle, t }: { eventTitle: string; t: T }) {
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
  );
}

interface AthleteEventHeaderProps {
  event: {
    id: number;
    title: string;
    type: string;
    location: string;
    startDate: Date;
    status: string;
    priceCents: number;
    currency: string;
    rosterOnly?: boolean | null;
    maxParticipants?: string | null;
  };
  confirmedCount: number;
  myStatus: string | null;
  userName: string;
  isLoading: boolean;
  t: T;
}

export function AthleteEventHeader({
  event,
  t,
}: Pick<AthleteEventHeaderProps, "event" | "t">) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-end px-4">
      <EventShareButton eventTitle={event.title} t={t} />
    </header>
  );
}

interface AthleteEventHeroProps {
  event: {
    id: number;
    title: string;
    type: string;
    location: string;
    startDate: Date;
    status: string;
    priceCents: number;
    currency: string;
    rosterOnly?: boolean | null;
    maxParticipants?: string | null;
  };
  confirmedCount: number;
  myStatus: string | null;
  myPaymentStatus?: string | null;
  userName: string;
  isLoading: boolean;
  onCancel?: () => void;
  t: T;
}

export function AthleteEventHero({
  event,
  confirmedCount,
  myStatus,
  myPaymentStatus,
  userName,
  isLoading,
  onCancel,
  t,
}: AthleteEventHeroProps) {
  const isGame =
    event.type === "match" ||
    event.type === "game" ||
    event.type === "challenge";
  const isCancelled =
    event.status === EVENT_STATUS.CANCELLED || event.status === "canceled";
  const isRosterOnly = event.rosterOnly ?? false;
  const total = Number(event.maxParticipants) || 14;

  return (
    <div
      className="border-b border-arena-border/60 px-4 pb-5 pt-2"
      style={{
        background:
          "linear-gradient(170deg, #0d1e30 0%, var(--color-arena-bg) 100%)",
      }}
    >
      {/* Title row with share */}
      <div className="mb-5 flex items-start gap-3">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-[14px] border shadow-lg",
            isGame
              ? "border-arena-primary/30 bg-arena-primary/10 shadow-arena-primary/10"
              : "border-arena-info/30 bg-arena-info/10 shadow-arena-info/10",
          )}
        >
          <Trophy
            size={22}
            className={isGame ? "text-arena-primary" : "text-arena-info"}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.18em]",
                isGame ? "text-arena-primary" : "text-arena-info",
              )}
            >
              {isGame ? t("type.game") : t("type.training")}
            </span>
            <StatusBadge status={event.status} t={t} />
          </div>
          <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-arena-text">
            {event.title}
          </h1>
        </div>
        <EventShareButton eventTitle={event.title} t={t} />
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
          concludedLabel={t("countdownEnded")}
          labels={{
            days: t("countdownUnits.days"),
            hours: t("countdownUnits.hours"),
            minutes: t("countdownUnits.minutes"),
            seconds: t("countdownUnits.seconds"),
          }}
        />
      </div>

      {/* Info grid */}
      <div className="mb-4 grid grid-cols-2 gap-2">
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

      {!isLoading && (
        <AttendanceBar confirmed={confirmedCount} total={total} t={t} />
      )}

      {isRosterOnly && (
        <div className="mt-3 rounded-[12px] border border-arena-primary/25 bg-arena-primary/10 px-3.5 py-2.5 text-[12px] font-semibold text-arena-primary">
          {t("rosterOnlyNotice")}
        </div>
      )}

      {myStatus === ATTENDANCE_STATUS.CONFIRMED && (
        <div className="mt-4 flex flex-col rounded-[16px] border border-arena-border bg-arena-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-arena-success/20 text-arena-success">
              <CheckIcon size={20} color="currentColor" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-arena-success">
                {t("presenceConfirmed")}
              </p>
              <p className="text-[12px] text-arena-text-muted">
                {userName
                  ? t("greetingWithName", { name: userName })
                  : t("onConfirmedList")}
              </p>
            </div>
          </div>

          <div className="mt-3 mb-3 h-[1px] w-full bg-arena-border/50" />

          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Banknote size={14} className="text-arena-text-muted" />
              <span className="text-[12px] font-semibold text-arena-text-sec">
                {t("paymentStatus") ?? "Pagamento"}
              </span>
            </div>
            {event.priceCents === 0 ? (
              <span className="text-[12px] font-bold text-arena-text-muted">
                {t("price.free")}
              </span>
            ) : myPaymentStatus === PAYMENT_STATUS.PAID ? (
              <span className="flex items-center gap-1 rounded-md bg-arena-success/15 px-2 py-0.5 text-[11px] font-bold text-arena-success">
                <CheckIcon size={12} color="currentColor" />
                {t("paymentConfirmed") ?? "Confirmado"}
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-md bg-arena-warning/15 px-2 py-0.5 text-[11px] font-bold text-arena-warning">
                {t("paymentPending") ?? "Pendente"}
              </span>
            )}
          </div>

          {onCancel && (
            <div className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="w-full rounded-[10px] bg-transparent py-2 text-[12px] font-semibold text-arena-text-muted transition-colors hover:bg-arena-surface-el hover:text-arena-danger"
                  >
                    {t("cancelPresence")}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-arena-border bg-arena-surface shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-arena-text">
                      {t("cancelConfirm.title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-arena-text-sec">
                      {t("cancelConfirm.description")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row gap-3">
                    <AlertDialogCancel className="mt-0 flex-1 border-arena-border bg-transparent text-arena-text hover:bg-arena-surface-el">
                      {t("cancelConfirm.keep")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="flex-1 bg-arena-danger text-white hover:bg-arena-danger/90"
                      onClick={onCancel}
                    >
                      {t("cancelConfirm.action")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
