"use client";

import { Bell, Calendar, Lock, Shield, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTeamGate } from "./team-gate-context";

const ITEMS = [
  { href: "/arena", icon: Shield, labelKey: "dashboard", requiresTeam: false },
  { href: "/arena/teams", icon: Users, labelKey: "teams", requiresTeam: true },
  { href: "/arena/events", icon: Calendar, labelKey: "events", requiresTeam: true },
  { href: "/arena/notifications", icon: Bell, labelKey: "notifications", requiresTeam: true },
];

export function JbBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("arenaNav");
  const { requireTeam, hasTeam, role } = useTeamGate();
  const [isMobile, setIsMobile] = useState(false);

  const isCaptainWithoutTeam = role === "captain" && !hasTeam;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (!isMobile) return null;

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 flex h-[72px] items-center justify-around border-arena-border border-t bg-arena-bg-sec px-1 pb-2">
      {ITEMS.map(item => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/arena" && pathname.startsWith(item.href));
        const isLocked = isCaptainWithoutTeam && item.requiresTeam;
        const Icon = item.icon;

        if (isLocked) {
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => requireTeam()}
              className="relative flex flex-1 flex-col items-center gap-0.5 pt-2 opacity-35"
            >
              <div className="relative">
                <Icon size={20} strokeWidth={1.7} className="text-arena-text-muted" />
                <Lock size={9} className="absolute -right-1.5 -bottom-1 text-arena-text-muted" />
              </div>
              <span className="text-[10px] font-medium text-arena-text-muted">
                {t(item.labelKey)}
              </span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-1 flex-col items-center gap-0.5 pt-2 no-underline"
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2 : 1.7}
              className={cn(
                isActive ? "text-arena-primary" : "text-arena-text-muted",
              )}
            />
            <span
              className={cn(
                "text-[10px]",
                isActive
                  ? "font-bold text-arena-primary"
                  : "font-medium text-arena-text-muted",
              )}
            >
              {t(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
