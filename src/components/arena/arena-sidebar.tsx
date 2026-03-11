"use client";

import {
  BarChart2,
  Calendar,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "../logo";

type ArenaSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ARENA_COLOR = "var(--color-journey-arena)";

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
    <div className="flex h-full flex-col py-6 px-4">
      {/* Logo */}
      <div className="mb-10 flex items-center justify-center gap-3 px-2">
        <Logo size={"small"} />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* Management Section */}
        <div className="mb-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
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
                    "flex items-center gap-3 no-underline rounded-2xl px-3 py-3 w-full transition-all duration-200 font-bold text-sm",
                    !isActive
                      ? "text-white/60 hover:bg-white/5 hover:text-white"
                      : "",
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: ARENA_COLOR,
                          color: "#000",
                        }
                      : undefined
                  }
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Club Admin Section */}
        <div>
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
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
                    "flex items-center gap-3 no-underline rounded-2xl px-3 py-3 w-full transition-all duration-200 font-bold text-sm",
                    !isActive
                      ? "text-white/60 hover:bg-white/5 hover:text-white"
                      : "",
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: ARENA_COLOR,
                          color: "#000",
                        }
                      : undefined
                  }
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom: Pro Plan Card */}
      <div className="mt-auto pt-6">
        <div className="rounded-2xl border border-white/8 bg-[#1a1a1a] p-4 flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(188,255,0,0.15)" }}
            >
              <ShieldCheck
                className="h-4 w-4"
                style={{ color: ARENA_COLOR }}
                strokeWidth={3}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                Pro Plan
              </p>
              <p className="text-[10px] text-white/40 leading-tight mt-0.5">
                Active until Dec 2024
              </p>
            </div>
          </div>
          <Link
            href="/arena/billing"
            className="rounded-xl py-2 px-4 text-xs font-bold transition hover:bg-white/5 text-center z-10 w-full"
            style={{ color: ARENA_COLOR, border: `1px solid ${ARENA_COLOR}` }}
            onClick={onClose}
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden w-full cursor-default"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 overflow-hidden transition-transform duration-300 md:translate-x-0",
          "bg-[#0d0d0d] border-r border-white/5 shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
