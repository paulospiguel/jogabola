"use client";

import { RELEASE } from "@/constants/app";
import { Logo } from "../logo";

export function JbMobileTopBar() {
  return (
    <header className="md:hidden fixed top-0 right-0 left-0 z-40 flex h-20 items-center px-4 border-b border-arena-border bg-arena-bg/90 backdrop-blur-sm">
      <Logo
        size="small"
        variant="white"
        href="/arena"
        className="mx-auto"
        isBeta={RELEASE.IS_BETA}
      />
    </header>
  );
}
