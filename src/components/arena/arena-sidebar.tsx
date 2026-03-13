"use client";

import { BarChart2, Calendar, LayoutDashboard, Settings, ShieldCheck, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "../logo";

type ArenaSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const managementItems = [
  { title: "Dashboard", href: "/arena", icon: LayoutDashboard },
  { title: "Active Teams", href: "/arena/teams", icon: Users },
  { title: "Fixtures", href: "/arena/calendar", icon: Calendar },
  { title: "Stat Center", href: "/arena/stats", icon: BarChart2 },
];

const adminItems = [
  { title: "Finances", href: "/arena/finances", icon: Wallet },
  { title: "Club Settings", href: "/arena/settings", icon: Settings },
];

export default function ArenaSidebar({ isOpen, onClose }: ArenaSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col px-4 py-6">
      {/* Logo */}
      <div className="mb-10 flex items-center justify-center gap-3 px-2">
        <Logo size="small" />
      </div>

      {/* Navigation */}
      <div className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
        {/* Management Section */}
        <div className="mb-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6fffe9]/50">
            Management
          </p>
          <nav className="flex flex-col gap-1">
            {managementItems.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold no-underline transition-all duration-200",
                    isActive
                      ? "bg-neon-secondary text-black shadow-[0_8px_25px_-8px_rgba(36,255,230,0.6)]"
                      : "text-white/60 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Club Admin Section */}
        <div>
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6fffe9]/50">
            Club Admin
          </p>
          <nav className="flex flex-col gap-1">
            {adminItems.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold no-underline transition-all duration-200",
                    isActive
                      ? "bg-neon-secondary text-black shadow-[0_8px_25px_-8px_rgba(36,255,230,0.6)]"
                      : "text-white/60 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom: Pro Plan Card */}
      <div className="mt-auto pt-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#6fffe9]/20 bg-white/5 p-4 backdrop-blur">
          {/* Glow accent */}
          <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-neon-secondary/15 blur-2xl" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neon-secondary/15">
              <ShieldCheck className="h-4 w-4 text-[#6fffe9]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-white">Pro Plan</p>
              <p className="mt-0.5 text-[10px] leading-tight text-white/40">
                Active until Dec 2024
              </p>
            </div>
          </div>
          <Link
            href="/arena/billing"
            onClick={onClose}
            className="relative z-10 mt-3 flex w-full items-center justify-center rounded-xl border border-[#6fffe9]/40 py-2 px-4 text-xs font-bold text-[#6fffe9] transition-all duration-200 hover:border-[#6fffe9]/70 hover:bg-[#6fffe9]/10"
          >
            Manage Billing
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 w-full cursor-default bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 overflow-hidden border-r border-white/8 shadow-2xl transition-transform duration-300 md:translate-x-0",
          "bg-[#050312]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
