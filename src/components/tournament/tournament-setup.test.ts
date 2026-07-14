import { describe, expect, it } from "vitest";

import { parsePlayerNames, resolveStartingOrder } from "./tournament-setup";

describe("parsePlayerNames", () => {
  it("accepts comma and newline separated names and removes blank entries", () => {
    expect(parsePlayerNames(" Ana, Bruno\n\nCarla , Diogo ")).toEqual([
      "Ana",
      "Bruno",
      "Carla",
      "Diogo",
    ]);
  });

  it("limits player names to the share contract length", () => {
    expect(parsePlayerNames("a".repeat(81))).toEqual(["a".repeat(80)]);
  });
});

describe("resolveStartingOrder", () => {
  it("preserves the original order and reference when shuffle is disabled", () => {
    const teams = ["a", "b", "c"];

    const result = resolveStartingOrder(teams, false, () => 0);

    expect(result).toBe(teams);
    expect(teams).toEqual(["a", "b", "c"]);
  });

  it("shuffles deterministically without mutating the source", () => {
    const teams = ["a", "b", "c"];

    expect(resolveStartingOrder(teams, true, () => 0)).toEqual(["b", "c", "a"]);
    expect(teams).toEqual(["a", "b", "c"]);
  });
});
