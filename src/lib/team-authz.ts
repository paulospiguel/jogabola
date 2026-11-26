import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teamMembers, teamStaff, teams } from "@/db/schema";
import {
  isStaffPermission,
  isStaffTitle,
  type StaffPermission,
  type StaffTitle,
} from "@/lib/staff-permissions";

/**
 * Server-side team authorization. Owner comes only from `teams.owner_id`,
 * staff from `team_staff`, athletes (roster) from `team_members`.
 */
export type TeamAccess = {
  teamExists: boolean;
  isOwner: boolean;
  isAthlete: boolean;
  staff: { title: StaffTitle; permissions: StaffPermission[] } | null;
};

const NO_ACCESS: TeamAccess = {
  teamExists: false,
  isOwner: false,
  isAthlete: false,
  staff: null,
};

export async function getTeamAccess(
  userId: string,
  teamId: number,
): Promise<TeamAccess> {
  const [row] = await db
    .select({
      ownerId: teams.ownerId,
      staffTitle: teamStaff.title,
      staffPermissions: teamStaff.permissions,
      memberId: teamMembers.id,
    })
    .from(teams)
    .leftJoin(
      teamStaff,
      and(eq(teamStaff.teamId, teams.id), eq(teamStaff.userId, userId)),
    )
    .leftJoin(
      teamMembers,
      and(eq(teamMembers.teamId, teams.id), eq(teamMembers.playerId, userId)),
    )
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!row) return { ...NO_ACCESS };

  const staff =
    row.staffTitle === null || row.staffTitle === undefined
      ? null
      : {
          title: isStaffTitle(row.staffTitle) ? row.staffTitle : "other",
          permissions: (row.staffPermissions ?? []).filter(isStaffPermission),
        };

  return {
    teamExists: true,
    isOwner: row.ownerId === userId,
    isAthlete: row.memberId !== null && row.memberId !== undefined,
    staff,
  };
}

export function accessCanView(a: TeamAccess): boolean {
  return a.teamExists && (a.isOwner || a.isAthlete || a.staff !== null);
}

export function accessCan(a: TeamAccess, p: StaffPermission): boolean {
  if (!a.teamExists) return false;
  if (a.isOwner) return true;
  return a.staff?.permissions.includes(p) ?? false;
}

export function isStaffOrOwner(a: TeamAccess): boolean {
  return a.teamExists && (a.isOwner || a.staff !== null);
}

export async function canViewTeam(
  userId: string,
  teamId: number,
): Promise<boolean> {
  return accessCanView(await getTeamAccess(userId, teamId));
}

export async function can(
  userId: string,
  teamId: number,
  p: StaffPermission,
): Promise<boolean> {
  return accessCan(await getTeamAccess(userId, teamId), p);
}

export async function isTeamOwner(
  userId: string,
  teamId: number,
): Promise<boolean> {
  const access = await getTeamAccess(userId, teamId);
  return access.teamExists && access.isOwner;
}

/** Teams the user can view: owned ∪ staff ∪ roster. */
export async function getAccessibleTeamIds(userId: string): Promise<number[]> {
  const [owned, staff, roster] = await Promise.all([
    db.select({ id: teams.id }).from(teams).where(eq(teams.ownerId, userId)),
    db
      .select({ id: teamStaff.teamId })
      .from(teamStaff)
      .where(eq(teamStaff.userId, userId)),
    db
      .select({ id: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.playerId, userId)),
  ]);

  return Array.from(
    new Set([...owned, ...staff, ...roster].map(row => row.id)),
  );
}
