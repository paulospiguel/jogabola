"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Calendar,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FieldSoccerIcon } from "../icons";

type ArenaSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};


// Mapeamento baseado na imagem visual
const menuItems = [
  {
    title: "Dashboard",
    href: "/arena", // Ícone de perfil/dashboard
    icon: LayoutDashboard,
  },
  {
    title: "Agenda",
    href: "/arena/calendar", // Ícone de calendário
    icon: Calendar,
  },
  {
    title: "Partidas",
    href: "/arena/matches", // Ícone de campo/jogo
    icon: FieldSoccerIcon, // Representando o campo/tabuleiro
  },
  {
    title: "Torneios",
    href: "/arena/tournaments", // Ícone de troféu
    icon: Trophy,
  },
   {
    title: "Comunidade",
    href: "/arena/messages", // Ícone de chat/grupo
    icon: MessageSquare, 
  },
];

export default function ArenaSidebar({ isOpen, onClose }: ArenaSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col items-center py-8">
      {/* Logo Section - Shield Icon */}
      <div className="mb-10 flex h-14 w-14 items-center justify-center">
        <Shield className="h-10 w-10 text-white fill-white" />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 w-full px-2">
        <nav className="flex flex-col items-center gap-5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="group relative flex items-center justify-center"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
                    isActive
                      ? "bg-[#dcfce7] text-slate-900 shadow-[0_0_15px_rgba(220,252,231,0.4)]" // Estilo ativo (claro/mint)
                      : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white" // Estilo inativo (escuro)
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                
                {/* Tooltip on hover (desktop only) */}
                <span className="absolute left-16 z-50 hidden rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 md:block whitespace-nowrap border border-white/10">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-6 px-4 pb-4">
         <Link
            href="/arena/settings"
            onClick={onClose}
            className="group relative flex items-center justify-center"
          >
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white",
              pathname === "/arena/settings" && "bg-[#dcfce7] text-slate-900"
            )}>
              <Settings className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="absolute left-16 z-50 hidden rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 md:block whitespace-nowrap border border-white/10">
              Configurações
            </span>
          </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[88px] overflow-hidden bg-black shadow-2xl transition-transform duration-300 md:translate-x-0 rounded-r-3xl border-r border-white/5",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
