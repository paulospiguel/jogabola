import type { TournamentRepository } from "./tournament-store";
import type { Tournament } from "./types";

export type TournamentPersistenceRepository = Pick<
  TournamentRepository,
  "get" | "save"
>;

export type TournamentDeletionRepository = Pick<
  TournamentRepository,
  "get" | "remove"
>;

export function tournamentsEqual(
  actual: Tournament | null,
  expected: Tournament,
): actual is Tournament {
  return actual !== null && JSON.stringify(actual) === JSON.stringify(expected);
}

export async function saveTournamentWithVerification(
  repository: TournamentPersistenceRepository,
  tournament: Tournament,
): Promise<Tournament> {
  await repository.save(tournament);
  const persisted = await repository.get(tournament.id);
  if (!tournamentsEqual(persisted, tournament)) {
    throw new Error("Tournament persistence verification failed");
  }
  return persisted;
}

export async function deleteTournamentWithVerification(
  repository: TournamentDeletionRepository,
  tournamentId: string,
): Promise<void> {
  await repository.remove(tournamentId);
  const persisted = await repository.get(tournamentId);
  if (persisted !== null) {
    throw new Error("Tournament deletion verification failed");
  }
}
