import { describe, expect, it } from "vitest";

import { initQueue, loserOf, pointsFor, resolveNext, winnerOf } from "./engine";
import type { MatchOutcome, TournamentMatch } from "./types";

function match(
  id: string,
  teamAId: string,
  teamBId: string,
  outcome: MatchOutcome,
): TournamentMatch {
  return {
    id,
    teamAId,
    teamBId,
    scoreA: outcome === "regA" ? 1 : 0,
    scoreB: outcome === "regB" ? 1 : 0,
    outcome,
    goals: [],
    endedAt: Number(id.replace("m", "")),
  };
}

describe("pointsFor", () => {
  it.each([
    ["regA", { a: 3, b: 0 }],
    ["regB", { a: 0, b: 3 }],
    ["decisionA", { a: 2, b: 1 }],
    ["decisionB", { a: 1, b: 2 }],
  ] satisfies [
    MatchOutcome,
    { a: number; b: number },
  ][])("awards the expected points for %s", (outcome, points) => {
    expect(pointsFor(outcome)).toEqual(points);
  });
});

describe("winnerOf and loserOf", () => {
  it.each([
    ["regA", "t1", "t2"],
    ["decisionA", "t1", "t2"],
    ["regB", "t2", "t1"],
    ["decisionB", "t2", "t1"],
  ] satisfies [
    MatchOutcome,
    string,
    string,
  ][])("select the winner and loser for %s", (outcome, winner, loser) => {
    const finished = match("m1", "t1", "t2", outcome);

    expect(winnerOf(finished)).toBe(winner);
    expect(loserOf(finished)).toBe(loser);
  });
});

describe("initQueue", () => {
  it("starts three teams with the first pair and one queued team", () => {
    expect(initQueue(["t1", "t2", "t3"])).toEqual({
      currentPair: ["t1", "t2"],
      queue: ["t3"],
    });
  });

  it("starts five teams with the first pair and remaining queue", () => {
    expect(initQueue(["t1", "t2", "t3", "t4", "t5"])).toEqual({
      currentPair: ["t1", "t2"],
      queue: ["t3", "t4", "t5"],
    });
  });
});

describe("resolveNext", () => {
  it("keeps the winner on and rotates the loser with three teams", () => {
    const first = match("m1", "t1", "t2", "regA");
    const afterFirst = resolveNext({
      finished: first,
      queue: ["t3"],
      mode: "always",
      matches: [first],
    });

    expect(afterFirst).toEqual({ currentPair: ["t1", "t3"], queue: ["t2"] });

    const second = match("m2", "t1", "t3", "regA");
    expect(
      resolveNext({
        finished: second,
        queue: afterFirst.queue,
        mode: "always",
        matches: [first, second],
      }),
    ).toEqual({ currentPair: ["t1", "t2"], queue: ["t3"] });
  });

  it("rotates four teams in queue order", () => {
    const finished = match("m1", "t1", "t2", "regA");

    expect(
      resolveNext({
        finished,
        queue: ["t3", "t4"],
        mode: "always",
        matches: [finished],
      }),
    ).toEqual({ currentPair: ["t1", "t3"], queue: ["t4", "t2"] });
  });

  it("rests a winner after two consecutive wins", () => {
    const first = match("m1", "t1", "t2", "regA");
    const afterFirst = resolveNext({
      finished: first,
      queue: ["t3"],
      mode: "maxTwoInARow",
      matches: [first],
    });

    expect(afterFirst).toEqual({ currentPair: ["t1", "t3"], queue: ["t2"] });

    const second = match("m2", "t1", "t3", "regA");
    const afterSecond = resolveNext({
      finished: second,
      queue: afterFirst.queue,
      mode: "maxTwoInARow",
      matches: [first, second],
    });

    expect(afterSecond).toEqual({ currentPair: ["t2", "t3"], queue: ["t1"] });

    const third = match("m3", "t2", "t3", "regA");
    expect(
      resolveNext({
        finished: third,
        queue: afterSecond.queue,
        mode: "maxTwoInARow",
        matches: [first, second, third],
      }),
    ).toEqual({ currentPair: ["t2", "t1"], queue: ["t3"] });
  });

  it("throws when there is no challenger", () => {
    const finished = match("m1", "t1", "t2", "regA");

    expect(() =>
      resolveNext({
        finished,
        queue: [],
        mode: "always",
        matches: [finished],
      }),
    ).toThrowError("Tournament queue exhausted");
  });
});
