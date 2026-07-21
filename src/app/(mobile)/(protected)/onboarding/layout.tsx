import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/get-session";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();
  const user = session?.user as { onboardingCompleted?: boolean } | undefined;

  if (user?.onboardingCompleted) {
    redirect("/arena");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-arena-bg text-arena-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(124,255,79,.10),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(56,189,248,.08),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(38,50,68,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(38,50,68,.18)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40 [mask-image:radial-gradient(circle_at_center,black_25%,transparent_78%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
