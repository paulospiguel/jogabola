import { describe, expect, it } from "vitest";
import { withTournamentLock } from "./tournament-lock";
import {
  createTournamentTimerMatch,
  endTournament,
  findActiveTournamentMatch,
  findTeamById,
  isPersistedTimerMatch,
  isTournamentEndedPersisted,
  markTournamentEnded,
  resolveTournamentViewState,
} from "./tournament-match";
import type { TournamentRepository } from "./tournament-store";
import type { Tournament } from "./types";

function fixture(): Tournament {
  return {
    id: "cup-1",
    name: "Taça",
    createdAt: 100,
    teams: [
      { id: "a", name: "Alfa", color: "#7CFF4F", players: [] },
      { id: "b", name: "Bravo", color: "#38BDF8", players: [] },
      { id: "c", name: "Charlie", color: "#FACC15", players: [] },
    ],
    config: {
      mode: "always",
      matchLenSec: 420,
      timerMode: "down",
      sound: true,
    },
    matches: [],
    queue: ["c"],
    currentPair: ["a", "b"],
    status: "running",
  };
}

describe("findActiveTournamentMatch", () => {
  it("finds the unfinalized match carrying this tournament's context", () => {
    const tournament = fixture();
    const live = createTournamentTimerMatch(
      tournament,
      tournament.teams[0],
      tournament.teams[1],
    );
    const unrelated = createTournamentTimerMatch(
      { ...fixture(), id: "cup-2" },
      tournament.teams[0],
      tournament.teams[1],
    );

    expect(findActiveTournamentMatch(tournament, [unrelated, live])).toBe(live);
  });

  it("ignores matches already folded into the tournament history", () => {
    const tournament = fixture();
    const live = createTournamentTimerMatch(
      tournament,
      tournament.teams[0],
      tournament.teams[1],
    );
    const finalized: Tournament = {
      ...tournament,
      matches: [
        {
          id: live.id,
          teamAId: "a",
          teamBId: "b",
          scoreA: 1,
          scoreB: 0,
          outcome: "regA",
          goals: [],
          endedAt: 1,
        },
      ],
    };

    expect(findActiveTournamentMatch(finalized, [live])).toBeNull();
  });

  it("returns null when no match belongs to the tournament", () => {
    expect(findActiveTournamentMatch(fixture(), [])).toBeNull();
  });
});

describe("markTournamentEnded", () => {
  it("changes only the status and preserves the final pairing and data references", () => {
    const tournament = fixture();

    const ended = markTournamentEnded(tournament);

    expect(ended).toEqual({ ...tournament, status: "ended" });
    expect(ended).not.toBe(tournament);
    expect(ended.currentPair).toBe(tournament.currentPair);
    expect(ended.teams).toBe(tournament.teams);
    expect(ended.matches).toBe(tournament.matches);
    expect(ended.queue).toBe(tournament.queue);
    expect(ended.config).toBe(tournament.config);
  });
});

describe("endTournament", () => {
  it("serializes with a finishing match and preserves its fresh tournament data", async () => {
    let stored = fixture();
    let releaseFinalize = () => {};
    const finalizeCanFinish = new Promise<void>(resolve => {
      releaseFinalize = resolve;
    });
    const repository: Pick<TournamentRepository, "get" | "save"> = {
      async get(id) {
        return stored.id === id ? structuredClone(stored) : null;
      },
      async save(tournament) {
        stored = structuredClone(tournament);
      },
    };

    const finalize = withTournamentLock(stored.id, async () => {
      await finalizeCanFinish;
      stored = {
        ...stored,
        teams: [
          { ...stored.teams[0], players: [{ id: "new", name: "Nova" }] },
          ...stored.teams.slice(1),
        ],
        matches: [
          {
            id: "m1",
            teamAId: "a",
            teamBId: "b",
            scoreA: 1,
            scoreB: 0,
            outcome: "regA",
            goals: [{ playerId: "new", teamId: "a", atSec: 12 }],
            endedAt: 200,
          },
        ],
        currentPair: ["a", "c"],
        queue: ["b"],
      };
    });
    const ending = endTournament(repository, stored.id);

    await Promise.resolve();
    expect(stored.status).toBe("running");
    releaseFinalize();
    await Promise.all([finalize, ending]);

    expect(stored).toMatchObject({
      status: "ended",
      currentPair: ["a", "c"],
      queue: ["b"],
    });
    expect(stored.matches).toHaveLength(1);
    expect(stored.teams[0]?.players).toEqual([{ id: "new", name: "Nova" }]);
  });

  it("rejects a missing tournament", async () => {
    const repository: Pick<TournamentRepository, "get" | "save"> = {
      get: async () => null,
      save: async () => undefined,
    };

    await expect(endTournament(repository, "missing")).rejects.toThrow(
      "not found",
    );
  });
});

describe("findTeamById", () => {
  it("returns null instead of throwing for an orphan team id", () => {
    expect(findTeamById(fixture(), "missing")).toBeNull();
  });

  it("returns the matching team", () => {
    const tournament = fixture();
    expect(findTeamById(tournament, "a")).toBe(tournament.teams[0]);
  });
});

describe("createTournamentTimerMatch", () => {
  it("maps tournament teams and timer configuration to a single-period match", () => {
    const tournament = fixture();
    const match = createTournamentTimerMatch(
      tournament,
      tournament.teams[0],
      tournament.teams[1],
    );
    expect(match.type).toBe("jogo");
    expect(match.teams).toEqual({
      A: { name: "Alfa", color: "#7CFF4F", players: [] },
      B: { name: "Bravo", color: "#38BDF8", players: [] },
    });
    expect(match.config).toEqual({
      mode: "down",
      periodLenSec: 420,
      periods: 1,
      sound: true,
    });
    expect(match.tournamentContext).toEqual({
      tournamentId: "cup-1",
      teamAId: "a",
      teamBId: "b",
      queue: ["c"],
    });
    expect(match.tournamentContext?.queue).not.toBe(tournament.queue);
  });
});

describe("resolveTournamentViewState", () => {
  it("resolves an ended tournament before requiring an active pairing", () => {
    const tournament = fixture();
    tournament.status = "ended";
    tournament.currentPair = null;

    expect(resolveTournamentViewState(tournament)).toBe("ended");
  });

  it("reports an invalid active pairing without throwing", () => {
    const tournament = fixture();
    tournament.currentPair = ["a", "missing"];

    expect(resolveTournamentViewState(tournament)).toBe("invalid");
  });
});

describe("persistence verification", () => {
  it("rejects a missing or mismatched persisted timer match", () => {
    const tournament = fixture();
    const match = createTournamentTimerMatch(
      tournament,
      tournament.teams[0],
      tournament.teams[1],
    );
    const context = match.tournamentContext;
    if (!context) throw new Error("Expected tournament context");

    expect(isPersistedTimerMatch(match, null)).toBe(false);
    expect(
      isPersistedTimerMatch(match, {
        ...match,
        teams: {
          ...match.teams,
          A: { ...match.teams.A, name: "Outra equipa" },
        },
      }),
    ).toBe(false);
    expect(isPersistedTimerMatch(match, match)).toBe(true);
    expect(
      isPersistedTimerMatch(match, {
        ...match,
        tournamentContext: {
          tournamentId: context.tournamentId,
          teamAId: context.teamAId,
          teamBId: context.teamBId,
          queue: ["outra"],
        },
      }),
    ).toBe(false);
  });

  it("only confirms the matching tournament in ended status", () => {
    const tournament = fixture();
    const ended = markTournamentEnded(tournament);

    expect(isTournamentEndedPersisted(ended, null)).toBe(false);
    expect(isTournamentEndedPersisted(ended, tournament)).toBe(false);
    expect(isTournamentEndedPersisted(ended, { ...ended, id: "another" })).toBe(
      false,
    );
    expect(isTournamentEndedPersisted(ended, ended)).toBe(true);
  });
});
