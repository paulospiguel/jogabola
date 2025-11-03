import { getProfileData } from "@/actions/profile";
import { JourneyWrapper } from "@/components/journey-wrapper";
import { auth } from "@/lib/auth";
import type { Role } from "@/schemas/profile";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session, redirect to sign-in
  if (!session) {
    redirect("/sign-in");
  }

  // Check if user has completed onboarding
  const profileResult = await getProfileData(session.user.id);

  if (profileResult.success && profileResult.data) {
    // If profile exists but not completed, redirect to onboard
    if (!profileResult.data.completed) {
      redirect("/onboard");
    }

    // Profile is complete - wrap children with JourneyWrapper
    const { role } = profileResult.data;

    return <JourneyWrapper role={role as Role}>{children}</JourneyWrapper>;
  } else {
    // If no profile exists at all, redirect to onboard
    redirect("/onboard");
  }
}
