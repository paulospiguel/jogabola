import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { teamMembers, teams } from "@/db/schema";

export async function userCanAccessTeam(
  userId: string,
  teamId: number,
): Promise<boolean> {
  const ownedTeam = await db.query.teams.findFirst({
    columns: { id: true },
    where: eq(teams.id, teamId),
  });

  if (!ownedTeam) return false;

  const owned = await db.query.teams.findFirst({
    columns: { id: true },
    where: and(eq(teams.id, teamId), eq(teams.ownerId, userId)),
  });

  if (owned) return true;

  const membership = await db.query.teamMembers.findFirst({
    columns: { id: true, teamId: true },
    where: and(
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.playerId, userId),
    ),
  });

  return Boolean(membership);
}

export async function getAccessibleTeamIds(userId: string): Promise<number[]> {
  const ownedTeams = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.ownerId, userId));

  const memberships = await db
    .select({ id: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.playerId, userId));

  return Array.from(
    new Set([
      ...ownedTeams.map(team => team.id),
      ...memberships.map(m => m.id),
    ]),
  );
}

/**
 * Returns true if the user can manage the team operationally:
 * owner OR co-captain (role "manager"). Use this to gate mutations
 * (create/edit events, attendance, payment registration).
 * For owner-only actions (billing, delete team, promote co-captain)
 * use userIsTeamOwner instead.
 */
export async function canManageTeam(
  userId: string,
  teamId: number,
): Promise<boolean> {
  const owned = await db.query.teams.findFirst({
    columns: { id: true },
    where: and(eq(teams.id, teamId), eq(teams.ownerId, userId)),
  });
  if (owned) return true;

  const membership = await db.query.teamMembers.findFirst({
    columns: { id: true },
    where: and(
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.playerId, userId),
      inArray(teamMembers.role, ["owner", "manager"]),
    ),
  });
  return Boolean(membership);
}

/**
 * Returns true if the given user is the owner (captain) of the team.
 * Use this to gate edit/manage capabilities — team members can view
 * but only the owner can mutate event settings.
 */
export async function userIsTeamOwner(
  userId: string,
  teamId: number,
): Promise<boolean> {
  const owned = await db.query.teams.findFirst({
    columns: { id: true },
    where: and(eq(teams.id, teamId), eq(teams.ownerId, userId)),
  });
  return Boolean(owned);
}
