import type { db } from "@/db/client";
import { teamStaffEvents } from "@/db/schema";

/** Event types recorded in `team_staff_events` (append-only audit log). */
export const STAFF_EVENT_TYPES = [
  "promoted",
  "demoted",
  "permissions_changed",
  "title_changed",
  "ownership_transfer_requested",
  "ownership_transfer_cancelled",
  "ownership_transfer_accepted",
  "ownership_transfer_expired",
  "athlete_opt_in",
  "athlete_opt_out",
] as const;

export type StaffEventType = (typeof STAFF_EVENT_TYPES)[number];

/** A Drizzle transaction handle (or the client itself). */
export type DbExecutor =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

export type StaffEventInput = {
  teamId: number;
  actorUserId: string | null;
  subjectUserId: string | null;
  type: StaffEventType;
  payload?: Record<string, unknown>;
};

/**
 * Appends one audit row. Call inside the same transaction as the change it
 * describes so the log and the state never diverge.
 */
export async function recordStaffEvent(
  tx: DbExecutor,
  event: StaffEventInput,
): Promise<void> {
  await tx.insert(teamStaffEvents).values({
    teamId: event.teamId,
    actorUserId: event.actorUserId,
    subjectUserId: event.subjectUserId,
    type: event.type,
    payload: event.payload ?? null,
  });
}
