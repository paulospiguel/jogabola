import { db } from "@/db/client";
import { teamMembers } from "@/db/schema";

/**
 * Adds a registered user to a team's roster (Plantel). Internal helper —
 * callers must authorize first (`roster.manage`). `team_members` is
 * roster-only, so the role is always "player"; management lives in
 * `teams.owner_id` and `team_staff`. Existing roster rows are kept as-is.
 */
export async function insertRosterMember(
  teamId: number,
  userId: string,
  position?: string | null,
): Promise<void> {
  await db
    .insert(teamMembers)
    .values({
      teamId,
      playerId: userId,
      role: "player",
      position: position || null,
      status: "new",
    })
    .onConflictDoNothing({
      target: [teamMembers.teamId, teamMembers.playerId],
    });
}
