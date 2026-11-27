import { notFound } from "next/navigation";
import { getTeamStaff } from "@/actions/team-staff.actions";
import { getAuthUser } from "@/lib/action-helpers";
import { listMyTeamSummaries } from "@/lib/team-summaries";
import { loadOwnerTransferData } from "@/lib/team-transfer-candidates";
import { StaffList } from "./_components/staff-list";

/**
 * Staff section: owner and staff only. The server is authoritative — any
 * failure (not staff, no team, forbidden) renders a 404.
 */
export default async function ArenaStaffPage() {
  const user = await getAuthUser();
  if (!user) notFound();

  // Same resolution as the client's `useTeams`: session team, else first team.
  const teamId =
    user.teamId ?? (await listMyTeamSummaries(user.id))[0]?.id ?? null;
  if (!teamId) notFound();

  const result = await getTeamStaff({ teamId });
  if (!result.success) notFound();

  const viewerIsOwner = result.data.some(
    entry => entry.title === "owner" && entry.userId === user.id,
  );

  // Owner-only: candidates, team name and any pending request.
  const transfer = viewerIsOwner
    ? await loadOwnerTransferData(
        teamId,
        user.id,
        result.data.map(({ userId, name, image }) => ({ userId, name, image })),
      )
    : null;

  return (
    <StaffList
      initialStaff={result.data}
      teamId={teamId}
      transfer={transfer}
      viewerId={user.id}
      viewerIsOwner={viewerIsOwner}
    />
  );
}
