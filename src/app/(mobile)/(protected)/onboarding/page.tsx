import { getCachedSession } from "@/lib/get-session";
import { OnboardingClient } from "./_components/onboarding-client";

export default async function OnboardingPage() {
  const session = await getCachedSession();
  const userName = session?.user?.name ?? null;

  return <OnboardingClient userName={userName} />;
}
