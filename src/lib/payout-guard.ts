import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teamPaymentSettings } from "@/db/schema";
import {
  decidePayoutUpdate,
  type PayoutPayload,
} from "@/lib/payout-reconfigure";
import { isTeamOwner } from "@/lib/team-authz";

/**
 * Server-side pre-check for paths that write payment settings as a side
 * effect (the event form), so they can refuse before writing anything else.
 * `upsertTeamPaymentSettings` applies the same rule again on write.
 */
export async function payoutWriteAllowed(
  userId: string,
  teamId: number,
  payload: PayoutPayload,
): Promise<boolean> {
  const settings = await db.query.teamPaymentSettings.findFirst({
    where: eq(teamPaymentSettings.teamId, teamId),
  });
  const flagged = settings?.payoutReconfigureRequiredAt != null;
  if (!flagged) return true;
  const isOwner = await isTeamOwner(userId, teamId);
  return decidePayoutUpdate({ flagged, isOwner, payload }).allowed;
}
