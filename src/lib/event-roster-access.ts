import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { players, teamMembers, user as userTable } from "@/db/schema";

export function normalizeRosterEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function emailBelongsToTeamRoster(teamId: number, email: string) {
  const normalizedEmail = normalizeRosterEmail(email);
  if (!normalizedEmail) return false;

  const manualPlayer = await db.query.players.findFirst({
    columns: { id: true },
    where: and(
      eq(players.teamId, teamId),
      sql`lower(${players.email}) = ${normalizedEmail}`,
    ),
  });
  if (manualPlayer) return true;

  const registeredUser = await db.query.user.findFirst({
    columns: { id: true },
    where: sql`lower(${userTable.email}) = ${normalizedEmail}`,
  });
  if (!registeredUser) return false;

  const member = await db.query.teamMembers.findFirst({
    columns: { id: true },
    where: and(
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.playerId, registeredUser.id),
    ),
  });

  return !!member;
}

export async function userBelongsToTeamRoster(teamId: number, userId: string) {
  const member = await db.query.teamMembers.findFirst({
    columns: { id: true },
    where: and(
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.playerId, userId),
    ),
  });
  if (member) return true;

  const account = await db.query.user.findFirst({
    columns: { email: true },
    where: eq(userTable.id, userId),
  });
  if (!account?.email) return false;

  return emailBelongsToTeamRoster(teamId, account.email);
}
