"use client";

import { useQuery } from "@tanstack/react-query";
import { useTeams } from "./use-teams";

export interface Payment {
  id: string;
  amount: string;
  method: string;
  status: "pending" | "validating" | "confirmed" | "refused";
  score: "low" | "medium" | "high";
  date: string;
  proofUrl?: string;
  player: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  event: {
    id: number;
    title: string;
  };
}

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
