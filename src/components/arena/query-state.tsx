"use client";

import { AlertCircle } from "lucide-react";
import { Cta } from "@/components/arena/cta";
import { cn } from "@/lib/utils";

export interface DeriveQueryViewStateInput {
  hasData: boolean;
  isInitialLoading: boolean;
  isFetching: boolean;
  error: unknown;
}

export type QueryViewState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "success"; isRefreshing: boolean };

/**
 * Pure state-derivation for a single query's UI. Callers (Dashboard, Plantel,
 * Cobranças) map their query hook's flags onto this input and switch on the
 * resulting `status` to pick between skeleton, ArenaQueryError, ArenaEmptyState
 * or the real content — without duplicating this precedence logic per screen.
 */
export function deriveQueryViewState({
  hasData,
  isInitialLoading,
  isFetching,
  error,
}: DeriveQueryViewStateInput): QueryViewState {
  if (isInitialLoading && !hasData) {
    return { status: "loading" };
  }

  if (error && !hasData) {
    return { status: "error" };
  }

  if (!hasData) {
    return { status: "empty" };
  }

  return { status: "success", isRefreshing: isFetching };
}

export interface ArenaQueryErrorProps {
  title: string;
  description?: string;
  retryLabel: string;
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function ArenaQueryError({
  title,
  description,
  retryLabel,
  onRetry,
  isRetrying = false,
  className,
}: ArenaQueryErrorProps) {
  return (
    <div
      role="alert"
      aria-busy={isRetrying}
      className={cn(
        "flex w-full min-w-0 flex-col items-center justify-center rounded-[14px] border border-arena-danger/30 bg-arena-danger/5 px-4 py-6 text-center sm:px-5",
        className,
      )}
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-arena-danger/30 bg-arena-surface-el text-arena-danger">
        <AlertCircle size={18} strokeWidth={2.4} aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-arena-text">{title}</h3>
      {description && (
        <p className="mt-1 max-w-[260px] text-xs leading-5 text-arena-text-muted">
          {description}
        </p>
      )}
      <Cta
        variant="secondary"
        size="sm"
        onClick={onRetry}
        disabled={isRetrying}
        className="btn-press mt-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-primary"
      >
        {retryLabel}
      </Cta>
    </div>
  );
}
