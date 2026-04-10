"use client";

import { Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AuthenticatedUserMenu,
  buildDefaultNotifications,
} from "@/components/authenticated-user-menu";
import { Button } from "@/components/ui/button";

type ArenaHeaderProps = {
  onMenuToggle: () => void;
  eyebrow?: string;
  title?: string;
  description?: string;
};

export default function ArenaHeader({
  onMenuToggle,
  eyebrow,
  title,
  description,
}: ArenaHeaderProps) {
  const t = useTranslations();
  const notifications = buildDefaultNotifications(t);

  return (
    <header className="w-full border-b border-white/10 bg-[#0a0b1e]/60 backdrop-blur-xl">
      <div className="border-b border-white/10 px-4 py-4 md:px-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 text-white/60 hover:bg-white/8 hover:text-white md:hidden"
            onClick={onMenuToggle}
            aria-label={t("arena.header.openMenu")}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className="text-[11px] font-semibold tracking-[0.24em] text-white/45 uppercase">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h1 className="mt-1 truncate font-heading text-2xl tracking-[0.08em] text-white">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="mt-1 truncate text-sm text-white/52">
                {description}
              </p>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <AuthenticatedUserMenu
              variant="compact"
              notificationCount={notifications.length}
              notifications={notifications}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 md:px-6">
        <div className="relative max-w-xl">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            placeholder={t("arena.header.searchPlaceholder")}
            className="w-full rounded-xl border border-white/8 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white/80 placeholder:text-white/30 backdrop-blur transition focus:border-[#6fffe9]/40 focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </header>
  );
}
