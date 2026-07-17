"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { RELEASE } from "@/constants/app";
import { useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { Logo } from "../logo";
import { TeamSwitcher } from "./team-switcher";
import { UserMenu } from "./user-menu";

export function MobileTopBar() {
  const t = useTranslations("arenaNav");
  const { unreadCount } = useUnreadNotificationsCount();

  return (
    <header className="md:hidden fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-arena-border bg-arena-bg-sec/95 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Logo
          size="header"
          variant="white"
          href="/arena"
          isBeta={RELEASE.IS_BETA}
          className="shrink-0"
        />

        {/* Unified Selector de Equipa */}
        <div className="shrink-0 min-w-0 m-auto">
          <TeamSwitcher variant="header" />
        </div>
      </div>

      <div className="flex shrink-0 ml-3 items-center gap-2">
        <Link
          href="/arena/notifications"
          aria-label={t("notifications")}
          className="press relative flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-arena-border bg-arena-surface text-arena-text-sec transition-all duration-200 hover:bg-arena-surface-el hover:text-arena-text"
        >
          <Bell aria-hidden="true" size={20} strokeWidth={1.7} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-arena-primary px-1 text-[9px] font-black text-arena-bg animate-pulse shadow-[0_0_8px_rgba(124,255,79,0.4)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <UserMenu
          className="press flex min-h-11 min-w-11 items-center justify-center"
          onlyAvatar
        />
      </div>
    </header>
  );
}
