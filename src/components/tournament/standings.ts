import { pointsFor, winnerOf } from "./engine";
import type { Tournament, TournamentMatch } from "./types";

export interface TeamStanding {
  teamId: string;
  points: number;
  played: number;
  wins: number;
  gf: number;
  ga: number;
  gd: number;
}

export interface ScorerEntry {
  playerId: string;
  name: string;
  teamId: string;
  goals: number;
  matchesPlayed: number;
}

export function computeStandings(tournament: Tournament): TeamStanding[] {
  const teamNames = new Map(tournament.teams.map(team => [team.id, team.name]));
  const standings = new Map(
    tournament.teams.map(team => [
      team.id,
      {
        teamId: team.id,
        points: 0,
        played: 0,
        wins: 0,
        gf: 0,
        ga: 0,
        gd: 0,
      } satisfies TeamStanding,
    ]),
  );
  const validMatches = tournament.matches.filter(
    match => standings.has(match.teamAId) && standings.has(match.teamBId),
  );

  for (const match of validMatches) {
    const teamA = standings.get(match.teamAId);
    const teamB = standings.get(match.teamBId);
    if (!teamA || !teamB) {
      continue;
    }

    const points = pointsFor(match.outcome);
    teamA.points += points.a;
    teamB.points += points.b;
    teamA.played += 1;
    teamB.played += 1;
    teamA.gf += match.scoreA;
    teamA.ga += match.scoreB;
    teamB.gf += match.scoreB;
    teamB.ga += match.scoreA;

    const winner = winnerOf(match);
    const winnerStanding = standings.get(winner);
    if (winnerStanding) {
      winnerStanding.wins += 1;
    }
  }

  for (const standing of standings.values()) {
    standing.gd = standing.gf - standing.ga;
  }

  const statisticallySorted = [...standings.values()].sort(compareStatistics);
  const result: TeamStanding[] = [];

  for (let start = 0; start < statisticallySorted.length; ) {
    let end = start + 1;
    while (
      end < statisticallySorted.length &&
      compareStatistics(
        statisticallySorted[start],
        statisticallySorted[end],
      ) === 0
    ) {
      end += 1;
    }

    result.push(
      ...orderTiedGroup(
        statisticallySorted.slice(start, end),
        validMatches,
        teamNames,
      ),
    );
    start = end;
  }

  return result;
}

export function computeTopScorers(tournament: Tournament): ScorerEntry[] {
  const teams = new Map(tournament.teams.map(team => [team.id, team]));
  const matchesByTeam = new Map<string, number>();

  for (const match of tournament.matches) {
    matchesByTeam.set(
      match.teamAId,
      (matchesByTeam.get(match.teamAId) ?? 0) + 1,
    );
    matchesByTeam.set(
      match.teamBId,
      (matchesByTeam.get(match.teamBId) ?? 0) + 1,
    );
  }

  const scorers = new Map<string, ScorerEntry>();
  for (const match of tournament.matches) {
    for (const goal of match.goals) {
      const team = teams.get(goal.teamId);
      const scorer = scorers.get(goal.playerId);
      if (scorer) {
        scorer.goals += 1;
        continue;
      }

      scorers.set(goal.playerId, {
        playerId: goal.playerId,
        name:
          team?.players.find(player => player.id === goal.playerId)?.name ?? "",
        teamId: goal.teamId,
        goals: 1,
        matchesPlayed: matchesByTeam.get(goal.teamId) ?? 0,
      });
    }
  }

  return [...scorers.values()].sort(
    (left, right) =>
      right.goals - left.goals ||
      left.matchesPlayed - right.matchesPlayed ||
      Number(left.name.length === 0) - Number(right.name.length === 0) ||
      left.name.localeCompare(right.name),
  );
}

function latestHeadToHead(
  matches: TournamentMatch[],
  firstTeamId: string,
  secondTeamId: string,
): TournamentMatch | undefined {
  return matches.reduce<TournamentMatch | undefined>((latest, match) => {
    const isHeadToHead =
      (match.teamAId === firstTeamId && match.teamBId === secondTeamId) ||
      (match.teamAId === secondTeamId && match.teamBId === firstTeamId);

    if (!isHeadToHead || (latest && latest.endedAt > match.endedAt)) {
      return latest;
    }

    return match;
  }, undefined);
}

function compareStatistics(left: TeamStanding, right: TeamStanding): number {
  return right.points - left.points || right.gd - left.gd || right.gf - left.gf;
}

function orderTiedGroup(
  group: TeamStanding[],
  matches: TournamentMatch[],
  teamNames: Map<string, string>,
): TeamStanding[] {
  const byName = (left: TeamStanding, right: TeamStanding) =>
    (teamNames.get(left.teamId) ?? "").localeCompare(
      teamNames.get(right.teamId) ?? "",
    );
  if (group.length < 2) {
    return group;
  }

  const byId = new Map(group.map(standing => [standing.teamId, standing]));
  const outgoing = new Map(
    group.map(standing => [standing.teamId, new Set<string>()]),
  );
  const indegree = new Map(group.map(standing => [standing.teamId, 0]));

  for (let first = 0; first < group.length; first += 1) {
    for (let second = first + 1; second < group.length; second += 1) {
      const headToHead = latestHeadToHead(
        matches,
        group[first].teamId,
        group[second].teamId,
      );
      if (!headToHead) {
        continue;
      }

      const winner = winnerOf(headToHead);
      const loser =
        winner === headToHead.teamAId ? headToHead.teamBId : headToHead.teamAId;
      outgoing.get(winner)?.add(loser);
      indegree.set(loser, (indegree.get(loser) ?? 0) + 1);
    }
  }

  const available = group
    .filter(standing => indegree.get(standing.teamId) === 0)
    .sort(byName);
  const ordered: TeamStanding[] = [];

  while (available.length > 0) {
    const standing = available.shift();
    if (!standing) {
      break;
    }
    ordered.push(standing);

    for (const loserId of outgoing.get(standing.teamId) ?? []) {
      const nextIndegree = (indegree.get(loserId) ?? 0) - 1;
      indegree.set(loserId, nextIndegree);
      const loser = byId.get(loserId);
      if (nextIndegree === 0 && loser) {
        available.push(loser);
        available.sort(byName);
      }
    }
  }

  return ordered.length === group.length ? ordered : [...group].sort(byName);
}
