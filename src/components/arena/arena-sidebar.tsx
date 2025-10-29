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
      <div className="flex items-center justify-between p-4 md:hidden border-b border-slate-200 dark:border-slate-700/50">
        <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
          ⚽ Menu
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Separator className="md:hidden bg-slate-200 dark:bg-slate-700/50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
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
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 text-white hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-blue-600 shadow-lg scale-105"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 hover:scale-105"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "animate-pulse" : "")} />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold shadow-md",
                      isActive
                        ? "bg-white dark:bg-slate-950 text-emerald-700 dark:text-emerald-400 backdrop-blur-sm"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 text-white"
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
      <div className="border-t border-slate-200 dark:border-slate-700/50 p-4">
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-gradient-to-br dark:from-slate-800/60 dark:to-slate-900/40 backdrop-blur-xl p-5 shadow-xl overflow-hidden">
          {/* Football decoration */}
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full border-4 border-emerald-300 dark:border-emerald-800/30" />
          <div className="absolute -left-2 -bottom-2 h-16 w-16 rounded-full border-4 border-teal-300 dark:border-blue-800/30" />
          
          <div className="relative">
            <h3 className="font-bold text-base mb-2 flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Seja Pro! 🚀
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Desbloqueie recursos premium e estatísticas avançadas
            </p>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 text-white hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-blue-600 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
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
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-slate-200 dark:border-slate-700/50 bg-white/90 dark:bg-gradient-to-b dark:from-slate-900/80 dark:to-slate-800/70 backdrop-blur-xl shadow-2xl dark:shadow-black/40 transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
