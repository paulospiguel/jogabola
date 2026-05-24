import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BottomNav } from "@/components/arena/bottom-nav";
import DotGrid from "@/components/arena/dot-grid";
import { MobileTopBar } from "@/components/arena/mobile-top-bar";
import { PasskeyPromptGate } from "@/components/arena/passkey-prompt-gate";
import { ArenaSidebar } from "@/components/arena/sidebar";
import { TeamGateProvider } from "@/components/arena/team-gate-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const sessionData = session?.session;

  if (!user) {
    redirect("/auth");
  }

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  const role: string | null = user?.role ?? null;
  let hasTeam = Boolean(sessionData?.teamId);

  if (!hasTeam && user?.id) {
    const membership = await db.query.teamMembers.findFirst({
      where: eq(schema.teamMembers.playerId, user.id),
    });
    if (membership) {
      hasTeam = true;
    }
  }

  let hasPasskey = false;
  if (user?.id) {
    const passkeyRecord = await db.query.passkey.findFirst({
      where: eq(schema.passkey.userId, user.id),
    });
    hasPasskey = Boolean(passkeyRecord);
  }

  const t = await getTranslations("passkeyPrompt");
  const passkeyTranslations = {
    title: t("title"),
    description: t("description"),
    yes: t("yes"),
    no: t("no"),
    skip: t("skip"),
    success: t("success"),
    error: t("error"),
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <TeamGateProvider role={role} hasTeam={hasTeam}>
        <PasskeyPromptGate
          hasPasskey={hasPasskey}
          userId={user.id}
          translations={passkeyTranslations}
        />
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

          <ArenaSidebar />

          <MobileTopBar />

          <main className="jb-arena-shell relative flex-1 pt-16 md:pt-0">
            {children}
          </main>

          <BottomNav />
        </div>
      </TeamGateProvider>
    </SidebarProvider>
  );
}
