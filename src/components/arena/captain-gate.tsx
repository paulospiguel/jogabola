"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface CaptainGateProps {
  role: string | null;
  hasTeam: boolean;
}

const ALLOWED_WITHOUT_TEAM = ["/arena", "/arena/teams"];

export function CaptainGate({ role, hasTeam }: CaptainGateProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (role !== "captain" || hasTeam) return;
    const allowed = ALLOWED_WITHOUT_TEAM.some(
      p => pathname === p || pathname.startsWith(p + "/"),
    );
    if (!allowed) {
      router.replace("/arena");
    }
  }, [role, hasTeam, pathname, router]);

  return null;
}
