"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getEvents } from "@/actions/match-sessions.actions";
import { getTeamSquad } from "@/actions/teams.actions";
import type { PlayerStatus } from "@/constants/player";
import { useTeams } from "@/hooks/use-teams";
import type { EventStatus } from "@/types/events";

export interface DashboardEvent {
  id: number;
  type: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: EventStatus;
  confirmed: number;
  total: number;
  /**
   * Raw event start instant, kept alongside the formatted `date`/`time`
   * display strings above so `dashboard-cockpit.ts`'s pure selectors
   * (selectActiveEvent/selectSecondaryEvents) can pick and sort
   * deterministically without re-parsing the display strings.
   */
  startsAt: Date;
}

export interface SquadMember {
  id: string | number;
  name: string;
  role: string;
  image?: string | null;
  position?: string | null;
  status: PlayerStatus;
  isVerified?: boolean | null;
}

/**
 * A single query's state, in the minimal shape `deriveDashboardQueryState`
 * needs. Mirrors the subset of TanStack Query's `UseQueryResult` this
 * dashboard cares about, so the composition logic below stays
 * framework-free and unit-testable without rendering a real query.
 */
export interface RawQuerySnapshot<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
}

export interface DashboardSectionState<T> {
  data: T;
  isInitialLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
}

export interface DeriveDashboardQueryStateInput<TEvent, TSquad> {
  events: RawQuerySnapshot<TEvent[]>;
  squad: RawQuerySnapshot<TSquad[]>;
}

export interface DashboardQueryState<TEvent, TSquad> {
  eventsState: DashboardSectionState<TEvent[]>;
  squadState: DashboardSectionState<TSquad[]>;
}

function toSectionState<T>(
  snapshot: RawQuerySnapshot<T[]>,
): DashboardSectionState<T[]> {
  return {
    // Only ever falls back to `[]` when the query hasn't returned data yet
    // (still loading, or disabled) — an error never gets silently mapped
    // to an empty array here, so callers can still tell "empty" (error is
    // null) apart from "failed with nothing to show" (error is set).
    data: snapshot.data ?? [],
    isInitialLoading: snapshot.isLoading,
    isFetching: snapshot.isFetching,
    error: snapshot.error,
    refetch: snapshot.refetch,
  };
}

/**
 * Composes the events and squad query snapshots into two fully independent
 * section states. Each section's data, loading, error and refetch come
 * only from its own query — an error or refetch on one section never
 * touches the other, and each section's `refetch` stays wired to its own
 * query's callback. Never converts an error response into an empty array:
 * `data` only falls back to `[]` when the query genuinely has nothing yet,
 * so an empty array after a successful fetch stays "empty", not "error".
 * Callers pass each section straight to `deriveQueryViewState` to render
 * loading/error/empty/success independently.
 */
export function deriveDashboardQueryState<TEvent, TSquad>(
  input: DeriveDashboardQueryStateInput<TEvent, TSquad>,
): DashboardQueryState<TEvent, TSquad> {
  return {
    eventsState: toSectionState(input.events),
    squadState: toSectionState(input.squad),
  };
}

export function useDashboardData() {
  const { activeTeamId, setActiveTeamId, myTeams, activeTeamCanManage } =
    useTeams();

  const eventsQuery = useQuery({
    queryKey: ["dashboard", "events", activeTeamId],
    queryFn: async (): Promise<DashboardEvent[]> => {
      if (!activeTeamId) return [];
      const response = await getEvents({ teamId: activeTeamId });
      if (!response.success) throw new Error("Failed to fetch events");

      return response.data.map(e => {
        const d = new Date(e.startDate);
        return {
          id: e.id,
          type: e.type,
          title: e.title,
          date: d.toLocaleDateString("pt-PT", {
            weekday: "short",
            day: "2-digit",
            month: "short",
          }),
          time: d.toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          location: e.location,
          status: e.status,
          confirmed: Number(e.currentParticipants) || 0,
          total: Number(e.maxParticipants) || 14,
          startsAt: d,
        };
      });
    },
    enabled: !!activeTeamId,
    placeholderData: keepPreviousData,
  });

  const squadQuery = useQuery({
    queryKey: ["dashboard", "squad", activeTeamId],
    queryFn: async (): Promise<SquadMember[]> => {
      if (!activeTeamId) return [];
      const response = await getTeamSquad({ teamId: activeTeamId });
      if (!response.success) throw new Error("Failed to fetch squad");
      return response.data as SquadMember[];
    },
    enabled: !!activeTeamId,
    placeholderData: keepPreviousData,
  });

  const { eventsState, squadState } = deriveDashboardQueryState<
    DashboardEvent,
    SquadMember
  >({
    events: {
      data: eventsQuery.data,
      isLoading: eventsQuery.isLoading,
      isFetching: eventsQuery.isFetching,
      error: eventsQuery.error,
      refetch: () => {
        void eventsQuery.refetch();
      },
    },
    squad: {
      data: squadQuery.data,
      isLoading: squadQuery.isLoading,
      isFetching: squadQuery.isFetching,
      error: squadQuery.error,
      refetch: () => {
        void squadQuery.refetch();
      },
    },
  });

  const confirmedCount = squadState.data.filter(
    p => p.status === "confirmed",
  ).length;
  const reserveCount = squadState.data.filter(
    p => p.status === "reserve",
  ).length;
  const pendingCount = squadState.data.filter(
    p => p.status === "pending",
  ).length;

  return {
    activeTeamId,
    setActiveTeamId,
    myTeams,
    activeTeamCanManage,
    events: eventsState.data,
    squad: squadState.data,
    eventsState,
    squadState,
    confirmedCount,
    reserveCount,
    pendingCount,
  };
}
