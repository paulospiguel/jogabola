import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  attendance,
  matchReservations,
  matchSessions,
  payments,
} from "@/db/schema";
import { can } from "@/lib/team-authz";

/** Server-only chat access check (not a Server Action: it takes an arbitrary
 * `userId`, so callers must pass the authenticated user's id).
 *
 * Access rule: the team owner or staff with `events.manage` always; otherwise
 * the user must have confirmed attendance AND (when the event requires payment) an approved
 * payment. Pending/unpaid/reserve see only the blurred teaser. */
export async function canParticipateInChat(
  eventId: number,
  userId: string,
): Promise<boolean> {
  const event = await db.query.matchSessions.findFirst({
    columns: { teamId: true, paymentRequired: true },
    where: eq(matchSessions.id, eventId),
  });
  if (!event) return false;

  // Owner or staff who manage events always have access.
  if (await can(userId, event.teamId, "events.manage")) return true;

  const confirmed = await db
    .select({ id: attendance.id })
    .from(attendance)
    .where(
      and(
        eq(attendance.matchSessionId, eventId),
        eq(attendance.playerId, userId),
        eq(attendance.status, "confirmed"),
      ),
    )
    .limit(1);

  if (confirmed.length === 0) return false;

  // Free events: confirmed attendance is enough.
  if (!event.paymentRequired) return true;

  // Paid events: require an approved payment for this user's reservation.
  const paid = await db
    .select({ id: payments.id })
    .from(payments)
    .innerJoin(
      matchReservations,
      eq(payments.matchReservationId, matchReservations.id),
    )
    .where(
      and(
        eq(matchReservations.matchSessionId, eventId),
        eq(matchReservations.playerId, userId),
        eq(payments.status, "paid"),
      ),
    )
    .limit(1);

  return paid.length > 0;
}
