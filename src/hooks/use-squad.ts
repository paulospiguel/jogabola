"use client";

import { useQuery } from "@tanstack/react-query";
import { useTeams } from "./use-teams";

export interface SquadPlayer {
  id: string;
  name: string;
  email?: string | null;
  role: string;
  position?: string | null;
  status: "confirmed" | "reserve" | "pending" | "refused" | "new";
  goals: number | null;
  assists: number | null;
  rating: number | null;
  games: number | null;
  selfRating: number | null;
  highlight?: boolean;
  isVerified?: boolean;
  image?: string | null;
}

export function useSquad() {
  const { activeTeamId } = useTeams();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["squad", activeTeamId],
    enabled: !!activeTeamId,
    queryFn: async (): Promise<SquadPlayer[]> => {
      if (!activeTeamId) return [];

      const { getTeamSquad } = await import("@/actions/teams.actions");
      const response = await getTeamSquad({ teamId: activeTeamId });

      if (!response.success) {
        throw new Error("Failed to fetch squad");
      }

      return response.data as SquadPlayer[];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    players: data ?? [],
    activeTeamId,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
