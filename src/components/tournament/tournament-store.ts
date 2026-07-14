import type { Tournament } from "./types";

const K_TOURNAMENTS = "jb_tournaments";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface TournamentRepository {
  list(): Promise<Tournament[]>;
  get(id: string): Promise<Tournament | null>;
  save(tournament: Tournament): Promise<void>;
  remove(id: string): Promise<void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPlayer(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string"
  );
}

function isTeam(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.color === "string" &&
    Array.isArray(value.players) &&
    value.players.every(isPlayer)
  );
}

function isConfig(value: unknown): boolean {
  return (
    isRecord(value) &&
    (value.mode === "always" || value.mode === "maxTwoInARow") &&
    isFiniteNumber(value.matchLenSec) &&
    (value.timerMode === "down" || value.timerMode === "up") &&
    typeof value.sound === "boolean"
  );
}

function isGoal(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.playerId === "string" &&
    typeof value.teamId === "string" &&
    isFiniteNumber(value.atSec)
  );
}

function isMatch(value: unknown): boolean {
  if (!isRecord(value)) return false;

  const hasValidDecisionMethod =
    value.decisionMethod === undefined ||
    value.decisionMethod === "coin" ||
    value.decisionMethod === "penalties";
  const hasValidOutcome =
    value.outcome === "regA" ||
    value.outcome === "regB" ||
    value.outcome === "decisionA" ||
    value.outcome === "decisionB";

  return (
    typeof value.id === "string" &&
    typeof value.teamAId === "string" &&
    typeof value.teamBId === "string" &&
    isFiniteNumber(value.scoreA) &&
    isFiniteNumber(value.scoreB) &&
    hasValidOutcome &&
    hasValidDecisionMethod &&
    Array.isArray(value.goals) &&
    value.goals.every(isGoal) &&
    isFiniteNumber(value.endedAt)
  );
}

function isCurrentPair(value: unknown): boolean {
  return (
    value === null ||
    (Array.isArray(value) &&
      value.length === 2 &&
      value.every(item => typeof item === "string"))
  );
}

function isPersistedTournament(value: unknown): value is Tournament {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    (value.name === undefined || typeof value.name === "string") &&
    isFiniteNumber(value.createdAt) &&
    Array.isArray(value.teams) &&
    value.teams.every(isTeam) &&
    isConfig(value.config) &&
    Array.isArray(value.matches) &&
    value.matches.every(isMatch) &&
    Array.isArray(value.queue) &&
    value.queue.every(item => typeof item === "string") &&
    isCurrentPair(value.currentPair) &&
    (value.status === "setup" ||
      value.status === "running" ||
      value.status === "ended")
  );
}

export function createTournamentRepository(
  store: KeyValueStore,
): TournamentRepository {
  function read(): Tournament[] {
    try {
      const raw = store.getItem(K_TOURNAMENTS);
      if (raw === null) return [];

      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isPersistedTournament) : [];
    } catch {
      return [];
    }
  }

  function write(tournaments: Tournament[]): void {
    try {
      store.setItem(K_TOURNAMENTS, JSON.stringify(tournaments));
    } catch {
      // Storage can be unavailable or full; persistence remains best-effort.
    }
  }

  return {
    async list() {
      return read().sort((a, b) => b.createdAt - a.createdAt);
    },
    async get(id) {
      return read().find(tournament => tournament.id === id) ?? null;
    },
    async save(tournament) {
      const tournaments = read();
      const existingIndex = tournaments.findIndex(
        item => item.id === tournament.id,
      );

      if (existingIndex === -1) {
        tournaments.push(tournament);
      } else {
        tournaments[existingIndex] = tournament;
      }

      write(tournaments);
    },
    async remove(id) {
      write(read().filter(tournament => tournament.id !== id));
    },
  };
}

const serverStore: KeyValueStore = {
  getItem: () => null,
  setItem: () => undefined,
};

const browserStore: KeyValueStore = {
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};

export const tournamentRepository = createTournamentRepository(
  typeof window === "undefined" ? serverStore : browserStore,
);
