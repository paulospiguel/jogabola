import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { teamMembers, teamStaff, teams } from "@/db/schema";
import {
  isStaffPermission,
  isStaffTitle,
  STAFF_PERMISSIONS,
  type StaffPermission,
  type StaffTitle,
} from "@/lib/staff-permissions";
import type { TeamRole } from "@/types/teams";

/**
 * Per-team access summary for the current user. Everything here is
 * presentation-only: every mutation must authorize server-side via
 * `can()` / `isTeamOwner()` from `@/lib/team-authz`.
 */
export interface TeamAccessSummary {
  isOwner: boolean;
  isAthlete: boolean;
  staffTitle: StaffTitle | null;
  permissions: StaffPermission[];
  canManage: boolean;
  membershipRole: TeamRole;
}

type StaffRow = { teamId: number; title: string; permissions: string[] };

export function buildTeamSummaries<
  T extends { id: number; name: string; ownerId: string },
>(
  userId: string,
  teamRows: readonly T[],
  memberships: { staff: readonly StaffRow[]; rosterTeamIds: readonly number[] },
): (T & TeamAccessSummary)[] {
  const staffByTeam = new Map(memberships.staff.map(s => [s.teamId, s]));
  const roster = new Set(memberships.rosterTeamIds);

  return teamRows
    .map(team => {
      const isOwner = team.ownerId === userId;
      const staff = staffByTeam.get(team.id) ?? null;
      const staffTitle: StaffTitle | null = staff
        ? isStaffTitle(staff.title)
          ? staff.title
          : "other"
        : null;
      const permissions: StaffPermission[] = isOwner
        ? [...STAFF_PERMISSIONS]
        : (staff?.permissions ?? []).filter(isStaffPermission);
      const membershipRole: TeamRole = isOwner
        ? "owner"
        : staff
          ? "staff"
          : "player";

      return {
        ...team,
        isOwner,
        isAthlete: roster.has(team.id),
        staffTitle,
        permissions,
        canManage: isOwner || staff !== null,
        membershipRole,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Teams the user can view (owned ∪ staff ∪ roster), with access summaries. */
export async function listMyTeamSummaries(userId: string) {
  const [owned, staff, roster] = await Promise.all([
    db.select({ id: teams.id }).from(teams).where(eq(teams.ownerId, userId)),
    db
      .select({
        teamId: teamStaff.teamId,
        title: teamStaff.title,
        permissions: teamStaff.permissions,
      })
      .from(teamStaff)
      .where(eq(teamStaff.userId, userId)),
    db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.playerId, userId)),
  ]);

  const teamIds = Array.from(
    new Set([
      ...owned.map(row => row.id),
      ...staff.map(row => row.teamId),
      ...roster.map(row => row.teamId),
    ]),
  );
  if (teamIds.length === 0) return [];

  const teamRows = await db
    .select()
    .from(teams)
    .where(inArray(teams.id, teamIds));

  return buildTeamSummaries(userId, teamRows, {
    staff,
    rosterTeamIds: roster.map(row => row.teamId),
  });
}
