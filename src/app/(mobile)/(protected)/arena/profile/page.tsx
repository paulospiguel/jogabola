import { eq, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getMyRating } from "@/actions/player-ratings.actions";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { getCachedSession } from "@/lib/get-session";
import { listMyTeamSummaries } from "@/lib/team-summaries";
import { ProfileContainer } from "./_components/profile-container";

export default async function ArenaProfilePage() {
  const session = await getCachedSession();

  if (!session?.user) {
    redirect("/auth");
  }

  // Teams the user can view (owned ∪ staff ∪ roster) with their role.
  const memberships = await listMyTeamSummaries(session.user.id).catch(
    () => [],
  );

  // Member count per team (single grouped query)
  const teamIds = memberships.map(m => m.id);
  const counts = teamIds.length
    ? await db
        .select({
          teamId: schema.teamMembers.teamId,
          count: sql<number>`count(*)::int`,
        })
        .from(schema.teamMembers)
        .where(inArray(schema.teamMembers.teamId, teamIds))
        .groupBy(schema.teamMembers.teamId)
        .catch(() => [])
    : [];
  const countByTeam = new Map(counts.map(c => [c.teamId, c.count]));

  const realTeams = memberships.map(m => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    location: m.location,
    role: m.membershipRole,
    isAthlete: m.isAthlete,
    isOwnerOrStaff: m.canManage,
    // Roster (Plantel) rows only: owner/staff who don't play are not counted.
    memberCount: countByTeam.get(m.id) ?? 0,
  }));

  // Fetch registered passkey count from the database
  const passkeysCount = await db
    .select()
    .from(schema.passkey)
    .where(eq(schema.passkey.userId, session.user.id))
    .then(res => res.length)
    .catch(() => 0);

  // Athlete self-assessment (drives AI team balancing)
  const myRating = await getMyRating().catch(() => null);
  const rating = myRating
    ? {
        overall: myRating.overall,
        primaryPosition: myRating.primaryPosition,
      }
    : null;

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <ProfileContainer
          user={{
            id: session.user.id,
            name: session.user.name || "",
            email: session.user.email,
            image: session.user.image || null,
            emailVerified: Boolean(session.user.emailVerified),
          }}
          realTeams={realTeams}
          passkeysCount={passkeysCount}
          rating={rating}
        />
      </div>
    </div>
  );
}
