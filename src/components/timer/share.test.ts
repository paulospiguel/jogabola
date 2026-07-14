import { describe, expect, it } from "vitest";
import {
  buildSharedResult,
  decodeResult,
  encodeResult,
  resultOgDescription,
  resultOgTitle,
  resultText,
} from "./share";
import type { Match } from "./types";
import { createMatch } from "./use-match-store";

function fixture(): Match {
  const m = createMatch(
    "jogo",
    { name: "Leões", color: "#7CFF4F", players: [{ id: "p1", name: "Rui" }] },
    { name: "Águias", color: "#38BDF8", players: [{ id: "p2", name: "Zé" }] },
    { mode: "up", periodLenSec: 1200, periods: 2, sound: false },
  );
  m.events.push(
    {
      id: "e1",
      atSec: 300,
      period: 1,
      type: "goal",
      team: "A",
      playerId: "p1",
    },
    {
      id: "e2",
      atSec: 900,
      period: 1,
      type: "goal",
      team: "B",
      playerId: "p2",
    },
    {
      id: "e3",
      atSec: 1500,
      period: 2,
      type: "goal",
      team: "A",
      playerId: "p1",
    },
  );
  return m;
}

describe("share round-trip", () => {
  it("encodes and decodes a result", () => {
    const r = decodeResult(encodeResult(fixture()));
    expect(r).not.toBeNull();
    expect(r?.sa).toBe(2);
    expect(r?.sb).toBe(1);
  });
});

describe("resultOgTitle", () => {
  it("formats score line with brand", () => {
    const r = buildSharedResult(fixture());
    expect(resultOgTitle(r)).toBe("Leões 2–1 Águias · JogaBola");
  });
});

describe("resultOgDescription", () => {
  it("summarizes goals and brands the tool", () => {
    const r = buildSharedResult(fixture());
    expect(resultOgDescription(r)).toBe(
      "3 golos · Resultado registado ao vivo com o Cronómetro JogaBola — sem login.",
    );
  });

  it("handles zero goals", () => {
    const m = fixture();
    m.events.length = 0;
    const r = buildSharedResult(m);
    expect(resultOgDescription(r)).toBe(
      "Resultado registado ao vivo com o Cronómetro JogaBola — sem login.",
    );
  });
});

describe("resultText signature", () => {
  it("ends with brand attribution line", () => {
    const lines = resultText(fixture()).split("\n");
    expect(lines.at(-1)).toBe("via jogabola.app/timer");
  });
});
