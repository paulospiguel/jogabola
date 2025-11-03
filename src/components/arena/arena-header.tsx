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
    <header className="w-full border-b border-white/10 bg-white/5 text-white backdrop-blur-xl shadow-[0_20px_45px_-30px_rgba(36,255,230,0.7)]">
      <div className="flex h-20 items-center gap-4 px-4 md:px-8">
        {/* Menu Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 md:hidden"
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6fffe9]" />
            <Input
              type="search"
              placeholder={t("search") || "Buscar partidas, times..."}
              className="w-full rounded-full border border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/50 focus:border-[#6fffe9] focus:ring-[#6fffe9]"
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
                className="relative text-white hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#050312] bg-[#24ffe6] p-0 text-xs font-bold text-slate-900 shadow-[0_10px_25px_-12px_rgba(36,255,230,0.9)] animate-pulse"
                  >
                    {notifications}
                  </Badge>
                )}
                <span className="sr-only">Notificações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 border border-white/10 bg-[#080a25]/90 text-white backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-sm font-semibold text-[#6fffe9]">
                Notificações
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="max-h-96 space-y-1 overflow-y-auto">
                <DropdownMenuItem className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 focus:bg-white/10">
                  <p className="font-medium">Nova partida disponível</p>
                  <p className="text-xs text-white/60">Há 5 minutos</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 focus:bg-white/10">
                  <p className="font-medium">Convite de time</p>
                  <p className="text-xs text-white/60">Há 1 hora</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 focus:bg-white/10">
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
                className="rounded-full text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:ring-2 hover:ring-[#24ffe6]/40 hover:ring-offset-2 hover:ring-offset-[#050312]"
              >
                <Avatar className="h-8 w-8 border-2 border-[#24ffe6]/60 shadow">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-[#24ffe6] to-[#02a7ff] font-bold text-slate-900">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border border-white/10 bg-[#080a25]/90 text-white backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-sm font-semibold text-[#6fffe9]">
                Minha Conta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 focus:bg-white/10"
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 focus:bg-white/10">
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 focus:bg-white/10">
                Estatísticas
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 focus:bg-red-500/10"
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
