import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/get-session";
import { isTesterEmail } from "@/lib/notion";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();

  if (!session) {
    redirect("/auth");
  }

  const isLaunched = process.env.APP_LAUNCHED === "true";

  if (!isLaunched) {
    const email = session.user.email;
    const isTester = await isTesterEmail(email);
    if (!isTester) {
      redirect("/waitlist");
    }
  }

  return <>{children}</>;
}
