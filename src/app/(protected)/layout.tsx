import { getProfileData } from "@/actions/profile";
import { auth } from "@/lib/auth";
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
    // If profile exists but not completed, redirect to welcome
    if (!profileResult.data.completed) {
      redirect("/welcome");
    }
  } else {
    // If no profile exists at all, redirect to welcome
    redirect("/welcome");
  }

  return <>{children}</>;
}
