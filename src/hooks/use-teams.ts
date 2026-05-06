"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";
import { useSession } from "@/lib/auth-client";

interface TeamStore {
  activeTeamId: number | null;
  setActiveTeamIdLocal: (id: number) => void;
}

export const useTeamStore = create<TeamStore>(set => ({
  activeTeamId: null,
  setActiveTeamIdLocal: id => set({ activeTeamId: id }),
}));

export function useTeams() {
  const { data: sessionData } = useSession();
  const queryClient = useQueryClient();
  const { activeTeamId, setActiveTeamIdLocal } = useTeamStore();

  const {
    data: myTeams,
    isLoading,
    refetch,
  } = useQuery({
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
        : { planTier: "free" as const, teamCount: 0, canCreateTeam: false };
    },
  });

  useEffect(() => {
    const defaultTeamId = (
      sessionData?.session as { teamId?: number | null } | undefined
    )?.teamId;

    if (defaultTeamId && activeTeamId === null) {
      setActiveTeamIdLocal(defaultTeamId);
    } else if (
      !defaultTeamId &&
      activeTeamId === null &&
      myTeams &&
      myTeams.length > 0
    ) {
      setActiveTeamIdLocal(myTeams[0].id);
    }
  }, [sessionData, activeTeamId, setActiveTeamIdLocal, myTeams]);

  const setActiveTeamId = (id: number) => {
    if (id === activeTeamId) return;

    setActiveTeamIdLocal(id);
    queryClient.removeQueries({ queryKey: ["dashboard", "events"] });
    queryClient.removeQueries({ queryKey: ["dashboard", "squad"] });
    queryClient.removeQueries({ queryKey: ["squad"] });
    queryClient.removeQueries({ queryKey: ["athlete-profile"] });
    queryClient.removeQueries({ queryKey: ["payments"] });
    queryClient.removeQueries({ queryKey: ["team-payment-settings"] });
    queryClient.removeQueries({ queryKey: ["events"] });
    queryClient.removeQueries({ queryKey: ["event"] });

    void import("@/actions/teams.actions").then(({ switchActiveTeam }) =>
      switchActiveTeam({ teamId: id }),
    );
  };

  return {
    activeTeamId,
    setActiveTeamId,
    myTeams: myTeams ?? [],
    isLoading,
    refetch,
    planTier: planData?.planTier ?? "free",
    canCreateTeam: planData?.canCreateTeam ?? false,
    isPlanLoading,
  };
}
