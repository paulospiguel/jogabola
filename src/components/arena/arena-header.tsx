"use client";

import { Logo } from "@/components/logo";
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
import { Bell, Home, Menu, User } from "lucide-react";
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
          router.push("/auth");
        },
      },
    });
  };

  return (
    <header className="w-full border-b border-border-default bg-overlay-light text-text-primary backdrop-blur-xl shadow-[0_20px_45px_-30px_var(--color-shadow-neon-secondary)] transition-colors">
      <div className="flex h-20 items-center gap-4 px-4 md:px-8">
        {/* Menu Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-text-primary hover:bg-overlay-medium md:hidden"
          onClick={onMenuToggle}
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo - Clicável para voltar à home */}
        <div className="flex items-center gap-2">
          <Logo size="small" />
        </div>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-text-secondary hover:bg-overlay-medium"
              >
                <Bell className="h-6 w-6" aria-hidden="true" />
                {notifications > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-background-base bg-neon-secondary p-0 text-xs font-bold text-slate-900 shadow-[0_10px_25px_-12px_var(--color-shadow-brand-green)] animate-pulse"
                  >
                    {notifications}
                  </Badge>
                )}
                <span className="sr-only">Notificações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 border border-border-default bg-background-surface/90 text-text-primary backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-sm font-semibold text-neon-primary">
                Notificações
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border-default" />
              <div className="max-h-96 space-y-1 overflow-y-auto">
                <DropdownMenuItem className="flex cursor-pointer flex-col gap-1 rounded-lg px-4 py-3 text-base text-text-primary transition-colors hover:bg-overlay-medium focus:bg-overlay-medium min-h-[44px]">
                  <p className="font-semibold">Nova partida disponível</p>
                  <p className="text-sm text-text-secondary">Há 5 minutos</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col gap-1 rounded-lg px-4 py-3 text-base text-text-primary transition-colors hover:bg-overlay-medium focus:bg-overlay-medium min-h-[44px]">
                  <p className="font-semibold">Convite de time</p>
                  <p className="text-sm text-text-secondary">Há 1 hora</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col gap-1 rounded-lg px-4 py-3 text-base text-text-primary transition-colors hover:bg-overlay-medium focus:bg-overlay-medium min-h-[44px]">
                  <p className="font-semibold">Torneio começando</p>
                  <p className="text-sm text-text-secondary">Há 2 horas</p>
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
                className="rounded-full text-text-primary transition-all hover:-translate-y-0.5 hover:bg-overlay-medium hover:ring-2 hover:ring-neon-secondary/40 hover:ring-offset-2 hover:ring-offset-background-base"
              >
                <Avatar className="h-8 w-8 border-2 border-neon-secondary/60 shadow">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-linear-to-br from-neon-secondary to-accent-blue font-bold text-slate-900">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border border-border-default bg-background-surface/90 text-text-primary backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-sm font-semibold text-neon-primary">
                Minha Conta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border-default" />
              <DropdownMenuItem
                onClick={() => router.push("/")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-base text-text-primary transition-colors hover:bg-overlay-medium focus:bg-overlay-medium min-h-[44px]"
              >
                <Home className="mr-2 h-5 w-5" aria-hidden="true" />
                Início
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-base text-text-primary transition-colors hover:bg-overlay-medium focus:bg-overlay-medium min-h-[44px]"
              >
                <User className="mr-2 h-5 w-5" aria-hidden="true" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-4 py-3 text-base text-text-primary transition-colors hover:bg-overlay-medium focus:bg-overlay-medium min-h-[44px]">
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-4 py-3 text-base text-text-primary transition-colors hover:bg-overlay-medium focus:bg-overlay-medium min-h-[44px]">
                Estatísticas
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border-default" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="rounded-lg px-4 py-3 text-base text-red-400 transition-colors hover:bg-red-500/10 focus:bg-red-500/10 min-h-[44px] font-semibold"
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
