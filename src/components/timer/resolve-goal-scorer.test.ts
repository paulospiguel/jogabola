import { describe, expect, it } from "vitest";
import { resolveGoalScorer } from "./resolve-goal-scorer";
import type { Player } from "./types";

const players: Player[] = [
  { id: "p1", name: "João Silva" },
  { id: "p2", name: "Rui Costa" },
];

describe("resolveGoalScorer", () => {
  it("blocks confirmation when neither a player nor the explicit unassigned option is selected", () => {
    expect(
      resolveGoalScorer({ draft: "   ", selection: null, players }),
    ).toEqual({ type: "blocked" });
  });

  it("selects an existing player using case-insensitive trimmed exact matching", () => {
    expect(
      resolveGoalScorer({
        draft: "  joão SILVA ",
        selection: null,
        players,
      }),
    ).toEqual({ type: "select-existing", playerId: "p1" });
  });

  it("asks the caller to create and select a new player on the first submit", () => {
    expect(
      resolveGoalScorer({ draft: "  Ana Dias  ", selection: null, players }),
    ).toEqual({ type: "create-and-select", name: "Ana Dias" });
  });

  it("confirms the selected player only on a subsequent submit without draft text", () => {
    expect(
      resolveGoalScorer({
        draft: "",
        selection: { kind: "player", playerId: "p2" },
        players,
      }),
    ).toEqual({ type: "confirm", playerId: "p2" });
  });

  it("confirms an unassigned goal only after the explicit option is selected", () => {
    expect(
      resolveGoalScorer({
        draft: "",
        selection: { kind: "unassigned" },
        players,
      }),
    ).toEqual({ type: "confirm", playerId: "" });
  });
});
