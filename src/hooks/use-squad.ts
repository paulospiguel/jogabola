"use client";

import { useQuery } from "@tanstack/react-query";

export interface SquadPlayer {
  id: number;
  name: string;
  role: string;
  status: "confirmed" | "reserve" | "pending" | "refused";
  goals: number;
  assists: number;
  rating: number;
  games: number;
  highlight?: boolean;
  isVerified?: boolean;
}

export function useSquad() {
  // In a real scenario, this would call a server action
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["squad"],
    queryFn: async (): Promise<SquadPlayer[]> => {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      return [
        {
          id: 1,
          name: "Diogo Ferreira",
          role: "GR",
          status: "confirmed",
          goals: 0,
          assists: 1,
          rating: 8.2,
          games: 22,
          highlight: true,
          isVerified: true,
        },
        {
          id: 2,
          name: "André Costa",
          role: "DD",
          status: "confirmed",
          goals: 1,
          assists: 3,
          rating: 7.5,
          games: 19,
          highlight: false,
          isVerified: true,
        },
        {
          id: 3,
          name: "Tiago Mendes",
          role: "DC",
          status: "confirmed",
          goals: 0,
          assists: 0,
          rating: 7.8,
          games: 21,
          highlight: false,
        },
        {
          id: 4,
          name: "Bruno Alves",
          role: "DC",
          status: "confirmed",
          goals: 2,
          assists: 1,
          rating: 8.0,
          games: 20,
          highlight: false,
        },
        {
          id: 5,
          name: "Ricardo Pinto",
          role: "DE",
          status: "confirmed",
          goals: 0,
          assists: 5,
          rating: 8.5,
          games: 24,
          highlight: true,
        },
        {
          id: 6,
          name: "Fábio Rodrigues",
          role: "MC",
          status: "confirmed",
          goals: 3,
          assists: 4,
          rating: 7.2,
          games: 18,
          highlight: false,
        },
        {
          id: 7,
          name: "Nuno Santos",
          role: "MC",
          status: "confirmed",
          goals: 1,
          assists: 6,
          rating: 7.9,
          games: 23,
          highlight: false,
        },
        {
          id: 8,
          name: "João Martins",
          role: "MD",
          status: "reserve",
          goals: 5,
          assists: 8,
          rating: 8.8,
          games: 20,
          highlight: false,
        },
        {
          id: 9,
          name: "Carlos Sousa",
          role: "ME",
          status: "confirmed",
          goals: 2,
          assists: 2,
          rating: 7.3,
          games: 17,
          highlight: false,
        },
        {
          id: 10,
          name: "Luís Oliveira",
          role: "PD",
          status: "reserve",
          goals: 4,
          assists: 3,
          rating: 7.6,
          games: 19,
          highlight: false,
        },
        {
          id: 11,
          name: "Miguel Pereira",
          role: "PE",
          status: "pending",
          goals: 7,
          assists: 9,
          rating: 9.1,
          games: 22,
          highlight: false,
        },
        {
          id: 12,
          name: "Rui Gomes",
          role: "CA",
          status: "confirmed",
          goals: 6,
          assists: 7,
          rating: 8.3,
          games: 24,
          highlight: false,
        },
        {
          id: 13,
          name: "Paulo Fernandes",
          role: "MC",
          status: "refused",
          goals: 0,
          assists: 1,
          rating: 6.8,
          games: 10,
          highlight: false,
        },
        {
          id: 14,
          name: "Sérgio Lima",
          role: "DC",
          status: "pending",
          goals: 1,
          assists: 0,
          rating: 7.1,
          games: 14,
          highlight: false,
        },
        {
          id: 15,
          name: "Marco Carvalho",
          role: "GR",
          status: "confirmed",
          goals: 0,
          assists: 0,
          rating: 7.4,
          games: 11,
          highlight: false,
        },
      ];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    players: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
