import { describe, expect, it } from "vitest";
import type { MatchConfig, Team } from "./types";
import { createMatch, standaloneOnly } from "./use-match-store";

const teamA: Team = { name: "Equipa A", color: "#ffffff", players: [] };
const teamB: Team = { name: "Equipa B", color: "#000000", players: [] };
const config: MatchConfig = {
  mode: "down",
  periodLenSec: 1_200,
  periods: 2,
  sound: true,
};

describe("standaloneOnly", () => {
  it("keeps only matches without tournament context", () => {
    const standalone = createMatch("jogo", teamA, teamB, config);
    const tournament = {
      ...standalone,
      tournamentContext: {
        tournamentId: "t1",
        teamAId: "a",
        teamBId: "b",
        queue: [],
      },
    };

    expect(standaloneOnly([standalone, tournament])).toEqual([standalone]);
  });

  it("returns an empty array for an empty collection", () => {
    expect(standaloneOnly([])).toEqual([]);
  });
});
