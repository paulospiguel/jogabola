import { describe, expect, it, vi } from "vitest";
import type { SquadPlayer } from "@/hooks/use-squad";
import {
  deriveSquadQueryState,
  type RawQuerySnapshot,
} from "./use-squad-client-state";

// `use-squad-client-state.ts` imports `sendRosterPlayerEmail` from
// `@/actions/teams.actions` at module scope (used inside a transition, not
// inside a queryFn). That module transitively imports `@/db/client`, which
// throws at import time when DATABASE_URL isn't set — as it isn't in this
// unit-test environment. Stub it so importing the module for its pure
// `deriveSquadQueryState` helper doesn't require a live DB connection. The
// hook itself (useSquadClientState) is not exercised here. vi.mock calls
// are hoisted above imports by Vitest, so placement here is safe despite
// appearing after the `./use-squad-client-state` import above.
vi.mock("@/actions/teams.actions", () => ({
  sendRosterPlayerEmail: vi.fn(),
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

const samplePlayer: SquadPlayer = {
  id: "1",
  name: "Ana",
  role: "player",
  status: "confirmed",
  goals: null,
  assists: null,
  rating: null,
  games: null,
  selfRating: null,
};

describe("deriveSquadQueryState", () => {
  it("shows loading during the initial fetch, before any data exists", () => {
    const result = deriveSquadQueryState(
      makeSnapshot<SquadPlayer[]>({ isLoading: true, isFetching: true }),
    );

    expect(result.isInitialLoading).toBe(true);
    expect(result.players).toEqual([]);
  });

  it("lets an error take precedence over empty when there is no data yet", () => {
    const error = new Error("boom");
    const result = deriveSquadQueryState(
      makeSnapshot<SquadPlayer[]>({ error }),
    );

    expect(result.error).toBe(error);
    expect(result.players).toEqual([]);
  });

  it("only reports empty after a successful fetch that returned no players", () => {
    const result = deriveSquadQueryState(
      makeSnapshot<SquadPlayer[]>({ data: [] }),
    );

    expect(result.error).toBeNull();
    expect(result.isInitialLoading).toBe(false);
    expect(result.players).toEqual([]);
  });

  it("preserves the previous roster while a refetch is in flight", () => {
    const data = [samplePlayer];
    const result = deriveSquadQueryState(
      makeSnapshot<SquadPlayer[]>({ data, isFetching: true }),
    );

    expect(result.players).toEqual(data);
    expect(result.isFetching).toBe(true);
  });

  it("keeps the previous roster visible when a background refetch fails", () => {
    const data = [samplePlayer];
    const error = new Error("refetch failed");
    const result = deriveSquadQueryState(
      makeSnapshot<SquadPlayer[]>({ data, error }),
    );

    expect(result.players).toEqual(data);
    expect(result.error).toBe(error);
  });

  it("wires retry to the exact refetch callback passed in, not a stale closure", () => {
    const refetch = vi.fn();
    const other = vi.fn();
    const result = deriveSquadQueryState(
      makeSnapshot<SquadPlayer[]>({ refetch }),
    );

    expect(result.refetch).toBe(refetch);
    result.refetch();
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(other).not.toHaveBeenCalled();
  });

  it("defaults missing data to an empty array instead of undefined", () => {
    const result = deriveSquadQueryState(
      makeSnapshot<SquadPlayer[]>({ isLoading: true }),
    );

    expect(result.players).toEqual([]);
    expect(result.isInitialLoading).toBe(true);
  });
});
