import { describe, expect, it } from "vitest";

import { drawPlayers, mulberry32, shuffle } from "./draw";

describe("mulberry32", () => {
  it("produces a deterministic sequence", () => {
    const first = mulberry32(42);
    const second = mulberry32(42);

    expect(Array.from({ length: 5 }, first)).toEqual(
      Array.from({ length: 5 }, second),
    );
  });

  it("keeps every value in the [0, 1) range", () => {
    const rng = mulberry32(42);
    const values = Array.from({ length: 100 }, rng);

    expect(values.every(value => value >= 0 && value < 1)).toBe(true);
  });

  it("matches the canonical sequence for an extreme seed", () => {
    const rng = mulberry32(Number.MAX_SAFE_INTEGER);

    expect(Array.from({ length: 5 }, rng)).toEqual([
      0.8964226141106337, 0.189478256739676, 0.7156526781618595,
      0.9440599093213677, 0.8452364315744489,
    ]);
  });
});

describe("shuffle", () => {
  it("preserves the input multiset", () => {
    const result = shuffle(["Ana", "Bruno", "Ana", "Duarte"], mulberry32(7));

    expect(result.toSorted()).toEqual(["Ana", "Ana", "Bruno", "Duarte"]);
  });

  it("is deterministic for the same seed", () => {
    const names = ["Ana", "Bruno", "Carla", "Duarte", "Eva"];

    expect(shuffle(names, mulberry32(7))).toEqual(
      shuffle(names, mulberry32(7)),
    );
  });

  it("does not mutate the input", () => {
    const names = ["Ana", "Bruno", "Carla"];

    shuffle(names, mulberry32(7));

    expect(names).toEqual(["Ana", "Bruno", "Carla"]);
  });
});

describe("drawPlayers", () => {
  it.each([
    0,
    -1,
    2.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])("rejects invalid team count %s", teamCount => {
    expect(() => drawPlayers(["Ana"], teamCount, mulberry32(21))).toThrowError(
      new RangeError("teamCount must be a positive integer"),
    );
  });

  it("draws every player exactly once into equal teams", () => {
    const names = ["Ana", "Bruno", "Carla", "Duarte", "Eva", "Filipe"];
    const teams = drawPlayers(names, 3, mulberry32(21));

    expect(teams).toHaveLength(3);
    expect(teams.map(team => team.length)).toEqual([2, 2, 2]);
    expect(teams.flat().toSorted()).toEqual(names.toSorted());
  });

  it("is deterministic for the same seed", () => {
    const names = ["Ana", "Bruno", "Carla", "Duarte", "Eva", "Filipe"];

    expect(drawPlayers(names, 3, mulberry32(21))).toEqual(
      drawPlayers(names, 3, mulberry32(21)),
    );
  });

  it("distributes an uneven draw round-robin", () => {
    const names = ["Ana", "Bruno", "Carla", "Duarte", "Eva"];
    const teams = drawPlayers(names, 3, mulberry32(21));

    expect(teams.map(team => team.length).toSorted()).toEqual([1, 2, 2]);
    expect(teams.flat().toSorted()).toEqual(names.toSorted());
  });

  it("creates empty teams when there are no players", () => {
    expect(drawPlayers([], 3, mulberry32(21))).toEqual([[], [], []]);
  });

  it("allows more teams than players", () => {
    const teams = drawPlayers(["Ana", "Bruno"], 4, mulberry32(21));

    expect(teams).toHaveLength(4);
    expect(teams.map(team => team.length).toSorted()).toEqual([0, 0, 1, 1]);
    expect(teams.flat().toSorted()).toEqual(["Ana", "Bruno"]);
  });
});
