import { describe, expect, it } from "vitest";
import {
  buildTournamentSharedResult,
  decodeTournamentResult,
  encodeTournamentResult,
  tournamentOgDescription,
  tournamentOgTitle,
} from "./tournament-share";
import type { Tournament } from "./types";

function fixture(): Tournament {
  return {
    id: "t1",
    name: "Torneio do Bairro",
    createdAt: 1,
    teams: [
      {
        id: "l",
        name: "Leões",
        color: "#7CFF4F",
        players: [{ id: "rui", name: "Rui" }],
      },
      {
        id: "a",
        name: "Águias",
        color: "#38BDF8",
        players: [{ id: "ze", name: "Zé" }],
      },
      {
        id: "t",
        name: "Tigres",
        color: "#F59E0B",
        players: [{ id: "ana", name: "Ana" }],
      },
    ],
    config: {
      mode: "always",
      matchLenSec: 420,
      timerMode: "down",
      sound: false,
    },
    matches: [
      {
        id: "m1",
        teamAId: "l",
        teamBId: "a",
        scoreA: 2,
        scoreB: 1,
        outcome: "regA",
        goals: [
          { playerId: "rui", teamId: "l", atSec: 60 },
          { playerId: "ze", teamId: "a", atSec: 120 },
          { playerId: "rui", teamId: "l", atSec: 180 },
        ],
        endedAt: 10,
      },
      {
        id: "m2",
        teamAId: "l",
        teamBId: "t",
        scoreA: 1,
        scoreB: 0,
        outcome: "regA",
        goals: [{ playerId: "ana", teamId: "t", atSec: 90 }],
        endedAt: 20,
      },
      {
        id: "m3",
        teamAId: "a",
        teamBId: "t",
        scoreA: 1,
        scoreB: 0,
        outcome: "regA",
        goals: [{ playerId: "ze", teamId: "a", atSec: 30 }],
        endedAt: 30,
      },
    ],
    queue: [],
    currentPair: null,
    status: "ended",
  };
}

function encodeRaw(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf-8").toString("base64url");
}

function expectInvalidForSharing(tournament: Tournament): void {
  expect(() => encodeTournamentResult(tournament)).toThrow(
    new RangeError("Tournament result payload is invalid for sharing"),
  );
}

function renameFirstTeamId(tournament: Tournament, id: string): void {
  const previousId = tournament.teams[0].id;
  tournament.teams[0].id = id;
  for (const match of tournament.matches) {
    if (match.teamAId === previousId) match.teamAId = id;
    if (match.teamBId === previousId) match.teamBId = id;
    for (const goal of match.goals) {
      if (goal.teamId === previousId) goal.teamId = id;
    }
  }
}

describe("buildTournamentSharedResult", () => {
  it("inclui campeão, classificação compacta e todos os artilheiros empatados", () => {
    expect(buildTournamentSharedResult(fixture())).toEqual({
      name: "Torneio do Bairro",
      teams: [
        { id: "l", n: "Leões", c: "#7CFF4F" },
        { id: "a", n: "Águias", c: "#38BDF8" },
        { id: "t", n: "Tigres", c: "#F59E0B" },
      ],
      s: [
        ["l", 6, 3, 1],
        ["a", 3, 2, 2],
        ["t", 0, 0, 2],
      ],
      top: [
        ["Rui", 2],
        ["Zé", 2],
      ],
    });
  });

  it("preserva todos os artilheiros empatados", () => {
    const tournament = fixture();
    tournament.teams[0].players = Array.from({ length: 101 }, (_, index) => ({
      id: `p${index}`,
      name: `Jogador ${String(index).padStart(3, "0")}`,
    }));
    tournament.matches = [
      {
        id: "m-many",
        teamAId: "l",
        teamBId: "a",
        scoreA: 101,
        scoreB: 0,
        outcome: "regA",
        goals: tournament.teams[0].players.map((player, index) => ({
          playerId: player.id,
          teamId: "l",
          atSec: index,
        })),
        endedAt: 10,
      },
    ];

    expect(buildTournamentSharedResult(tournament).top).toHaveLength(101);
    expect(
      decodeTournamentResult(encodeTournamentResult(tournament))?.top,
    ).toHaveLength(101);
  });
});

describe("tournament share round-trip", () => {
  it("codifica e descodifica o resultado", () => {
    const result = decodeTournamentResult(encodeTournamentResult(fixture()));
    expect(result).toEqual(buildTournamentSharedResult(fixture()));
  });

  it("devolve null para dados inválidos", () => {
    expect(decodeTournamentResult("não-é-válido")).toBeNull();
  });

  it.each([
    null,
    {},
    [],
    { name: "Torneio" },
  ])("rejeita uma shape incompleta: %j", value => {
    expect(decodeTournamentResult(encodeRaw(value))).toBeNull();
  });

  it.each([
    {
      name: "Torneio",
      teams: [{ id: "a", n: "A", c: "#fff" }],
      s: [["desconhecida", 0, 0, 0]],
      top: [],
    },
    {
      name: "Torneio",
      teams: [{ id: "a", n: "A", c: "#fff" }],
      s: [["a", -1, 0, 0]],
      top: [],
    },
    {
      name: "Torneio",
      teams: [{ id: "a", n: "A", c: "#fff" }],
      s: [["a", 0, 0, 0]],
      top: [["Rui", 0]],
    },
    {
      name: "Torneio",
      teams: [
        { id: "a", n: "A", c: "#fff" },
        { id: "a", n: "B", c: "#000" },
      ],
      s: [
        ["a", 0, 0, 0],
        ["a", 0, 0, 0],
      ],
      top: [],
    },
  ])("rejeita tuples e relações inválidas", value => {
    expect(decodeTournamentResult(encodeRaw(value))).toBeNull();
  });

  it("rejeita caracteres, padding e payloads acima do limite", () => {
    const encoded = encodeTournamentResult(fixture());
    expect(decodeTournamentResult(`${encoded}!!!`)).toBeNull();
    expect(decodeTournamentResult(`${encoded}=`)).toBeNull();
    expect(decodeTournamentResult("A".repeat(8193))).toBeNull();
  });

  it("preserva UTF-8 no round-trip", () => {
    const tournament = fixture();
    tournament.name = "Torneio São João ⚽";
    tournament.teams[0].name = "Leões da Sé";

    const result = decodeTournamentResult(encodeTournamentResult(tournament));
    expect(result?.name).toBe("Torneio São João ⚽");
    expect(result?.teams[0].n).toBe("Leões da Sé");
  });

  it("recusa codificar payloads acima do limite", () => {
    const tournament = fixture();
    tournament.teams[0].players = Array.from({ length: 300 }, (_, index) => ({
      id: `p${index}`,
      name: `${String(index).padStart(3, "0")}${"J".repeat(77)}`,
    }));
    tournament.matches = [
      {
        id: "m-large",
        teamAId: "l",
        teamBId: "a",
        scoreA: 300,
        scoreB: 0,
        outcome: "regA",
        goals: tournament.teams[0].players.map((player, index) => ({
          playerId: player.id,
          teamId: "l",
          atSec: index,
        })),
        endedAt: 10,
      },
    ];

    expect(() => encodeTournamentResult(tournament)).toThrow(
      new RangeError("Tournament result payload exceeds share limit"),
    );
  });

  it("aplica simetricamente os limites dos nomes", () => {
    const valid = fixture();
    valid.name = "T".repeat(120);
    valid.teams[0].name = "E".repeat(80);
    valid.teams[0].players[0].name = "J".repeat(80);
    expect(
      decodeTournamentResult(encodeTournamentResult(valid)),
    ).not.toBeNull();

    const longTournament = fixture();
    longTournament.name = "T".repeat(121);
    expectInvalidForSharing(longTournament);

    const longTeam = fixture();
    longTeam.teams[0].name = "E".repeat(81);
    expectInvalidForSharing(longTeam);

    const longScorer = fixture();
    longScorer.teams[0].players[0].name = "J".repeat(81);
    expectInvalidForSharing(longScorer);
  });

  it("aplica simetricamente os limites dos ids", () => {
    const valid = fixture();
    renameFirstTeamId(valid, "i".repeat(120));
    expect(
      decodeTournamentResult(encodeTournamentResult(valid)),
    ).not.toBeNull();

    const invalid = fixture();
    renameFirstTeamId(invalid, "i".repeat(121));
    expectInvalidForSharing(invalid);
  });

  it("aceita entre uma e seis equipas e rejeita cardinalidades externas", () => {
    const one = fixture();
    one.teams = one.teams.slice(0, 1);
    one.matches = [];
    expect(decodeTournamentResult(encodeTournamentResult(one))).not.toBeNull();

    const six = fixture();
    six.matches = [];
    six.teams = Array.from({ length: 6 }, (_, index) => ({
      id: `team-${index}`,
      name: `Equipa ${index}`,
      color: "#123ABC",
      players: [],
    }));
    expect(decodeTournamentResult(encodeTournamentResult(six))).not.toBeNull();

    const zero = fixture();
    zero.teams = [];
    zero.matches = [];
    expectInvalidForSharing(zero);

    const seven = fixture();
    seven.matches = [];
    seven.teams = Array.from({ length: 7 }, (_, index) => ({
      id: `team-${index}`,
      name: `Equipa ${index}`,
      color: "#123ABC",
      players: [],
    }));
    expectInvalidForSharing(seven);
  });

  it("rejeita cores fora do formato hexadecimal", () => {
    const result = buildTournamentSharedResult(fixture());
    result.teams[0].c = "url(javascript:alert(1))";
    expect(decodeTournamentResult(encodeRaw(result))).toBeNull();

    const tournament = fixture();
    tournament.teams[0].color = "red";
    expectInvalidForSharing(tournament);
  });

  it("rejeita artilheiros com contagens inconsistentes", () => {
    const result = buildTournamentSharedResult(fixture());
    result.top[1][1] = result.top[0][1] + 1;
    expect(decodeTournamentResult(encodeRaw(result))).toBeNull();
  });
});

describe("tournamentOgTitle", () => {
  it("identifica o campeão e o torneio", () => {
    expect(tournamentOgTitle(buildTournamentSharedResult(fixture()))).toBe(
      "Leões venceu o Torneio do Bairro · JogaBola",
    );
  });
});

describe("tournamentOgDescription", () => {
  it("destaca todos os artilheiros empatados", () => {
    expect(
      tournamentOgDescription(buildTournamentSharedResult(fixture())),
    ).toBe(
      "Artilheiro: Rui, Zé (2 golos) · 3 equipas · Torneio registado com o Cronómetro JogaBola — sem login.",
    );
  });

  it("omite o artilheiro quando não há golos", () => {
    const tournament = fixture();
    tournament.matches = [];
    expect(
      tournamentOgDescription(buildTournamentSharedResult(tournament)),
    ).toBe(
      "3 equipas · Torneio registado com o Cronómetro JogaBola — sem login.",
    );
  });
});
