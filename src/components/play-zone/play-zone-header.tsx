"use client";

import { AuthenticatedUserMenu, buildDefaultNotifications } from "@/components/authenticated-user-menu";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

type PlayZoneHeaderProps = {
  onMenuToggle: () => void;
};

export default function PlayZoneHeader({ onMenuToggle }: PlayZoneHeaderProps) {
  const t = useTranslations();
  const notifications = buildDefaultNotifications(t);

  return (
    <header className="w-full border-b border-white/10 bg-[#0a0b1e]/95 text-white shadow-[0_20px_45px_-30px_rgba(0,255,213,0.3)] backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 md:px-8">
        {/* Menu Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 md:hidden"
          onClick={onMenuToggle}
          aria-label={t("arena.header.openMenu")}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo - Clicável para voltar à home */}
        <div className="flex items-center gap-2">
          <Logo size="small" href="/playzone" />
        </div>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-3">
          <AuthenticatedUserMenu
            variant="featured"
            notificationCount={notifications.length}
            notifications={notifications}
          />
        </div>
      </div>
    </header>
  );
}
