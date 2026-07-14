import type {
  Match,
  Player,
  TeamSide,
  TournamentMatchContext,
} from "@/components/timer/types";
import { resolveNext } from "./engine";
import {
  type TournamentRepository,
  tournamentRepository,
} from "./tournament-store";
import type {
  DecisionMethod,
  MatchOutcome,
  Tournament,
  TournamentMatch,
  TournamentTeam,
} from "./types";

export type TournamentMatchRepository = Pick<
  TournamentRepository,
  "get" | "save"
>;

type FinalizeTournamentMatch = (
  tournamentId: string,
  match: Match,
  winnerSide: TeamSide,
  decisionMethod?: DecisionMethod,
) => Promise<string>;

function outcomeFor(winnerSide: TeamSide, tied: boolean): MatchOutcome {
  if (tied) return winnerSide === "A" ? "decisionA" : "decisionB";
  return winnerSide === "A" ? "regA" : "regB";
}

function mergedPlayers(base: Player[], fromMatch: Player[]): Player[] {
  const playersById = new Map(base.map(player => [player.id, player]));
  for (const player of fromMatch) {
    if (!playersById.has(player.id)) playersById.set(player.id, player);
  }
  return [...playersById.values()];
}

function sameSequence(
  actual: readonly string[] | null,
  expected: readonly string[] | null,
): boolean {
  if (actual === null || expected === null) return actual === expected;
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function playersEqual(actual: Player[], expected: Player[]): boolean {
  return (
    actual.length === expected.length &&
    actual.every(
      (player, index) =>
        player.id === expected[index]?.id &&
        player.name === expected[index]?.name,
    )
  );
}

function goalsEqual(
  actual: TournamentMatch["goals"],
  expected: TournamentMatch["goals"],
): boolean {
  return (
    actual.length === expected.length &&
    actual.every(
      (goal, index) =>
        goal.playerId === expected[index]?.playerId &&
        goal.teamId === expected[index]?.teamId &&
        goal.atSec === expected[index]?.atSec,
    )
  );
}

/** Full value comparison used for idempotency and persistence verification. */
export function tournamentMatchesEqual(
  actual: TournamentMatch,
  expected: TournamentMatch,
): boolean {
  return (
    actual.id === expected.id &&
    actual.teamAId === expected.teamAId &&
    actual.teamBId === expected.teamBId &&
    actual.scoreA === expected.scoreA &&
    actual.scoreB === expected.scoreB &&
    actual.outcome === expected.outcome &&
    actual.decisionMethod === expected.decisionMethod &&
    actual.endedAt === expected.endedAt &&
    goalsEqual(actual.goals, expected.goals)
  );
}

function storedTeamContainsLivePlayers(
  stored: TournamentTeam,
  livePlayers: Player[],
): boolean {
  const storedIds = stored.players.map(player => player.id);
  const uniqueIds = new Set(storedIds);
  return (
    uniqueIds.size === storedIds.length &&
    livePlayers.every(player =>
      stored.players.some(
        candidate =>
          candidate.id === player.id && candidate.name === player.name,
      ),
    )
  );
}

function teamsForPair(
  tournament: Tournament,
  teamAId: string,
  teamBId: string,
): [TournamentTeam, TournamentTeam] {
  const teamA = tournament.teams.find(team => team.id === teamAId);
  const teamB = tournament.teams.find(team => team.id === teamBId);
  if (!teamA || !teamB) {
    throw new Error("Tournament current pair is invalid");
  }
  return [teamA, teamB];
}

function assertBoundContext(
  tournament: Tournament,
  match: Match,
  tournamentId: string,
): TournamentMatchContext {
  const context = match.tournamentContext;
  if (!context || context.tournamentId !== tournamentId) {
    throw new Error("Match is not bound to this tournament context");
  }
  teamsForPair(tournament, context.teamAId, context.teamBId);
  const boundIds = [context.teamAId, context.teamBId, ...context.queue];
  const tournamentIds = tournament.teams.map(team => team.id);
  if (
    new Set(boundIds).size !== boundIds.length ||
    boundIds.length !== tournamentIds.length ||
    !tournamentIds.every(teamId => boundIds.includes(teamId))
  ) {
    throw new Error("Match tournament context has an invalid pair or queue");
  }
  return context;
}

function buildTournamentMatch(
  match: Match,
  winnerSide: TeamSide,
  decisionMethod: DecisionMethod | undefined,
  teamAId: string,
  teamBId: string,
  endedAt: number,
): TournamentMatch {
  const goalEvents = match.events.filter(event => event.type === "goal");
  const scoreA = goalEvents.filter(event => event.team === "A").length;
  const scoreB = goalEvents.filter(event => event.team === "B").length;
  const tied = scoreA === scoreB;
  if (tied && !decisionMethod) {
    throw new Error("A decision method is required for a tied match");
  }

  return {
    id: match.id,
    teamAId,
    teamBId,
    scoreA,
    scoreB,
    outcome: outcomeFor(winnerSide, tied),
    ...(tied ? { decisionMethod } : {}),
    goals: goalEvents.map(event => ({
      playerId: event.playerId,
      teamId: event.team === "A" ? teamAId : teamBId,
      atSec: event.atSec,
    })),
    endedAt,
  };
}

function mergePairPlayers(
  tournament: Tournament,
  match: Match,
  teamAId: string,
  teamBId: string,
): TournamentTeam[] {
  return tournament.teams.map(team => {
    if (team.id === teamAId) {
      return {
        ...team,
        players: mergedPlayers(team.players, match.teams.A.players),
      };
    }
    if (team.id === teamBId) {
      return {
        ...team,
        players: mergedPlayers(team.players, match.teams.B.players),
      };
    }
    return team;
  });
}

function persistedAsExpected(
  persisted: Tournament | null,
  expectedMatch: TournamentMatch,
  expectedTeams: TournamentTeam[],
  expectedPair: [string, string],
  expectedQueue: string[],
): boolean {
  const storedMatch = persisted?.matches.find(
    item => item.id === expectedMatch.id,
  );
  return Boolean(
    persisted &&
      storedMatch &&
      tournamentMatchesEqual(storedMatch, expectedMatch) &&
      persisted.teams.length === expectedTeams.length &&
      persisted.teams.every((team, index) => {
        const expected = expectedTeams[index];
        return (
          team.id === expected?.id &&
          team.name === expected.name &&
          team.color === expected.color &&
          playersEqual(team.players, expected.players)
        );
      }) &&
      sameSequence(persisted.currentPair, expectedPair) &&
      sameSequence(persisted.queue, expectedQueue),
  );
}

function tournamentSnapshotEqual(a: Tournament | null, b: Tournament): boolean {
  return a !== null && JSON.stringify(a) === JSON.stringify(b);
}

async function saveWithPrecondition(
  repository: TournamentMatchRepository,
  before: Tournament,
  next: Tournament,
): Promise<void> {
  const latest = await repository.get(before.id);
  if (!tournamentSnapshotEqual(latest, before)) {
    throw new Error("Tournament changed concurrently before persistence");
  }
  // The repository has no compare-and-swap operation. The client lock narrows
  // the race, but localStorage remains last-write-wins between this read and
  // save. A future server repository must make this transactional or use CAS.
  await repository.save(next);
}

const fallbackLocks = new Map<string, Promise<void>>();

async function withFallbackTournamentLock<T>(
  tournamentId: string,
  work: () => Promise<T>,
): Promise<T> {
  const previous = fallbackLocks.get(tournamentId) ?? Promise.resolve();
  let release = () => {};
  const gate = new Promise<void>(resolve => {
    release = resolve;
  });
  const queued = previous.catch(() => undefined).then(() => gate);
  fallbackLocks.set(tournamentId, queued);
  await previous.catch(() => undefined);
  try {
    return await work();
  } finally {
    release();
    if (fallbackLocks.get(tournamentId) === queued) {
      fallbackLocks.delete(tournamentId);
    }
  }
}

/** Serializes the full read/write/readback sequence for one tournament. */
export async function withTournamentLock<T>(
  tournamentId: string,
  work: () => Promise<T>,
): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request(`jb-tournament-${tournamentId}`, work);
  }
  return withFallbackTournamentLock(tournamentId, work);
}

function expectedTopology(
  tournament: Tournament,
  finished: TournamentMatch,
  queueSnapshot: string[],
  matchIndex: number,
): { currentPair: [string, string]; queue: string[] } {
  return resolveNext({
    finished,
    queue: queueSnapshot,
    mode: tournament.config.mode,
    matches: tournament.matches.slice(0, matchIndex + 1),
  });
}

/** Creates the testable implementation while preserving the singleton API. */
export function createFinalizeTournamentMatch(
  repository: TournamentMatchRepository,
  now: () => number = Date.now,
): FinalizeTournamentMatch {
  return (tournamentId, match, winnerSide, decisionMethod) =>
    withTournamentLock(tournamentId, async () => {
      const tournament = await repository.get(tournamentId);
      if (!tournament) throw new Error(`Tournament ${tournamentId} not found`);
      const context = assertBoundContext(tournament, match, tournamentId);

      const existingIndex = tournament.matches.findIndex(
        item => item.id === match.id,
      );
      const existing = tournament.matches[existingIndex];
      if (existing) {
        if (
          existingIndex !== tournament.matches.length - 1 ||
          existing.teamAId !== context.teamAId ||
          existing.teamBId !== context.teamBId
        ) {
          throw new Error(
            "Existing match conflicts with its bound tournament context",
          );
        }
        const expected = buildTournamentMatch(
          match,
          winnerSide,
          decisionMethod,
          existing.teamAId,
          existing.teamBId,
          existing.endedAt,
        );
        if (!tournamentMatchesEqual(existing, expected)) {
          throw new Error(
            "Existing tournament match is corrupt or conflicts with retry",
          );
        }
        const expectedNext = expectedTopology(
          tournament,
          existing,
          context.queue,
          existingIndex,
        );
        const topologyMatches =
          sameSequence(tournament.currentPair, expectedNext.currentPair) &&
          sameSequence(tournament.queue, expectedNext.queue);
        const [storedA, storedB] = teamsForPair(
          tournament,
          existing.teamAId,
          existing.teamBId,
        );
        const playersMatch =
          storedTeamContainsLivePlayers(storedA, match.teams.A.players) &&
          storedTeamContainsLivePlayers(storedB, match.teams.B.players);

        if (!topologyMatches) {
          const teams = mergePairPlayers(
            tournament,
            match,
            existing.teamAId,
            existing.teamBId,
          );
          const { currentPair, queue } = expectedNext;
          const repaired = { ...tournament, teams, currentPair, queue };
          await saveWithPrecondition(repository, tournament, repaired);
          const persisted = await repository.get(tournamentId);
          if (
            !persistedAsExpected(persisted, expected, teams, currentPair, queue)
          ) {
            throw new Error(
              `Tournament ${tournamentId} repair did not persist`,
            );
          }
          return tournamentId;
        }
        if (!playersMatch) {
          throw new Error(
            "Existing tournament finalization has invalid players",
          );
        }
        return tournamentId;
      }

      if (!tournament.currentPair) {
        throw new Error(`Tournament ${tournamentId} has no current pair`);
      }
      if (
        !sameSequence(tournament.currentPair, [
          context.teamAId,
          context.teamBId,
        ]) ||
        !sameSequence(tournament.queue, context.queue)
      ) {
        throw new Error(
          "Stale match context does not match the tournament current pair",
        );
      }
      const { teamAId, teamBId } = context;
      const tournamentMatch = buildTournamentMatch(
        match,
        winnerSide,
        decisionMethod,
        teamAId,
        teamBId,
        now(),
      );
      const teams = mergePairPlayers(tournament, match, teamAId, teamBId);
      const matches = [...tournament.matches, tournamentMatch];
      const { currentPair, queue } = resolveNext({
        finished: tournamentMatch,
        queue: context.queue,
        mode: tournament.config.mode,
        matches,
      });
      const next = { ...tournament, teams, matches, currentPair, queue };

      await saveWithPrecondition(repository, tournament, next);
      const persisted = await repository.get(tournamentId);
      if (
        !persistedAsExpected(
          persisted,
          tournamentMatch,
          teams,
          currentPair,
          queue,
        )
      ) {
        throw new Error(`Tournament ${tournamentId} update did not persist`);
      }
      return tournamentId;
    });
}

const finalizeWithTournamentRepository =
  createFinalizeTournamentMatch(tournamentRepository);

export async function finalizeTournamentMatch(
  tournamentId: string,
  match: Match,
  winnerSide: TeamSide,
  decisionMethod?: DecisionMethod,
): Promise<string> {
  return finalizeWithTournamentRepository(
    tournamentId,
    match,
    winnerSide,
    decisionMethod,
  );
}
