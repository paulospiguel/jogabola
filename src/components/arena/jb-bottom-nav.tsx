"use client";

import { Bell, Calendar, Shield, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/arena", icon: Shield, labelKey: "dashboard" },
  { href: "/arena/teams", icon: Users, labelKey: "teams" },
  { href: "/arena/events", icon: Calendar, labelKey: "events" },
  { href: "/arena/notifications", icon: Bell, labelKey: "notifications" },
];

export function JbBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("arenaNav");
  const [isMobile, setIsMobile] = useState(false);

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
        const Icon = item.icon;

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
