import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { OnboardingClient } from "./_components/onboarding-client";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userName = session?.user?.name ?? null;

  return <OnboardingClient userName={userName} />;
}
