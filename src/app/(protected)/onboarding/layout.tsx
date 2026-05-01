import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user && (session.user as any).onboardingCompleted) {
    redirect("/arena");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A16]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[20%] left-[5%] h-80 w-80 rounded-full bg-[#5D17A9]/20 blur-[90px]" />
        <div className="absolute right-[5%] bottom-[15%] h-96 w-96 rounded-full bg-[#0B3B78]/15 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7CFF4F]/5 blur-[80px]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
