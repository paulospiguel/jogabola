"use client";

import { CalendarDays, Flag, Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useClub } from "./club-context";
import { CLUB_LINK_BUTTON_CLASS } from "./club-ui";

/** Club header with role badge and the calendar / settings sub-navigation. */
export function ClubShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("arenaClubCalendar");
  const pathname = usePathname();
  const { club, canCreateFixtures } = useClub();
  const base = `/arena/club/${club.id}`;

  const tabs = [
    { href: base, label: t("nav.calendar"), icon: CalendarDays },
    {
      href: `${base}/settings`,
      label: t("nav.settings"),
      icon: Settings2,
    },
  ];
  const isCalendarArea =
    pathname === base || pathname.startsWith(`${base}/fixtures`);

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <header className="jb-topbar flex-wrap">
          <div className="flex min-w-0 items-center gap-3">
            <span className="jb-icon-tile border border-arena-primary/40 bg-arena-primary/15 text-arena-primary">
              <Flag size={20} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              {/* The role badge sits on the kicker line so it never takes
                  width from the club name. */}
              <div className="flex items-center gap-2">
                <span className="jb-kicker">{t("kicker")}</span>
                <span className="shrink-0 rounded-[4px] border border-arena-info/35 bg-arena-info/10 px-1.5 py-px text-[9px] font-bold uppercase leading-[14px] tracking-[0.5px] text-arena-info">
                  {t(`roles.${club.role}`)}
                </span>
              </div>
              <h1 className="jb-title line-clamp-2 break-words">{club.name}</h1>
            </div>
          </div>
          {canCreateFixtures && (
            <Link
              href={`${base}/fixtures/new`}
              className={cn(
                CLUB_LINK_BUTTON_CLASS,
                "hidden h-10 rounded-[12px] bg-arena-primary px-4 text-sm text-arena-bg hover:bg-arena-primary/90 md:inline-flex",
              )}
            >
              <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
              {t("calendar.newFixture")}
            </Link>
          )}
        </header>

        <nav
          aria-label={t("nav.label")}
          className="mb-4 flex gap-1 border-arena-border border-b"
        >
          {tabs.map(tab => {
            const active =
              tab.href === base
                ? isCalendarArea
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "btn-press -mb-px flex h-11 items-center gap-1.5 border-b-2 px-3 text-[13px] font-semibold transition-colors duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-arena-primary",
                  active
                    ? "border-arena-primary text-arena-primary"
                    : "border-transparent text-arena-text-muted hover:text-arena-text",
                )}
              >
                <Icon size={15} strokeWidth={1.9} aria-hidden="true" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
