import { eq } from "drizzle-orm";
import { getPendingTransfer } from "@/actions/team-transfer.actions";
import { db } from "@/db/client";
import { teamMembers, teams, user as userTable } from "@/db/schema";
import {
  buildTransferCandidates,
  type OwnerTransferData,
  type TransferCandidate,
} from "@/lib/transfer-ui";

/** Registered roster athletes of a team. */
async function listRegisteredRoster(
  teamId: number,
): Promise<TransferCandidate[]> {
  return db
    .select({
      userId: userTable.id,
      name: userTable.name,
      image: userTable.image,
    })
    .from(teamMembers)
    .innerJoin(userTable, eq(teamMembers.playerId, userTable.id))
    .where(eq(teamMembers.teamId, teamId));
}

/**
 * Data for the owner's "Transferir equipa" entry. Call only once the caller
 * is known to be the owner; `requestOwnershipTransfer` re-checks everything.
 */
export async function loadOwnerTransferData(
  teamId: number,
  ownerId: string,
  staff: readonly TransferCandidate[],
): Promise<OwnerTransferData | null> {
  const [[team], roster, pending] = await Promise.all([
    db
      .select({ name: teams.name })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1),
    listRegisteredRoster(teamId),
    getPendingTransfer({ teamId }),
  ]);
  if (!team) return null;

  return {
    teamName: team.name,
    candidates: buildTransferCandidates(roster, staff, ownerId),
    initialPending: pending.success ? pending.data : null,
  };
}
