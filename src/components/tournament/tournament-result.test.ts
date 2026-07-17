import { describe, expect, it } from "vitest";
import {
  buildTopScorerKeys,
  buildTournamentMetadata,
} from "./tournament-result";
import type { TournamentSharedResult } from "./tournament-share";

const fixture: TournamentSharedResult = {
  name: "Torneio",
  teams: [
    { id: "t1", n: "Leões", c: "#7CFF4F" },
    { id: "t2", n: "Águias", c: "#38BDF8" },
    { id: "t3", n: "Tigres", c: "#FACC15" },
  ],
  s: [
    ["t1", 6, 4, 1],
    ["t2", 3, 2, 2],
    ["t3", 1, 1, 4],
  ],
  top: [["Rui", 3]],
};

describe("buildTournamentMetadata", () => {
  it("builds the exact metadata contract for a valid shared result", () => {
    expect(buildTournamentMetadata(fixture)).toEqual({
      title: "Leões venceu o Torneio · JogaBola",
      description:
        "Artilheiro: Rui (3 golos) · 3 equipas · Torneio registado com o Cronómetro JogaBola — sem login.",
    });
  });

  it("returns the exact fallback title for an invalid result", () => {
    expect(buildTournamentMetadata(null)).toEqual({
      title: "Resultado do torneio · JogaBola",
    });
  });
});

describe("buildTopScorerKeys", () => {
  it("produces stable collision-free keys for duplicate scorer rows", () => {
    expect(
      buildTopScorerKeys([
        ["Rui", 3],
        ["Rui", 3],
        ["Ana", 3],
        ["Rui", 3],
      ]),
    ).toEqual(["Rui:3:1", "Rui:3:2", "Ana:3:1", "Rui:3:3"]);
  });
});
