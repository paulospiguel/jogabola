"use client";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
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
import { Input } from "@/components/ui/input";
import { signOut } from "@/lib/auth-client";
import { Bell, Menu, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ArenaHeaderProps = {
  onMenuToggle: () => void;
};

export default function ArenaHeader({ onMenuToggle }: ArenaHeaderProps) {
  const [notifications] = useState(3);
  const t = useTranslations();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <header className="w-full border-b border-emerald-100/60 bg-white/80 text-slate-900 backdrop-blur-xl shadow-[0_20px_45px_-30px_rgba(13,148,136,0.35)] transition-colors dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_20px_45px_-30px_rgba(36,255,230,0.7)]">
      <div className="flex h-20 items-center gap-4 px-4 md:px-8">
        {/* Menu Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-700 hover:bg-emerald-100/60 md:hidden dark:text-white dark:hover:bg-white/10"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Logo size="small" />
        </div>

        {/* Search Bar */}
        <div className="hidden max-w-md flex-1 sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500 dark:text-[#6fffe9]" />
            <Input
              type="search"
              placeholder={t("search") || "Buscar partidas, times..."}
              className="w-full rounded-full border border-emerald-100/80 bg-white/70 pl-10 text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50 dark:focus:border-[#6fffe9] dark:focus:ring-[#6fffe9]"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-600 hover:bg-emerald-100/70 dark:text-white dark:hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-emerald-400 p-0 text-xs font-bold text-slate-900 shadow-[0_10px_25px_-12px_rgba(16,185,129,0.6)] animate-pulse dark:border-[#050312] dark:bg-[#24ffe6]"
                  >
                    {notifications}
                  </Badge>
                )}
                <span className="sr-only">Notificações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 border border-emerald-100/60 bg-white/90 text-slate-800 backdrop-blur-xl dark:border-white/10 dark:bg-[#080a25]/90 dark:text-white"
            >
              <DropdownMenuLabel className="text-sm font-semibold text-emerald-600 dark:text-[#6fffe9]">
                Notificações
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-emerald-100 dark:bg-white/10" />
              <div className="max-h-96 space-y-1 overflow-y-auto">
                <DropdownMenuItem className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-100/70 focus:bg-emerald-100/70 dark:text-white/90 dark:hover:bg-white/10 dark:focus:bg-white/10">
                  <p className="font-medium">Nova partida disponível</p>
                  <p className="text-xs text-white/60">Há 5 minutos</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-100/70 focus:bg-emerald-100/70 dark:text-white/90 dark:hover:bg-white/10 dark:focus:bg-white/10">
                  <p className="font-medium">Convite de time</p>
                  <p className="text-xs text-white/60">Há 1 hora</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-100/70 focus:bg-emerald-100/70 dark:text-white/90 dark:hover:bg-white/10 dark:focus:bg-white/10">
                  <p className="font-medium">Torneio começando</p>
                  <p className="text-xs text-white/60">Há 2 horas</p>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-emerald-100/70 hover:ring-2 hover:ring-emerald-400/40 hover:ring-offset-2 hover:ring-offset-white dark:text-white dark:hover:bg-white/10 dark:hover:ring-[#24ffe6]/40 dark:hover:ring-offset-[#050312]"
              >
                <Avatar className="h-8 w-8 border-2 border-emerald-500/50 shadow dark:border-[#24ffe6]/60">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-linear-to-br from-emerald-400 to-sky-400 font-bold text-white dark:from-[#24ffe6] dark:to-[#02a7ff] dark:text-slate-900">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border border-emerald-100/60 bg-white/90 text-slate-800 backdrop-blur-xl dark:border-white/10 dark:bg-[#080a25]/90 dark:text-white"
            >
              <DropdownMenuLabel className="text-sm font-semibold text-emerald-600 dark:text-[#6fffe9]">
                Minha Conta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-emerald-100 dark:bg-white/10" />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-100/80 focus:bg-emerald-100/80 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-100/80 focus:bg-emerald-100/80 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10">
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-emerald-100/80 focus:bg-emerald-100/80 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10">
                Estatísticas
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-emerald-100 dark:bg-white/10" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10 focus:bg-red-500/10"
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
