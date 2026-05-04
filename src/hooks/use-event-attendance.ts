"use client";

import { useQuery } from "@tanstack/react-query";

import { getEventAttendanceWithUsers } from "@/actions/attendance.actions";

export interface Participant {
  id: string | number;
  name: string;
  role: string;
}

export function useEventAttendance(eventId: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["event", eventId, "attendance"],
    queryFn: async () => {
      const response = await getEventAttendanceWithUsers(eventId);
      if (response.success) {
        return response.data;
      }
      return { confirmed: [], reserves: [], pending: [] };
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
