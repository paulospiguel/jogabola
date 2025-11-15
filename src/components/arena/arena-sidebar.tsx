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
  Globe,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ArenaSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    title: "Início",
    href: "/",
    icon: Globe,
    badge: null,
  },
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
    <div className="flex h-full flex-col text-slate-800 transition-colors dark:text-white">
      {/* Mobile Close Button */}
      <div className="flex items-center justify-between border-b border-emerald-100/60 bg-white/80 p-4 md:hidden dark:border-white/10 dark:bg-white/5">
        <h2 className="bg-linear-to-r from-emerald-500 to-sky-500 bg-clip-text text-lg font-bold text-transparent dark:from-[#24ffe6] dark:to-[#02a7ff]">
          ⚽ Menu
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-700 hover:bg-emerald-100/70 dark:text-white dark:hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Separator className="bg-emerald-100 dark:bg-white/10 md:hidden" />

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
                  "flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-base font-medium transition-all duration-300 min-h-[44px]",
                  isActive
                    ? "scale-105 border border-emerald-300 bg-emerald-100/70 text-emerald-700 shadow-[0_20px_50px_-30px_rgba(16,185,129,0.45)] dark:border-[#24ffe6]/40 dark:bg-white/10 dark:text-white dark:shadow-[0_25px_60px_-35px_rgba(36,255,230,0.8)]"
                    : "text-slate-600 hover:scale-105 hover:border hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-700 dark:text-white/70 dark:hover:border-white/15 dark:hover:bg-white/5 dark:hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 flex-shrink-0",
                    isActive
                      ? "text-emerald-600 dark:text-[#24ffe6]"
                      : "text-slate-500 dark:text-white/70",
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-bold",
                      isActive
                        ? "bg-emerald-500 text-white shadow-sm dark:bg-[#24ffe6] dark:text-slate-900"
                        : "border border-emerald-100 bg-emerald-50/80 text-emerald-600 dark:border-white/15 dark:bg-white/10 dark:text-white/80",
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
      <div className="border-t border-emerald-100/60 p-4 dark:border-white/10">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100/70 bg-emerald-50/90 p-5 shadow-[0_20px_50px_-35px_rgba(16,185,129,0.35)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_50px_-35px_rgba(36,255,230,0.6)]">
          <div className="absolute -top-6 -right-4 h-24 w-24 rounded-full border border-emerald-300/30 dark:border-[#24ffe6]/20" />
          <div className="absolute -bottom-4 -left-2 h-20 w-20 rounded-full border border-sky-300/30 dark:border-[#02a7ff]/20" />

          <div className="relative">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-emerald-700 dark:text-white">
              <Trophy className="h-5 w-5 text-emerald-500 dark:text-[#24ffe6]" />
              Seja Pro! 🚀
            </h3>
            <p className="mb-4 text-xs leading-relaxed text-slate-600 dark:text-white/70">
              Desbloqueie recursos premium e estatísticas avançadas
            </p>
            <Button
              size="sm"
              className="group w-full bg-emerald-500 font-semibold text-white shadow-[0_16px_45px_-20px_rgba(16,185,129,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 dark:bg-[#24ffe6] dark:text-slate-900 dark:shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] dark:hover:bg-[#24ffe6]/90"
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
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-20 left-0 z-40 h-[calc(100vh-5rem)] w-72 overflow-hidden border-r border-emerald-100/60 bg-white/90 shadow-[0_25px_60px_-40px_rgba(16,185,129,0.35)] backdrop-blur-xl transition-transform duration-300 md:translate-x-0 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_25px_60px_-40px_rgba(36,255,230,0.6)]",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
