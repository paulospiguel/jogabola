import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { ProfileContainer } from "./_components/profile-container";

export default async function ArenaProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  // Fetch real team memberships for the authenticated user from the database
  const realTeams = await db
    .select({
      id: schema.teams.id,
      name: schema.teams.name,
      slug: schema.teams.slug,
      location: schema.teams.location,
    })
    .from(schema.teamMembers)
    .innerJoin(schema.teams, eq(schema.teamMembers.teamId, schema.teams.id))
    .where(eq(schema.teamMembers.playerId, session.user.id))
    .catch(() => []);

  // Fetch registered passkey count from the database
  const passkeysCount = await db
    .select()
    .from(schema.passkey)
    .where(eq(schema.passkey.userId, session.user.id))
    .then(res => res.length)
    .catch(() => 0);

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
        />
      </div>
    </div>
  );
}
