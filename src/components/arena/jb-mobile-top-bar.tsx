"use client";

import { RELEASE } from "@/constants/app";
import { Logo } from "../logo";
import { JbUserMenu } from "./jb-user-menu";

export function JbMobileTopBar() {
  return (
    <header className="md:hidden fixed top-0 right-0 left-0 z-40 flex h-20 items-center justify-between px-5 border-b border-arena-border bg-arena-bg/90 backdrop-blur-sm">
      <Logo
        size="small"
        variant="white"
        href="/arena"
        isBeta={RELEASE.IS_BETA}
      />

      <JbUserMenu onlyAvatar />
    </header>
  );
}
