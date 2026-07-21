"use client";

import { Lock, type LucideIcon } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDevice } from "@/hooks/use-device";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV_ITEMS, isBottomNavItemActive } from "./bottom-nav-items";
import { useTeamGate } from "./team-gate-context";

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("arenaNav");
  const { requireTeam, hasTeam, role } = useTeamGate();
  const { isMobile } = useDevice();

  const isCaptainWithoutTeam = role === "captain" && !hasTeam;

  if (!isMobile) return null;

  return (
    <nav id="arena-bottom-nav" className="fixed right-0 bottom-0 left-0 z-50 flex h-[72px] items-center justify-around border-arena-border border-t bg-arena-bg-sec px-0.5 pb-2">
      {BOTTOM_NAV_ITEMS.map(item => {
        const isActive = isBottomNavItemActive(item.href, pathname);
        const isLocked = isCaptainWithoutTeam && item.requiresTeam;
        const Icon = item.icon;

        if (isLocked) {
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => requireTeam()}
              className="press relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 opacity-35"
            >
              <div className="relative">
                <Icon
                  size={19}
                  strokeWidth={1.7}
                  className="text-arena-text-muted"
                />
                <Lock
                  size={9}
                  className="absolute -right-1.5 -bottom-1 text-arena-text-muted"
                />
              </div>
              <span className="max-w-full truncate text-[9px] font-medium text-arena-text-muted">
                {t(item.labelKey)}
              </span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className="press relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 no-underline"
          >
            <BottomNavLinkContent
              icon={item.icon}
              isActive={isActive}
              label={t(item.labelKey)}
            />
          </Link>
        );
      })}
    </nav>
  );
}

function BottomNavLinkContent({
  icon: Icon,
  isActive,
  label,
}: {
  icon: LucideIcon;
  isActive: boolean;
  label: string;
}) {
  const { pending } = useLinkStatus();

  return (
    <>
      <Icon
        size={19}
        strokeWidth={isActive ? 2 : 1.7}
        className={cn(
          isActive ? "text-arena-primary" : "text-arena-text-muted",
          pending && "animate-pulse text-arena-primary",
        )}
      />
      <span
        className={cn(
          "max-w-full truncate text-[9px]",
          isActive
            ? "font-bold text-arena-primary"
            : "font-medium text-arena-text-muted",
          pending && "text-arena-primary",
        )}
      >
        {label}
      </span>
    </>
  );
}
