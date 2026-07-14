import { describe, expect, it } from "vitest";
import { saveTournamentWithVerification } from "./tournament-persistence";
import type { TournamentRepository } from "./tournament-store";
import type { Tournament } from "./types";

function fixture(): Tournament {
  return {
    id: "cup-1",
    name: "Taça",
    createdAt: 100,
    teams: [
      {
        id: "a",
        name: "Alfa",
        color: "#7CFF4F",
        players: [{ id: "p1", name: "Ana" }],
      },
      { id: "b", name: "Bravo", color: "#38BDF8", players: [] },
      { id: "c", name: "Charlie", color: "#FACC15", players: [] },
    ],
    config: {
      mode: "always",
      matchLenSec: 300,
      timerMode: "down",
      sound: true,
    },
    matches: [],
    queue: ["c"],
    currentPair: ["a", "b"],
    status: "running",
  };
}

function repositoryWithReadback(
  readback: Tournament | null,
): Pick<TournamentRepository, "get" | "save"> {
  return {
    save: async () => undefined,
    get: async () => readback,
  };
}

describe("saveTournamentWithVerification", () => {
  it("returns the confirmed persisted tournament", async () => {
    const tournament = fixture();

    await expect(
      saveTournamentWithVerification(
        repositoryWithReadback(structuredClone(tournament)),
        tournament,
      ),
    ).resolves.toEqual(tournament);
  });

  it("rejects a missing readback", async () => {
    await expect(
      saveTournamentWithVerification(repositoryWithReadback(null), fixture()),
    ).rejects.toThrow("verification failed");
  });

  it("rejects a mismatched readback", async () => {
    const tournament = fixture();
    const mismatched = { ...tournament, queue: ["b"] };

    await expect(
      saveTournamentWithVerification(
        repositoryWithReadback(mismatched),
        tournament,
      ),
    ).rejects.toThrow("verification failed");
  });

  it("propagates a save rejection without reading back", async () => {
    let reads = 0;
    const repository: Pick<TournamentRepository, "get" | "save"> = {
      save: async () => {
        throw new Error("storage unavailable");
      },
      get: async () => {
        reads += 1;
        return fixture();
      },
    };

    await expect(
      saveTournamentWithVerification(repository, fixture()),
    ).rejects.toThrow("storage unavailable");
    expect(reads).toBe(0);
  });
});
