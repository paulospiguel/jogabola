import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isTesterEmail } from "@/lib/notion";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();

  const session = await auth.api.getSession({
    headers: headerStore,
  });

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
