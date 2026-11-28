import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/get-session";
import { isPreLaunchEligible } from "@/lib/launch-gate";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();

  if (!session) {
    redirect("/auth");
  }

  if (!(await isPreLaunchEligible(session.user.email))) {
    redirect("/waitlist");
  }

  return <>{children}</>;
}
