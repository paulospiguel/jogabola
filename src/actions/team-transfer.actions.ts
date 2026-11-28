"use server";

import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull, or, type SQL, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import {
  session as sessionTable,
  teamMembers,
  teamOwnershipTransfers,
  teamPaymentSettings,
  teamStaff,
  teams,
  user as userTable,
} from "@/db/schema";
import { withAuthAction, withAuthQuery } from "@/lib/action-helpers";
import { sendTeamTransferEmail } from "@/lib/email";
import { isPreLaunchEligible } from "@/lib/launch-gate";
import { canCreateTeam, normalizePlanTier } from "@/lib/plan-limits";
import { type DbExecutor, recordStaffEvent } from "@/lib/staff-audit";
import { getTeamAccess } from "@/lib/team-authz";
import {
  normalizeEmail,
  requestOwnershipTransferSchema,
  teamTransferTeamSchema,
  transferIdSchema,
  transferTokenSchema,
} from "@/schemas/team-transfer.schema";
import type { ActionResult } from "@/types/common";

const T = teamOwnershipTransfers;
const TRANSFER_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type TransferRow = typeof teamOwnershipTransfers.$inferSelect;
type Failure = Extract<ActionResult<never>, { success: false }>;
type Caller = { id: string; email: string; emailVerified: boolean };

export type PendingTransfer = {
  transferId: number;
  toUserId: string | null;
  toName: string | null;
  toEmail: string | null;
  expiresAt: Date;
};

export type IncomingTransfer = {
  transferId: number;
  teamName: string;
  fromName: string;
  expiresAt: Date;
};

const fail = (code: string): Failure => ({ success: false, error: { code } });

/** The token never leaves this module except inside the email link. */
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

function refreshArena() {
  revalidatePath("/arena", "layout");
}

function isUniqueViolation(error: unknown): boolean {
  const code = (e: unknown) =>
    typeof e === "object" && e !== null
      ? (e as { code?: unknown }).code
      : undefined;
  return (
    code(error) === "23505" ||
    code((error as { cause?: unknown } | null)?.cause) === "23505"
  );
}

const isStale = (row: TransferRow, now: Date) =>
  row.status === "pending" && row.expiresAt.getTime() <= now.getTime();

/**
 * Marks a pending, past-due request `expired` and records the event.
 * Returns true when the row is (now) expired.
 */
async function expireIfStale(
  tx: DbExecutor,
  row: TransferRow,
  now = new Date(),
): Promise<boolean> {
  if (!isStale(row, now)) return row.status === "expired";
  const updated = await tx
    .update(T)
    .set({ status: "expired", resolvedAt: now })
    .where(and(eq(T.id, row.id), eq(T.status, "pending")))
    .returning({ id: T.id });
  if (updated.length > 0) {
    await recordStaffEvent(tx, {
      teamId: row.teamId,
      actorUserId: null,
      subjectUserId: row.toUserId,
      type: "ownership_transfer_expired",
      payload: { transferId: row.id },
    });
  }
  row.status = "expired";
  return true;
}

/**
 * Locks and expires each stale row; used by read paths. Rows are locked in
 * ascending id order so concurrent callers can never deadlock.
 */
async function expireStaleRows(rows: TransferRow[]) {
  if (rows.length === 0) return;
  const ordered = [...rows].sort((a, b) => a.id - b.id);
  await db.transaction(async tx => {
    for (const stale of ordered) {
      const [locked] = await tx
        .select()
        .from(T)
        .where(eq(T.id, stale.id))
        .for("update");
      if (locked) await expireIfStale(tx, locked);
    }
  });
}

/** Whether `caller` is the recipient of `row`; returns an error code otherwise. */
function recipientError(row: TransferRow, caller: Caller): string | null {
  if (row.fromUserId === caller.id) return "CANNOT_TRANSFER_TO_SELF";
  if (row.toUserId) {
    return row.toUserId === caller.id ? null : "TRANSFER_NOT_FOR_YOU";
  }
  if (!row.toEmail || normalizeEmail(caller.email) !== row.toEmail) {
    return "TRANSFER_NOT_FOR_YOU";
  }
  return caller.emailVerified ? null : "EMAIL_NOT_VERIFIED";
}

type ResolveOutcome =
  | { kind: "failure"; failure: Failure }
  | { kind: "done"; row: TransferRow }
  | { kind: "pending"; row: TransferRow; planTier: string | null };

/**
 * Shared front half of accept/decline, inside the caller's transaction:
 * finds the request, checks the recipient, takes the locks and resolves
 * expiry.
 *
 * Lock order (every path takes them in this order, so no cycle can form):
 *   1. `teams` row — `FOR NO KEY UPDATE` in request/cancel/accept,
 *      `FOR SHARE` in the staff mutations. These conflict with each other on
 *      purpose (ownership changes serialize with owner-only mutations), but
 *      neither conflicts with the `FOR KEY SHARE` that FK inserts referencing
 *      the team take (owner_id is not a key column).
 *   2. recipient `user` row — accept only, `FOR NO KEY UPDATE`, so the
 *      owned-team count is stable across concurrent accepts by the same
 *      recipient. It does not conflict with the `FOR KEY SHARE` taken by
 *      inserts whose FK references that user (e.g. `team_staff_events`).
 *   3. transfer row — `FOR UPDATE`.
 * Decline takes only (3). Nothing takes (1) after (2) or (3), and the FK
 * key-share locks taken by inserts never wait on (1) or (2).
 */
async function resolveForRecipient(
  tx: DbExecutor,
  where: SQL,
  userId: string,
  mode: "accept" | "decline",
): Promise<ResolveOutcome> {
  const [found] = await tx.select().from(T).where(where).limit(1);
  if (!found) return { kind: "failure", failure: fail("TRANSFER_NOT_FOUND") };

  const [caller] = await tx
    .select({
      email: userTable.email,
      emailVerified: userTable.emailVerified,
    })
    .from(userTable)
    .where(eq(userTable.id, userId));
  if (!caller) return { kind: "failure", failure: fail("UNAUTHORIZED") };

  const identity = { id: userId, ...caller };
  const denied = recipientError(found, identity);
  if (denied) return { kind: "failure", failure: fail(denied) };

  let ownerId: string | null = null;
  let planTier: string | null = null;
  if (mode === "accept") {
    const [team] = await tx
      .select({ ownerId: teams.ownerId })
      .from(teams)
      .where(eq(teams.id, found.teamId))
      .for("no key update");
    if (!team) return { kind: "failure", failure: fail("TRANSFER_NOT_FOUND") };
    ownerId = team.ownerId;

    const [recipient] = await tx
      .select({ planTier: userTable.planTier })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .for("no key update");
    if (!recipient) return { kind: "failure", failure: fail("UNAUTHORIZED") };
    planTier = recipient.planTier;
  }

  const [row] = await tx
    .select()
    .from(T)
    .where(eq(T.id, found.id))
    .for("update");
  if (!row) return { kind: "failure", failure: fail("TRANSFER_NOT_FOUND") };
  const deniedLocked = recipientError(row, identity);
  if (deniedLocked) return { kind: "failure", failure: fail(deniedLocked) };

  if (row.status === "accepted") {
    return mode === "accept" && row.toUserId === userId
      ? { kind: "done", row }
      : { kind: "failure", failure: fail("TRANSFER_NOT_FOUND") };
  }
  if (await expireIfStale(tx, row)) {
    return { kind: "failure", failure: fail("TRANSFER_EXPIRED") };
  }
  if (row.status !== "pending") {
    return { kind: "failure", failure: fail("TRANSFER_NOT_FOUND") };
  }
  // The team changed hands outside this request: it no longer applies.
  if (mode === "accept" && ownerId !== row.fromUserId) {
    return { kind: "failure", failure: fail("TRANSFER_NOT_FOUND") };
  }
  return { kind: "pending", row, planTier };
}

/** Whether `userId` is still on the roster or staff of `teamId`. */
async function isRosterOrStaff(
  tx: DbExecutor,
  teamId: number,
  userId: string,
): Promise<boolean> {
  const [athlete] = await tx
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.playerId, userId)),
    )
    .limit(1);
  if (athlete) return true;
  const [staff] = await tx
    .select({ id: teamStaff.id })
    .from(teamStaff)
    .where(and(eq(teamStaff.teamId, teamId), eq(teamStaff.userId, userId)))
    .limit(1);
  return Boolean(staff);
}

/** Accept core shared by the token and id paths. */
async function acceptTransfer(
  where: SQL,
  userId: string,
): Promise<ActionResult<{ teamId: number }>> {
  const outcome = await db.transaction(
    async (tx): Promise<ActionResult<{ teamId: number }>> => {
      const resolved = await resolveForRecipient(tx, where, userId, "accept");
      if (resolved.kind === "failure") return resolved.failure;
      const { row } = resolved;
      if (resolved.kind === "done") {
        return { success: true, data: { teamId: row.teamId } };
      }

      // A member-targeted request only applies while the recipient is
      // still on the roster or staff; the request stays pending otherwise.
      if (row.toUserId && !(await isRosterOrStaff(tx, row.teamId, userId))) {
        return fail("RECIPIENT_NOT_MEMBER");
      }

      const [{ teamCount }] = await tx
        .select({ teamCount: sql<number>`count(*)::int` })
        .from(teams)
        .where(eq(teams.ownerId, userId));
      if (!canCreateTeam(normalizePlanTier(resolved.planTier), teamCount)) {
        return fail("TEAM_LIMIT_REACHED");
      }

      const now = new Date();
      await tx
        .update(teams)
        .set({ ownerId: userId, updatedAt: now })
        .where(eq(teams.id, row.teamId));

      // The new owner is never staff; the old owner is not kept as staff.
      await tx
        .delete(teamStaff)
        .where(
          and(eq(teamStaff.teamId, row.teamId), eq(teamStaff.userId, userId)),
        );
      await tx
        .delete(teamStaff)
        .where(
          and(
            eq(teamStaff.teamId, row.teamId),
            eq(teamStaff.userId, row.fromUserId),
          ),
        );

      // Old owner keeps their roster row only if they had one; otherwise
      // they lose access, so their sessions stop pointing at this team.
      const [oldOwnerRoster] = await tx
        .select({ id: teamMembers.id })
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, row.teamId),
            eq(teamMembers.playerId, row.fromUserId),
          ),
        )
        .limit(1);
      if (!oldOwnerRoster) {
        await tx
          .update(sessionTable)
          .set({ teamId: null })
          .where(
            and(
              eq(sessionTable.userId, row.fromUserId),
              eq(sessionTable.teamId, row.teamId),
            ),
          );
      }

      // Online payment methods stay stored but inactive and masked until
      // the new owner enters fresh details (ADR 0006). Cash is untouched.
      await tx
        .update(teamPaymentSettings)
        .set({
          stripeEnabled: false,
          mbwayEnabled: false,
          transferEnabled: false,
          payoutReconfigureRequiredAt: now,
          updatedAt: now,
        })
        .where(eq(teamPaymentSettings.teamId, row.teamId));

      const accepted = await tx
        .update(T)
        .set({ status: "accepted", toUserId: userId, resolvedAt: now })
        .where(and(eq(T.id, row.id), eq(T.status, "pending")))
        .returning({ id: T.id });
      // Unreachable under the row lock; throwing rolls back every write above.
      if (accepted.length !== 1) {
        throw new Error("Ownership transfer changed state during accept");
      }

      await recordStaffEvent(tx, {
        teamId: row.teamId,
        actorUserId: userId,
        subjectUserId: userId,
        type: "ownership_transfer_accepted",
        payload: { transferId: row.id, fromUserId: row.fromUserId },
      });

      return { success: true, data: { teamId: row.teamId } };
    },
  );

  if (outcome.success) refreshArena();
  return outcome;
}

/**
 * Before launch, only testers may become owners: same check as the
 * `(protected)` layout, done outside the transaction (it calls Notion).
 */
async function acceptIfEligible(
  where: SQL,
  user: { id: string; email: string },
): Promise<ActionResult<{ teamId: number }>> {
  if (!(await isPreLaunchEligible(user.email))) {
    return fail("RECIPIENT_NOT_ELIGIBLE");
  }
  return acceptTransfer(where, user.id);
}

/** Cancels a request whose email never left, so the owner can retry. */
async function cancelAfterEmailFailure(
  teamId: number,
  transferId: number,
  actorUserId: string,
  subjectUserId: string | null,
) {
  await db.transaction(async tx => {
    const cancelled = await tx
      .update(T)
      .set({ status: "cancelled", resolvedAt: new Date() })
      .where(and(eq(T.id, transferId), eq(T.status, "pending")))
      .returning({ id: T.id });
    if (cancelled.length === 0) return;
    await recordStaffEvent(tx, {
      teamId,
      actorUserId,
      subjectUserId,
      type: "ownership_transfer_cancelled",
      payload: { transferId, reason: "email_failed" },
    });
  });
}

/** Decline core shared by the token and id paths. */
async function declineTransfer(
  where: SQL,
  userId: string,
): Promise<ActionResult<{ declined: true }>> {
  const outcome = await db.transaction(
    async (tx): Promise<ActionResult<{ declined: true }>> => {
      const resolved = await resolveForRecipient(tx, where, userId, "decline");
      if (resolved.kind === "failure") return resolved.failure;
      if (resolved.kind === "done") return fail("TRANSFER_NOT_FOUND");
      const { row } = resolved;

      await tx
        .update(T)
        .set({ status: "cancelled", resolvedAt: new Date() })
        .where(and(eq(T.id, row.id), eq(T.status, "pending")));
      await recordStaffEvent(tx, {
        teamId: row.teamId,
        actorUserId: userId,
        subjectUserId: userId,
        type: "ownership_transfer_cancelled",
        payload: { transferId: row.id, reason: "declined" },
      });
      return { success: true, data: { declined: true } };
    },
  );

  if (outcome.success) refreshArena();
  return outcome;
}

/** Owner asks to hand the team to a roster/staff member or an email. */
export const requestOwnershipTransfer = withAuthAction(
  requestOwnershipTransferSchema,
  async (
    user,
    data,
  ): Promise<ActionResult<{ transferId: number; expiresAt: Date }>> => {
    const access = await getTeamAccess(user.id, data.teamId);
    if (!access.teamExists) return fail("TEAM_NOT_FOUND");
    if (!access.isOwner) return fail("FORBIDDEN");

    const [team] = await db
      .select({ name: teams.name })
      .from(teams)
      .where(eq(teams.id, data.teamId))
      .limit(1);
    if (!team) return fail("TEAM_NOT_FOUND");
    if (data.confirmTeamName.trim() !== team.name) {
      return fail("TEAM_NAME_MISMATCH");
    }

    let toUserId: string | null = null;
    let recipientEmail: string;
    if (data.toUserId !== undefined) {
      if (data.toUserId === user.id) return fail("CANNOT_TRANSFER_TO_SELF");
      const target = await getTeamAccess(data.toUserId, data.teamId);
      if (!target.isAthlete && target.staff === null) {
        return fail("RECIPIENT_NOT_MEMBER");
      }
      const [recipient] = await db
        .select({ email: userTable.email })
        .from(userTable)
        .where(eq(userTable.id, data.toUserId))
        .limit(1);
      if (!recipient) return fail("RECIPIENT_NOT_MEMBER");
      toUserId = data.toUserId;
      recipientEmail = normalizeEmail(recipient.email);
    } else {
      recipientEmail = normalizeEmail(data.toEmail ?? "");
      if (recipientEmail === normalizeEmail(user.email)) {
        return fail("CANNOT_TRANSFER_TO_SELF");
      }
      // Before launch an outside email could never reach the app.
      if (!(await isPreLaunchEligible(recipientEmail))) {
        return fail("RECIPIENT_NOT_ELIGIBLE");
      }
    }

    const token = randomBytes(32).toString("base64url");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TRANSFER_TTL_MS);

    let created: ActionResult<{ transferId: number; expiresAt: Date }>;
    try {
      created = await db.transaction(async tx => {
        const [locked] = await tx
          .select({ ownerId: teams.ownerId })
          .from(teams)
          .where(eq(teams.id, data.teamId))
          .for("no key update");
        if (locked?.ownerId !== user.id) return fail("FORBIDDEN");

        const [pending] = await tx
          .select()
          .from(T)
          .where(and(eq(T.teamId, data.teamId), eq(T.status, "pending")))
          .for("update");
        if (pending && !(await expireIfStale(tx, pending, now))) {
          return fail("TRANSFER_ALREADY_PENDING");
        }

        const [inserted] = await tx
          .insert(T)
          .values({
            teamId: data.teamId,
            fromUserId: user.id,
            toUserId,
            toEmail: toUserId ? null : recipientEmail,
            tokenHash: hashToken(token),
            status: "pending",
            expiresAt,
          })
          .returning({ id: T.id });

        await recordStaffEvent(tx, {
          teamId: data.teamId,
          actorUserId: user.id,
          subjectUserId: toUserId,
          type: "ownership_transfer_requested",
          payload: {
            transferId: inserted.id,
            toEmail: toUserId ? null : recipientEmail,
            expiresAt: expiresAt.toISOString(),
          },
        });
        return { success: true, data: { transferId: inserted.id, expiresAt } };
      });
    } catch (error) {
      if (isUniqueViolation(error)) return fail("TRANSFER_ALREADY_PENDING");
      throw error;
    }
    if (!created.success) return created;

    // Only the hash is stored: if the email does not leave, the link is
    // lost, so the request is cancelled and the owner can send it again.
    let sent = false;
    try {
      const delivery = await sendTeamTransferEmail(recipientEmail, {
        teamName: team.name,
        fromName: user.name,
        expiresAt,
        token,
      });
      sent = delivery.success;
    } catch (error) {
      console.error("[team-transfer] email send failed:", error);
    }
    if (!sent) {
      await cancelAfterEmailFailure(
        data.teamId,
        created.data.transferId,
        user.id,
        toUserId,
      );
      refreshArena();
      return fail("EMAIL_SEND_FAILED");
    }

    refreshArena();
    return created;
  },
);

/** Owner withdraws the pending request. */
export const cancelOwnershipTransfer = withAuthAction(
  teamTransferTeamSchema,
  async (user, data): Promise<ActionResult<{ cancelled: true }>> => {
    const access = await getTeamAccess(user.id, data.teamId);
    if (!access.teamExists) return fail("TEAM_NOT_FOUND");
    if (!access.isOwner) return fail("FORBIDDEN");

    const outcome = await db.transaction(
      async (tx): Promise<ActionResult<{ cancelled: true }>> => {
        const [locked] = await tx
          .select({ ownerId: teams.ownerId })
          .from(teams)
          .where(eq(teams.id, data.teamId))
          .for("no key update");
        if (locked?.ownerId !== user.id) return fail("FORBIDDEN");

        const [pending] = await tx
          .select()
          .from(T)
          .where(and(eq(T.teamId, data.teamId), eq(T.status, "pending")))
          .for("update");
        if (!pending) return fail("TRANSFER_NOT_FOUND");
        if (await expireIfStale(tx, pending)) return fail("TRANSFER_EXPIRED");

        await tx
          .update(T)
          .set({ status: "cancelled", resolvedAt: new Date() })
          .where(eq(T.id, pending.id));
        await recordStaffEvent(tx, {
          teamId: data.teamId,
          actorUserId: user.id,
          subjectUserId: pending.toUserId,
          type: "ownership_transfer_cancelled",
          payload: { transferId: pending.id, reason: "cancelled" },
        });
        return { success: true, data: { cancelled: true } };
      },
    );

    if (outcome.success) refreshArena();
    return outcome;
  },
);

export const acceptOwnershipTransfer = withAuthAction(
  transferTokenSchema,
  async (user, data) =>
    acceptIfEligible(eq(T.tokenHash, hashToken(data.token)), user),
);

export const acceptOwnershipTransferById = withAuthAction(
  transferIdSchema,
  async (user, data) => acceptIfEligible(eq(T.id, data.transferId), user),
);

export const declineOwnershipTransfer = withAuthAction(
  transferTokenSchema,
  async (user, data) =>
    declineTransfer(eq(T.tokenHash, hashToken(data.token)), user.id),
);

export const declineOwnershipTransferById = withAuthAction(
  transferIdSchema,
  async (user, data) => declineTransfer(eq(T.id, data.transferId), user.id),
);

/** Details for the token landing page; holding the token is the access. */
export const getTransferByToken = withAuthAction(
  transferTokenSchema,
  async (
    _user,
    data,
  ): Promise<
    ActionResult<{
      teamName: string;
      fromName: string;
      expiresAt: Date;
      status: string;
    }>
  > => {
    const [found] = await db
      .select({
        transfer: T,
        teamName: teams.name,
        fromName: userTable.name,
      })
      .from(T)
      .innerJoin(teams, eq(teams.id, T.teamId))
      .innerJoin(userTable, eq(userTable.id, T.fromUserId))
      .where(eq(T.tokenHash, hashToken(data.token)))
      .limit(1);
    if (!found) return fail("TRANSFER_NOT_FOUND");

    let status: string = found.transfer.status;
    if (isStale(found.transfer, new Date())) {
      await expireStaleRows([found.transfer]);
      status = "expired";
    }

    return {
      success: true,
      data: {
        teamName: found.teamName,
        fromName: found.fromName,
        expiresAt: found.transfer.expiresAt,
        status,
      },
    };
  },
);

/** Owner view of the team's pending request, if any. */
export const getPendingTransfer = withAuthAction(
  teamTransferTeamSchema,
  async (user, data): Promise<ActionResult<PendingTransfer | null>> => {
    const access = await getTeamAccess(user.id, data.teamId);
    if (!access.teamExists) return fail("TEAM_NOT_FOUND");
    if (!access.isOwner) return fail("FORBIDDEN");

    const [found] = await db
      .select({ transfer: T, toName: userTable.name })
      .from(T)
      .leftJoin(userTable, eq(userTable.id, T.toUserId))
      .where(and(eq(T.teamId, data.teamId), eq(T.status, "pending")))
      .limit(1);
    if (!found) return { success: true, data: null };
    if (isStale(found.transfer, new Date())) {
      await expireStaleRows([found.transfer]);
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        transferId: found.transfer.id,
        toUserId: found.transfer.toUserId,
        toName: found.toName ?? null,
        toEmail: found.transfer.toEmail,
        expiresAt: found.transfer.expiresAt,
      },
    };
  },
);

/** Pending requests addressed to the caller (by id or verified email). */
export const getMyIncomingTransfers = withAuthQuery(
  async (user): Promise<ActionResult<IncomingTransfer[]>> => {
    const [caller] = await db
      .select({
        email: userTable.email,
        emailVerified: userTable.emailVerified,
      })
      .from(userTable)
      .where(eq(userTable.id, user.id))
      .limit(1);
    if (!caller) return fail("UNAUTHORIZED");

    const recipient = caller.emailVerified
      ? or(
          eq(T.toUserId, user.id),
          and(isNull(T.toUserId), eq(T.toEmail, normalizeEmail(caller.email))),
        )
      : eq(T.toUserId, user.id);

    const rows = await db
      .select({
        transfer: T,
        teamName: teams.name,
        fromName: userTable.name,
      })
      .from(T)
      .innerJoin(teams, eq(teams.id, T.teamId))
      .innerJoin(userTable, eq(userTable.id, T.fromUserId))
      .where(and(eq(T.status, "pending"), recipient));

    const now = new Date();
    const fresh = rows.filter(row => !isStale(row.transfer, now));
    const stale = rows.filter(row => isStale(row.transfer, now));
    await expireStaleRows(stale.map(row => row.transfer));

    return {
      success: true,
      data: fresh
        .filter(row => row.transfer.fromUserId !== user.id)
        .map(row => ({
          transferId: row.transfer.id,
          teamName: row.teamName,
          fromName: row.fromName,
          expiresAt: row.transfer.expiresAt,
        })),
    };
  },
);
