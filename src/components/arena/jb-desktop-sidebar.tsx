"use client";

import { Calendar, CreditCard, Shield, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Logo } from "../logo";

const ITEMS = [
  { href: "/arena", icon: Shield, labelKey: "dashboard" },
  { href: "/arena/events", icon: Calendar, labelKey: "events" },
  { href: "/arena/squads", icon: Users, labelKey: "squads" },
  { href: "/arena/payments", icon: CreditCard, labelKey: "payments" },
  { href: "/arena/profile", icon: UserRound, labelKey: "profile" },
];

export function JbDesktopSidebar() {
  const pathname = usePathname();
  const t = useTranslations("arenaNav");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] flex-col border-arena-border border-r bg-arena-bg-sec py-6 md:flex">
      <div className="border-arena-border border-b px-5 pb-6">
        <div className="flex items-center gap-2.5">
          <Logo variant="white" size="small" className="m-auto" />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {ITEMS.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/arena" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-sm no-underline transition-colors",
                isActive
                  ? "border-arena-primary/20 bg-arena-primary/10 font-semibold text-arena-primary"
                  : "border-transparent font-medium text-arena-text-sec hover:bg-arena-surface/60 hover:text-arena-text",
              )}
            >
              <Icon size={17} strokeWidth={isActive ? 2 : 1.7} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
