"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { teamMembers, teamStaff, teams, user as userTable } from "@/db/schema";
import { withAuthAction } from "@/lib/action-helpers";
import { type DbExecutor, recordStaffEvent } from "@/lib/staff-audit";
import {
  isStaffPermission,
  isStaffTitle,
  STAFF_PERMISSIONS,
  type StaffPermission,
  type StaffTitle,
} from "@/lib/staff-permissions";
import { getTeamAccess, type TeamAccess } from "@/lib/team-authz";
import {
  demoteStaffSchema,
  getTeamStaffSchema,
  promoteToStaffSchema,
  setMyAthleteStatusSchema,
  updateStaffMemberSchema,
} from "@/schemas/team-staff.schema";
import type { ActionResult } from "@/types/common";

export type TeamStaffEntry = {
  userId: string;
  name: string;
  image: string | null;
  title: StaffTitle | "owner";
  permissions: StaffPermission[];
  isAthlete: boolean;
};

type Failure = Extract<ActionResult<never>, { success: false }>;

const fail = (code: string): Failure => ({ success: false, error: { code } });

/** Owner-only guard shared by the staff management actions. */
async function requireOwner(
  actorId: string,
  teamId: number,
): Promise<Failure | null> {
  const access = await getTeamAccess(actorId, teamId);
  if (!access.teamExists) return fail("TEAM_NOT_FOUND");
  if (!access.isOwner) return fail("FORBIDDEN");
  return null;
}

function refreshArena() {
  revalidatePath("/arena", "layout");
}

/**
 * Re-reads `teams.owner_id` inside the mutation's transaction with a share
 * lock, so an ownership transfer that commits after the pre-check cannot let
 * the former owner finish an in-flight staff change.
 */
async function stillOwner(
  tx: DbExecutor,
  teamId: number,
  userId: string,
): Promise<boolean> {
  const [team] = await tx
    .select({ ownerId: teams.ownerId })
    .from(teams)
    .where(eq(teams.id, teamId))
    .for("share");
  return team?.ownerId === userId;
}

const sameList = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every(item => b.includes(item));

/** Owner or staff joins/leaves the roster (Plantel) themselves. */
export const setMyAthleteStatus = withAuthAction(
  setMyAthleteStatusSchema,
  async (user, data): Promise<ActionResult<{ isAthlete: boolean }>> => {
    const access = await getTeamAccess(user.id, data.teamId);
    if (!access.teamExists) return fail("TEAM_NOT_FOUND");
    if (!access.isOwner && access.staff === null) return fail("FORBIDDEN");

    await db.transaction(async tx => {
      if (data.isAthlete) {
        const inserted = await tx
          .insert(teamMembers)
          .values({
            teamId: data.teamId,
            playerId: user.id,
            role: "player",
            status: "new",
          })
          .onConflictDoNothing({
            target: [teamMembers.teamId, teamMembers.playerId],
          })
          .returning({ id: teamMembers.id });
        if (inserted.length > 0) {
          await recordStaffEvent(tx, {
            teamId: data.teamId,
            actorUserId: user.id,
            subjectUserId: user.id,
            type: "athlete_opt_in",
          });
        }
        return;
      }

      // Leaving the roster keeps attendance, payments and stats history.
      const removed = await tx
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, data.teamId),
            eq(teamMembers.playerId, user.id),
          ),
        )
        .returning({ id: teamMembers.id });
      if (removed.length > 0) {
        await recordStaffEvent(tx, {
          teamId: data.teamId,
          actorUserId: user.id,
          subjectUserId: user.id,
          type: "athlete_opt_out",
        });
      }
    });

    refreshArena();
    return { success: true, data: { isAthlete: data.isAthlete } };
  },
);

/** Owner promotes a registered athlete to staff. */
export const promoteToStaff = withAuthAction(
  promoteToStaffSchema,
  async (user, data): Promise<ActionResult<{ userId: string }>> => {
    const denied = await requireOwner(user.id, data.teamId);
    if (denied) return denied;

    const target: TeamAccess = await getTeamAccess(data.userId, data.teamId);
    if (target.isOwner) return fail("CANNOT_MODIFY_OWNER");
    if (!target.isAthlete) return fail("NOT_AN_ATHLETE");

    const result = await db.transaction(async tx => {
      if (!(await stillOwner(tx, data.teamId, user.id))) {
        return fail("FORBIDDEN");
      }
      const inserted = await tx
        .insert(teamStaff)
        .values({
          teamId: data.teamId,
          userId: data.userId,
          title: data.title,
          permissions: data.permissions,
          createdBy: user.id,
        })
        .onConflictDoNothing({ target: [teamStaff.teamId, teamStaff.userId] })
        .returning({ id: teamStaff.id });
      if (inserted.length > 0) {
        await recordStaffEvent(tx, {
          teamId: data.teamId,
          actorUserId: user.id,
          subjectUserId: data.userId,
          type: "promoted",
          payload: { title: data.title, permissions: data.permissions },
        });
      }
      return null;
    });
    if (result) return result;

    refreshArena();
    return { success: true, data: { userId: data.userId } };
  },
);

/** Owner changes a staff member's title and/or permissions. */
export const updateStaffMember = withAuthAction(
  updateStaffMemberSchema,
  async (user, data): Promise<ActionResult<{ userId: string }>> => {
    const denied = await requireOwner(user.id, data.teamId);
    if (denied) return denied;

    const target = await getTeamAccess(data.userId, data.teamId);
    if (target.isOwner) return fail("CANNOT_MODIFY_OWNER");

    const result = await db.transaction(async tx => {
      if (!(await stillOwner(tx, data.teamId, user.id))) {
        return fail("FORBIDDEN");
      }
      const [current] = await tx
        .select({ title: teamStaff.title, permissions: teamStaff.permissions })
        .from(teamStaff)
        .where(
          and(
            eq(teamStaff.teamId, data.teamId),
            eq(teamStaff.userId, data.userId),
          ),
        )
        .for("update");
      if (!current) return fail("NOT_STAFF");

      const nextTitle = data.title ?? current.title;
      const nextPermissions = data.permissions ?? current.permissions;
      const titleChanged = nextTitle !== current.title;
      const permissionsChanged = !sameList(
        nextPermissions,
        current.permissions,
      );
      if (!titleChanged && !permissionsChanged) return null;

      await tx
        .update(teamStaff)
        .set({
          title: nextTitle,
          permissions: nextPermissions,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(teamStaff.teamId, data.teamId),
            eq(teamStaff.userId, data.userId),
          ),
        );

      const event = {
        teamId: data.teamId,
        actorUserId: user.id,
        subjectUserId: data.userId,
      };
      if (titleChanged) {
        await recordStaffEvent(tx, {
          ...event,
          type: "title_changed",
          payload: { before: current.title, after: nextTitle },
        });
      }
      if (permissionsChanged) {
        await recordStaffEvent(tx, {
          ...event,
          type: "permissions_changed",
          payload: { before: current.permissions, after: nextPermissions },
        });
      }
      return null;
    });
    if (result) return result;

    refreshArena();
    return { success: true, data: { userId: data.userId } };
  },
);

/** Owner removes a staff member; their roster place is kept. */
export const demoteStaff = withAuthAction(
  demoteStaffSchema,
  async (user, data): Promise<ActionResult<{ userId: string }>> => {
    const denied = await requireOwner(user.id, data.teamId);
    if (denied) return denied;

    const target = await getTeamAccess(data.userId, data.teamId);
    if (target.isOwner) return fail("CANNOT_MODIFY_OWNER");

    const result = await db.transaction(async tx => {
      if (!(await stillOwner(tx, data.teamId, user.id))) {
        return fail("FORBIDDEN");
      }
      const [removed] = await tx
        .delete(teamStaff)
        .where(
          and(
            eq(teamStaff.teamId, data.teamId),
            eq(teamStaff.userId, data.userId),
          ),
        )
        .returning({
          title: teamStaff.title,
          permissions: teamStaff.permissions,
        });
      if (!removed) return fail("NOT_STAFF");

      await recordStaffEvent(tx, {
        teamId: data.teamId,
        actorUserId: user.id,
        subjectUserId: data.userId,
        type: "demoted",
        payload: { title: removed.title, permissions: removed.permissions },
      });
      return null;
    });
    if (result) return result;

    refreshArena();
    return { success: true, data: { userId: data.userId } };
  },
);

/** Owner (first) plus staff members. Readable by owner and staff only. */
export const getTeamStaff = withAuthAction(
  getTeamStaffSchema,
  async (user, data): Promise<ActionResult<TeamStaffEntry[]>> => {
    const access = await getTeamAccess(user.id, data.teamId);
    if (!access.teamExists) return fail("TEAM_NOT_FOUND");
    if (!access.isOwner && access.staff === null) return fail("FORBIDDEN");

    const [owner] = await db
      .select({
        userId: userTable.id,
        name: userTable.name,
        image: userTable.image,
      })
      .from(teams)
      .innerJoin(userTable, eq(userTable.id, teams.ownerId))
      .where(eq(teams.id, data.teamId))
      .limit(1);

    const staffRows = await db
      .select({
        userId: teamStaff.userId,
        name: userTable.name,
        image: userTable.image,
        title: teamStaff.title,
        permissions: teamStaff.permissions,
      })
      .from(teamStaff)
      .innerJoin(userTable, eq(userTable.id, teamStaff.userId))
      .where(eq(teamStaff.teamId, data.teamId))
      .orderBy(teamStaff.createdAt);

    const userIds = [
      ...(owner ? [owner.userId] : []),
      ...staffRows.map(row => row.userId),
    ];
    const rosterRows = userIds.length
      ? await db
          .select({ playerId: teamMembers.playerId })
          .from(teamMembers)
          .where(
            and(
              eq(teamMembers.teamId, data.teamId),
              inArray(teamMembers.playerId, userIds),
            ),
          )
      : [];
    const athletes = new Set(rosterRows.map(row => row.playerId));

    const entries: TeamStaffEntry[] = [];
    if (owner) {
      entries.push({
        userId: owner.userId,
        name: owner.name,
        image: owner.image ?? null,
        title: "owner",
        permissions: [...STAFF_PERMISSIONS],
        isAthlete: athletes.has(owner.userId),
      });
    }
    for (const row of staffRows) {
      entries.push({
        userId: row.userId,
        name: row.name,
        image: row.image ?? null,
        title: isStaffTitle(row.title) ? row.title : "other",
        permissions: (row.permissions ?? []).filter(isStaffPermission),
        isAthlete: athletes.has(row.userId),
      });
    }

    return { success: true, data: entries };
  },
);
