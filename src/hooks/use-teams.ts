"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";
import { useSession } from "@/lib/auth-client";

interface TeamStore {
  activeTeamId: number | null;
  setActiveTeamId: (id: number) => void;
}

export const useTeamStore = create<TeamStore>(set => ({
  activeTeamId: null,
  setActiveTeamId: id => set({ activeTeamId: id }),
}));

export function useTeams() {
  const { data: sessionData } = useSession();
  const { activeTeamId, setActiveTeamId } = useTeamStore();

  const { data: myTeams, isLoading, refetch } = useQuery({
    queryKey: ["dashboard", "teams"],
    queryFn: async () => {
      const { getMyTeams } = await import("@/actions/teams.actions");
      const response = await getMyTeams({});
      return response.success ? response.data : [];
    },
  });

  const { data: planData, isLoading: isPlanLoading } = useQuery({
    queryKey: ["dashboard", "planTier"],
    queryFn: async () => {
      const { getUserPlanTier } = await import("@/actions/teams.actions");
      const response = await getUserPlanTier({});
      return response.success
        ? response.data
        : { planTier: "BASE" as const, teamCount: 0, canCreateTeam: false };
    },
  });

  useEffect(() => {
    const defaultTeamId = (sessionData?.session as any)?.teamId;

    if (defaultTeamId && activeTeamId === null) {
      setActiveTeamId(defaultTeamId);
    } else if (!defaultTeamId && activeTeamId === null && myTeams && myTeams.length > 0) {
      setActiveTeamId(myTeams[0].id);
    }
  }, [sessionData, activeTeamId, setActiveTeamId, myTeams]);

  return {
    activeTeamId,
    setActiveTeamId,
    myTeams: myTeams ?? [],
    isLoading,
    refetch,
    planTier: planData?.planTier ?? "BASE",
    canCreateTeam: planData?.canCreateTeam ?? false,
    isPlanLoading,
  };
}
