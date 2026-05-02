"use client";

import { useQuery } from "@tanstack/react-query";
export interface Payment {
  id: string;
  playerId: string;
  player: string;
  match: string;
  amount: string;
  method: string;
  status: "pending" | "validating" | "confirmed" | "refused";
  isVerified: boolean;
  score: "low" | "medium" | "high";
  date: string;
  proofUrl?: string;
}

export function usePayments() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["payments"],
    queryFn: async (): Promise<Payment[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));

      return [
        {
          id: "PAY-001",
          playerId: "user-1",
          player: "Diogo Ferreira",
          match: "weeklyGame",
          amount: "€5,00",
          method: "MBWay",
          status: "pending",
          isVerified: true,
          score: "low",
          date: "2024-05-01 18:30",
        },
        {
          id: "PAY-002",
          playerId: "user-2",
          player: "Ricardo Pinto",
          match: "weeklyGame",
          amount: "€5,00",
          method: "MBWay",
          status: "validating",
          isVerified: false,
          score: "medium",
          date: "2024-05-01 19:15",
          proofUrl: "https://placehold.co/400x600/png?text=MBWay+Proof",
        },
        {
          id: "PAY-003",
          playerId: "user-3",
          player: "Ana Silva",
          match: "weeklyGame",
          amount: "€5,00",
          method: "Dinheiro",
          status: "confirmed",
          isVerified: true,
          score: "low",
          date: "2024-04-30 20:00",
        },
        {
          id: "PAY-004",
          playerId: "user-4",
          player: "Bruno Costa",
          match: "weeklyGame",
          amount: "€5,00",
          method: "MBWay",
          status: "pending",
          isVerified: false,
          score: "high",
          date: "2024-05-01 10:00",
        },
      ];
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
