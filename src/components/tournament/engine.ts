import type { MatchOutcome, TournamentMatch, WinnerStaysMode } from "./types";

interface MatchPoints {
  a: number;
  b: number;
}

interface QueueState {
  currentPair: [string, string];
  queue: string[];
}

interface ResolveNextInput {
  finished: TournamentMatch;
  queue: string[];
  mode: WinnerStaysMode;
  matches: TournamentMatch[];
}

export function pointsFor(outcome: MatchOutcome): MatchPoints {
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

export function winnerOf(match: TournamentMatch): string {
  return match.outcome === "regA" || match.outcome === "decisionA"
    ? match.teamAId
    : match.teamBId;
}

export function loserOf(match: TournamentMatch): string {
  return winnerOf(match) === match.teamAId ? match.teamBId : match.teamAId;
}

export function initQueue(teamIds: string[]): QueueState {
  const [teamAId, teamBId, ...queue] = teamIds;

  if (!teamAId || !teamBId) {
    throw new Error("Tournament queue exhausted");
  }

  return { currentPair: [teamAId, teamBId], queue };
}

export function resolveNext({
  finished,
  queue,
  mode,
  matches,
}: ResolveNextInput): QueueState {
  const winner = winnerOf(finished);
  const loser = loserOf(finished);

  if (mode === "maxTwoInARow" && currentStreak(matches, winner) >= 2) {
    const [teamAId, teamBId, ...remaining] = [...queue, loser, winner];

    if (!teamAId || !teamBId) {
      throw new Error("Tournament queue exhausted");
    }

    return { currentPair: [teamAId, teamBId], queue: remaining };
  }

  const [challenger, ...remaining] = queue;
  if (!challenger) {
    throw new Error("Tournament queue exhausted");
  }

  return {
    currentPair: [winner, challenger],
    queue: [...remaining, loser],
  };
}

function currentStreak(matches: TournamentMatch[], winnerId: string): number {
  let streak = 0;

  for (let index = matches.length - 1; index >= 0; index -= 1) {
    if (winnerOf(matches[index]) !== winnerId) {
      break;
    }
    streak += 1;
  }

  return streak;
}
