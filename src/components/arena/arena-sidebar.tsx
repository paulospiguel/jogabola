"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Home,
  MessageSquare,
  Settings,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ArenaSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    title: "Dashboard",
    href: "/arena",
    icon: Home,
    badge: null,
  },
  {
    title: "Partidas",
    href: "/arena/matches",
    icon: Trophy,
    badge: "3",
  },
  {
    title: "Times",
    href: "/arena/teams",
    icon: Users,
    badge: null,
  },
  {
    title: "Torneios",
    href: "/arena/tournaments",
    icon: Shield,
    badge: "Novo",
  },
  {
    title: "Agenda",
    href: "/arena/calendar",
    icon: Calendar,
    badge: null,
  },
  {
    title: "Estatísticas",
    href: "/arena/stats",
    icon: BarChart3,
    badge: null,
  },
  {
    title: "Mensagens",
    href: "/arena/messages",
    icon: MessageSquare,
    badge: "5",
  },
  {
    title: "Configurações",
    href: "/arena/settings",
    icon: Settings,
    badge: null,
  },
];

export default function ArenaSidebar({ isOpen, onClose }: ArenaSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col text-white">
      {/* Mobile Close Button */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4 md:hidden">
        <h2 className="bg-gradient-to-r from-[#24ffe6] to-[#02a7ff] bg-clip-text text-lg font-bold text-transparent">
          ⚽ Menu
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Separator className="bg-white/10 md:hidden" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {menuItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "scale-105 border border-[#24ffe6]/40 bg-white/10 text-white shadow-[0_25px_60px_-35px_rgba(36,255,230,0.8)]"
                    : "text-white/70 hover:scale-105 hover:border hover:border-white/15 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-[#24ffe6]" : "text-white/60",
                  )}
                />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      isActive
                        ? "bg-[#24ffe6] text-slate-900"
                        : "border border-white/15 bg-white/10 text-white/80",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="border-t border-white/10 p-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_-35px_rgba(36,255,230,0.6)] backdrop-blur">
          <div className="absolute -top-6 -right-4 h-24 w-24 rounded-full border border-[#24ffe6]/20" />
          <div className="absolute -bottom-4 -left-2 h-20 w-20 rounded-full border border-[#02a7ff]/20" />

          <div className="relative">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-white">
              <Trophy className="h-5 w-5 text-[#24ffe6]" />
              Seja Pro! 🚀
            </h3>
            <p className="mb-4 text-xs leading-relaxed text-white/70">
              Desbloqueie recursos premium e estatísticas avançadas
            </p>
            <Button
              size="sm"
              className="group w-full bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24ffe6]/90"
            >
              Fazer Upgrade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-20 left-0 z-40 h-[calc(100vh-5rem)] w-72 overflow-hidden border-r border-white/10 bg-white/5 shadow-[0_25px_60px_-40px_rgba(36,255,230,0.6)] backdrop-blur-xl transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
