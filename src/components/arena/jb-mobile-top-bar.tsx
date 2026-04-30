"use client";

import Image from "next/image";
import Link from "next/link";
import logoWhite from "@/assets/logos/jogabola-white.svg";

export function JbMobileTopBar() {
  return (
    <header className="md:hidden fixed top-0 right-0 left-0 z-40 flex h-20 items-center px-4 border-b border-arena-border bg-arena-bg/90 backdrop-blur-sm">
      <Link href="/arena" className="relative h-10 w-24 m-auto">
        <Image
          unoptimized
          src={logoWhite}
          alt="Jogabola"
          fill
          className="object-contain object-left m-auto"
        />
      </Link>
    </header>
  );
}
