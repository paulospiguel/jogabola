"use client";

import { useQuery } from "@tanstack/react-query";
import { getAthleteProfile } from "@/actions/teams.actions";
import { useTeams } from "@/hooks/use-teams";

export function useAthleteProfile(playerId: string | string[]) {
  const { activeTeamId } = useTeams();
  const id = Array.isArray(playerId) ? playerId[0] : playerId;

  const { data, isLoading } = useQuery({
    queryKey: ["athlete-profile", id, activeTeamId],
    queryFn: async () => {
      if (!id || !activeTeamId) return null;
      const response = await getAthleteProfile({
        playerId: id,
        teamId: activeTeamId,
      });
      return response.success ? response.data : null;
    },
    enabled: !!id && !!activeTeamId,
  });

  return {
    profile: data,
    isLoading,
  };
}
