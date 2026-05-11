"use client";

import { useQuery } from "@tanstack/react-query";

export function useTeamPaymentSettings(teamId?: number | string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["team-payment-settings", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { getTeamPaymentSettings } = await import(
        "@/actions/team-payment-settings.actions"
      );
      const res = await getTeamPaymentSettings({ teamId: Number(teamId) });

      if (!res.success) {
        throw new Error("Failed to fetch team payment settings");
      }

      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    settings: data,
    isLoading,
    error,
    refetch,
  };
}

export function usePublicTeamPaymentSettings(teamId?: number | string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["public-team-payment-settings", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { getPublicTeamPaymentSettings } = await import(
        "@/actions/team-payment-settings.actions"
      );
      const res = await getPublicTeamPaymentSettings({ teamId: Number(teamId) });

      if (!res.success) {
        throw new Error("Failed to fetch public team payment settings");
      }

      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    settings: data,
    isLoading,
    error,
    refetch,
  };
}
