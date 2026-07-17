"use client";

import {
  Bell,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  Lock,
  Shield,
  Timer,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { RELEASE } from "@/constants/app";
import { useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { Logo } from "../logo";
import { useTeamGate } from "./team-gate-context";
import { TeamSwitcher } from "./team-switcher";
import { UserMenu } from "./user-menu";

const ITEMS = [
  { href: "/arena", icon: Shield, labelKey: "dashboard", requiresTeam: false },
  {
    href: "/arena/events",
    icon: Calendar,
    labelKey: "events",
    requiresTeam: true,
  },
  {
    href: "/arena/squads",
    icon: Users,
    labelKey: "squads",
    requiresTeam: true,
  },
  {
    href: "/arena/notifications",
    icon: Bell,
    labelKey: "notifications",
    requiresTeam: true,
  },
  {
    href: "/arena/payments",
    icon: Wallet,
    labelKey: "payments",
    requiresTeam: true,
  },
  {
    href: "/timer",
    icon: Timer,
    labelKey: "timer",
    requiresTeam: false,
  },
];

export function ArenaSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const t = useTranslations("arenaNav");
  const { requireTeam, hasTeam, role } = useTeamGate();
  const { unreadCount } = useUnreadNotificationsCount();

  const isCaptainWithoutTeam = role === "captain" && !hasTeam;

  return (
    <Sidebar collapsible="icon" className="border-arena-border border-r">
      <SidebarHeader className="flex flex-col items-center gap-3 border-arena-border border-b px-2 py-5 group-data-[collapsible=icon]:px-0">
        <div className="relative flex h-12 w-full items-center justify-center group-data-[collapsible=icon]:h-8">
          <Logo
            variant="white"
            size="small"
            href="/arena"
            isBeta={RELEASE.IS_BETA && state !== "collapsed"}
            className={cn(
              "transition-all duration-300",
              state === "collapsed" ? "w-8 h-8" : "scale-100",
            )}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-0">
        <TeamSwitcher />

        <SidebarGroup className="group-data-[collapsible=icon]:p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:gap-2">
              {ITEMS.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/arena" && pathname.startsWith(item.href));
                const isLocked = isCaptainWithoutTeam && item.requiresTeam;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem
                    key={item.href}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      asChild={!isLocked}
                      isActive={isActive && !isLocked}
                      tooltip={isLocked ? t("createTeam") : t(item.labelKey)}
                      className={cn(
                        "h-11 rounded-[10px] transition-all duration-200",
                        isLocked
                          ? "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-arena-text-sec"
                          : isActive
                            ? "bg-arena-primary/10 text-arena-primary hover:bg-arena-primary/15 hover:text-arena-primary"
                            : "text-arena-text-sec hover:bg-arena-surface/60 hover:text-arena-text",
                        "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center",
                      )}
                      onClick={isLocked ? () => requireTeam() : undefined}
                    >
                      {isLocked ? (
                        <span className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                          <Icon className="size-[18px] shrink-0 stroke-[1.8px]" />
                          <span
                            className={cn(
                              "flex flex-1 items-center justify-between font-semibold transition-opacity duration-200",
                              state === "collapsed"
                                ? "opacity-0 w-0"
                                : "opacity-100",
                            )}
                          >
                            {t(item.labelKey)}
                            <Lock size={5} className="opacity-60 ml-2" />
                          </span>
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center w-full"
                        >
                          <div className="relative flex items-center justify-center">
                            <Icon
                              className={cn(
                                "size-[18px] shrink-0",
                                isActive ? "stroke-[2.5px]" : "stroke-[1.8px]",
                              )}
                            />
                            {item.href === "/arena/notifications" &&
                              unreadCount > 0 &&
                              state === "collapsed" && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-arena-primary shadow-[0_0_6px_rgba(124,255,79,0.5)] animate-pulse" />
                              )}
                          </div>
                          <span
                            className={cn(
                              "font-semibold transition-opacity duration-200 flex flex-1 items-center justify-between",
                              state === "collapsed"
                                ? "opacity-0 w-0 pointer-events-none"
                                : "opacity-100",
                            )}
                          >
                            <span>{t(item.labelKey)}</span>
                            {item.href === "/arena/notifications" &&
                              unreadCount > 0 && (
                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-arena-primary px-1.5 text-[10px] font-black text-arena-bg shadow-[0_0_8px_rgba(124,255,79,0.3)] animate-pulse ml-2 shrink-0">
                                  {unreadCount}
                                </span>
                              )}
                          </span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-arena-border border-t p-2 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              size="lg"
              className="text-arena-text-sec hover:bg-arena-surface/60 hover:text-arena-text group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              onClick={toggleSidebar}
            >
              <div
                title={state === "collapsed" ? t("expand") : t("collapse")}
                className="flex aspect-square size-8 items-center justify-center rounded-lg bg-arena-surface-el text-arena-primary group-data-[collapsible=icon]:size-7"
              >
                {state === "collapsed" ? (
                  <ChevronsRight className="size-4" />
                ) : (
                  <ChevronsLeft className="size-4" />
                )}
              </div>
              <div
                className={cn(
                  "grid flex-1 text-left text-sm leading-tight transition-opacity duration-200",
                  state === "collapsed" ? "opacity-0 w-0" : "opacity-100",
                )}
              >
                <span className="truncate font-semibold">
                  {state === "collapsed" ? t("expand") : t("collapse")}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <UserMenu collapsed={state === "collapsed"} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
