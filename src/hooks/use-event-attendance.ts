"use client";

import { useQuery } from "@tanstack/react-query";

export interface Participant {
  id: number;
  name: string;
  role: string;
}

export function useEventAttendance(eventId: number) {
  // In a real scenario, this would call server actions to get attendance
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["event", eventId, "attendance"],
    queryFn: async () => {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      return {
        confirmed: [
          { id: 1, name: "Diogo Ferreira", role: "GR" },
          { id: 5, name: "Ricardo Pinto", role: "LE" },
          { id: 4, name: "Bruno Alves", role: "DC" },
          { id: 7, name: "Nuno Santos", role: "MC" },
          { id: 12, name: "Rui Gomes", role: "PL" },
        ],
        reserves: [
          { id: 8, name: "João Martins", role: "MD" },
          { id: 10, name: "Luís Oliveira", role: "ED" },
        ],
        pending: [
          { id: 11, name: "Miguel Pereira", role: "EE" },
          { id: 14, name: "Sérgio Lima", role: "DC" },
        ],
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    confirmed: data?.confirmed ?? [],
    reserves: data?.reserves ?? [],
    pending: data?.pending ?? [],
    isLoading,
    error,
    refetch,
  };
}
