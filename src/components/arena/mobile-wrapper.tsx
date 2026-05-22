"use client";

import { IPhoneMockup } from "@/components/arena/iphone-mockup";
import { CONFIG } from "@/constants/app";
import { useDevice } from "@/hooks/use-device";

interface MobileWrapperProps {
  children: React.ReactNode;
}

export function MobileWrapper({ children }: MobileWrapperProps) {
  const { isDesktop } = useDevice();
  const shouldShowMobileOnly = CONFIG.SHOW_MOBILE_ONLY === "true";

  if (isDesktop && shouldShowMobileOnly) {
    return <IPhoneMockup>{children}</IPhoneMockup>;
  }

  return <>{children}</>;
}
