import { describe, expect, it, vi } from "vitest";
import {
  type DashboardEvent,
  deriveDashboardQueryState,
  type RawQuerySnapshot,
  type SquadMember,
} from "./use-dashboard";

// `use-dashboard.ts` imports these server actions directly (used inside
// useQuery's queryFn). Both actions transitively import `@/db/client`,
// which throws at module load time when DATABASE_URL isn't set — as it
// isn't in this unit-test environment. Stub them so importing the module
// for its pure `deriveDashboardQueryState` helper doesn't require a live
// DB connection. The hook itself (useDashboardData) is not exercised here.
// vi.mock calls are hoisted above imports by Vitest, so placement here is
// safe despite appearing after the `./use-dashboard` import above.
vi.mock("@/actions/match-sessions.actions", () => ({
  getEvents: vi.fn(),
}));
vi.mock("@/actions/teams.actions", () => ({
  getTeamSquad: vi.fn(),
}));

function makeSnapshot<T>(
  overrides: Partial<RawQuerySnapshot<T>> = {},
): RawQuerySnapshot<T> {
  return {
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

const sampleEvent: DashboardEvent = {
  id: 1,
  type: "match",
  title: "Jogo de sábado",
  date: "sáb, 18 jul",
  time: "18:00",
  location: "Campo Municipal",
  status: "scheduled",
  confirmed: 8,
  total: 14,
  startsAt: new Date("2026-07-18T18:00:00.000Z"),
};

const sampleSquadMember: SquadMember = {
  id: 1,
  name: "Ana",
  role: "player",
  status: "confirmed",
};

describe("deriveDashboardQueryState", () => {
  it("keeps the squad section visible and unaffected when the events query errors", () => {
    const squadData = [sampleSquadMember];

    const result = deriveDashboardQueryState({
      events: makeSnapshot<DashboardEvent[]>({ error: new Error("boom") }),
      squad: makeSnapshot<SquadMember[]>({ data: squadData }),
    });

    expect(result.eventsState.error).toBeInstanceOf(Error);
    expect(result.squadState.error).toBeNull();
    expect(result.squadState.data).toEqual(squadData);
  });

  it("keeps the active event visible and unaffected when the squad query errors", () => {
    const eventsData = [sampleEvent];

    const result = deriveDashboardQueryState({
      events: makeSnapshot<DashboardEvent[]>({ data: eventsData }),
      squad: makeSnapshot<SquadMember[]>({ error: new Error("boom") }),
    });

    expect(result.squadState.error).toBeInstanceOf(Error);
    expect(result.eventsState.error).toBeNull();
    expect(result.eventsState.data).toEqual(eventsData);
  });

  it("produces two independent local errors when both queries fail", () => {
    const eventsError = new Error("events failed");
    const squadError = new Error("squad failed");

    const result = deriveDashboardQueryState({
      events: makeSnapshot<DashboardEvent[]>({ error: eventsError }),
      squad: makeSnapshot<SquadMember[]>({ error: squadError }),
    });

    expect(result.eventsState.error).toBe(eventsError);
    expect(result.squadState.error).toBe(squadError);
  });

  it("keeps each section's retry wired to the correct query's refetch callback", () => {
    const eventsRefetch = vi.fn();
    const squadRefetch = vi.fn();

    const result = deriveDashboardQueryState({
      events: makeSnapshot<DashboardEvent[]>({ refetch: eventsRefetch }),
      squad: makeSnapshot<SquadMember[]>({ refetch: squadRefetch }),
    });

    expect(result.eventsState.refetch).toBe(eventsRefetch);
    expect(result.squadState.refetch).toBe(squadRefetch);
    expect(result.eventsState.refetch).not.toBe(result.squadState.refetch);

    result.eventsState.refetch();
    expect(eventsRefetch).toHaveBeenCalledTimes(1);
    expect(squadRefetch).not.toHaveBeenCalled();
  });

  it("preserves each section's previous data while it is refetching", () => {
    const eventsData = [sampleEvent];
    const squadData = [sampleSquadMember];

    const result = deriveDashboardQueryState({
      events: makeSnapshot<DashboardEvent[]>({
        data: eventsData,
        isFetching: true,
      }),
      squad: makeSnapshot<SquadMember[]>({ data: squadData }),
    });

    expect(result.eventsState.data).toEqual(eventsData);
    expect(result.eventsState.isFetching).toBe(true);
    expect(result.squadState.data).toEqual(squadData);
    expect(result.squadState.isFetching).toBe(false);
  });

  it("treats an empty array after a successful fetch as empty, never as an error", () => {
    const result = deriveDashboardQueryState({
      events: makeSnapshot<DashboardEvent[]>({ data: [] }),
      squad: makeSnapshot<SquadMember[]>({ data: [] }),
    });

    expect(result.eventsState.data).toEqual([]);
    expect(result.eventsState.error).toBeNull();
    expect(result.squadState.data).toEqual([]);
    expect(result.squadState.error).toBeNull();
  });

  it("defaults missing data to an empty array instead of undefined", () => {
    const result = deriveDashboardQueryState({
      events: makeSnapshot<DashboardEvent[]>({ isLoading: true }),
      squad: makeSnapshot<SquadMember[]>({ isLoading: true }),
    });

    expect(result.eventsState.data).toEqual([]);
    expect(result.eventsState.isInitialLoading).toBe(true);
    expect(result.squadState.data).toEqual([]);
    expect(result.squadState.isInitialLoading).toBe(true);
  });
});
