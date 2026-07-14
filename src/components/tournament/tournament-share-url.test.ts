import { describe, expect, it } from "vitest";
import {
  buildTournamentShareUrl,
  canRenderTournamentQr,
} from "./tournament-share-url";
import type { Tournament } from "./types";

function fixture(): Tournament {
  return {
    id: "t1",
    name: "Torneio do Bairro",
    createdAt: 1,
    teams: [
      { id: "a", name: "Águias", color: "#38BDF8", players: [] },
      { id: "b", name: "Bolas", color: "#7CFF4F", players: [] },
      { id: "c", name: "Craques", color: "#F59E0B", players: [] },
    ],
    config: {
      mode: "always",
      matchLenSec: 420,
      timerMode: "down",
      sound: false,
    },
    matches: [],
    queue: [],
    currentPair: null,
    status: "ended",
  };
}

describe("buildTournamentShareUrl", () => {
  it("cria um URL partilhável absoluto para um torneio válido", () => {
    const result = buildTournamentShareUrl("https://jogabola.pt", fixture());

    expect(result.ok).toBe(true);
    if (result.ok) {
      const url = new URL(result.url);
      expect(url.origin).toBe("https://jogabola.pt");
      expect(url.pathname).toBe("/timer/tournament/resultado");
      expect(url.searchParams.get("d")).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it("devolve indisponível quando o resultado não pode ser codificado", () => {
    const tournament = fixture();
    tournament.name = "A".repeat(121);

    expect(buildTournamentShareUrl("https://jogabola.pt", tournament)).toEqual({
      ok: false,
    });
  });
});

describe("canRenderTournamentQr", () => {
  it("aceita o limite conservador de 2800 bytes", () => {
    expect(canRenderTournamentQr("a".repeat(2800))).toBe(true);
  });

  it("rejeita URLs acima do limite conservador", () => {
    expect(canRenderTournamentQr("a".repeat(2801))).toBe(false);
  });

  it("rejeita um URL vazio", () => {
    expect(canRenderTournamentQr("")).toBe(false);
  });

  it("mede bytes UTF-8 em vez de unidades de código", () => {
    expect(canRenderTournamentQr("á".repeat(1400))).toBe(true);
    expect(canRenderTournamentQr("á".repeat(1401))).toBe(false);
  });
});
