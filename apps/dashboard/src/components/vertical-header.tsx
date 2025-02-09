import Link from "next/link";
import { Logo } from "./logo";
import { Navbar } from "./navbar";
import Notifications from "./notifications";
import { CogIcon } from "./icons";
import { cn } from "@repo/utils";
import { Suspense } from "react";

type VerticalHeader = {
  className?: string;
};

export default function VerticalHeader({ className }: VerticalHeader) {
  return (
    <header className={cn("sticky top-0 z-10", className)}>
      <div className="flex h-screen min-w-[80px] flex-col justify-between py-2 shadow-md">
        <div className="border-b-2 p-2">
          <Logo size="mini" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <Suspense>
            {/* @ts-expect-error Async Server Component */}
            <Navbar />
          </Suspense>
          <Notifications className="transition-all duration-300 hover:scale-110" />
          <Link href="/profile/settings" className="group">
            <CogIcon className="size-5 text-green-600 transition-all group-hover:rotate-90" />
          </Link>
        </div>
      </div>
    </header>
  );
}
