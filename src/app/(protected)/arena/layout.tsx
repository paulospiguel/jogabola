import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DotGrid from "@/components/arena/dot-grid";
import { JbBottomNav } from "@/components/arena/jb-bottom-nav";
import { JbMobileTopBar } from "@/components/arena/jb-mobile-top-bar";
import { JbSidebar } from "@/components/arena/jb-sidebar";
import { TeamGateProvider } from "@/components/arena/team-gate-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export default async function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as any;
  const sessionData = session?.session as any;

  if (!user?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const role: string | null = user?.role ?? null;
  let hasTeam = Boolean(sessionData?.teamId);

  // Fallback: Check if user has any team membership in DB if session is stale
  if (!hasTeam && user?.id) {
    const membership = await db.query.teamMembers.findFirst({
      where: eq(schema.teamMembers.playerId, user.id),
    });
    if (membership) {
      hasTeam = true;
    }
  }

  return (
    <SidebarProvider>
      <TeamGateProvider role={role} hasTeam={hasTeam}>
        <div className="jb-arena flex min-h-screen w-full">
          <div className="jb-arena-bg" aria-hidden="true">
            <DotGrid
              activeColor="#7CFF4F"
              baseColor="#263244"
              dotSize={3}
              gap={26}
              proximity={130}
              resistance={760}
              returnDuration={1.4}
              shockRadius={230}
              shockStrength={4.5}
              speedTrigger={120}
            />
          </div>

          <JbSidebar />

          <JbMobileTopBar />

          <main className="jb-arena-shell relative flex-1 md:pt-0 pt-20">
            {children}
          </main>

          <JbBottomNav />
        </div>
      </TeamGateProvider>
    </SidebarProvider>
  );
}
