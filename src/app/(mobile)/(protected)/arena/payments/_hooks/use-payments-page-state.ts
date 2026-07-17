"use client";

import { useMemo, useState } from "react";
import {
  PAYMENT_OVERVIEW_STATUS,
  type PaymentOverviewStatus,
} from "@/constants/payments";
import { type Payment, usePayments } from "@/hooks/use-payments";
import { useTeamPaymentSettings } from "@/hooks/use-team-payment-settings";
import { useTeams } from "@/hooks/use-teams";

export type PaymentsTab = "payments" | "methods" | "iapro";
export type PaymentsFilter = "all" | PaymentOverviewStatus;

/**
 * A single query's state, in the minimal shape
 * `derivePaymentsPageQueryState` needs. Mirrors the subset of TanStack
 * Query's `UseQueryResult` this screen cares about (same contract as
 * `use-dashboard.ts`'s `RawQuerySnapshot`), so the composition logic below
 * stays framework-free and unit-testable without rendering a real query.
 */
export interface RawQuerySnapshot<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
}

export interface PaymentsSectionState {
  payments: Payment[];
  isInitialLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
}

export interface SettingsSectionState<TSettings> {
  settings: TSettings | undefined;
  isInitialLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
}

export interface DerivePaymentsPageQueryStateInput<TSettings> {
  payments: RawQuerySnapshot<Payment[]>;
  settings: RawQuerySnapshot<TSettings>;
}

export interface PaymentsPageQueryState<TSettings> {
  paymentsState: PaymentsSectionState;
  settingsState: SettingsSectionState<TSettings>;
}

/**
 * Composes the payments and payment-settings query snapshots into two
 * fully independent section states — this screen has two unrelated data
 * sources (the list of charges, and the team's accepted payment methods),
 * and neither may be allowed to wipe the other. A failed payments fetch
 * never touches `settingsState`, and a failed settings fetch never
 * touches `paymentsState`: each section's data, loading, error and
 * refetch come only from its own query. `payments` only ever falls back
 * to `[]` (and `settings` only ever falls back to `undefined`) when the
 * query genuinely has nothing yet — an error response is never silently
 * converted into "empty", so callers can tell "zero payments" apart from
 * "failed to load payments", and can gate metrics (totals, counts) on
 * having real data instead of rendering a misleading zero while loading
 * or erroring.
 */
export function derivePaymentsPageQueryState<TSettings>(
  input: DerivePaymentsPageQueryStateInput<TSettings>,
): PaymentsPageQueryState<TSettings> {
  return {
    paymentsState: {
      payments: input.payments.data ?? [],
      isInitialLoading: input.payments.isLoading,
      isFetching: input.payments.isFetching,
      error: input.payments.error,
      refetch: input.payments.refetch,
    },
    settingsState: {
      settings: input.settings.data,
      isInitialLoading: input.settings.isLoading,
      isFetching: input.settings.isFetching,
      error: input.settings.error,
      refetch: input.settings.refetch,
    },
  };
}

function parsePaymentAmount(amount: string) {
  const cleaned = amount.replace(/[^\d,.-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function usePaymentsPageState() {
  const paymentsQuery = usePayments();
  const { activeTeamId } = useTeams();
  const settingsQuery = useTeamPaymentSettings(activeTeamId ?? undefined);

  const [activeTab, setActiveTab] = useState<PaymentsTab>("payments");
  const [activeFilter, setActiveFilter] = useState<PaymentsFilter>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProofPayment, setSelectedProofPayment] =
    useState<Payment | null>(null);

  const { paymentsState, settingsState } = derivePaymentsPageQueryState({
    payments: {
      data: paymentsQuery.payments,
      isLoading: paymentsQuery.isLoading,
      isFetching: paymentsQuery.isFetching,
      error: paymentsQuery.error,
      refetch: () => {
        void paymentsQuery.refetch();
      },
    },
    settings: {
      data: settingsQuery.settings,
      isLoading: settingsQuery.isLoading,
      isFetching: settingsQuery.isFetching,
      error: settingsQuery.error,
      refetch: () => {
        void settingsQuery.refetch();
      },
    },
  });

  const totals = useMemo(() => {
    return paymentsState.payments.reduce(
      (acc, payment) => {
        const amount = parsePaymentAmount(payment.amount);
        acc.expected += amount;

        if (payment.status === PAYMENT_OVERVIEW_STATUS.CONFIRMED) {
          acc.received += amount;
        }

        return acc;
      },
      { expected: 0, received: 0 },
    );
  }, [paymentsState.payments]);

  const statusCounts = useMemo(
    () => ({
      validating: paymentsState.payments.filter(
        payment => payment.status === PAYMENT_OVERVIEW_STATUS.VALIDATING,
      ).length,
      pending: paymentsState.payments.filter(
        payment => payment.status === PAYMENT_OVERVIEW_STATUS.PENDING,
      ).length,
      confirmed: paymentsState.payments.filter(
        payment => payment.status === PAYMENT_OVERVIEW_STATUS.CONFIRMED,
      ).length,
    }),
    [paymentsState.payments],
  );

  const filteredPayments = useMemo(() => {
    if (activeFilter === "all") {
      return paymentsState.payments;
    }

    return paymentsState.payments.filter(
      payment => payment.status === activeFilter,
    );
  }, [activeFilter, paymentsState.payments]);

  return {
    activeFilter,
    activeTab,
    activeTeamId,
    filteredPayments,
    paymentsState,
    selectedProofPayment,
    setActiveFilter,
    setActiveTab,
    setSelectedProofPayment,
    setShowSettings,
    settingsState,
    showSettings,
    statusCounts,
    totals,
  };
}
