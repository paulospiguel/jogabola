"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAttachableTeams,
  listClubOpponents,
  listClubSeasons,
  listMyClubs,
} from "@/actions/clubs.actions";
import { getFixture, listClubFixtures } from "@/actions/fixtures.actions";
import { getEvent, getEvents } from "@/actions/match-sessions.actions";
import type {
  ClubSummary,
  FixtureDto,
  OpponentDto,
  SeasonDto,
} from "@/db/queries/club-calendar";
import { unwrapClubResult } from "../_utils/club-action-error";

export type { ClubSummary, FixtureDto, OpponentDto, SeasonDto };

export const clubCalendarKeys = {
  all: ["club-calendar"] as const,
  myClubs: () => [...clubCalendarKeys.all, "my-clubs"] as const,
  attachableTeams: () => [...clubCalendarKeys.all, "attachable-teams"] as const,
  club: (clubId: number) => [...clubCalendarKeys.all, "club", clubId] as const,
  fixtures: (clubId: number) =>
    [...clubCalendarKeys.club(clubId), "fixtures"] as const,
  seasons: (clubId: number) =>
    [...clubCalendarKeys.club(clubId), "seasons"] as const,
  opponents: (clubId: number) =>
    [...clubCalendarKeys.club(clubId), "opponents"] as const,
  fixture: (fixtureId: number) =>
    [...clubCalendarKeys.all, "fixture", fixtureId] as const,
  teamCallups: (teamId: number) =>
    [...clubCalendarKeys.all, "team-callups", teamId] as const,
  callup: (matchSessionId: number) =>
    [...clubCalendarKeys.all, "callup", matchSessionId] as const,
};

const STALE_TIME = 60_000;

// Club data must not be retried on authorization or validation failures:
// they are deterministic answers from the server, not network blips.
function retryOnce(failureCount: number, error: unknown) {
  return error instanceof Error && error.name !== "ClubActionError"
    ? failureCount < 1
    : false;
}

export function useMyClubs() {
  return useQuery({
    queryKey: clubCalendarKeys.myClubs(),
    queryFn: async () => unwrapClubResult(await listMyClubs({})),
    staleTime: STALE_TIME,
    retry: retryOnce,
  });
}

/** Teams the caller owns that are not in any club (server-derived). */
export function useAttachableTeams(enabled: boolean) {
  return useQuery({
    queryKey: clubCalendarKeys.attachableTeams(),
    enabled,
    queryFn: async () => unwrapClubResult(await listAttachableTeams({})),
    staleTime: STALE_TIME,
    retry: retryOnce,
  });
}

export function useClubFixtures(clubId: number) {
  return useQuery({
    queryKey: clubCalendarKeys.fixtures(clubId),
    queryFn: async () => unwrapClubResult(await listClubFixtures({ clubId })),
    staleTime: STALE_TIME,
    retry: retryOnce,
  });
}

export function useClubSeasons(clubId: number) {
  return useQuery({
    queryKey: clubCalendarKeys.seasons(clubId),
    queryFn: async () => unwrapClubResult(await listClubSeasons({ clubId })),
    staleTime: STALE_TIME,
    retry: retryOnce,
  });
}

export function useClubOpponents(clubId: number) {
  return useQuery({
    queryKey: clubCalendarKeys.opponents(clubId),
    queryFn: async () => unwrapClubResult(await listClubOpponents({ clubId })),
    staleTime: STALE_TIME,
    retry: retryOnce,
  });
}

export function useFixture(fixtureId: number | null) {
  return useQuery({
    queryKey: clubCalendarKeys.fixture(fixtureId ?? 0),
    enabled: fixtureId !== null,
    queryFn: async () =>
      unwrapClubResult(await getFixture({ fixtureId: fixtureId ?? 0 })),
    staleTime: STALE_TIME,
    retry: retryOnce,
  });
}

export interface CallupOption {
  id: number;
  title: string;
  startDate: string;
  location: string;
}

/**
 * Callups (match sessions) of one team, through the existing recreational
 * action and its access rules. Used to pick a callup to link.
 */
export function useTeamCallups(teamId: number | null) {
  return useQuery({
    queryKey: clubCalendarKeys.teamCallups(teamId ?? 0),
    enabled: teamId !== null,
    queryFn: async (): Promise<CallupOption[]> => {
      const result = await getEvents({
        teamId: teamId ?? undefined,
        upcomingOnly: false,
        limit: 50,
      });
      const data = unwrapClubResult(
        result.success
          ? { success: true as const, data: result.data ?? [] }
          : { success: false as const, error: result.error },
      );
      return data.map(event => ({
        id: event.id,
        title: event.title,
        startDate: new Date(event.startDate).toISOString(),
        location: event.location,
      }));
    },
    staleTime: STALE_TIME,
    retry: retryOnce,
  });
}

/** Linked callup summary; keeps the callup's own read rules. */
export function useCallup(matchSessionId: number | null) {
  return useQuery({
    queryKey: clubCalendarKeys.callup(matchSessionId ?? 0),
    enabled: matchSessionId !== null,
    queryFn: async () => {
      const result = await getEvent(matchSessionId ?? 0);
      if (!result.success) return null;
      return {
        id: result.data.id,
        title: result.data.title,
        startDate: new Date(result.data.startDate).toISOString(),
        location: result.data.location,
      } satisfies CallupOption;
    },
    staleTime: STALE_TIME,
    retry: retryOnce,
  });
}

/** Invalidates every club calendar read after a mutation. */
export function useInvalidateClub() {
  const queryClient = useQueryClient();
  return (clubId?: number) =>
    queryClient.invalidateQueries({
      queryKey: clubId ? clubCalendarKeys.club(clubId) : clubCalendarKeys.all,
    });
}
