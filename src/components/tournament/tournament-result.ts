import {
  type TournamentSharedResult,
  tournamentOgDescription,
  tournamentOgTitle,
} from "./tournament-share";

export interface TournamentMetadataFields {
  title: string;
  description?: string;
}

export function buildTournamentMetadata(
  result: TournamentSharedResult | null,
): TournamentMetadataFields {
  if (!result) {
    return { title: "Resultado do torneio · JogaBola" };
  }

  return {
    title: tournamentOgTitle(result),
    description: tournamentOgDescription(result),
  };
}

export function buildTopScorerKeys(
  scorers: TournamentSharedResult["top"],
): string[] {
  const occurrences = new Map<string, number>();

  return scorers.map(([name, goals]) => {
    const identity = `${name}:${goals}`;
    const occurrence = (occurrences.get(identity) ?? 0) + 1;
    occurrences.set(identity, occurrence);
    return `${identity}:${occurrence}`;
  });
}
