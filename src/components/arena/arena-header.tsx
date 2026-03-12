"use client";

import { Bell, Home, Menu, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

const ARENA_COLOR = "var(--color-journey-arena)";

type ArenaHeaderProps = {
  onMenuToggle: () => void;
};

export default function ArenaHeader({ onMenuToggle }: ArenaHeaderProps) {
  const [notifications] = useState(3);
  const router = useRouter();
  const t = useTranslations();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth");
        },
      },
    });
  };

  return (
    <header className="w-full border-b border-white/6 bg-[#111111]/95 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white/60 hover:bg-white/8 hover:text-white md:hidden"
          onClick={onMenuToggle}
          aria-label={t("arena.header.openMenu")}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            placeholder={t("arena.header.searchPlaceholder")}
            className="w-full rounded-xl border border-white/8 bg-white/5 py-2 pl-9 pr-4 text-sm text-white/80 placeholder:text-white/30 focus:border-white/20 focus:outline-none focus:ring-0 transition"
          />
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white/50 hover:bg-white/8 hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-0 p-0 text-[9px] font-black text-black animate-pulse"
                    style={{ backgroundColor: ARENA_COLOR }}
                  >
                    {notifications}
                  </Badge>
                )}
                <span className="sr-only">{t("common.notifications")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 border border-white/10 bg-[#1a1a1a] text-white"
            >
              <DropdownMenuLabel
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: ARENA_COLOR }}
              >
                {t("arena.notifications.title")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/8" />
              {[
                { title: t("arena.notifications.newMatch"), time: t("arena.notifications.ago5min") },
                { title: t("arena.notifications.teamInvite"), time: t("arena.notifications.ago1hour") },
                { title: t("arena.notifications.tournamentStarting"), time: t("arena.notifications.ago2hours") },
              ].map(n => (
                <DropdownMenuItem
                  key={n.title}
                  className="flex cursor-pointer flex-col gap-0.5 rounded-lg px-4 py-3 focus:bg-white/8"
                >
                  <p className="text-sm font-semibold text-white">{n.title}</p>
                  <p className="text-xs text-white/40">{n.time}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-auto items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/8"
              >
                <Avatar
                  className="h-8 w-8 border-2"
                  style={{ borderColor: ARENA_COLOR }}
                >
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback
                    className="text-xs font-black text-black"
                    style={{ backgroundColor: ARENA_COLOR }}
                  >
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-xs font-bold text-white leading-tight">
                    Coach Marcus
                  </p>
                  <p className="text-[10px] text-white/40 leading-tight">
                    Head of Operations
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 border border-white/10 bg-[#1a1a1a] text-white"
            >
              <DropdownMenuLabel
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: ARENA_COLOR }}
              >
                {t("arena.userMenu.myAccount")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/8" />
              <DropdownMenuItem
                onClick={() => router.push("/")}
                className="cursor-pointer gap-2 rounded-lg px-4 py-2.5 text-sm focus:bg-white/8"
              >
                <Home className="h-4 w-4 text-white/50" />
                {t("common.home")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer gap-2 rounded-lg px-4 py-2.5 text-sm focus:bg-white/8"
              >
                <User className="h-4 w-4 text-white/50" />
                {t("common.profile")}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/8" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer rounded-lg px-4 py-2.5 text-sm text-red-400 focus:bg-red-500/10 font-semibold"
              >
                {t("common.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
