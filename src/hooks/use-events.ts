"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvent, getEvents } from "@/actions/match-sessions.actions";
import type { EventView } from "@/types/events";

interface UseEventsOptions {
  limit?: number;
  organizerId?: string;
  status?: string;
  upcomingOnly?: boolean;
  enabled?: boolean;
}

export function useEvents(options?: UseEventsOptions) {
  const {
    limit = 10,
    organizerId,
    status,
    upcomingOnly = true,
    enabled = true,
  } = options || {};

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["events", { limit, organizerId, status, upcomingOnly }],
    queryFn: async () => {
      const result = await getEvents({ limit, organizerId, status, upcomingOnly });
      if (!result.success) throw new Error("Failed to fetch events");
      return result.data ?? [];
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    events: data ?? ([] as EventView[]),
    isLoading,
    isRefetching,
    error,
    refetch,
  };
}

export function useEventsList(options?: UseEventsOptions): EventView[] {
  return useEvents(options).events;
}

export function useEvent(eventId: number | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const result = await getEvent(eventId);
      if (!result.success || !result.data) throw new Error("Failed to fetch event");
      return result.data;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
  });

  return { event: data ?? null, isLoading, error, refetch };
}
