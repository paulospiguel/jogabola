"use client";

import { CheckIcon, XIcon } from "@animateicons/react/lucide";
import { Banknote } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
import { ATTENDANCE_STATUS } from "@/constants/attendance";
import { cn } from "@/lib/utils";

interface AthleteEventRsvpBarProps {
  eventId: number;
  userId: string;
  myStatus: string | null;
  isCancelled: boolean;
  isFull: boolean;
  canResumePayment: boolean;
  actionLoading: boolean;
  actionError: string;
  onConfirm: () => void;
  onCancel: () => void;
  onResumePayment: () => void;
  t: ReturnType<typeof useTranslations<"athleteEventPublic">>;
}

export function AthleteEventRsvpBar({
  eventId,
  userId,
  myStatus,
  isCancelled,
  isFull,
  canResumePayment,
  actionLoading,
  actionError,
  onConfirm,
  onCancel,
  onResumePayment,
  t,
}: AthleteEventRsvpBarProps) {
  return (
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

      {myStatus === ATTENDANCE_STATUS.CONFIRMED ? (
        <div className="flex flex-col gap-2">
          {canResumePayment && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={onResumePayment}
              className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] bg-arena-primary text-[15px] font-bold text-arena-bg shadow-[0_0_24px_rgba(124,255,79,0.25)] transition-all hover:bg-arena-primary/90 disabled:opacity-60"
            >
              <Banknote size={18} />
              {t("payNow")}
            </button>
          )}
          <button
            type="button"
            disabled={actionLoading}
            onClick={onCancel}
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
            onClick={onConfirm}
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
                  href={`/auth?callbackURL=/event/${eventId}`}
                  className="flex h-10 flex-1 items-center justify-center rounded-[10px] border border-arena-border bg-arena-surface-el text-[13px] font-bold text-arena-text-sec no-underline transition-colors hover:bg-arena-surface hover:text-arena-text"
                >
                  {t("login")}
                </Link>
                <Link
                  href={`/auth?mode=register&callbackURL=/event/${eventId}`}
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
  );
}
