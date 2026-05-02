"use client";

import {
  Bell,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Lock,
  Shield,
  Users,
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
import { cn } from "@/lib/utils";
import { Logo } from "../logo";
import { JbTeamSwitcher } from "./jb-team-switcher";
import { JbUserMenu } from "./jb-user-menu";
import { useTeamGate } from "./team-gate-context";

const ITEMS = [
  { href: "/arena", icon: Shield, labelKey: "dashboard", requiresTeam: false },
  {
    href: "/arena/events",
    icon: Calendar,
    labelKey: "events",
    requiresTeam: true,
  },
  { href: "/arena/teams", icon: Users, labelKey: "teams", requiresTeam: true },
  {
    href: "/arena/notifications",
    icon: Bell,
    labelKey: "notifications",
    requiresTeam: true,
  },
  {
    href: "/arena/payments",
    icon: CreditCard,
    labelKey: "payments",
    requiresTeam: true,
  },
];

export function JbSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const t = useTranslations("arenaNav");
  const company = useTranslations("company");
  const { requireTeam, hasTeam, role } = useTeamGate();

  const isCaptainWithoutTeam = role === "captain" && !hasTeam;

  return (
    <Sidebar collapsible="icon" className="border-arena-border border-r">
      <SidebarHeader className="flex flex-col gap-3 border-arena-border border-b px-2 py-5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        <div className="flex h-10 items-center justify-between group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:justify-center">
          <Logo
            variant="white"
            size="small"
            href="/arena"
            className={cn(
              "transition-all duration-300",
              state === "collapsed" ? "w-8 h-8" : "scale-100",
            )}
          />
          {RELEASE.IS_BETA && state !== "collapsed" && (
            <span className="rounded-full border border-[#7CFF4F]/25 bg-[#7CFF4F]/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#7CFF4F] uppercase">
              Beta
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-0">
        <JbTeamSwitcher />

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
                      tooltip={
                        isLocked ? "Cria uma equipa primeiro" : t(item.labelKey)
                      }
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
                            <Lock size={12} className="opacity-60" />
                          </span>
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center"
                        >
                          <Icon
                            className={cn(
                              "size-[18px] shrink-0",
                              isActive ? "stroke-[2.5px]" : "stroke-[1.8px]",
                            )}
                          />
                          <span
                            className={cn(
                              "font-semibold transition-opacity duration-200",
                              state === "collapsed"
                                ? "opacity-0 w-0"
                                : "opacity-100",
                            )}
                          >
                            {t(item.labelKey)}
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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-arena-surface-el text-arena-primary group-data-[collapsible=icon]:size-7">
                <LayoutDashboard className="size-4" />
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
            <JbUserMenu collapsed={state === "collapsed"} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
