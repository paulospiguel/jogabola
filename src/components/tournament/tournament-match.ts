import type { Match } from "@/components/timer/types";
import { createMatch } from "@/components/timer/use-match-store";
import type { Tournament, TournamentTeam } from "./types";

export function findTeamById(
  tournament: Tournament,
  teamId: string,
): TournamentTeam | null {
  return tournament.teams.find(item => item.id === teamId) ?? null;
}

export function markTournamentEnded(tournament: Tournament): Tournament {
  return { ...tournament, status: "ended" };
}

export function resolveTournamentViewState(
  tournament: Tournament,
): "active" | "ended" | "invalid" {
  if (tournament.status === "ended") return "ended";
  if (!tournament.currentPair) return "invalid";

  const [teamAId, teamBId] = tournament.currentPair;
  return findTeamById(tournament, teamAId) && findTeamById(tournament, teamBId)
    ? "active"
    : "invalid";
}

export function isPersistedTimerMatch(
  expected: Match,
  persisted: Match | null,
): boolean {
  if (!persisted) return false;

  const expectedContext = expected.tournamentContext;
  const persistedContext = persisted.tournamentContext;
  const contextMatches = expectedContext
    ? Boolean(
        persistedContext &&
          persistedContext.tournamentId === expectedContext.tournamentId &&
          persistedContext.teamAId === expectedContext.teamAId &&
          persistedContext.teamBId === expectedContext.teamBId &&
          persistedContext.queue.length === expectedContext.queue.length &&
          persistedContext.queue.every(
            (teamId, index) => teamId === expectedContext.queue[index],
          ),
      )
    : persistedContext === undefined;

  return (
    persisted.id === expected.id &&
    persisted.type === expected.type &&
    persisted.createdAt === expected.createdAt &&
    persisted.teams.A.name === expected.teams.A.name &&
    persisted.teams.A.color === expected.teams.A.color &&
    persisted.teams.B.name === expected.teams.B.name &&
    persisted.teams.B.color === expected.teams.B.color &&
    persisted.config.mode === expected.config.mode &&
    persisted.config.periodLenSec === expected.config.periodLenSec &&
    persisted.config.periods === expected.config.periods &&
    persisted.config.sound === expected.config.sound &&
    contextMatches
  );
}

export function isTournamentEndedPersisted(
  expected: Tournament,
  persisted: Tournament | null,
): boolean {
  return persisted?.id === expected.id && persisted.status === "ended";
}

export function createTournamentTimerMatch(
  tournament: Tournament,
  teamA: TournamentTeam,
  teamB: TournamentTeam,
): Match {
  if (!tournament.currentPair) {
    throw new Error("Tournament has no current pair");
  }
  const [teamAId, teamBId] = tournament.currentPair;
  if (teamA.id !== teamAId || teamB.id !== teamBId) {
    throw new Error("Tournament teams do not match the current pair");
  }
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
  return {
    ...match,
    tournamentContext: {
      tournamentId: tournament.id,
      teamAId,
      teamBId,
      queue: [...tournament.queue],
    },
  };
}
