import { describe, expect, it } from "vitest";

import type { Match, TeamSide } from "@/components/timer/types";
import {
  createFinalizeTournamentMatch,
  type TournamentMatchRepository,
  withTournamentLock,
} from "./tournament-match-bridge";
import type { Tournament } from "./types";

function tournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "tournament-1",
    createdAt: 1,
    teams: [
      { id: "team-1", name: "Azuis", color: "#00f", players: [] },
      { id: "team-2", name: "Verdes", color: "#0f0", players: [] },
      { id: "team-3", name: "Brancos", color: "#fff", players: [] },
    ],
    config: {
      mode: "always",
      matchLenSec: 300,
      timerMode: "down",
      sound: true,
    },
    matches: [],
    queue: ["team-3"],
    currentPair: ["team-1", "team-2"],
    status: "running",
    ...overrides,
  };
}

function match(events: Match["events"], overrides: Partial<Match> = {}): Match {
  return {
    id: "match-1",
    type: "jogo",
    createdAt: 1,
    teams: {
      A: {
        name: "Azuis",
        color: "#00f",
        players: [
          { id: "p1", name: "Ana" },
          { id: "p-new", name: "Nova" },
        ],
      },
      B: {
        name: "Verdes",
        color: "#0f0",
        players: [{ id: "p2", name: "Bruno" }],
      },
    },
    config: { mode: "down", periodLenSec: 300, periods: 1, sound: true },
    state: {
      status: "ended",
      period: 1,
      accumulatedSec: 300,
      startedAt: null,
      inStoppage: false,
    },
    tournamentContext: {
      tournamentId: "tournament-1",
      teamAId: "team-1",
      teamBId: "team-2",
      queue: ["team-3"],
    },
    events,
    ...overrides,
  };
}

function goal(
  id: string,
  team: TeamSide,
  playerId: string,
  atSec: number,
): Match["events"][number] {
  return { id, team, playerId, atSec, period: 1, type: "goal" };
}

function memoryRepository(initial: Tournament | null): {
  repository: TournamentMatchRepository;
  saved: Tournament[];
} {
  let stored = initial;
  const saved: Tournament[] = [];
  return {
    saved,
    repository: {
      async get(id) {
        return stored?.id === id ? structuredClone(stored) : null;
      },
      async save(value) {
        stored = structuredClone(value);
        saved.push(structuredClone(value));
      },
    },
  };
}

describe("createFinalizeTournamentMatch", () => {
  it("rejects a tournament match without binding context", async () => {
    const { repository } = memoryRepository(tournament());
    const legacy = match([], { tournamentContext: undefined });

    await expect(
      createFinalizeTournamentMatch(repository)(
        "tournament-1",
        legacy,
        "A",
        "coin",
      ),
    ).rejects.toThrow(/context|bound/i);
  });

  it("rejects context bound to another tournament or pair", async () => {
    const { repository } = memoryRepository(tournament());
    const wrong = match([], {
      tournamentContext: {
        tournamentId: "another",
        teamAId: "team-1",
        teamBId: "team-3",
        queue: ["team-2"],
      },
    });

    await expect(
      createFinalizeTournamentMatch(repository)(
        "tournament-1",
        wrong,
        "A",
        "coin",
      ),
    ).rejects.toThrow(/context|bound|pair/i);
  });
  it.each([
    ["A", "regA"],
    ["B", "regB"],
  ] as const)("records a regular %s victory", async (winner, outcome) => {
    const { repository, saved } = memoryRepository(tournament());
    const finalize = createFinalizeTournamentMatch(repository, () => 1234);

    await finalize(
      "tournament-1",
      match([
        goal("g1", "A", "p1", 20),
        ...(winner === "A"
          ? [goal("g2", "A", "p-new", 40)]
          : [goal("g2", "B", "p2", 40), goal("g3", "B", "p2", 50)]),
      ]),
      winner,
    );

    expect(saved[0].matches[0].outcome).toBe(outcome);
    expect(saved[0].matches[0].endedAt).toBe(1234);
  });

  it("does not persist a decision method for a regular result", async () => {
    const { repository, saved } = memoryRepository(tournament());
    await createFinalizeTournamentMatch(repository)(
      "tournament-1",
      match([goal("g1", "A", "p1", 20)]),
      "A",
      "penalties",
    );

    expect(saved[0].matches[0].decisionMethod).toBeUndefined();
  });

  it.each([
    ["A", "decisionA", "coin"],
    ["B", "decisionB", "penalties"],
  ] as const)("records a tied decision for %s", async (winner, outcome, method) => {
    const { repository, saved } = memoryRepository(tournament());
    const finalize = createFinalizeTournamentMatch(repository);

    await finalize(
      "tournament-1",
      match([goal("g1", "A", "p1", 20), goal("g2", "B", "p2", 30)]),
      winner,
      method,
    );

    expect(saved[0].matches[0].outcome).toBe(outcome);
    expect(saved[0].matches[0].decisionMethod).toBe(method);
  });

  it("requires a decision method for a tied match", async () => {
    const { repository } = memoryRepository(tournament());
    await expect(
      createFinalizeTournamentMatch(repository)("tournament-1", match([]), "A"),
    ).rejects.toThrow("decision method");
  });

  it("maps only goal events to tournament team ids and merges players without duplicates", async () => {
    const initial = tournament({
      teams: [
        {
          id: "team-1",
          name: "Azuis",
          color: "#00f",
          players: [{ id: "p1", name: "Ana" }],
        },
        { id: "team-2", name: "Verdes", color: "#0f0", players: [] },
        { id: "team-3", name: "Brancos", color: "#fff", players: [] },
      ],
    });
    const { repository, saved } = memoryRepository(initial);
    const finalize = createFinalizeTournamentMatch(repository, () => 777);
    const liveMatch = match([
      goal("g1", "A", "p1", 12),
      goal("g2", "B", "p2", 34),
      {
        id: "c1",
        team: "A",
        playerId: "p1",
        atSec: 50,
        period: 1,
        type: "card",
        card: "yellow",
      },
    ]);

    await finalize("tournament-1", liveMatch, "A", "coin");

    expect(saved[0].matches[0]).toMatchObject({
      teamAId: "team-1",
      teamBId: "team-2",
      scoreA: 1,
      scoreB: 1,
      endedAt: 777,
      goals: [
        { playerId: "p1", teamId: "team-1", atSec: 12 },
        { playerId: "p2", teamId: "team-2", atSec: 34 },
      ],
    });
    expect(saved[0].teams[0].players).toEqual([
      { id: "p1", name: "Ana" },
      { id: "p-new", name: "Nova" },
    ]);
    expect(saved[0].teams[1].players).toEqual([{ id: "p2", name: "Bruno" }]);
  });

  it("resolves and persists the next pair and queue from appended matches", async () => {
    const { repository, saved } = memoryRepository(tournament());
    const finalize = createFinalizeTournamentMatch(repository);

    await finalize("tournament-1", match([goal("g1", "A", "p1", 12)]), "A");

    expect(saved[0].matches).toHaveLength(1);
    expect(saved[0].currentPair).toEqual(["team-1", "team-3"]);
    expect(saved[0].queue).toEqual(["team-2"]);
  });

  it("is idempotent when a valid match was already finalized", async () => {
    const existing = {
      id: "match-1",
      teamAId: "team-1",
      teamBId: "team-2",
      scoreA: 1,
      scoreB: 0,
      outcome: "regA" as const,
      goals: [{ playerId: "p1", teamId: "team-1", atSec: 12 }],
      endedAt: 1,
    };
    const { repository, saved } = memoryRepository(
      tournament({
        matches: [existing],
        currentPair: ["team-1", "team-3"],
        queue: ["team-2"],
        teams: [
          {
            id: "team-1",
            name: "Azuis",
            color: "#00f",
            players: [
              { id: "p1", name: "Ana" },
              { id: "p-new", name: "Nova" },
            ],
          },
          {
            id: "team-2",
            name: "Verdes",
            color: "#0f0",
            players: [{ id: "p2", name: "Bruno" }],
          },
          { id: "team-3", name: "Brancos", color: "#fff", players: [] },
        ],
      }),
    );
    const finalize = createFinalizeTournamentMatch(repository);

    await expect(
      finalize("tournament-1", match([goal("g1", "A", "p1", 12)]), "A"),
    ).resolves.toBe("tournament-1");
    expect(saved).toHaveLength(0);
  });

  it("uses bound team ids instead of mutable names and colours", async () => {
    const { repository } = memoryRepository(tournament());
    const stale = match([], {
      teams: {
        A: { name: "Antigos", color: "#111", players: [] },
        B: { name: "Outros", color: "#222", players: [] },
      },
    });

    await expect(
      createFinalizeTournamentMatch(repository)(
        "tournament-1",
        stale,
        "A",
        "coin",
      ),
    ).resolves.toBe("tournament-1");
  });

  it("rejects a prior-pair match after the tournament already advanced", async () => {
    const advanced = tournament({
      currentPair: ["team-1", "team-3"],
      queue: ["team-2"],
    });
    const { repository } = memoryRepository(advanced);

    await expect(
      createFinalizeTournamentMatch(repository)(
        "tournament-1",
        match([goal("g1", "A", "p1", 12)], { id: "stale-match" }),
        "A",
      ),
    ).rejects.toThrow(/stale|current pair/i);
  });

  it("repairs an appended match whose pair and queue were not advanced", async () => {
    const existing = {
      id: "match-1",
      teamAId: "team-1",
      teamBId: "team-2",
      scoreA: 1,
      scoreB: 0,
      outcome: "regA" as const,
      goals: [{ playerId: "p1", teamId: "team-1", atSec: 12 }],
      endedAt: 999,
    };
    const { repository, saved } = memoryRepository(
      tournament({ matches: [existing] }),
    );

    await expect(
      createFinalizeTournamentMatch(repository)(
        "tournament-1",
        match([goal("g1", "A", "p1", 12)]),
        "A",
      ),
    ).resolves.toBe("tournament-1");

    expect(saved).toHaveLength(1);
    expect(saved[0].currentPair).toEqual(["team-1", "team-3"]);
    expect(saved[0].queue).toEqual(["team-2"]);
    expect(saved[0].matches).toHaveLength(1);
  });

  it("repairs structurally valid but incorrect topology from the bound queue snapshot", async () => {
    const existing = {
      id: "match-1",
      teamAId: "team-1",
      teamBId: "team-2",
      scoreA: 1,
      scoreB: 0,
      outcome: "regA" as const,
      goals: [{ playerId: "p1", teamId: "team-1", atSec: 12 }],
      endedAt: 999,
    };
    const { repository, saved } = memoryRepository(
      tournament({
        matches: [existing],
        currentPair: ["team-2", "team-3"],
        queue: ["team-1"],
      }),
    );

    await createFinalizeTournamentMatch(repository)(
      "tournament-1",
      match([goal("g1", "A", "p1", 12)]),
      "A",
    );

    expect(saved.at(-1)?.currentPair).toEqual(["team-1", "team-3"]);
    expect(saved.at(-1)?.queue).toEqual(["team-2"]);
  });

  it("serializes concurrent finalization of the same tournament", async () => {
    const { repository, saved } = memoryRepository(tournament());
    const finalize = createFinalizeTournamentMatch(repository, () => 1000);
    const live = match([goal("g1", "A", "p1", 12)]);

    await Promise.all([
      finalize("tournament-1", live, "A"),
      finalize("tournament-1", live, "A"),
    ]);

    expect(saved).toHaveLength(1);
    expect(saved[0].matches.filter(item => item.id === live.id)).toHaveLength(
      1,
    );
  });

  it.each([
    "outcome",
    "goals",
    "players",
  ] as const)("rejects an already advanced match with corrupted %s", async corruption => {
    const existing = {
      id: "match-1",
      teamAId: "team-1",
      teamBId: "team-2",
      scoreA: 1,
      scoreB: 0,
      outcome: (corruption === "outcome" ? "regB" : "regA") as "regA" | "regB",
      goals:
        corruption === "goals"
          ? []
          : [{ playerId: "p1", teamId: "team-1", atSec: 12 }],
      endedAt: 999,
    };
    const stored = tournament({
      matches: [existing],
      currentPair: ["team-1", "team-3"],
      queue: ["team-2"],
      teams: [
        {
          id: "team-1",
          name: "Azuis",
          color: "#00f",
          players:
            corruption === "players"
              ? [{ id: "p1", name: "Ana" }]
              : [
                  { id: "p1", name: "Ana" },
                  { id: "p-new", name: "Nova" },
                ],
        },
        {
          id: "team-2",
          name: "Verdes",
          color: "#0f0",
          players: [{ id: "p2", name: "Bruno" }],
        },
        { id: "team-3", name: "Brancos", color: "#fff", players: [] },
      ],
    });
    const { repository } = memoryRepository(stored);

    await expect(
      createFinalizeTournamentMatch(repository)(
        "tournament-1",
        match([goal("g1", "A", "p1", 12)]),
        "A",
      ),
    ).rejects.toThrow(/corrupt|conflict|invalid|stale/i);
  });

  it("throws when the tournament is missing", async () => {
    const { repository } = memoryRepository(null);
    await expect(
      createFinalizeTournamentMatch(repository)("missing", match([]), "A"),
    ).rejects.toThrow("missing");
  });

  it("throws when the current pair is missing", async () => {
    const { repository } = memoryRepository(tournament({ currentPair: null }));
    await expect(
      createFinalizeTournamentMatch(repository)("tournament-1", match([]), "A"),
    ).rejects.toThrow("current pair");
  });

  it("rejects success when best-effort persistence did not store the update", async () => {
    const initial = tournament();
    const repository: TournamentMatchRepository = {
      async get() {
        return structuredClone(initial);
      },
      async save() {},
    };

    await expect(
      createFinalizeTournamentMatch(repository)(
        "tournament-1",
        match([goal("g1", "A", "p1", 1)]),
        "A",
      ),
    ).rejects.toThrow("persist");
  });

  it("rejects a partial write with stale pair and queue", async () => {
    let stored = tournament();
    const repository: TournamentMatchRepository = {
      async get() {
        return structuredClone(stored);
      },
      async save(value) {
        stored = {
          ...structuredClone(value),
          currentPair: ["team-1", "team-2"],
          queue: ["team-3"],
        };
      },
    };

    await expect(
      createFinalizeTournamentMatch(repository)(
        "tournament-1",
        match([goal("g1", "A", "p1", 1)]),
        "A",
      ),
    ).rejects.toThrow("persist");
  });

  it("rejects when the tournament changes immediately before save", async () => {
    const initial = tournament();
    let reads = 0;
    let saveCalled = false;
    const repository: TournamentMatchRepository = {
      async get() {
        reads += 1;
        return structuredClone(
          reads === 1
            ? initial
            : { ...initial, name: "Alterado noutro separador" },
        );
      },
      async save() {
        saveCalled = true;
      },
    };

    await expect(
      createFinalizeTournamentMatch(repository)(
        "tournament-1",
        match([goal("g1", "A", "p1", 1)]),
        "A",
      ),
    ).rejects.toThrow(/concurrent/i);
    expect(saveCalled).toBe(false);
  });
});

describe("withTournamentLock", () => {
  it("allows different tournament ids to progress in parallel", async () => {
    let active = 0;
    let maxActive = 0;
    const work = async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      active -= 1;
    };

    await Promise.all([
      withTournamentLock("parallel-a", work),
      withTournamentLock("parallel-b", work),
    ]);

    expect(maxActive).toBe(2);
  });

  it("releases the fallback lock when work throws", async () => {
    await expect(
      withTournamentLock("cleanup", async () => {
        throw new Error("expected failure");
      }),
    ).rejects.toThrow("expected failure");

    await expect(
      withTournamentLock("cleanup", async () => "recovered"),
    ).resolves.toBe("recovered");
  });
});
