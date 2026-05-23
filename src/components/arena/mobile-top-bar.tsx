"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { RELEASE } from "@/constants/app";
import { useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { Logo } from "../logo";
import { UserMenu } from "./user-menu";

export function MobileTopBar() {
  const { unreadCount } = useUnreadNotificationsCount();

  return (
    <header className="md:hidden fixed top-0 right-0 left-0 z-40 flex h-20 items-center justify-between px-5 border-b border-arena-border bg-arena-bg/90 backdrop-blur-sm">
      <Logo
        size="small"
        variant="white"
        href="/arena"
        isBeta={RELEASE.IS_BETA}
      />

      <div className="flex items-center gap-3">
        <Link
          href="/arena/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-arena-surface border border-arena-border text-arena-text-sec hover:text-arena-text hover:bg-arena-surface-el transition-all duration-200 press"
        >
          <Bell size={20} strokeWidth={1.7} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-arena-primary px-1 text-[9px] font-black text-arena-bg animate-pulse shadow-[0_0_8px_rgba(124,255,79,0.4)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <UserMenu onlyAvatar />
      </div>
    </header>
  );
}
