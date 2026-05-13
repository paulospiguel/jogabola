"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlayerHistory } from "@/actions/attendance.actions";
import { getAthleteProfile } from "@/actions/teams.actions";
import { useTeams } from "@/hooks/use-teams";

export function useAthleteProfile(playerId: string | string[]) {
  const { activeTeamId } = useTeams();
  const id = Array.isArray(playerId) ? playerId[0] : playerId;

  const { data: profile, isLoading: profileLoading } = useQuery({
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

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["athlete-history", id, activeTeamId],
    queryFn: async () => {
      if (!id || !activeTeamId) return [];
      const response = await getPlayerHistory(id, activeTeamId);
      return response.success ? response.data : [];
    },
    enabled: !!id && !!activeTeamId,
  });

  return {
    profile,
    history,
    isLoading: profileLoading || historyLoading,
  };
}
