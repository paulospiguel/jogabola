import { describe, expect, it } from "vitest";

import { computeStandings, computeTopScorers } from "./standings";
import type { MatchOutcome, Tournament, TournamentMatch } from "./types";

function tournament(
  matches: TournamentMatch[] = [],
  teams: Tournament["teams"] = [
    { id: "t1", name: "Águias", color: "red", players: [] },
    { id: "t2", name: "Bolas", color: "blue", players: [] },
    { id: "t3", name: "Craques", color: "green", players: [] },
  ],
): Tournament {
  return {
    id: "tournament-1",
    createdAt: 1,
    teams,
    config: {
      mode: "always",
      matchLenSec: 600,
      timerMode: "down",
      sound: false,
    },
    matches,
    queue: [],
    currentPair: null,
    status: "ended",
  };
}

function match(
  id: string,
  teamAId: string,
  teamBId: string,
  scoreA: number,
  scoreB: number,
  outcome: MatchOutcome,
  endedAt = Number(id.replace("m", "")),
  goals: TournamentMatch["goals"] = [],
): TournamentMatch {
  return {
    id,
    teamAId,
    teamBId,
    scoreA,
    scoreB,
    outcome,
    goals,
    endedAt,
  };
}

describe("computeStandings", () => {
  it("initializes every team with zeroed statistics", () => {
    expect(computeStandings(tournament())).toEqual([
      { teamId: "t1", points: 0, played: 0, wins: 0, gf: 0, ga: 0, gd: 0 },
      { teamId: "t2", points: 0, played: 0, wins: 0, gf: 0, ga: 0, gd: 0 },
      { teamId: "t3", points: 0, played: 0, wins: 0, gf: 0, ga: 0, gd: 0 },
    ]);
  });

  it("aggregates regular and decision results", () => {
    const result = computeStandings(
      tournament([
        match("m1", "t1", "t2", 2, 0, "regA"),
        match("m2", "t1", "t3", 1, 2, "decisionB"),
      ]),
    );

    expect(result).toEqual([
      { teamId: "t1", points: 4, played: 2, wins: 1, gf: 3, ga: 2, gd: 1 },
      { teamId: "t3", points: 2, played: 1, wins: 1, gf: 2, ga: 1, gd: 1 },
      { teamId: "t2", points: 0, played: 1, wins: 0, gf: 0, ga: 2, gd: -2 },
    ]);
  });

  it("breaks equal points by goal difference", () => {
    const result = computeStandings(
      tournament([
        match("m1", "t1", "t3", 3, 0, "regA"),
        match("m2", "t2", "t3", 1, 0, "regA"),
      ]),
    );

    expect(result.map(({ teamId }) => teamId)).toEqual(["t1", "t2", "t3"]);
  });

  it("breaks equal points and goal difference by goals scored", () => {
    const result = computeStandings(
      tournament([
        match("m1", "t1", "t3", 3, 1, "regA"),
        match("m2", "t2", "t3", 2, 0, "regA"),
      ]),
    );

    expect(result.map(({ teamId }) => teamId)).toEqual(["t1", "t2", "t3"]);
  });

  it("breaks remaining ties using the most recent head-to-head winner", () => {
    const result = computeStandings(
      tournament([
        match("m1", "t1", "t2", 1, 0, "regA", 100),
        match("m2", "t2", "t1", 1, 0, "regA", 200),
      ]),
    );

    expect(result.map(({ teamId }) => teamId)).toEqual(["t2", "t1", "t3"]);
  });

  it("falls back to a stable name order for a cyclic head-to-head tie", () => {
    const matches = [
      match("m1", "t1", "t2", 1, 0, "regA"),
      match("m2", "t2", "t3", 1, 0, "regA"),
      match("m3", "t3", "t1", 1, 0, "regA"),
    ];
    const teams = [
      { id: "t1", name: "Águias", color: "red", players: [] },
      { id: "t2", name: "Bolas", color: "blue", players: [] },
      { id: "t3", name: "Craques", color: "green", players: [] },
    ];

    const firstOrder = computeStandings(tournament(matches, teams));
    const secondOrder = computeStandings(
      tournament(matches, [teams[2], teams[0], teams[1]]),
    );

    expect(firstOrder.map(({ teamId }) => teamId)).toEqual(["t1", "t2", "t3"]);
    expect(secondOrder.map(({ teamId }) => teamId)).toEqual(["t1", "t2", "t3"]);
  });

  it("falls back to team name and ignores matches with unknown teams", () => {
    const result = computeStandings(
      tournament([match("m1", "t1", "unknown", 8, 0, "regA")]),
    );

    expect(result.map(({ teamId }) => teamId)).toEqual(["t1", "t2", "t3"]);
    expect(result.every(({ played }) => played === 0)).toBe(true);
  });
});

describe("computeTopScorers", () => {
  it("aggregates stored goals and counts the player's team matches", () => {
    const result = computeTopScorers(
      tournament(
        [
          match("m1", "t1", "t2", 2, 0, "regA", 1, [
            { playerId: "p1", teamId: "t1", atSec: 10 },
            { playerId: "p1", teamId: "t1", atSec: 20 },
          ]),
          match("m2", "t1", "t3", 1, 0, "regA", 2, [
            { playerId: "p1", teamId: "t1", atSec: 30 },
          ]),
        ],
        [
          {
            id: "t1",
            name: "Águias",
            color: "red",
            players: [{ id: "p1", name: "Ana" }],
          },
          { id: "t2", name: "Bolas", color: "blue", players: [] },
          { id: "t3", name: "Craques", color: "green", players: [] },
        ],
      ),
    );

    expect(result).toEqual([
      { playerId: "p1", name: "Ana", teamId: "t1", goals: 3, matchesPlayed: 2 },
    ]);
  });

  it("sorts tied scorers by fewer team matches and then name", () => {
    const result = computeTopScorers(
      tournament(
        [
          match("m1", "t1", "t3", 1, 0, "regA", 1, [
            { playerId: "p1", teamId: "t1", atSec: 10 },
            { playerId: "missing", teamId: "t3", atSec: 20 },
          ]),
          match("m2", "t1", "t2", 0, 1, "regB", 2, [
            { playerId: "p2", teamId: "t2", atSec: 30 },
          ]),
        ],
        [
          {
            id: "t1",
            name: "Águias",
            color: "red",
            players: [{ id: "p1", name: "Zara" }],
          },
          {
            id: "t2",
            name: "Bolas",
            color: "blue",
            players: [{ id: "p2", name: "Bruno" }],
          },
          { id: "t3", name: "Craques", color: "green", players: [] },
        ],
      ),
    );

    expect(result).toEqual([
      {
        playerId: "p2",
        name: "Bruno",
        teamId: "t2",
        goals: 1,
        matchesPlayed: 1,
      },
      {
        playerId: "missing",
        name: "",
        teamId: "t3",
        goals: 1,
        matchesPlayed: 1,
      },
      {
        playerId: "p1",
        name: "Zara",
        teamId: "t1",
        goals: 1,
        matchesPlayed: 2,
      },
    ]);
  });

  it("combines a player's goals across teams using the first team entry", () => {
    const result = computeTopScorers(
      tournament(
        [
          match("m1", "t1", "t2", 1, 0, "regA", 1, [
            { playerId: "p1", teamId: "t1", atSec: 10 },
          ]),
          match("m2", "t2", "t3", 1, 0, "regA", 2, [
            { playerId: "p1", teamId: "t2", atSec: 20 },
          ]),
        ],
        [
          {
            id: "t1",
            name: "Águias",
            color: "red",
            players: [{ id: "p1", name: "Ana" }],
          },
          {
            id: "t2",
            name: "Bolas",
            color: "blue",
            players: [{ id: "p1", name: "Ana B" }],
          },
          { id: "t3", name: "Craques", color: "green", players: [] },
        ],
      ),
    );

    expect(result).toEqual([
      { playerId: "p1", name: "Ana", teamId: "t1", goals: 2, matchesPlayed: 1 },
    ]);
  });

  it("preserves goals and match counts for unknown teams and players", () => {
    const result = computeTopScorers(
      tournament([
        match("m1", "unknown", "t1", 1, 0, "regA", 1, [
          { playerId: "ghost", teamId: "unknown", atSec: 10 },
        ]),
        match("m2", "unknown", "also-unknown", 1, 0, "regA", 2, [
          { playerId: "ghost", teamId: "unknown", atSec: 20 },
          { playerId: "other", teamId: "missing", atSec: 30 },
        ]),
      ]),
    );

    expect(result).toEqual([
      {
        playerId: "ghost",
        name: "",
        teamId: "unknown",
        goals: 2,
        matchesPlayed: 2,
      },
      {
        playerId: "other",
        name: "",
        teamId: "missing",
        goals: 1,
        matchesPlayed: 0,
      },
    ]);
  });
});
