import { describe, expect, it } from "vitest";
import {
  createTournamentRepository,
  type KeyValueStore,
} from "./tournament-store";
import type { Tournament } from "./types";

class MemoryKeyValueStore implements KeyValueStore {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function createTournament(id: string, createdAt: number): Tournament {
  return {
    id,
    createdAt,
    teams: [],
    config: {
      mode: "always",
      matchLenSec: 300,
      timerMode: "down",
      sound: true,
    },
    matches: [],
    queue: [],
    currentPair: null,
    status: "setup",
  };
}

describe("tournament repository", () => {
  it("returns an empty list when no tournaments are stored", async () => {
    const repository = createTournamentRepository(new MemoryKeyValueStore());

    await expect(repository.list()).resolves.toEqual([]);
  });

  it("ignores invalid entries in persisted tournament arrays", async () => {
    const store = new MemoryKeyValueStore();
    store.setItem(
      "jb_tournaments",
      JSON.stringify([null, "invalid", {}, { id: "partial", createdAt: 1 }]),
    );
    const repository = createTournamentRepository(store);

    await expect(repository.list()).resolves.toEqual([]);
  });

  it("saves and gets a tournament, returning null for a missing id", async () => {
    const repository = createTournamentRepository(new MemoryKeyValueStore());
    const tournament = createTournament("one", 100);

    await repository.save(tournament);

    await expect(repository.get("one")).resolves.toEqual(tournament);
    await expect(repository.get("missing")).resolves.toBeNull();
  });

  it("lists tournaments ordered by createdAt descending", async () => {
    const repository = createTournamentRepository(new MemoryKeyValueStore());
    const older = createTournament("older", 100);
    const newer = createTournament("newer", 200);

    await repository.save(older);
    await repository.save(newer);

    await expect(repository.list()).resolves.toEqual([newer, older]);
  });

  it("updates a tournament with the same id without duplicating it", async () => {
    const repository = createTournamentRepository(new MemoryKeyValueStore());
    const tournament = createTournament("one", 100);
    const updated = { ...tournament, name: "Taça de verão" };

    await repository.save(tournament);
    await repository.save(updated);

    await expect(repository.list()).resolves.toEqual([updated]);
  });

  it("removes a tournament by id", async () => {
    const repository = createTournamentRepository(new MemoryKeyValueStore());
    const removed = createTournament("removed", 100);
    const kept = createTournament("kept", 200);
    await repository.save(removed);
    await repository.save(kept);

    await repository.remove("removed");

    await expect(repository.list()).resolves.toEqual([kept]);
    await expect(repository.get("removed")).resolves.toBeNull();
  });
});
