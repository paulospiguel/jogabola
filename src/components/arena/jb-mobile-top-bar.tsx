"use client";

import Image from "next/image";
import Link from "next/link";
import logoWhite from "@/assets/logos/jogabola-white.svg";
import { RELEASE } from "@/constants/app";
import { Logo } from "../logo";
import { JbUserMenu } from "./jb-user-menu";

export function JbMobileTopBar() {
  return (
    <header className="md:hidden fixed top-0 right-0 left-0 z-40 flex h-20 items-center px-4 border-b border-arena-border bg-arena-bg/90 backdrop-blur-sm">
      <div className="flex-1" />
      <Logo size="small" variant="white" href="/arena" isBeta={RELEASE.IS_BETA} />
      <div className="flex-1 flex justify-end">
        <JbUserMenu onlyAvatar />
      </div>
    </header>
  );
}
