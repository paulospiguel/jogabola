"use client";

import Image from "next/image";
import Link from "next/link";
import logoWhite from "@/assets/logos/jogabola-white.svg";
import { RELEASE } from "@/constants/app";
import { JbUserMenu } from "./jb-user-menu";

export function JbMobileTopBar() {
  return (
    <header className="md:hidden fixed top-0 right-0 left-0 z-40 flex h-20 items-center px-4 border-b border-arena-border bg-arena-bg/90 backdrop-blur-sm">
      <div className="flex-1" />
      <Link href="/arena" className="relative flex items-center gap-2">
        <div className="relative h-10 w-24">
          <Image
            unoptimized
            src={logoWhite}
            alt="Jogabola"
            fill
            className="object-contain object-center"
          />
        </div>
        {RELEASE.IS_BETA && (
          <span className="rounded-full border border-[#7CFF4F]/25 bg-[#7CFF4F]/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#7CFF4F] uppercase">
            Beta
          </span>
        )}
      </Link>
      <div className="flex-1 flex justify-end">
        <JbUserMenu onlyAvatar />
      </div>
    </header>
  );
}
