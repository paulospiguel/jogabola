"use client";

import { getProfileData } from "@/actions/profile";
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
import { signOut, useSession } from "@/lib/auth-client";
import { Experience } from "@/schemas/profile";
import {
  Bell,
  Home,
  Menu,
  User
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PlayZoneHeaderProps = {
  onMenuToggle: () => void;
};

interface UserProfile {
  name: string;
  image: string | null;
  level: number;
  experience: Experience;
  position?: string;
}

export default function PlayZoneHeader({ onMenuToggle }: PlayZoneHeaderProps) {
  const [notifications] = useState(3);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { data: session } = useSession();
  const t = useTranslations();
  const router = useRouter();

  useEffect(() => {
    async function loadUserProfile() {
      if (!session?.user?.id) return;

      try {
        const result = await getProfileData(session.user.id);
        if (result.success && result.data) {
          setUserProfile({
            name: result.data.name || session.user.name || "Jogador",
            image: session.user.image || null,
            level: result.data.level || 1,
            experience: result.data.experience as Experience,
            position: result.data.customFields?.position || "",
          });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }

    loadUserProfile();
  }, [session?.user?.id, session?.user?.name, session?.user?.image]);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth");
        },
      },
    });
  };

  const getExperienceLabel = (experience: Experience) => {
    const labels: Record<Experience, string> = {
      beginner: t("experience.beginner"),
      intermediate: t("experience.intermediate"),
      advanced: t("experience.advanced"),
      professional: t("experience.professional"),
    };
    return labels[experience as Experience];
  };



  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };



  return (
    <header className="w-full border-b border-white/10 bg-toast-bg/95 text-white shadow-[0_20px_45px_-30px_rgba(0,255,213,0.3)] backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 md:px-8">
        {/* Menu Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 md:hidden"
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
                className="relative text-white/70 hover:bg-white/10"
              >
                <Bell className="h-6 w-6" aria-hidden="true" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full border border-[#050312] bg-[#6fffe9] p-0 text-xs font-bold text-slate-900 shadow-[0_10px_25px_-12px_rgba(111,255,233,0.5)]">
                    {notifications}
                  </Badge>
                )}
                <span className="sr-only">Notificações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 border border-white/10 bg-[#050312]/95 text-white backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-sm font-semibold text-[#6fffe9]">
                Notificações
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="max-h-96 space-y-1 overflow-y-auto">
                <DropdownMenuItem className="flex min-h-[44px] cursor-pointer flex-col gap-1 rounded-lg px-4 py-3 text-base text-white transition-colors hover:bg-white/10 focus:bg-white/10">
                  <p className="font-semibold">Nova partida disponível</p>
                  <p className="text-sm text-white/60">Há 5 minutos</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex min-h-[44px] cursor-pointer flex-col gap-1 rounded-lg px-4 py-3 text-base text-white transition-colors hover:bg-white/10 focus:bg-white/10">
                  <p className="font-semibold">Convite de time</p>
                  <p className="text-sm text-white/60">Há 1 hora</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex min-h-[44px] cursor-pointer flex-col gap-1 rounded-lg px-4 py-3 text-base text-white transition-colors hover:bg-white/10 focus:bg-white/10">
                  <p className="font-semibold">Torneio começando</p>
                  <p className="text-sm text-white/60">Há 2 horas</p>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Component */}
          {userProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#6fffe9]/40 focus-visible:outline-none"
                  aria-label="Menu do usuário"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-[#6fffe9]/30 blur-xl" />
                    <Avatar className="relative h-12 w-12 border-2 border-[#6fffe9] shadow-[0_0_20px_rgba(111,255,233,0.5)]">
                      <AvatarImage
                        src={userProfile.image || ""}
                        alt={userProfile.name}
                      />
                      <AvatarFallback className="bg-[#080a25] text-lg font-bold text-[#6fffe9]">
                        {getInitials(userProfile.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border border-white/10 bg-[#050312]/95 text-white backdrop-blur-xl"
              >
                <DropdownMenuLabel className="flex flex-col items-start text-sm font-semibold text-[#6fffe9]">
                  <span>{userProfile.name}</span>
                  <span className="text-sm text-white/60">
                    {getExperienceLabel(userProfile.experience)}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => router.push("/")}
                  className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base text-white transition-colors hover:bg-white/10 focus:bg-white/10"
                >
                  <Home className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Início</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base text-white transition-colors hover:bg-white/10 focus:bg-white/10"
                >
                  <User className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="min-h-[44px] rounded-lg px-4 py-3 text-base text-white transition-colors hover:bg-white/10 focus:bg-white/10">
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem className="min-h-[44px] rounded-lg px-4 py-3 text-base text-white transition-colors hover:bg-white/10 focus:bg-white/10">
                  Estatísticas
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="min-h-[44px] rounded-lg px-4 py-3 text-base font-semibold text-red-400 transition-colors hover:bg-red-500/10 focus:bg-red-500/10"
                >
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
