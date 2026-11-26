"use client";

import { AlertCircle, Lock, SearchX } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { ArenaQueryError } from "@/components/arena/query-state";
import { cn } from "@/lib/utils";
import { isNotFoundCode } from "../_utils/club-action-error";

/** Static input styling shared by the club forms (Arena input spec). */
export const CLUB_INPUT_CLASS =
  "h-11 w-full rounded-[10px] border border-arena-border bg-arena-surface-el px-3 text-sm font-semibold text-arena-text outline-none transition-colors placeholder:text-arena-text-muted focus-visible:border-arena-primary focus-visible:ring-2 focus-visible:ring-arena-primary/25 aria-[invalid=true]:border-arena-danger md:h-10 [color-scheme:dark]";

export const CLUB_LINK_BUTTON_CLASS =
  "btn-press inline-flex items-center justify-center gap-2 font-bold transition-transform duration-100 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-primary";

/** Framer Motion variants for list stagger (DESIGN.md rowStagger). */
export const CLUB_STAGGER = {
  container: { animate: { transition: { staggerChildren: 0.028 } } },
  item: {
    initial: { opacity: 0, y: 6 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.17, ease: [0.4, 0, 0.2, 1] as const },
    },
  },
};

interface ClubFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export function ClubField({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: ClubFieldProps) {
  const t = useTranslations("arenaClubCalendar.form");
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 px-0.5 text-xs font-bold text-arena-text-sec"
      >
        {label}
        {optional && (
          <span className="ml-1 text-[10px] font-semibold text-arena-text-muted">
            {t("optional")}
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1 px-0.5 text-[11px] font-semibold text-arena-danger"
        >
          <AlertCircle size={12} strokeWidth={2.2} aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-hint`}
          className="px-0.5 text-[11px] text-arena-text-muted"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** aria attributes linking an input to its error or hint text. */
export function fieldAria(id: string, error?: string, hint?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

export function ClubFormAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-[12px] border border-arena-danger/35 bg-arena-danger/10 px-3 py-2.5 text-xs font-semibold text-arena-danger"
    >
      <AlertCircle
        size={14}
        strokeWidth={2.2}
        className="mt-px shrink-0"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  );
}

export function ClubSkeletonRows({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  const t = useTranslations("common");
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <output className="sr-only">{t("loading")}</output>
      {Array.from({ length: rows }, (_, n) => n).map(row => (
        <div
          key={`club-skeleton-${row}`}
          aria-hidden="true"
          className="flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-3.5 py-3"
        >
          <div className="jb-skeleton h-10 w-12 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="jb-skeleton h-3 w-1/3" />
            <div className="jb-skeleton h-3.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ClubQueryProblemProps {
  code: string | null;
  onRetry: () => void;
  isRetrying?: boolean;
  backHref?: string;
}

/**
 * Renders the right state for a failed club read: "not found" (also used
 * for out-of-scope data, as the server answers both the same way),
 * "forbidden" or a retryable error.
 */
export function ClubQueryProblem({
  code,
  onRetry,
  isRetrying,
  backHref,
}: ClubQueryProblemProps) {
  const t = useTranslations("arenaClubCalendar.states");
  const backAction = backHref ? (
    <Link
      href={backHref}
      className={cn(
        CLUB_LINK_BUTTON_CLASS,
        "h-9 rounded-[10px] border border-arena-border bg-arena-surface px-4 text-xs text-arena-text-sec hover:bg-arena-surface-el",
      )}
    >
      {t("backToCalendar")}
    </Link>
  ) : undefined;

  if (isNotFoundCode(code)) {
    return (
      <ArenaEmptyState
        icon={SearchX}
        title={t("notFoundTitle")}
        description={t("notFoundDescription")}
        action={backAction}
      />
    );
  }
  if (code === "FORBIDDEN" || code === "UNAUTHORIZED") {
    return (
      <ArenaEmptyState
        icon={Lock}
        title={t("forbiddenTitle")}
        description={t("forbiddenDescription")}
        action={backAction}
      />
    );
  }
  return (
    <ArenaQueryError
      title={t("errorTitle")}
      description={t("errorDescription")}
      retryLabel={t("retry")}
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  );
}
