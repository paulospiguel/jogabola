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

function parsePaymentAmount(amount: string) {
  const cleaned = amount.replace(/[^\d,.-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function usePaymentsPageState() {
  const { payments, isLoading, refetch } = usePayments();
  const { activeTeamId } = useTeams();
  const { settings, refetch: refetchSettings } = useTeamPaymentSettings(
    activeTeamId ?? undefined,
  );

  const [activeTab, setActiveTab] = useState<PaymentsTab>("payments");
  const [activeFilter, setActiveFilter] = useState<PaymentsFilter>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProofPayment, setSelectedProofPayment] =
    useState<Payment | null>(null);

  const totals = useMemo(() => {
    return payments.reduce(
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
  }, [payments]);

  const statusCounts = useMemo(
    () => ({
      validating: payments.filter(
        payment => payment.status === PAYMENT_OVERVIEW_STATUS.VALIDATING,
      ).length,
      pending: payments.filter(
        payment => payment.status === PAYMENT_OVERVIEW_STATUS.PENDING,
      ).length,
      confirmed: payments.filter(
        payment => payment.status === PAYMENT_OVERVIEW_STATUS.CONFIRMED,
      ).length,
    }),
    [payments],
  );

  const filteredPayments = useMemo(() => {
    if (activeFilter === "all") {
      return payments;
    }

    return payments.filter(payment => payment.status === activeFilter);
  }, [activeFilter, payments]);

  return {
    activeFilter,
    activeTab,
    activeTeamId,
    filteredPayments,
    isLoading,
    payments,
    refetch,
    refetchSettings,
    selectedProofPayment,
    setActiveFilter,
    setActiveTab,
    setSelectedProofPayment,
    setShowSettings,
    settings,
    showSettings,
    statusCounts,
    totals,
  };
}
