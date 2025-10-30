"use client";

import { JourneyRouter } from "@/components/journey-router";
import type { Role } from "@/schemas/profile";
import { usePathname } from "next/navigation";

interface JourneyWrapperProps {
  role: Role;
  children: React.ReactNode;
}

export function JourneyWrapper({ role, children }: JourneyWrapperProps) {
  const pathname = usePathname();

  return (
    <JourneyRouter role={role} currentPath={pathname}>
      {children}
    </JourneyRouter>
  );
}
