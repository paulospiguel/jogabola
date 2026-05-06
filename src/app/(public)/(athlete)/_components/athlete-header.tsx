"use client";

import { JbUserMenu } from "@/components/arena/jb-user-menu";
import { Logo } from "@/components/logo";


export function AthleteHeader() {

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-arena-border bg-arena-bg/90 px-4 backdrop-blur-md">
      <Logo href="/" size="mini" variant="white" className="opacity-80" />

      <JbUserMenu onlyAvatar />
    </header>
  );
}
