"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaymentOverviewStatus } from "@/constants/payments";
import { useTeams } from "./use-teams";

export interface Payment {
  id: string;
  amount: string;
  method: string;
  status: PaymentOverviewStatus;
  score: "low" | "medium" | "high";
  date: string;
  proofUrl?: string;
  player: {
    id: string;
    name: string;
    email?: string;
    image?: string | null;
    isVerified: boolean;
    createdAt: string;
  };
  event: {
    id: number;
    title: string;
    status: string;
  };
}

export type PaymentDetail = {
  id: number;
  status: string;
  method: string;
  amountCents: number;
  currency: string;
  payerName: string | null;
  teamName: string;
  eventTitle: string;
  eventId: number;
  transferRequiresProof: boolean;
};

export function usePayments() {
  const { activeTeamId } = useTeams();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["payments", activeTeamId],
    enabled: !!activeTeamId,
    queryFn: async (): Promise<Payment[]> => {
      if (!activeTeamId) return [];

      const { getTeamPayments } = await import("@/actions/payments.actions");
      const res = await getTeamPayments({ teamId: activeTeamId });

      if (!res.success) {
        throw new Error("Failed to fetch payments");
      }

      return res.data as Payment[];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    payments: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function usePayment(paymentId: number | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["payment", paymentId],
    enabled: !!paymentId,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (!paymentId) return null;
      const { getPaymentById } = await import("@/actions/payments.actions");
      const res = await getPaymentById(paymentId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    staleTime: 0, // Always refetch — payment status changes when captain approves
  });

  return {
    payment: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
