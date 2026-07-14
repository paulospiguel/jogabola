import { describe, expect, it } from "vitest";
import {
  createTournamentTimerMatch,
  findTeamById,
  isPersistedTimerMatch,
  isTournamentEndedPersisted,
  markTournamentEnded,
  resolveTournamentViewState,
} from "./tournament-match";
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
