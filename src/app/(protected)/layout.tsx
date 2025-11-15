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

  // Check if user has a profile (onboarding is optional)
  const profileResult = await getProfileData(session.user.id);

  if (profileResult.success && profileResult.data) {
    // Profile exists - wrap children with JourneyWrapper
    // If onboarding is not completed, role might be undefined, use default
    const { role } = profileResult.data;

    return <JourneyWrapper role={role as Role}>{children}</JourneyWrapper>;
  } else {
    // No profile exists - allow access anyway (onboarding is optional)
    // User can complete onboarding later if they want
    return <JourneyWrapper role={undefined}>{children}</JourneyWrapper>;
  }
}
