# Mini-torneio (Tournament) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a "vencedor fica" mini-tournament module on top of the existing `/timer` engine — set up 3-6 teams, run matches back-to-back through the existing live `MatchView`, track standings/top-scorer, and share the final result with dynamic OG.

**Architecture:** A new `tournament` namespace (`src/components/tournament/`) holds pure domain logic (types, engine, standings, draw, share) plus orchestration screens. It reuses the existing 2-team `Match` engine unmodified — `MatchView` gains an optional `?tournament=<id>` query param that branches its end-of-match flow into a small bridge function instead of the standalone summary/share UI. Persistence goes through an async `TournamentRepository` (localStorage-backed today, swappable for Server Actions later without touching any screen).

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · vitest (node env) · framer-motion · lucide-react · react-qr-code · next-intl (existing keys only, no new copy requiring translation — this module is PT-only like the rest of `/timer`)

## Global Constraints

- Route: `/timer/tournament` (hub), `/timer/tournament/[id]` (live view), `/timer/tournament/resultado` (shared result). English folder name, PT-PT visible copy — matches the rest of the repo's routing convention.
- Tailwind Arena tokens only (`bg-arena-*`, `text-arena-*`, `border-arena-*`); no hardcoded hex in JSX except computed/dynamic values (team colors, which are already user-chosen hex strings — same pattern as the existing timer module).
- No login, no server calls — localStorage only, but every read/write goes through the async `TournamentRepository` interface (see Task 1) so a future Postgres/Drizzle swap only touches `tournament-store.ts`.
- Points: win (regular time) = 3, draw = 1 each, decision bonus = +1 to the decision winner. Decision-time goals never count (not stored).
- Standings tie-break order: points → goal difference → goals for → head-to-head (most recent meeting) → name.
- Top scorer tie-break: goals → fewer matches played (by team) → name. Ties show all tied players.
- Winner-stays modes: `"always"` (winner keeps playing) and `"maxTwoInARow"` (winner rests after 2 consecutive wins; both loser and resting winner go to the back of the queue, in that order).
- Minimum 3 teams, maximum 6.
- `timerMode` (regressivo/cronológico) is fixed to `"down"` for tournament matches and not exposed in setup UI — resolved from the spec's open item, YAGNI for v1.
- Conventional commits, one per task, verification before each commit.
- Verification per task: `pnpm test`, `pnpm ts-check`, `pnpm lint` — all exit 0. Final task also runs `pnpm build`.

---

## File Structure

**New — pure domain (`src/components/tournament/`):**
- `types.ts` — all tournament interfaces.
- `tournament-store.ts` — `TournamentRepository` interface, DI-testable factory, localStorage-backed singleton.
- `engine.ts` — `pointsFor`, `winnerOf`, `loserOf`, `initQueue`, `resolveNext`.
- `standings.ts` — `computeStandings`, `computeTopScorers`.
- `draw.ts` — `mulberry32`, `shuffle`, `drawPlayers`.
- `tournament-share.ts` — encode/decode + OG helpers for the final result.

**New — screens/components (`src/components/tournament/`):**
- `tournament-setup-sheet.tsx` — multi-step BottomSheet: teams → config → sorteio.
- `tournament-hub-view.tsx` — list of saved tournaments + "Novo torneio".
- `tournament-view.tsx` — live pairing/queue/standings + ended → champion view.
- `tournament-decision-sheet.tsx` — draw-resolution BottomSheet.
- `tournament-match-bridge.ts` — finalizes a live `Match` into tournament history and advances the queue.
- `tournament-result-view.tsx` — shared/decoded result screen.

**New — routes (`src/app/(public)/timer/tournament/`):**
- `page.tsx` → `TournamentHubView`.
- `[id]/page.tsx` → `TournamentView`.
- `resultado/page.tsx` → `TournamentResultView` + `generateMetadata`.

**Modified:**
- `src/components/timer/setup-drawer.tsx` — export `Stepper` (was module-private; reused by the tournament setup sheet).
- `src/components/timer/match-view.tsx` — tournament-aware end-of-match branching.

**Test files (vitest, `src/components/tournament/*.test.ts`):** `tournament-store.test.ts`, `engine.test.ts`, `standings.test.ts`, `draw.test.ts`, `tournament-share.test.ts`.

---

### Task 1: Types + async repository (DI-testable)

**Files:**
- Create: `src/components/tournament/types.ts`
- Create: `src/components/tournament/tournament-store.ts`
- Test: `src/components/tournament/tournament-store.test.ts`

**Interfaces:**
- Consumes: `Player` from `@/components/timer/types` (existing).
- Produces: `Tournament`, `TournamentTeam`, `TournamentConfig`, `TournamentMatch`, `TournamentGoal`, `WinnerStaysMode`, `MatchOutcome`, `DecisionMethod`, `TournamentStatus` types. `KeyValueStore`, `TournamentRepository` interfaces. `createTournamentRepository(store: KeyValueStore): TournamentRepository`. `tournamentRepository: TournamentRepository` (localStorage-backed singleton) — every later task imports this singleton for real usage.

- [ ] **Step 1: Write `types.ts`**

```ts
import type { Player } from "@/components/timer/types";

export interface TournamentTeam {
  id: string;
  name: string;
  color: string;
  players: Player[];
}

export type WinnerStaysMode = "always" | "maxTwoInARow";

export interface TournamentConfig {
  mode: WinnerStaysMode;
  matchLenSec: number;
  timerMode: "down" | "up";
  sound: boolean;
}

export type MatchOutcome = "regA" | "regB" | "decisionA" | "decisionB";
export type DecisionMethod = "coin" | "penalties";

export interface TournamentGoal {
  playerId: string;
  teamId: string;
  atSec: number;
}

export interface TournamentMatch {
  id: string;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  outcome: MatchOutcome;
  decisionMethod?: DecisionMethod;
  goals: TournamentGoal[];
  endedAt: number;
}

export type TournamentStatus = "setup" | "running" | "ended";

export interface Tournament {
  id: string;
  name?: string;
  createdAt: number;
  teams: TournamentTeam[];
  config: TournamentConfig;
  matches: TournamentMatch[];
  /** Team ids waiting their turn; front of array = next challenger. */
  queue: string[];
  currentPair: [string, string] | null;
  status: TournamentStatus;
}
```

- [ ] **Step 2: Write the failing repository tests**

Create `src/components/tournament/tournament-store.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createTournamentRepository, type KeyValueStore } from "./tournament-store";
import type { Tournament } from "./types";

function memoryStore(): KeyValueStore {
  const m = new Map<string, string>();
  return {
    getItem: key => m.get(key) ?? null,
    setItem: (key, value) => void m.set(key, value),
  };
}

function fixture(id: string, createdAt: number): Tournament {
  return {
    id,
    createdAt,
    teams: [],
    config: { mode: "always", matchLenSec: 600, timerMode: "down", sound: true },
    matches: [],
    queue: [],
    currentPair: null,
    status: "running",
  };
}

describe("tournament repository", () => {
  it("returns empty list when nothing saved", async () => {
    const repo = createTournamentRepository(memoryStore());
    expect(await repo.list()).toEqual([]);
  });

  it("saves and retrieves a tournament by id", async () => {
    const repo = createTournamentRepository(memoryStore());
    await repo.save(fixture("t1", 100));
    expect((await repo.get("t1"))?.id).toBe("t1");
    expect(await repo.get("missing")).toBeNull();
  });

  it("lists tournaments sorted by createdAt descending", async () => {
    const repo = createTournamentRepository(memoryStore());
    await repo.save(fixture("older", 100));
    await repo.save(fixture("newer", 200));
    const list = await repo.list();
    expect(list.map(t => t.id)).toEqual(["newer", "older"]);
  });

  it("updates an existing tournament in place", async () => {
    const repo = createTournamentRepository(memoryStore());
    await repo.save(fixture("t1", 100));
    await repo.save({ ...fixture("t1", 100), status: "ended" });
    const list = await repo.list();
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe("ended");
  });

  it("removes a tournament", async () => {
    const repo = createTournamentRepository(memoryStore());
    await repo.save(fixture("t1", 100));
    await repo.remove("t1");
    expect(await repo.list()).toEqual([]);
  });
});
```

- [ ] **Step 3: Run tests, verify they fail**

Run: `pnpm test -- tournament-store`
Expected: FAIL — `./tournament-store` module not found.

- [ ] **Step 4: Write `tournament-store.ts`**

```ts
import type { Tournament } from "./types";

const K_TOURNAMENTS = "jb_tournaments";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface TournamentRepository {
  list(): Promise<Tournament[]>;
  get(id: string): Promise<Tournament | null>;
  save(t: Tournament): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createTournamentRepository(
  store: KeyValueStore,
): TournamentRepository {
  function readAll(): Tournament[] {
    try {
      const raw = store.getItem(K_TOURNAMENTS);
      return raw ? (JSON.parse(raw) as Tournament[]) : [];
    } catch {
      return [];
    }
  }

  function writeAll(all: Tournament[]): void {
    try {
      store.setItem(K_TOURNAMENTS, JSON.stringify(all));
    } catch {
      /* quota / private mode — ignore */
    }
  }

  return {
    async list() {
      return readAll().sort((a, b) => b.createdAt - a.createdAt);
    },
    async get(id) {
      return readAll().find(t => t.id === id) ?? null;
    },
    async save(t) {
      const all = readAll();
      const idx = all.findIndex(x => x.id === t.id);
      if (idx >= 0) all[idx] = t;
      else all.push(t);
      writeAll(all);
    },
    async remove(id) {
      writeAll(readAll().filter(t => t.id !== id));
    },
  };
}

const localStorageAdapter: KeyValueStore =
  typeof window === "undefined"
    ? { getItem: () => null, setItem: () => {} }
    : window.localStorage;

export const tournamentRepository = createTournamentRepository(localStorageAdapter);
```

- [ ] **Step 5: Run tests, verify they pass**

Run: `pnpm test -- tournament-store`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/tournament/types.ts src/components/tournament/tournament-store.ts src/components/tournament/tournament-store.test.ts
git commit -m "feat(tournament): add domain types and async repository (DI-testable)"
```

---

### Task 2: Engine — points, winner/loser, queue init, winner-stays resolver

**Files:**
- Create: `src/components/tournament/engine.ts`
- Test: `src/components/tournament/engine.test.ts`

**Interfaces:**
- Consumes: `MatchOutcome`, `TournamentMatch`, `WinnerStaysMode` from `./types` (Task 1).
- Produces: `pointsFor(outcome: MatchOutcome): { a: number; b: number }`, `winnerOf(m: TournamentMatch): string`, `loserOf(m: TournamentMatch): string`, `initQueue(teamIds: string[]): { currentPair: [string, string]; queue: string[] }`, `resolveNext(input: { finished: TournamentMatch; queue: string[]; mode: WinnerStaysMode; matches: TournamentMatch[] }): { currentPair: [string, string]; queue: string[] }`. **Contract:** `matches` passed to `resolveNext` must already include `finished` as its last element — callers append before calling. Later tasks (7, 8) rely on `winnerOf`/`loserOf`/`initQueue`/`resolveNext` with these exact signatures.

- [ ] **Step 1: Write the failing tests**

Create `src/components/tournament/engine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { initQueue, loserOf, pointsFor, resolveNext, winnerOf } from "./engine";
import type { TournamentMatch } from "./types";

function match(
  id: string,
  teamAId: string,
  teamBId: string,
  outcome: TournamentMatch["outcome"],
): TournamentMatch {
  return {
    id,
    teamAId,
    teamBId,
    scoreA: 0,
    scoreB: 0,
    outcome,
    goals: [],
    endedAt: 0,
  };
}

describe("pointsFor", () => {
  it("awards 3-0 for a regular-time win", () => {
    expect(pointsFor("regA")).toEqual({ a: 3, b: 0 });
    expect(pointsFor("regB")).toEqual({ a: 0, b: 3 });
  });

  it("awards 2-1 for a decision win (1 draw point + 1 bonus)", () => {
    expect(pointsFor("decisionA")).toEqual({ a: 2, b: 1 });
    expect(pointsFor("decisionB")).toEqual({ a: 1, b: 2 });
  });
});

describe("winnerOf / loserOf", () => {
  it("resolves team A as winner on regA/decisionA", () => {
    const m = match("m1", "t1", "t2", "regA");
    expect(winnerOf(m)).toBe("t1");
    expect(loserOf(m)).toBe("t2");
  });

  it("resolves team B as winner on regB/decisionB", () => {
    const m = match("m1", "t1", "t2", "decisionB");
    expect(winnerOf(m)).toBe("t2");
    expect(loserOf(m)).toBe("t1");
  });
});

describe("initQueue", () => {
  it("pairs the first two teams and queues the rest (3 teams)", () => {
    expect(initQueue(["t1", "t2", "t3"])).toEqual({
      currentPair: ["t1", "t2"],
      queue: ["t3"],
    });
  });

  it("queues the rest with 5 teams", () => {
    expect(initQueue(["t1", "t2", "t3", "t4", "t5"])).toEqual({
      currentPair: ["t1", "t2"],
      queue: ["t3", "t4", "t5"],
    });
  });
});

describe("resolveNext — mode always (3 teams)", () => {
  it("winner keeps playing, loser goes to the back of the queue", () => {
    const m1 = match("m1", "t1", "t2", "regA"); // t1 beats t2
    const r1 = resolveNext({
      finished: m1,
      queue: ["t3"],
      mode: "always",
      matches: [m1],
    });
    expect(r1).toEqual({ currentPair: ["t1", "t3"], queue: ["t2"] });

    const m2 = match("m2", "t1", "t3", "regA"); // t1 beats t3
    const r2 = resolveNext({
      finished: m2,
      queue: r1.queue,
      mode: "always",
      matches: [m1, m2],
    });
    expect(r2).toEqual({ currentPair: ["t1", "t2"], queue: ["t3"] });
  });
});

describe("resolveNext — mode always (4 teams)", () => {
  it("rotates the queue with the winner always challenging the front", () => {
    const m1 = match("m1", "t1", "t2", "regA");
    const r1 = resolveNext({
      finished: m1,
      queue: ["t3", "t4"],
      mode: "always",
      matches: [m1],
    });
    expect(r1).toEqual({ currentPair: ["t1", "t3"], queue: ["t4", "t2"] });
  });
});

describe("resolveNext — mode maxTwoInARow", () => {
  it("forces the winner to rest after 2 consecutive wins", () => {
    const m1 = match("m1", "t1", "t2", "regA"); // t1 win #1
    const r1 = resolveNext({
      finished: m1,
      queue: ["t3"],
      mode: "maxTwoInARow",
      matches: [m1],
    });
    expect(r1).toEqual({ currentPair: ["t1", "t3"], queue: ["t2"] });

    const m2 = match("m2", "t1", "t3", "regA"); // t1 win #2 — must rest now
    const r2 = resolveNext({
      finished: m2,
      queue: r1.queue,
      mode: "maxTwoInARow",
      matches: [m1, m2],
    });
    expect(r2).toEqual({ currentPair: ["t2", "t3"], queue: ["t1"] });

    const m3 = match("m3", "t2", "t3", "regA"); // t2 win #1 (streak resets for t2)
    const r3 = resolveNext({
      finished: m3,
      queue: r2.queue,
      mode: "maxTwoInARow",
      matches: [m1, m2, m3],
    });
    expect(r3).toEqual({ currentPair: ["t2", "t1"], queue: ["t3"] });
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `pnpm test -- engine`
Expected: FAIL — `./engine` module not found.

- [ ] **Step 3: Write `engine.ts`**

```ts
import type { MatchOutcome, TournamentMatch, WinnerStaysMode } from "./types";

export function pointsFor(outcome: MatchOutcome): { a: number; b: number } {
  switch (outcome) {
    case "regA":
      return { a: 3, b: 0 };
    case "regB":
      return { a: 0, b: 3 };
    case "decisionA":
      return { a: 2, b: 1 };
    case "decisionB":
      return { a: 1, b: 2 };
  }
}

export function winnerOf(m: TournamentMatch): string {
  return m.outcome === "regA" || m.outcome === "decisionA" ? m.teamAId : m.teamBId;
}

export function loserOf(m: TournamentMatch): string {
  return m.outcome === "regA" || m.outcome === "decisionA" ? m.teamBId : m.teamAId;
}

export function initQueue(teamIds: string[]): {
  currentPair: [string, string];
  queue: string[];
} {
  const [a, b, ...rest] = teamIds;
  return { currentPair: [a, b], queue: rest };
}

/** Trailing consecutive wins by `teamId`, walking the match history backward. */
function currentStreak(matches: TournamentMatch[], teamId: string): number {
  let streak = 0;
  for (let i = matches.length - 1; i >= 0; i--) {
    if (winnerOf(matches[i]) === teamId) streak++;
    else break;
  }
  return streak;
}

export function resolveNext(input: {
  finished: TournamentMatch;
  queue: string[];
  mode: WinnerStaysMode;
  matches: TournamentMatch[];
}): { currentPair: [string, string]; queue: string[] } {
  const { finished, mode, matches } = input;
  const queue = [...input.queue];
  const winner = winnerOf(finished);
  const loser = loserOf(finished);

  if (mode === "maxTwoInARow" && currentStreak(matches, winner) >= 2) {
    queue.push(loser);
    queue.push(winner);
    const a = queue.shift();
    const b = queue.shift();
    if (!a || !b) throw new Error("Tournament queue exhausted");
    return { currentPair: [a, b], queue };
  }

  const challenger = queue.shift();
  if (!challenger) throw new Error("Tournament queue exhausted");
  queue.push(loser);
  return { currentPair: [winner, challenger], queue };
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `pnpm test -- engine`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/tournament/engine.ts src/components/tournament/engine.test.ts
git commit -m "feat(tournament): add winner-stays engine (points, queue resolver)"
```

---

### Task 3: Standings + top scorers

**Files:**
- Create: `src/components/tournament/standings.ts`
- Test: `src/components/tournament/standings.test.ts`

**Interfaces:**
- Consumes: `pointsFor`, `winnerOf` from `./engine` (Task 2). `Tournament`, `TournamentMatch` from `./types` (Task 1).
- Produces: `TeamStanding { teamId, points, played, wins, gf, ga, gd }`, `computeStandings(t: Tournament): TeamStanding[]`. `ScorerEntry { playerId, name, teamId, goals, matchesPlayed }`, `computeTopScorers(t: Tournament): ScorerEntry[]`. Later tasks (6, 7, 9, 10) render these directly.

- [ ] **Step 1: Write the failing tests**

Create `src/components/tournament/standings.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { computeStandings, computeTopScorers } from "./standings";
import type { Tournament, TournamentMatch } from "./types";

function baseTournament(matches: TournamentMatch[]): Tournament {
  return {
    id: "trn",
    createdAt: 0,
    teams: [
      { id: "t1", name: "Leões", color: "#7CFF4F", players: [{ id: "p1", name: "Rui" }] },
      { id: "t2", name: "Águias", color: "#38BDF8", players: [{ id: "p2", name: "Zé" }] },
      { id: "t3", name: "Tigres", color: "#FACC15", players: [{ id: "p3", name: "Ana" }] },
    ],
    config: { mode: "always", matchLenSec: 600, timerMode: "down", sound: true },
    matches,
    queue: [],
    currentPair: null,
    status: "running",
  };
}

function m(
  id: string,
  teamAId: string,
  teamBId: string,
  scoreA: number,
  scoreB: number,
  outcome: TournamentMatch["outcome"],
  goals: TournamentMatch["goals"] = [],
): TournamentMatch {
  return { id, teamAId, teamBId, scoreA, scoreB, outcome, goals, endedAt: 0 };
}

describe("computeStandings", () => {
  it("returns zeroed rows with no matches", () => {
    const rows = computeStandings(baseTournament([]));
    expect(rows).toHaveLength(3);
    expect(rows.every(r => r.points === 0 && r.played === 0)).toBe(true);
  });

  it("aggregates points across regular and decision outcomes", () => {
    const matches = [
      m("m1", "t1", "t2", 2, 1, "regA"),
      m("m2", "t1", "t3", 1, 1, "decisionB"),
    ];
    const rows = computeStandings(baseTournament(matches));
    const t1 = rows.find(r => r.teamId === "t1");
    const t2 = rows.find(r => r.teamId === "t2");
    const t3 = rows.find(r => r.teamId === "t3");
    expect(t1).toMatchObject({ points: 4, played: 2, wins: 1, gf: 3, ga: 2, gd: 1 });
    expect(t2).toMatchObject({ points: 0, played: 1, wins: 0, gf: 1, ga: 2, gd: -1 });
    expect(t3).toMatchObject({ points: 2, played: 1, wins: 1, gf: 1, ga: 1, gd: 0 });
  });

  it("breaks ties by goal difference", () => {
    const matches = [
      m("m1", "t1", "t2", 3, 0, "regA"),
      m("m2", "t3", "t2", 1, 0, "regA"),
    ];
    // t1: 3 pts, gd +3. t3: 3 pts, gd +1. t1 must rank above t3.
    const rows = computeStandings(baseTournament(matches));
    expect(rows[0].teamId).toBe("t1");
    expect(rows[1].teamId).toBe("t3");
  });

  it("breaks ties by goals for when points and gd are equal", () => {
    const matches = [
      m("m1", "t1", "t2", 2, 0, "regA"),
      m("m2", "t3", "t2", 3, 1, "regA"),
    ];
    // t1: 3 pts, gd +2, gf 2. t3: 3 pts, gd +2, gf 3. t3 ranks above t1.
    const rows = computeStandings(baseTournament(matches));
    expect(rows[0].teamId).toBe("t3");
    expect(rows[1].teamId).toBe("t1");
  });

  it("breaks remaining ties by head-to-head result", () => {
    const matches = [
      // Direct meeting: t1 beats t3 — decides h2h in t1's favor.
      m("m1", "t1", "t3", 1, 0, "regA"),
      // t1 pads its record; t3 catches up on points/gf/ga via t2 so both
      // end tied on points, gf, and gd (t2 stays last, never contends).
      m("m2", "t1", "t2", 2, 1, "regA"),
      m("m3", "t3", "t2", 2, 0, "regA"),
      m("m4", "t3", "t2", 1, 0, "regA"),
    ];
    const rows = computeStandings(baseTournament(matches));
    const t1 = rows.find(r => r.teamId === "t1")!;
    const t3 = rows.find(r => r.teamId === "t3")!;
    expect(t1.points).toBe(t3.points);
    expect(t1.gd).toBe(t3.gd);
    expect(t1.gf).toBe(t3.gf);
    const t1Index = rows.findIndex(r => r.teamId === "t1");
    const t3Index = rows.findIndex(r => r.teamId === "t3");
    expect(t1Index).toBeLessThan(t3Index);
  });
});

describe("computeTopScorers", () => {
  it("aggregates goals per player across matches", () => {
    const matches = [
      m("m1", "t1", "t2", 2, 0, "regA", [
        { playerId: "p1", teamId: "t1", atSec: 60 },
        { playerId: "p1", teamId: "t1", atSec: 300 },
      ]),
      m("m2", "t1", "t3", 1, 0, "regA", [
        { playerId: "p1", teamId: "t1", atSec: 120 },
      ]),
    ];
    const scorers = computeTopScorers(baseTournament(matches));
    expect(scorers[0]).toMatchObject({ playerId: "p1", name: "Rui", goals: 3 });
  });

  it("breaks ties by fewer matches played, then name", () => {
    const matches = [
      m("m1", "t1", "t2", 1, 0, "regA", [{ playerId: "p1", teamId: "t1", atSec: 60 }]),
      m("m2", "t1", "t3", 0, 1, "regB", []),
      m("m3", "t2", "t3", 1, 0, "regA", [{ playerId: "p2", teamId: "t2", atSec: 60 }]),
    ];
    // p1 (t1) has 1 goal in 2 matches played by t1; p2 (t2) has 1 goal in 2 matches played by t2.
    const scorers = computeTopScorers(baseTournament(matches));
    expect(scorers).toHaveLength(2);
    expect(scorers.every(s => s.goals === 1)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `pnpm test -- standings`
Expected: FAIL — `./standings` module not found.

- [ ] **Step 3: Write `standings.ts`**

```ts
import { pointsFor, winnerOf } from "./engine";
import type { Tournament } from "./types";

export interface TeamStanding {
  teamId: string;
  points: number;
  played: number;
  wins: number;
  gf: number;
  ga: number;
  gd: number;
}

export function computeStandings(tournament: Tournament): TeamStanding[] {
  const byId = new Map<string, TeamStanding>();
  for (const team of tournament.teams) {
    byId.set(team.id, {
      teamId: team.id,
      points: 0,
      played: 0,
      wins: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    });
  }

  for (const m of tournament.matches) {
    const pts = pointsFor(m.outcome);
    const a = byId.get(m.teamAId);
    const b = byId.get(m.teamBId);
    if (!a || !b) continue;
    a.points += pts.a;
    b.points += pts.b;
    a.played += 1;
    b.played += 1;
    a.gf += m.scoreA;
    a.ga += m.scoreB;
    b.gf += m.scoreB;
    b.ga += m.scoreA;
    if (winnerOf(m) === a.teamId) a.wins += 1;
    else b.wins += 1;
  }
  for (const s of byId.values()) s.gd = s.gf - s.ga;

  function headToHeadWinner(x: string, y: string): string | null {
    const direct = tournament.matches.filter(
      m => (m.teamAId === x && m.teamBId === y) || (m.teamAId === y && m.teamBId === x),
    );
    if (direct.length === 0) return null;
    return winnerOf(direct[direct.length - 1]);
  }

  return [...byId.values()].sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    if (y.gd !== x.gd) return y.gd - x.gd;
    if (y.gf !== x.gf) return y.gf - x.gf;
    const h2h = headToHeadWinner(x.teamId, y.teamId);
    if (h2h === x.teamId) return -1;
    if (h2h === y.teamId) return 1;
    const nameX = tournament.teams.find(t => t.id === x.teamId)?.name ?? "";
    const nameY = tournament.teams.find(t => t.id === y.teamId)?.name ?? "";
    return nameX.localeCompare(nameY);
  });
}

export interface ScorerEntry {
  playerId: string;
  name: string;
  teamId: string;
  goals: number;
  /** Matches played by the scorer's team — used as a fairness tie-break. */
  matchesPlayed: number;
}

export function computeTopScorers(tournament: Tournament): ScorerEntry[] {
  const goalsByPlayer = new Map<string, { teamId: string; goals: number }>();
  for (const m of tournament.matches) {
    for (const g of m.goals) {
      const entry = goalsByPlayer.get(g.playerId) ?? { teamId: g.teamId, goals: 0 };
      entry.goals += 1;
      goalsByPlayer.set(g.playerId, entry);
    }
  }

  const playedByTeam = new Map<string, number>();
  for (const m of tournament.matches) {
    playedByTeam.set(m.teamAId, (playedByTeam.get(m.teamAId) ?? 0) + 1);
    playedByTeam.set(m.teamBId, (playedByTeam.get(m.teamBId) ?? 0) + 1);
  }

  function nameOf(playerId: string, teamId: string): string {
    const team = tournament.teams.find(t => t.id === teamId);
    return team?.players.find(p => p.id === playerId)?.name ?? "Jogador";
  }

  const entries: ScorerEntry[] = [...goalsByPlayer.entries()].map(([playerId, v]) => ({
    playerId,
    teamId: v.teamId,
    goals: v.goals,
    name: nameOf(playerId, v.teamId),
    matchesPlayed: playedByTeam.get(v.teamId) ?? 0,
  }));

  return entries.sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (a.matchesPlayed !== b.matchesPlayed) return a.matchesPlayed - b.matchesPlayed;
    return a.name.localeCompare(b.name);
  });
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `pnpm test -- standings`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/tournament/standings.ts src/components/tournament/standings.test.ts
git commit -m "feat(tournament): add standings and top-scorer aggregation"
```

---

### Task 4: Draw (sorteio) — deterministic RNG, shuffle, player distribution

**Files:**
- Create: `src/components/tournament/draw.ts`
- Test: `src/components/tournament/draw.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure, generic).
- Produces: `Rng = () => number` (returns `[0,1)`), `mulberry32(seed: number): Rng`, `shuffle<T>(items: T[], rng: Rng): T[]`, `drawPlayers(names: string[], teamCount: number, rng: Rng): string[][]`. Consumed by Task 6 (setup sheet).

- [ ] **Step 1: Write the failing tests**

Create `src/components/tournament/draw.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { drawPlayers, mulberry32, shuffle } from "./draw";

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const seq1 = Array.from({ length: 5 }, () => mulberry32(42)());
    const seq2 = Array.from({ length: 5 }, () => mulberry32(42)());
    // Re-seeding produces the same first draw each time.
    expect(seq1[0]).toBe(seq2[0]);
  });

  it("returns values in [0, 1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 20; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("shuffle", () => {
  it("preserves the same multiset of elements", () => {
    const input = ["a", "b", "c", "d", "e"];
    const out = shuffle(input, mulberry32(1));
    expect([...out].sort()).toEqual([...input].sort());
    expect(out).toHaveLength(input.length);
  });

  it("is deterministic for the same seed", () => {
    const input = ["a", "b", "c", "d", "e"];
    const out1 = shuffle(input, mulberry32(123));
    const out2 = shuffle(input, mulberry32(123));
    expect(out1).toEqual(out2);
  });

  it("does not mutate the input array", () => {
    const input = ["a", "b", "c"];
    const copy = [...input];
    shuffle(input, mulberry32(9));
    expect(input).toEqual(copy);
  });
});

describe("drawPlayers", () => {
  it("distributes every name into exactly one team, round-robin", () => {
    const names = ["Ana", "Beto", "Caio", "Dani", "Eva", "Fábio"];
    const groups = drawPlayers(names, 3, mulberry32(5));
    expect(groups).toHaveLength(3);
    const flat = groups.flat();
    expect(flat).toHaveLength(names.length);
    expect([...flat].sort()).toEqual([...names].sort());
    expect(groups.every(g => g.length === 2)).toBe(true);
  });

  it("is deterministic for the same seed", () => {
    const names = ["Ana", "Beto", "Caio", "Dani"];
    const g1 = drawPlayers(names, 2, mulberry32(77));
    const g2 = drawPlayers(names, 2, mulberry32(77));
    expect(g1).toEqual(g2);
  });

  it("handles uneven distribution (names not divisible by team count)", () => {
    const names = ["Ana", "Beto", "Caio", "Dani", "Eva"];
    const groups = drawPlayers(names, 3, mulberry32(3));
    expect(groups.flat()).toHaveLength(5);
    const sizes = groups.map(g => g.length).sort();
    expect(sizes).toEqual([1, 2, 2]);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `pnpm test -- draw`
Expected: FAIL — `./draw` module not found.

- [ ] **Step 3: Write `draw.ts`**

```ts
export type Rng = () => number;

/** Small deterministic PRNG (mulberry32) — seeded, no external dependency. */
export function mulberry32(seed: number): Rng {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle. Does not mutate `items`. */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Shuffles `names` and distributes them round-robin into `teamCount` groups. */
export function drawPlayers(
  names: string[],
  teamCount: number,
  rng: Rng,
): string[][] {
  const shuffled = shuffle(names, rng);
  const groups: string[][] = Array.from({ length: teamCount }, () => []);
  shuffled.forEach((name, i) => {
    groups[i % teamCount].push(name);
  });
  return groups;
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `pnpm test -- draw`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/tournament/draw.ts src/components/tournament/draw.test.ts
git commit -m "feat(tournament): add seeded RNG, shuffle, and player draw"
```

---

### Task 5: Shareable result — encode/decode + OG helpers

**Files:**
- Create: `src/components/tournament/tournament-share.ts`
- Test: `src/components/tournament/tournament-share.test.ts`

**Interfaces:**
- Consumes: `computeStandings`, `computeTopScorers` from `./standings` (Task 3). `Tournament` from `./types` (Task 1).
- Produces: `TournamentSharedResult { name, teams, s, top }`, `buildTournamentSharedResult(t: Tournament): TournamentSharedResult`, `encodeTournamentResult(t: Tournament): string`, `decodeTournamentResult(data: string): TournamentSharedResult | null`, `tournamentOgTitle(r): string`, `tournamentOgDescription(r): string`. Consumed by Task 9 (champion view) and Task 10 (shared result route).

- [ ] **Step 1: Write the failing tests**

Create `src/components/tournament/tournament-share.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  buildTournamentSharedResult,
  decodeTournamentResult,
  encodeTournamentResult,
  tournamentOgDescription,
  tournamentOgTitle,
} from "./tournament-share";
import type { Tournament, TournamentMatch } from "./types";

function fixture(): Tournament {
  const matches: TournamentMatch[] = [
    {
      id: "m1",
      teamAId: "t1",
      teamBId: "t2",
      scoreA: 2,
      scoreB: 1,
      outcome: "regA",
      goals: [
        { playerId: "p1", teamId: "t1", atSec: 60 },
        { playerId: "p1", teamId: "t1", atSec: 300 },
        { playerId: "p2", teamId: "t2", atSec: 200 },
      ],
      endedAt: 0,
    },
    {
      id: "m2",
      teamAId: "t1",
      teamBId: "t3",
      scoreA: 1,
      scoreB: 0,
      outcome: "regA",
      goals: [{ playerId: "p1", teamId: "t1", atSec: 120 }],
      endedAt: 0,
    },
  ];
  return {
    id: "trn",
    name: "Treino de sábado",
    createdAt: 0,
    teams: [
      { id: "t1", name: "Leões", color: "#7CFF4F", players: [{ id: "p1", name: "Rui" }] },
      { id: "t2", name: "Águias", color: "#38BDF8", players: [{ id: "p2", name: "Zé" }] },
      { id: "t3", name: "Tigres", color: "#FACC15", players: [{ id: "p3", name: "Ana" }] },
    ],
    config: { mode: "always", matchLenSec: 600, timerMode: "down", sound: true },
    matches,
    queue: [],
    currentPair: null,
    status: "ended",
  };
}

describe("buildTournamentSharedResult", () => {
  it("orders teams by standing and lists the top scorer", () => {
    const r = buildTournamentSharedResult(fixture());
    expect(r.name).toBe("Treino de sábado");
    expect(r.s[0][0]).toBe("t1"); // champion first
    expect(r.top).toEqual([["Rui", 3]]);
  });
});

describe("round-trip", () => {
  it("encodes and decodes without loss", () => {
    const r = buildTournamentSharedResult(fixture());
    const decoded = decodeTournamentResult(encodeTournamentResult(fixture()));
    expect(decoded).toEqual(r);
  });

  it("returns null for invalid data", () => {
    expect(decodeTournamentResult("not-valid-base64url!!")).toBeNull();
  });
});

describe("OG helpers", () => {
  it("titles with the champion name", () => {
    const r = buildTournamentSharedResult(fixture());
    expect(tournamentOgTitle(r)).toBe("Leões venceu o Treino de sábado · JogaBola");
  });

  it("describes team count and top scorer", () => {
    const r = buildTournamentSharedResult(fixture());
    expect(tournamentOgDescription(r)).toBe(
      "Artilheiro: Rui (3 golos) · 3 equipas · Torneio registado com o Cronómetro JogaBola — sem login.",
    );
  });

  it("omits the scorer clause when nobody scored", () => {
    const t = fixture();
    for (const m of t.matches) m.goals = [];
    const r = buildTournamentSharedResult(t);
    expect(tournamentOgDescription(r)).toBe(
      "3 equipas · Torneio registado com o Cronómetro JogaBola — sem login.",
    );
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `pnpm test -- tournament-share`
Expected: FAIL — `./tournament-share` module not found.

- [ ] **Step 3: Write `tournament-share.ts`**

```ts
import { computeStandings, computeTopScorers } from "./standings";
import type { Tournament } from "./types";

export interface TournamentSharedResult {
  name: string;
  teams: Array<{ id: string; n: string; c: string }>;
  /** standing rows in final order: [teamId, points, goalsFor, goalsAgainst] */
  s: Array<[string, number, number, number]>;
  /** top scorers (all tied at the max): [name, goals] */
  top: Array<[string, number]>;
}

function b64urlEncode(str: string): string {
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(str, "utf-8").toString("base64")
      : window.btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return typeof window === "undefined"
    ? Buffer.from(b64, "base64").toString("utf-8")
    : decodeURIComponent(escape(window.atob(b64)));
}

export function buildTournamentSharedResult(t: Tournament): TournamentSharedResult {
  const standings = computeStandings(t);
  const scorers = computeTopScorers(t);
  const topGoals = scorers[0]?.goals ?? 0;
  const top: TournamentSharedResult["top"] = scorers
    .filter(s => s.goals > 0 && s.goals === topGoals)
    .map(s => [s.name, s.goals]);
  return {
    name: t.name ?? "Torneio",
    teams: t.teams.map(team => ({ id: team.id, n: team.name, c: team.color })),
    s: standings.map(row => [row.teamId, row.points, row.gf, row.ga]),
    top,
  };
}

export function encodeTournamentResult(t: Tournament): string {
  return b64urlEncode(JSON.stringify(buildTournamentSharedResult(t)));
}

export function decodeTournamentResult(data: string): TournamentSharedResult | null {
  try {
    return JSON.parse(b64urlDecode(data)) as TournamentSharedResult;
  } catch {
    return null;
  }
}

export function tournamentOgTitle(r: TournamentSharedResult): string {
  const champion = r.teams.find(team => team.id === r.s[0]?.[0]);
  return champion ? `${champion.n} venceu o ${r.name} · JogaBola` : `${r.name} · JogaBola`;
}

export function tournamentOgDescription(r: TournamentSharedResult): string {
  const base = `${r.teams.length} equipas · Torneio registado com o Cronómetro JogaBola — sem login.`;
  if (r.top.length === 0) return base;
  const plural = r.top[0][1] === 1 ? "golo" : "golos";
  const names = r.top.map(([n]) => n).join(", ");
  return `Artilheiro: ${names} (${r.top[0][1]} ${plural}) · ${base}`;
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `pnpm test -- tournament-share`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/tournament/tournament-share.ts src/components/tournament/tournament-share.test.ts
git commit -m "feat(tournament): add shareable result encode/decode and OG helpers"
```

---

### Task 6: Setup sheet + hub page

**Files:**
- Modify: `src/components/timer/setup-drawer.tsx` — export the existing `Stepper` function (one-word change).
- Create: `src/components/tournament/tournament-setup-sheet.tsx`
- Create: `src/components/tournament/tournament-hub-view.tsx`
- Create: `src/app/(public)/timer/tournament/page.tsx`

**Interfaces:**
- Consumes: `Stepper` from `@/components/timer/setup-drawer` (this task). `TEAM_COLORS`, `onColor` from `@/components/timer/team-color`. `loadTeams` from `@/components/timer/use-match-store`. `uid` from `@/components/timer/format`. `Player` from `@/components/timer/types`. `mulberry32`, `shuffle`, `drawPlayers` from `./draw` (Task 4). `initQueue` from `./engine` (Task 2). `tournamentRepository` from `./tournament-store` (Task 1). `Tournament`, `TournamentConfig`, `TournamentTeam`, `WinnerStaysMode` from `./types` (Task 1).
- Produces: `TournamentSetupSheet({ onClose }): JSX`, `TournamentHubView(): JSX` — consumed by the route file in this task and (hub only) unchanged afterward.

- [ ] **Step 1: Export `Stepper`**

In `src/components/timer/setup-drawer.tsx`, change:

```ts
function Stepper({
```

to:

```ts
export function Stepper({
```

- [ ] **Step 2: Write `tournament-setup-sheet.tsx`**

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { uid } from "@/components/timer/format";
import { Stepper } from "@/components/timer/setup-drawer";
import { onColor, TEAM_COLORS } from "@/components/timer/team-color";
import type { Player } from "@/components/timer/types";
import { loadTeams } from "@/components/timer/use-match-store";
import { drawPlayers, mulberry32, shuffle } from "./draw";
import { initQueue } from "./engine";
import { tournamentRepository } from "./tournament-store";
import type {
  Tournament,
  TournamentConfig,
  TournamentTeam,
  WinnerStaysMode,
} from "./types";

const MIN_TEAMS = 3;
const MAX_TEAMS = 6;

function blankTeam(index: number): TournamentTeam {
  return {
    id: uid(),
    name: `Equipa ${index + 1}`,
    color: TEAM_COLORS[index % TEAM_COLORS.length],
    players: [],
  };
}

function parseNames(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map(s => s.trim())
    .filter(Boolean);
}

function TeamCard({
  team,
  onChange,
  onRemove,
  removable,
}: {
  team: TournamentTeam;
  onChange: (t: TournamentTeam) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  const [draft, setDraft] = useState("");
  const saved = loadTeams();

  function addPlayer() {
    const name = draft.trim();
    if (!name) return;
    const p: Player = { id: uid(), name };
    onChange({ ...team, players: [...team.players, p] });
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3">
      <div className="flex items-center gap-2">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold"
          style={{ background: team.color, color: onColor(team.color) }}
        >
          {team.name.slice(0, 1).toUpperCase()}
        </span>
        <input
          value={team.name}
          onChange={e => onChange({ ...team, name: e.target.value })}
          className="h-10 flex-1 rounded-[10px] border border-arena-border bg-arena-surface-el px-3 text-sm font-semibold text-arena-text outline-none focus:border-arena-primary"
          placeholder="Nome da equipa"
        />
        {removable && (
          <button
            type="button"
            aria-label="Remover equipa"
            onClick={onRemove}
            className="shrink-0 rounded-lg p-2 text-arena-text-muted hover:text-arena-danger"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TEAM_COLORS.map(c => (
          <button
            key={c}
            type="button"
            aria-label={`Cor ${c}`}
            onClick={() => onChange({ ...team, color: c })}
            className="size-7 rounded-full ring-2 ring-offset-2 ring-offset-arena-surface transition"
            style={{
              background: c,
              boxShadow: team.color === c ? `0 0 0 2px ${c}` : "none",
              outline: team.color === c ? "2px solid #fff" : "none",
            }}
          />
        ))}
      </div>

      {saved.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {saved.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                onChange({
                  ...team,
                  name: s.name,
                  color: s.color,
                  players: s.players.map(p => ({ ...p })),
                })
              }
              className="rounded-full border border-arena-border bg-arena-surface-el px-2.5 py-1 text-xs font-semibold text-arena-text-sec hover:border-arena-primary"
            >
              {s.name} · {s.players.length}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPlayer();
            }
          }}
          className="h-10 flex-1 rounded-[10px] border border-arena-border bg-arena-surface-el px-3 text-sm text-arena-text outline-none focus:border-arena-primary"
          placeholder="Adicionar jogador"
        />
        <button
          type="button"
          onClick={addPlayer}
          className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-arena-primary text-arena-bg"
          aria-label="Adicionar jogador"
        >
          <Plus size={18} />
        </button>
      </div>

      {team.players.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {team.players.map(p => (
            <span
              key={p.id}
              className="flex items-center gap-1 rounded-full bg-arena-surface-el px-2.5 py-1 text-xs font-semibold text-arena-text"
            >
              {p.name}
              <button
                type="button"
                aria-label={`Remover ${p.name}`}
                onClick={() =>
                  onChange({
                    ...team,
                    players: team.players.filter(x => x.id !== p.id),
                  })
                }
                className="text-arena-text-muted hover:text-arena-danger"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TournamentSetupSheet({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [teams, setTeams] = useState<TournamentTeam[]>(() => [
    blankTeam(0),
    blankTeam(1),
    blankTeam(2),
  ]);
  const [mode, setMode] = useState<WinnerStaysMode>("always");
  const [minutes, setMinutes] = useState(10);
  const [sound, setSound] = useState(true);
  const [drawNames, setDrawNames] = useState("");
  const [shuffleStart, setShuffleStart] = useState(false);

  const titles = ["Equipas", "Configuração", "Sorteio"];

  function updateTeam(index: number, next: TournamentTeam) {
    setTeams(prev => prev.map((t, i) => (i === index ? next : t)));
  }

  function addTeam() {
    if (teams.length >= MAX_TEAMS) return;
    setTeams(prev => [...prev, blankTeam(prev.length)]);
  }

  function removeTeam(index: number) {
    if (teams.length <= MIN_TEAMS) return;
    setTeams(prev => prev.filter((_, i) => i !== index));
  }

  function applyDraw() {
    const names = parseNames(drawNames);
    if (names.length === 0) return;
    const rng = mulberry32(Date.now());
    const groups = drawPlayers(names, teams.length, rng);
    setTeams(prev =>
      prev.map((t, i) => ({
        ...t,
        players: groups[i].map(name => ({ id: uid(), name })),
      })),
    );
  }

  async function finish() {
    const rng = mulberry32(Date.now());
    const order = shuffleStart ? shuffle(teams, rng) : teams;
    const { currentPair, queue } = initQueue(order.map(t => t.id));
    const config: TournamentConfig = {
      mode,
      matchLenSec: minutes * 60,
      timerMode: "down",
      sound,
    };
    const tournament: Tournament = {
      id: uid(),
      createdAt: Date.now(),
      teams: order,
      config,
      matches: [],
      queue,
      currentPair,
      status: "running",
    };
    await tournamentRepository.save(tournament);
    onClose();
    router.push(`/timer/tournament/${tournament.id}`);
  }

  return (
    <BottomSheet onClose={onClose} title={`Novo torneio · ${titles[step]}`}>
      <div className="flex flex-col gap-4 overflow-y-auto pb-1">
        <div className="flex justify-center gap-1.5">
          {titles.map((t, i) => (
            <span
              key={t}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 22 : 8,
                background:
                  i <= step ? "var(--color-arena-primary)" : "var(--color-arena-border)",
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="flex flex-col gap-3"
            >
              {teams.map((team, i) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onChange={next => updateTeam(i, next)}
                  onRemove={() => removeTeam(i)}
                  removable={teams.length > MIN_TEAMS}
                />
              ))}
              {teams.length < MAX_TEAMS && (
                <button
                  type="button"
                  onClick={addTeam}
                  className="flex items-center justify-center gap-2 rounded-[14px] border border-arena-border border-dashed py-3 text-sm font-bold text-arena-text-sec"
                >
                  <Plus size={16} /> Equipa
                </button>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    ["always", "Vencedora fica sempre", "Continua até perder"],
                    ["maxTwoInARow", "Máx. 2 jogos seguidos", "Descansa após 2 vitórias"],
                  ] as const
                ).map(([m, label, hint]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className="flex flex-col gap-0.5 rounded-[14px] border p-3 text-left transition-colors"
                    style={{
                      borderColor:
                        mode === m ? "var(--color-arena-primary)" : "var(--color-arena-border)",
                      background:
                        mode === m ? "rgba(124,255,79,.12)" : "var(--color-arena-surface)",
                    }}
                  >
                    <span className="text-sm font-bold text-arena-text">{label}</span>
                    <span className="text-xs text-arena-text-muted">{hint}</span>
                  </button>
                ))}
              </div>

              <Stepper
                label="Duração da partida"
                value={minutes}
                suffix="min"
                min={1}
                max={60}
                step={1}
                onChange={setMinutes}
              />

              <button
                type="button"
                onClick={() => setSound(s => !s)}
                className="flex items-center justify-between rounded-[12px] border border-arena-border bg-arena-surface px-3 py-2.5"
              >
                <span className="text-sm font-semibold text-arena-text">Som + vibração</span>
                <span
                  className="relative h-6 w-11 rounded-full transition-colors"
                  style={{
                    background: sound
                      ? "var(--color-arena-primary)"
                      : "var(--color-arena-border)",
                  }}
                >
                  <span
                    className="absolute top-0.5 size-5 rounded-full bg-white transition-all"
                    style={{ left: sound ? 22 : 2 }}
                  />
                </span>
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-arena-text">
                  Sortear jogadores pelas equipas
                </span>
                <textarea
                  value={drawNames}
                  onChange={e => setDrawNames(e.target.value)}
                  placeholder="Um nome por linha ou separados por vírgula"
                  rows={4}
                  className="rounded-[10px] border border-arena-border bg-arena-surface-el px-3 py-2 text-sm text-arena-text outline-none focus:border-arena-primary"
                />
                <Cta variant="secondary" size="sm" onClick={applyDraw}>
                  Distribuir pelas equipas
                </Cta>
              </div>

              <button
                type="button"
                onClick={() => setShuffleStart(s => !s)}
                className="flex items-center justify-between rounded-[12px] border border-arena-border bg-arena-surface px-3 py-2.5"
              >
                <span className="text-sm font-semibold text-arena-text">Sortear quem começa</span>
                <span
                  className="relative h-6 w-11 rounded-full transition-colors"
                  style={{
                    background: shuffleStart
                      ? "var(--color-arena-primary)"
                      : "var(--color-arena-border)",
                  }}
                >
                  <span
                    className="absolute top-0.5 size-5 rounded-full bg-white transition-all"
                    style={{ left: shuffleStart ? 22 : 2 }}
                  />
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 pt-1">
          {step > 0 && (
            <Cta variant="secondary" onClick={() => setStep(s => s - 1)} className="flex-1">
              Voltar
            </Cta>
          )}
          {step < 2 ? (
            <Cta onClick={() => setStep(s => s + 1)} className="flex-1">
              Continuar
            </Cta>
          ) : (
            <Cta onClick={finish} className="flex-1">
              Criar torneio
            </Cta>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
```

- [ ] **Step 3: Write `tournament-hub-view.tsx`**

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { TournamentSetupSheet } from "./tournament-setup-sheet";
import { tournamentRepository } from "./tournament-store";
import type { Tournament } from "./types";

const STATUS_LABEL: Record<Tournament["status"], { label: string; cls: string }> = {
  setup: { label: "Por começar", cls: "bg-arena-surface-el text-arena-text-muted" },
  running: { label: "A decorrer", cls: "bg-arena-primary/15 text-arena-primary" },
  ended: { label: "Terminado", cls: "bg-arena-surface-el text-arena-text-sec" },
};

function TournamentCard({
  tournament,
  onOpen,
}: {
  tournament: Tournament;
  onOpen: () => void;
}) {
  const st = STATUS_LABEL[tournament.status];
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={onOpen}
      className="flex items-center gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3 text-left transition-colors hover:border-arena-primary/40 hover:bg-arena-surface-el"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-arena-surface-el text-base">
        🏆
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-bold text-arena-text">
          {tournament.teams.map(t => t.name).join(" · ")}
        </span>
        <span className={`mt-1 w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>
          {st.label}
        </span>
      </div>
    </motion.button>
  );
}

export function TournamentHubView() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [setupOpen, setSetupOpen] = useState(false);

  useEffect(() => {
    tournamentRepository.list().then(setTournaments);
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-4 pb-10">
      <header className="flex items-center justify-between pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-arena-primary/15 ring-1 ring-arena-primary/40">
            <Trophy size={20} className="text-arena-primary" />
          </span>
          <div className="flex flex-col">
            <h1 className="font-sora text-lg font-extrabold leading-none text-arena-text">
              Torneios
            </h1>
            <span className="text-xs text-arena-text-sec">Mini-torneios recreativos</span>
          </div>
        </div>
        <Logo variant="white" size="header" />
      </header>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setSetupOpen(true)}
        className="flex items-center justify-center gap-2 rounded-[16px] bg-arena-primary py-4 font-extrabold text-arena-bg shadow-[0_0_32px_rgba(124,255,79,.18)]"
      >
        <Plus size={20} /> Novo torneio
      </motion.button>

      <section className="mt-7 flex flex-col gap-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
          Torneios
        </h2>
        {tournaments.length === 0 ? (
          <div className="rounded-[16px] border border-arena-border border-dashed bg-arena-surface/40 px-4 py-10 text-center">
            <span className="text-3xl">🏆</span>
            <p className="mt-2 text-sm font-semibold text-arena-text">Sem torneios ainda</p>
            <p className="mt-1 text-xs text-arena-text-muted">
              Cria o primeiro torneio acima.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tournaments.map(t => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onOpen={() => router.push(`/timer/tournament/${t.id}`)}
              />
            ))}
          </AnimatePresence>
        )}
      </section>

      {setupOpen && <TournamentSetupSheet onClose={() => setSetupOpen(false)} />}
    </div>
  );
}
```

- [ ] **Step 4: Write the route**

Create `src/app/(public)/timer/tournament/page.tsx`:

```tsx
import { TournamentHubView } from "@/components/tournament/tournament-hub-view";

export default function TournamentHubPage() {
  return <TournamentHubView />;
}
```

- [ ] **Step 5: Verify — types, lint, and a manual browser check**

Run: `pnpm ts-check && pnpm lint`
Expected: exit 0 (both).

Dev server already running (or `pnpm dev`). Open `http://localhost:3000/timer/tournament` in the browser:
- Empty state renders ("Sem torneios ainda").
- "Novo torneio" opens the sheet at step "Equipas" with 3 pre-filled teams.
- Add a 4th team, remove it, confirm it goes back to 3 and the remove button disappears at 3 teams.
- Type a player name + Enter in one team, confirm the chip appears.
- Step to "Configuração", toggle mode, change minutes.
- Step to "Sorteio", type 6 comma-separated names, tap "Distribuir pelas equipas", confirm each team now shows 2 players.
- Tap "Criar torneio" — confirm navigation to `/timer/tournament/<id>` (will 404 until Task 7 exists; that's expected at this point — just confirm the URL is right and localStorage now has the tournament under key `jb_tournaments`, checkable via DevTools → Application → Local Storage).

- [ ] **Step 6: Commit**

```bash
git add src/components/timer/setup-drawer.tsx src/components/tournament/tournament-setup-sheet.tsx src/components/tournament/tournament-hub-view.tsx "src/app/(public)/timer/tournament/page.tsx"
git commit -m "feat(tournament): add setup wizard and hub page"
```

---

### Task 7: Tournament view — pairing, queue, live standings

**Files:**
- Create: `src/components/tournament/tournament-view.tsx`
- Create: `src/app/(public)/timer/tournament/[id]/page.tsx`

**Interfaces:**
- Consumes: `tournamentRepository` from `./tournament-store` (Task 1). `computeStandings` from `./standings` (Task 3). `Tournament`, `TournamentTeam` from `./types` (Task 1). `createMatch`, `upsertMatch` from `@/components/timer/use-match-store`. `onColor` from `@/components/timer/team-color`. `Logo` from `@/components/logo`.
- Produces: `TournamentView({ id }): JSX`, `StandingsTable({ tournament }): JSX` (exported for reuse in Task 9). Route target `/timer/jogo/<matchId>?tournament=<id>` — consumed by Task 8's search-param handling.

- [ ] **Step 1: Write `tournament-view.tsx`**

```tsx
"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Cta } from "@/components/arena/cta";
import { Logo } from "@/components/logo";
import { onColor } from "@/components/timer/team-color";
import { createMatch, upsertMatch } from "@/components/timer/use-match-store";
import { computeStandings } from "./standings";
import { tournamentRepository } from "./tournament-store";
import type { Tournament, TournamentTeam } from "./types";

function teamById(tournament: Tournament, id: string): TournamentTeam {
  const team = tournament.teams.find(t => t.id === id);
  if (!team) throw new Error(`Team ${id} not found in tournament ${tournament.id}`);
  return team;
}

export function StandingsTable({ tournament }: { tournament: Tournament }) {
  const rows = computeStandings(tournament);
  return (
    <div className="flex flex-col gap-1.5 rounded-[16px] border border-arena-border bg-arena-surface p-3">
      <div className="grid grid-cols-[1fr_2.5rem_2.5rem_2.5rem] gap-1 px-1 text-[10px] font-bold uppercase tracking-wide text-arena-text-muted">
        <span>Equipa</span>
        <span className="text-center">Pts</span>
        <span className="text-center">SG</span>
        <span className="text-center">J</span>
      </div>
      {rows.map(row => {
        const team = teamById(tournament, row.teamId);
        return (
          <div
            key={row.teamId}
            className="grid grid-cols-[1fr_2.5rem_2.5rem_2.5rem] items-center gap-1 rounded-[10px] bg-arena-surface-el px-2 py-1.5"
          >
            <span className="flex items-center gap-1.5 truncate text-xs font-bold text-arena-text">
              <span className="size-2 shrink-0 rounded-full" style={{ background: team.color }} />
              {team.name}
            </span>
            <span className="text-center font-sora text-sm font-extrabold tabular-nums text-arena-text">
              {row.points}
            </span>
            <span className="text-center text-xs tabular-nums text-arena-text-sec">
              {row.gd > 0 ? `+${row.gd}` : row.gd}
            </span>
            <span className="text-center text-xs tabular-nums text-arena-text-sec">
              {row.played}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function TournamentView({ id }: { id: string }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined);

  useEffect(() => {
    tournamentRepository.get(id).then(setTournament);
  }, [id]);

  if (tournament === undefined) return null;

  if (tournament === null) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-3 px-4">
        <p className="text-sm text-arena-text-sec">Torneio não encontrado.</p>
        <Cta onClick={() => router.push("/timer/tournament")}>Voltar ao início</Cta>
      </div>
    );
  }

  function startMatch() {
    if (!tournament?.currentPair) return;
    const [aId, bId] = tournament.currentPair;
    const teamA = teamById(tournament, aId);
    const teamB = teamById(tournament, bId);
    const match = createMatch(
      "jogo",
      { name: teamA.name, color: teamA.color, players: teamA.players },
      { name: teamB.name, color: teamB.color, players: teamB.players },
      {
        mode: tournament.config.timerMode,
        periodLenSec: tournament.config.matchLenSec,
        periods: 1,
        sound: tournament.config.sound,
      },
    );
    upsertMatch(match);
    router.push(`/timer/jogo/${match.id}?tournament=${tournament.id}`);
  }

  async function endTournament() {
    if (!tournament) return;
    const ended: Tournament = { ...tournament, status: "ended" };
    await tournamentRepository.save(ended);
    setTournament(ended);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-4 px-4 pb-10">
      <header className="flex items-center justify-between pt-5">
        <button
          type="button"
          aria-label="Voltar"
          onClick={() => router.push("/timer/tournament")}
          className="grid size-9 place-items-center rounded-lg border border-arena-border bg-arena-surface text-arena-text-sec"
        >
          <ChevronLeft size={18} />
        </button>
        <Logo variant="white" size="header" />
        <span className="w-9" />
      </header>

      {tournament.status === "ended" ? (
        <div className="flex flex-col gap-4">
          <p className="text-center text-sm font-bold text-arena-text">Torneio terminado</p>
          <StandingsTable tournament={tournament} />
        </div>
      ) : (
        <>
          {tournament.currentPair && (
            <div className="flex items-center justify-center gap-4 rounded-[18px] border border-arena-border bg-arena-surface py-6">
              {tournament.currentPair.map(tid => {
                const team = teamById(tournament, tid);
                return (
                  <div key={tid} className="flex flex-col items-center gap-1.5">
                    <span
                      className="grid size-11 place-items-center rounded-xl text-base font-extrabold"
                      style={{ background: team.color, color: onColor(team.color) }}
                    >
                      {team.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="max-w-[88px] truncate text-sm font-bold text-arena-text-sec">
                      {team.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {tournament.queue.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
                Fila de espera
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {tournament.queue.map(tid => {
                  const team = teamById(tournament, tid);
                  return (
                    <span
                      key={tid}
                      className="flex items-center gap-1.5 rounded-full bg-arena-surface-el px-2.5 py-1 text-xs font-semibold text-arena-text"
                    >
                      <span className="size-2 rounded-full" style={{ background: team.color }} />
                      {team.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <Cta fullWidth onClick={startMatch}>
            Iniciar partida
          </Cta>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
              Classificação
            </h2>
            <StandingsTable tournament={tournament} />
          </div>

          {tournament.matches.length > 0 && (
            <Cta variant="secondary" fullWidth onClick={endTournament}>
              Terminar torneio
            </Cta>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the route**

Create `src/app/(public)/timer/tournament/[id]/page.tsx`:

```tsx
import { TournamentView } from "@/components/tournament/tournament-view";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TournamentView id={id} />;
}
```

- [ ] **Step 3: Verify**

Run: `pnpm ts-check && pnpm lint`
Expected: exit 0 (both).

In the browser, resume the tournament created at the end of Task 6 (or create a new one): open `/timer/tournament/<id>`.
- Current pair renders with team initials/colors.
- Queue renders remaining teams as chips.
- Standings table shows all teams at 0 pts.
- "Iniciar partida" navigates to `/timer/jogo/<matchId>?tournament=<id>` (the match screen renders — Task 8 hasn't wired the tournament-aware ending yet, so ending the match here still falls back to the standalone summary at this point; that's expected until Task 8 lands).
- "Terminar torneio" is hidden until at least one match exists in `tournament.matches` (won't show yet — verify it's absent).

- [ ] **Step 4: Commit**

```bash
git add src/components/tournament/tournament-view.tsx "src/app/(public)/timer/tournament/[id]/page.tsx"
git commit -m "feat(tournament): add tournament view with pairing, queue, and standings"
```

---

### Task 8: MatchView tournament integration + decision sheet

**Files:**
- Create: `src/components/tournament/tournament-decision-sheet.tsx`
- Create: `src/components/tournament/tournament-match-bridge.ts`
- Modify: `src/components/timer/match-view.tsx`

**Interfaces:**
- Consumes: `resolveNext` from `@/components/tournament/engine` (Task 2). `tournamentRepository` from `@/components/tournament/tournament-store` (Task 1). `Tournament`, `TournamentMatch`, `MatchOutcome` from `@/components/tournament/types` (Task 1). `Match`, `TeamSide`, `Team` from `@/components/timer/types` (existing). `onColor` from `@/components/timer/team-color` (existing).
- Produces: `finalizeTournamentMatch(tournamentId: string, match: Match, winnerSide: TeamSide): Promise<string>` (resolves to the tournament id, for navigation). `TournamentDecisionSheet({ teamA, teamB, onChoose }): JSX`. Both consumed only by `match-view.tsx` in this task.

- [ ] **Step 1: Write `tournament-decision-sheet.tsx`**

```tsx
"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { onColor } from "@/components/timer/team-color";
import type { Team, TeamSide } from "@/components/timer/types";

export function TournamentDecisionSheet({
  teamA,
  teamB,
  onChoose,
}: {
  teamA: Team;
  teamB: Team;
  onChoose: (winner: TeamSide) => void;
}) {
  const [method, setMethod] = useState<"coin" | "penalties" | null>(null);

  return (
    // The decision is mandatory to advance the tournament — onClose is a
    // deliberate no-op so the backdrop/X can't dismiss it without a choice.
    <BottomSheet onClose={() => {}} title="Empate — quem ganhou a decisão?">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-arena-text-sec">
          Golos da decisão não contam para o resultado. Escolhe a equipa vencedora.
        </p>
        <div className="flex gap-2">
          {(["coin", "penalties"] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className="flex-1 rounded-[10px] border px-3 py-2 text-xs font-semibold"
              style={{
                borderColor:
                  method === m ? "var(--color-arena-primary)" : "var(--color-arena-border)",
                color: method === m ? "var(--color-arena-primary)" : "var(--color-arena-text-sec)",
              }}
            >
              {m === "coin" ? "Par ou ímpar" : "Penáltis"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([["A", teamA] as const, ["B", teamB] as const]).map(([side, team]) => (
            <button
              key={side}
              type="button"
              onClick={() => onChoose(side)}
              className="flex flex-col items-center gap-2 rounded-[16px] border border-arena-border bg-arena-surface p-4"
            >
              <span
                className="grid size-10 place-items-center rounded-xl text-base font-extrabold"
                style={{ background: team.color, color: onColor(team.color) }}
              >
                {team.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="text-sm font-bold text-arena-text">{team.name}</span>
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
```

- [ ] **Step 2: Write `tournament-match-bridge.ts`**

```ts
import type { Match, TeamSide } from "@/components/timer/types";
import { resolveNext } from "./engine";
import { tournamentRepository } from "./tournament-store";
import type { MatchOutcome, TournamentMatch } from "./types";

function outcomeFor(winnerSide: TeamSide, tied: boolean): MatchOutcome {
  if (tied) return winnerSide === "A" ? "decisionA" : "decisionB";
  return winnerSide === "A" ? "regA" : "regB";
}

function mergedPlayers(
  base: { id: string; name: string }[],
  fromMatch: { id: string; name: string }[],
): { id: string; name: string }[] {
  const ids = new Set(base.map(p => p.id));
  return [...base, ...fromMatch.filter(p => !ids.has(p.id))];
}

/**
 * Finalizes a live 2-team Match into the tournament's history, advances the
 * winner-stays queue, persists, and returns the tournament id (unchanged)
 * for navigation back to the tournament view.
 */
export async function finalizeTournamentMatch(
  tournamentId: string,
  match: Match,
  winnerSide: TeamSide,
): Promise<string> {
  const tournament = await tournamentRepository.get(tournamentId);
  if (!tournament || !tournament.currentPair) {
    throw new Error(`Tournament ${tournamentId} not found or has no current pair`);
  }
  const [teamAId, teamBId] = tournament.currentPair;

  const goalEvents = match.events.filter(e => e.type === "goal");
  const scoreA = goalEvents.filter(e => e.team === "A").length;
  const scoreB = goalEvents.filter(e => e.team === "B").length;
  const tied = scoreA === scoreB;

  const goals = goalEvents.map(e => ({
    playerId: e.playerId,
    teamId: e.team === "A" ? teamAId : teamBId,
    atSec: e.atSec,
  }));

  const tMatch: TournamentMatch = {
    id: match.id,
    teamAId,
    teamBId,
    scoreA,
    scoreB,
    outcome: outcomeFor(winnerSide, tied),
    goals,
    endedAt: Date.now(),
  };

  const teams = tournament.teams.map(team => {
    if (team.id === teamAId) return { ...team, players: mergedPlayers(team.players, match.teams.A.players) };
    if (team.id === teamBId) return { ...team, players: mergedPlayers(team.players, match.teams.B.players) };
    return team;
  });

  const matches = [...tournament.matches, tMatch];
  const { currentPair, queue } = resolveNext({
    finished: tMatch,
    queue: tournament.queue,
    mode: tournament.config.mode,
    matches,
  });

  await tournamentRepository.save({ ...tournament, teams, matches, currentPair, queue });

  return tournamentId;
}
```

- [ ] **Step 3: Modify `match-view.tsx`**

Change the import block from:

```tsx
"use client";

import { useStatsigClient } from "@statsig/react-bindings";
import { ChevronLeft, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EventTimeline } from "./event-timeline";
import { uid } from "./format";
import { LogCardSheet } from "./log-card-sheet";
import { LogGoalSheet } from "./log-goal-sheet";
import { MatchControls } from "./match-controls";
import { Scoreboard } from "./scoreboard";
import { SummaryModal } from "./summary-modal";
import { TimerRing } from "./timer-ring";
import type { Player, TeamSide } from "./types";
import { deriveClock, score, useLiveMatch } from "./use-match-store";
```

to:

```tsx
"use client";

import { useStatsigClient } from "@statsig/react-bindings";
import { ChevronLeft, Flag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { finalizeTournamentMatch } from "@/components/tournament/tournament-match-bridge";
import { TournamentDecisionSheet } from "@/components/tournament/tournament-decision-sheet";
import { EventTimeline } from "./event-timeline";
import { uid } from "./format";
import { LogCardSheet } from "./log-card-sheet";
import { LogGoalSheet } from "./log-goal-sheet";
import { MatchControls } from "./match-controls";
import { Scoreboard } from "./scoreboard";
import { SummaryModal } from "./summary-modal";
import { TimerRing } from "./timer-ring";
import type { Player, TeamSide } from "./types";
import { deriveClock, score, useLiveMatch } from "./use-match-store";
```

Change the component body's opening state block from:

```tsx
export function MatchView({ id }: { id: string }) {
  const router = useRouter();
  const { logEvent } = useStatsigClient();
  const { match, now, actions } = useLiveMatch(id);
  const [goalSide, setGoalSide] = useState<TeamSide | null>(null);
  const [cardSide, setCardSide] = useState<TeamSide | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Auto-open summary when the match ends.
  useEffect(() => {
    if (match?.state.status === "ended") setSummaryOpen(true);
  }, [match?.state.status]);
```

to:

```tsx
export function MatchView({ id }: { id: string }) {
  const router = useRouter();
  const tournamentId = useSearchParams().get("tournament");
  const { logEvent } = useStatsigClient();
  const { match, now, actions } = useLiveMatch(id);
  const [goalSide, setGoalSide] = useState<TeamSide | null>(null);
  const [cardSide, setCardSide] = useState<TeamSide | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  // Auto-open summary (standalone matches) or the draw-decision sheet
  // (tournament matches ending tied) when the match ends.
  useEffect(() => {
    if (match?.state.status !== "ended") return;
    if (!tournamentId) {
      setSummaryOpen(true);
      return;
    }
    const s = score(match);
    if (s.A === s.B) setDecisionOpen(true);
  }, [match, tournamentId]);

  async function finalizeAndReturn(winnerSide: TeamSide) {
    if (!match || !tournamentId) return;
    setNavigating(true);
    const nextId = await finalizeTournamentMatch(tournamentId, match, winnerSide);
    router.push(`/timer/tournament/${nextId}`);
  }
```

Change the "Jogo terminado" banner block from:

```tsx
      {match.state.status === "ended" && !summaryOpen && (
        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-arena-border bg-arena-surface/60 px-4 py-5 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-arena-primary/15">
            <Flag size={18} className="text-arena-primary" />
          </span>
          <p className="text-sm font-extrabold text-arena-text">
            Jogo terminado
          </p>
          <p className="text-xs text-arena-text-muted">
            O resultado foi registado.
          </p>
          <button
            type="button"
            onClick={() => setSummaryOpen(true)}
            className="mt-1 rounded-[10px] bg-arena-primary px-4 py-2 text-xs font-bold text-arena-bg"
          >
            Ver resumo
          </button>
        </div>
      )}
```

to:

```tsx
      {match.state.status === "ended" && !summaryOpen && !decisionOpen && (
        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-arena-border bg-arena-surface/60 px-4 py-5 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-arena-primary/15">
            <Flag size={18} className="text-arena-primary" />
          </span>
          <p className="text-sm font-extrabold text-arena-text">
            Jogo terminado
          </p>
          <p className="text-xs text-arena-text-muted">
            O resultado foi registado.
          </p>
          {tournamentId ? (
            <button
              type="button"
              disabled={navigating}
              onClick={() => finalizeAndReturn(s.A > s.B ? "A" : "B")}
              className="mt-1 rounded-[10px] bg-arena-primary px-4 py-2 text-xs font-bold text-arena-bg disabled:opacity-50"
            >
              {navigating ? "A continuar…" : "Continuar torneio"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSummaryOpen(true)}
              className="mt-1 rounded-[10px] bg-arena-primary px-4 py-2 text-xs font-bold text-arena-bg"
            >
              Ver resumo
            </button>
          )}
        </div>
      )}
```

Add the decision sheet render, right after the existing `{summaryOpen && <SummaryModal ... />}` block, before the closing `</div>`:

```tsx
      {decisionOpen && match && tournamentId && (
        <TournamentDecisionSheet
          teamA={match.teams.A}
          teamB={match.teams.B}
          onChoose={side => {
            setDecisionOpen(false);
            finalizeAndReturn(side);
          }}
        />
      )}
```

- [ ] **Step 4: Verify**

Run: `pnpm test && pnpm ts-check && pnpm lint`
Expected: all exit 0.

In the browser: from an existing running tournament (`/timer/tournament/<id>`), tap "Iniciar partida". Play the match and end it:
- **Non-tied ending** (e.g. 2-0): banner shows "Continuar torneio" (not "Ver resumo"). Tap it → navigates to `/timer/tournament/<id>`, the pair/queue updated (winner stayed or rested per mode), and standings show the new points.
- **Tied ending** (e.g. 1-1): the decision sheet opens automatically over the score. Tap one team → navigates back to the tournament view with `outcome` recorded as `decisionA`/`decisionB` (points 2-1 visible in standings).
- **Standalone match** (open `/timer/jogo/<id>` directly without a `?tournament=` param, e.g. from the regular `/timer` hub): ending still shows "Ver resumo" and the existing `SummaryModal` — unaffected by this change.

- [ ] **Step 5: Commit**

```bash
git add src/components/tournament/tournament-decision-sheet.tsx src/components/tournament/tournament-match-bridge.ts src/components/timer/match-view.tsx
git commit -m "feat(tournament): wire MatchView into the tournament flow (decision sheet, bridge)"
```

---

### Task 9: Champion view + share

**Files:**
- Modify: `src/components/tournament/tournament-view.tsx`

**Interfaces:**
- Consumes: `computeStandings` (already imported), `computeTopScorers` from `./standings` (Task 3). `encodeTournamentResult` from `./tournament-share` (Task 5). `trophy.svg` from `@/assets/images/trophy.svg`.
- Produces: `ChampionView` (local component, not exported — only used inside this file).

- [ ] **Step 1: Update imports**

Change the top of `src/components/tournament/tournament-view.tsx` from:

```tsx
"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Cta } from "@/components/arena/cta";
import { Logo } from "@/components/logo";
import { onColor } from "@/components/timer/team-color";
import { createMatch, upsertMatch } from "@/components/timer/use-match-store";
import { computeStandings } from "./standings";
import { tournamentRepository } from "./tournament-store";
import type { Tournament, TournamentTeam } from "./types";
```

to:

```tsx
"use client";

import { Check, ChevronLeft, Copy, Share2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import trophyIcon from "@/assets/images/trophy.svg";
import { Cta } from "@/components/arena/cta";
import { Logo } from "@/components/logo";
import { onColor } from "@/components/timer/team-color";
import { createMatch, upsertMatch } from "@/components/timer/use-match-store";
import { computeStandings, computeTopScorers } from "./standings";
import { encodeTournamentResult } from "./tournament-share";
import { tournamentRepository } from "./tournament-store";
import type { Tournament, TournamentTeam } from "./types";
```

- [ ] **Step 2: Add `ChampionView`**

Insert this new component right after `StandingsTable` and before `TournamentView`:

```tsx
function ChampionView({
  tournament,
  onNewTournament,
}: {
  tournament: Tournament;
  onNewTournament: () => void;
}) {
  const standings = computeStandings(tournament);
  const scorers = computeTopScorers(tournament);
  const champion = standings[0] ? teamById(tournament, standings[0].teamId) : null;
  const topGoals = scorers[0]?.goals ?? 0;
  const topScorers = scorers.filter(s => s.goals > 0 && s.goals === topGoals);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/timer/tournament/resultado?d=${encodeTournamentResult(tournament)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Resultado do torneio JogaBola", url: shareUrl });
        return;
      } catch {
        /* user cancelled — fall through */
      }
    }
    copy();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 rounded-[18px] border border-arena-primary/40 bg-arena-primary/10 py-6">
        <Image src={trophyIcon} alt="" width={40} height={40} />
        {champion && (
          <>
            <span className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
              Campeão
            </span>
            <span className="font-sora text-xl font-extrabold text-arena-text">
              {champion.name}
            </span>
          </>
        )}
      </div>

      <StandingsTable tournament={tournament} />

      {topScorers.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-[16px] border border-arena-border bg-arena-surface p-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
            Artilheiro
          </h2>
          {topScorers.map(s => (
            <div key={s.playerId} className="flex items-center justify-between text-sm">
              <span className="font-semibold text-arena-text">{s.name}</span>
              <span className="font-sora font-extrabold tabular-nums text-arena-primary">
                {s.goals}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3">
        {shareUrl && (
          <div className="rounded-lg bg-arena-surface-el p-1.5">
            <QRCode value={shareUrl} size={76} bgColor="transparent" fgColor="#7CFF4F" />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <Cta size="sm" fullWidth onClick={share}>
            <Share2 size={15} className="mr-1.5" /> Partilhar
          </Cta>
          <Cta size="sm" variant="secondary" fullWidth onClick={copy}>
            {copied ? (
              <Check size={15} className="mr-1.5 text-arena-primary" />
            ) : (
              <Copy size={15} className="mr-1.5" />
            )}
            {copied ? "Copiado!" : "Copiar link"}
          </Cta>
        </div>
      </div>

      <Cta variant="secondary" fullWidth onClick={onNewTournament}>
        Novo torneio
      </Cta>
    </div>
  );
}
```

- [ ] **Step 3: Replace the ended-state branch**

In `TournamentView`, change:

```tsx
      {tournament.status === "ended" ? (
        <div className="flex flex-col gap-4">
          <p className="text-center text-sm font-bold text-arena-text">Torneio terminado</p>
          <StandingsTable tournament={tournament} />
        </div>
      ) : (
```

to:

```tsx
      {tournament.status === "ended" ? (
        <ChampionView
          tournament={tournament}
          onNewTournament={() => router.push("/timer/tournament")}
        />
      ) : (
```

- [ ] **Step 4: Verify**

Run: `pnpm ts-check && pnpm lint`
Expected: exit 0 (both).

In the browser: play a tournament to at least 2 matches (from Task 8's verification), then tap "Terminar torneio". Confirm:
- Trophy image + "Campeão" + winning team name render.
- Full standings table shows below.
- Artilheiro block lists the top scorer(s) with goal count (or is absent if nobody scored).
- QR code renders (offline, no external request — check the network panel).
- "Copiar link" copies a URL matching `/timer/tournament/resultado?d=...` (paste into a new tab to sanity-check it doesn't 404 — Task 10 makes it render properly).
- "Novo torneio" returns to `/timer/tournament`.

- [ ] **Step 5: Commit**

```bash
git add src/components/tournament/tournament-view.tsx
git commit -m "feat(tournament): add champion screen with standings, top scorer, and share"
```

---

### Task 10: Shared result page with dynamic OG

**Files:**
- Create: `src/components/tournament/tournament-result-view.tsx`
- Create: `src/app/(public)/timer/tournament/resultado/page.tsx`

**Interfaces:**
- Consumes: `decodeTournamentResult`, `tournamentOgTitle`, `tournamentOgDescription` from `@/components/tournament/tournament-share` (Task 5). `Logo` from `@/components/logo`. `trophy.svg` from `@/assets/images/trophy.svg`.
- Produces: `TournamentResultView({ data }): JSX`, `generateMetadata` for the route. Terminal task — no downstream consumers.

- [ ] **Step 1: Write `tournament-result-view.tsx`**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import trophyIcon from "@/assets/images/trophy.svg";
import { Logo } from "@/components/logo";
import { decodeTournamentResult } from "./tournament-share";

export function TournamentResultView({ data }: { data: string | null }) {
  const r = data ? decodeTournamentResult(data) : null;

  if (!r) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-arena-text-sec">Resultado inválido ou expirado.</p>
        <Link
          href="/timer/tournament"
          className="rounded-[10px] bg-arena-primary px-4 py-2 text-sm font-bold text-arena-bg"
        >
          Abrir torneios
        </Link>
      </div>
    );
  }

  const champion = r.s[0] ? r.teams.find(t => t.id === r.s[0][0]) : null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-4 px-4 py-8">
      <Logo variant="white" href="/" />

      <div className="flex flex-col items-center gap-2 rounded-[18px] border border-arena-primary/40 bg-arena-primary/10 py-6">
        <Image src={trophyIcon} alt="" width={40} height={40} />
        <span className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
          {r.name}
        </span>
        {champion && (
          <span className="font-sora text-xl font-extrabold text-arena-text">{champion.n}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 rounded-[16px] border border-arena-border bg-arena-surface p-3">
        {r.s.map(([teamId, points, gf, ga]) => {
          const team = r.teams.find(t => t.id === teamId);
          return (
            <div
              key={teamId}
              className="flex items-center justify-between rounded-[10px] bg-arena-surface-el px-2 py-1.5 text-sm"
            >
              <span className="flex items-center gap-1.5 font-bold text-arena-text">
                <span className="size-2 rounded-full" style={{ background: team?.c ?? "#7CFF4F" }} />
                {team?.n ?? "Equipa"}
              </span>
              <span className="font-sora font-extrabold tabular-nums text-arena-text">
                {points} pts
              </span>
              <span className="text-xs tabular-nums text-arena-text-sec">
                {gf}-{ga}
              </span>
            </div>
          );
        })}
      </div>

      {r.top.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-[16px] border border-arena-border bg-arena-surface p-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
            Artilheiro
          </h2>
          {r.top.map(([name, goals]) => (
            <div key={name} className="flex items-center justify-between text-sm">
              <span className="font-semibold text-arena-text">{name}</span>
              <span className="font-sora font-extrabold tabular-nums text-arena-primary">
                {goals}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/timer/tournament"
        className="mt-2 flex items-center justify-center rounded-[14px] bg-arena-primary py-3.5 font-extrabold text-arena-bg"
      >
        Criar o meu torneio
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Write the route with dynamic OG**

Create `src/app/(public)/timer/tournament/resultado/page.tsx`:

```tsx
import type { Metadata } from "next";
import { TournamentResultView } from "@/components/tournament/tournament-result-view";
import {
  decodeTournamentResult,
  tournamentOgDescription,
  tournamentOgTitle,
} from "@/components/tournament/tournament-share";

type Props = { searchParams: Promise<{ d?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { d } = await searchParams;
  const r = d ? decodeTournamentResult(d) : null;
  if (!r) return { title: "Resultado do torneio · JogaBola" };
  const title = tournamentOgTitle(r);
  const description = tournamentOgDescription(r);
  return {
    title,
    description,
    openGraph: { title, description, siteName: "JogaBola", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function TournamentResultadoPage({ searchParams }: Props) {
  const { d } = await searchParams;
  return <TournamentResultView data={d ?? null} />;
}
```

- [ ] **Step 3: Verify — full suite + OG + browser**

Run: `pnpm test && pnpm ts-check && pnpm lint`
Expected: all exit 0.

Dev server running on `localhost:3000`. Verify OG with a known fixture (3 teams, Leões champion with 6 pts, artilheiro Rui with 3 goals):

```bash
curl -s "http://localhost:3000/timer/tournament/resultado?d=eyJuYW1lIjoiVG9ybmVpbyIsInRlYW1zIjpbeyJpZCI6InQxIiwibiI6Ikxlw7VlcyIsImMiOiIjN0NGRjRGIn0seyJpZCI6InQyIiwibiI6IsOBZ3VpYXMiLCJjIjoiIzM4QkRGOCJ9LHsiaWQiOiJ0MyIsIm4iOiJUaWdyZXMiLCJjIjoiI0ZBQ0MxNSJ9XSwicyI6W1sidDEiLDYsNCwxXSxbInQyIiwzLDIsMl0sWyJ0MyIsMSwxLDRdXSwidG9wIjpbWyJSdWkiLDNdXX0" | grep -oE '<meta property="og:(title|description)"[^>]*>|<title>[^<]*</title>'
```

Expected output (order may vary):
```
<title>Leões venceu o Torneio · JogaBola</title>
<meta property="og:title" content="Leões venceu o Torneio · JogaBola"/>
<meta property="og:description" content="Artilheiro: Rui (3 golos) · 3 equipas · Torneio registado com o Cronómetro JogaBola — sem login."/>
```

```bash
curl -s "http://localhost:3000/timer/tournament/resultado" | grep -oE '<title>[^<]*</title>'
```

Expected: `<title>Resultado do torneio · JogaBola</title>` (fallback, no `d` param).

In the browser, open the same fixture URL: confirm standings render for all 3 teams (Leões 6pts/4-1, Águias 3pts/2-2, Tigres 1pt/1-4), artilheiro shows "Rui — 3", Logo top-left links to `/`, "Criar o meu torneio" links to `/timer/tournament`.

- [ ] **Step 4: Full build**

Run: `pnpm build`
Expected: exit 0, all `/timer/tournament*` routes listed in the output.

- [ ] **Step 5: Commit**

```bash
git add src/components/tournament/tournament-result-view.tsx "src/app/(public)/timer/tournament/resultado/page.tsx"
git commit -m "feat(tournament): add shared result page with dynamic OG metadata"
```

---

## Final verification

- [ ] `pnpm test && pnpm ts-check && pnpm lint && pnpm build` — all exit 0.
- [ ] End-to-end manual flow: `/timer/tournament` → new tournament (4 teams, mode "Máx. 2 jogos seguidos", draw players from a pasted list) → play 3+ matches including at least one tie (verify the decision sheet and that decision goals don't appear in any scorer count) → confirm the winner-stays queue behaves per the chosen mode → "Terminar torneio" → champion screen matches the standings math by hand → share link opens correctly in a fresh tab.
- [ ] `git log --oneline` shows 10 commits on top of `releases/jogabola-teams/release02`.

## Deferred (explicitly out of scope — see spec's "Não-objetivos")

- Login-gated persistence / Postgres migration (repository is DI-ready; swap is a follow-up plan).
- Saving a tournament match into a real Arena team's stats/rankings.
- Bracket/knockout formats beyond winner-stays.
