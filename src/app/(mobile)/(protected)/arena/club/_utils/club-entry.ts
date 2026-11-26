/**
 * Decides where the "Clube" entry point leads for the active team. Pure and
 * presentation-only: every action behind it is authorized on the server.
 */
export interface ClubEntryClub {
  id: number;
  ownedTeams: { id: number }[];
}

export interface ClubEntryTeam {
  id: number;
  name: string;
  ownerId: string;
}

export type ClubEntryDecision =
  | { kind: "club"; clubId: number }
  | { kind: "create"; teamId: number; teamName: string }
  | { kind: "none"; reason: "noTeam" | "notOwner" };

export function decideClubEntry({
  clubs,
  activeTeam,
  userId,
}: {
  clubs: readonly ClubEntryClub[];
  activeTeam: ClubEntryTeam | null;
  userId: string | null;
}): ClubEntryDecision {
  if (activeTeam) {
    const clubOfTeam = clubs.find(club =>
      club.ownedTeams.some(team => team.id === activeTeam.id),
    );
    if (clubOfTeam) return { kind: "club", clubId: clubOfTeam.id };
    if (userId && activeTeam.ownerId === userId) {
      return {
        kind: "create",
        teamId: activeTeam.id,
        teamName: activeTeam.name,
      };
    }
  }
  if (clubs.length > 0) return { kind: "club", clubId: clubs[0].id };
  return { kind: "none", reason: activeTeam ? "notOwner" : "noTeam" };
}
