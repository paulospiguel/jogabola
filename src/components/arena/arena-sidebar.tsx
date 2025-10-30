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
    <div className="flex h-full flex-col">
      {/* Mobile Close Button */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4 md:hidden dark:border-slate-700/50">
        <h2 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-lg font-bold text-transparent dark:from-emerald-400 dark:to-blue-400">
          ⚽ Menu
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Separator className="bg-slate-200 md:hidden dark:bg-slate-700/50" />

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
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "scale-105 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-700 dark:to-blue-700 dark:hover:from-emerald-600 dark:hover:to-blue-600"
                    : "text-slate-600 hover:scale-105 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", isActive ? "animate-pulse" : "")}
                />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold shadow-md",
                      isActive
                        ? "bg-white text-emerald-700 backdrop-blur-sm dark:bg-slate-950 dark:text-emerald-400"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:from-emerald-700 dark:to-blue-700",
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
      <div className="border-t border-slate-200 p-4 dark:border-slate-700/50">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-800/60 dark:to-slate-900/40">
          {/* Football decoration */}
          <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full border-4 border-emerald-300 dark:border-emerald-800/30" />
          <div className="absolute -bottom-2 -left-2 h-16 w-16 rounded-full border-4 border-teal-300 dark:border-blue-800/30" />

          <div className="relative">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-200">
              <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Seja Pro! 🚀
            </h3>
            <p className="mb-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Desbloqueie recursos premium e estatísticas avançadas
            </p>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl dark:from-emerald-700 dark:to-blue-700 dark:hover:from-emerald-600 dark:hover:to-blue-600"
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
          className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 overflow-hidden border-r border-slate-200 bg-white/90 shadow-2xl backdrop-blur-xl transition-transform duration-300 md:translate-x-0 dark:border-slate-700/50 dark:bg-linear-to-b dark:from-slate-900/80 dark:to-slate-800/70 dark:shadow-black/40",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
