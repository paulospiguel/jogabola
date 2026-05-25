"use client";

import { ChevronsUpDown, ListTree, Plus, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTeams } from "@/hooks/use-teams";
import { cn } from "@/lib/utils";
import { CreateTeamSheet } from "./create-team-sheet";

export interface Team {
  id: number;
  name: string;
  slug?: string;
}

interface TeamSwitcherProps {
  variant?: "sidebar" | "header";
}

export function TeamSwitcher({ variant = "sidebar" }: TeamSwitcherProps) {
  if (variant === "header") {
    return <HeaderTeamSwitcher />;
  }
  return <SidebarTeamSwitcher />;
}

// ── Sub-component for Mobile Top Header ──────────────────────────────────────────
function HeaderTeamSwitcher() {
  const {
    activeTeamId,
    setActiveTeamId,
    myTeams,
    isLoading,
    canCreateTeam,
    isPlanLoading,
  } = useTeams();
  const t = useTranslations("arenaNav.teamSwitcher");
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeTeam = myTeams?.find((tm: Team) => tm.id === activeTeamId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-8 items-center gap-1.5 rounded-lg border border-arena-border/30 bg-arena-surface-el/20 px-2.5 py-1.5 w-[110px] animate-pulse" />
    );
  }

  // No teams state
  if (!myTeams || myTeams.length === 0) {
    return (
      <>
        {sheetOpen && <CreateTeamSheet onClose={() => setSheetOpen(false)} />}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="press flex w-full items-center gap-1.5 rounded-lg border border-arena-primary/30 bg-arena-primary/5 px-2.5 py-1.5 text-[11px] font-bold text-arena-primary transition-colors hover:bg-arena-primary/10"
        >
          <Shield className="size-3.5" />
          <span className="truncate">{t("noTeam")}</span>
        </button>
      </>
    );
  }

  return (
    <>
      {sheetOpen && <CreateTeamSheet onClose={() => setSheetOpen(false)} />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="press flex w-full items-center gap-1.5 rounded-lg border border-arena-border bg-arena-surface-el/40 px-2.5 py-1.5 text-[11px] font-bold text-arena-text transition-colors hover:border-arena-border hover:bg-arena-surface-el"
          >
            <Shield
              className="size-3.5 text-arena-primary fill-arena-primary/10"
              strokeWidth={2}
            />
            <span className="max-w-[80px] xs:max-w-[110px] truncate">
              {activeTeam?.name ?? t("select")}
            </span>
            <ChevronsUpDown className="size-3 text-arena-text-muted" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-xl border border-arena-border bg-arena-surface p-1 shadow-xl"
          align="start"
          sideOffset={6}
        >
          <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
            {t("teamsLabel")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-arena-border" />
          {myTeams.map((team: Team) => (
            <DropdownMenuItem
              key={team.id}
              onClick={() => setActiveTeamId(team.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-xs transition-colors focus:bg-arena-surface-el focus:text-arena-text",
                team.id === activeTeamId
                  ? "bg-arena-primary/10 text-arena-primary"
                  : "text-arena-text-sec hover:text-arena-text",
              )}
            >
              <Shield
                className={cn(
                  "size-3.5",
                  team.id === activeTeamId
                    ? "text-arena-primary"
                    : "text-arena-text-muted",
                )}
              />
              <span className="flex-1 truncate font-semibold">{team.name}</span>
              {team.id === activeTeamId && (
                <div className="size-1.5 rounded-full bg-arena-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-arena-border" />
          {!isPlanLoading &&
            (canCreateTeam ? (
              <DropdownMenuItem
                onClick={() => setSheetOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-arena-text transition-colors focus:bg-arena-surface-el focus:text-arena-text"
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded bg-arena-surface-el text-arena-text-muted">
                  <Plus className="size-3" strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-xs ml-1">
                  {t("createNewTeam")}
                </span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link
                  href="/arena/profile"
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors focus:bg-arena-surface-el focus:text-arena-text"
                >
                  <div className="flex size-5 shrink-0 items-center justify-center rounded bg-amber-500/15 text-amber-500">
                    <Zap className="size-3" />
                  </div>
                  <span className="font-semibold text-xs ml-1 text-amber-600 dark:text-amber-400">
                    {t("upgradePlan")}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// ── Sub-component for Desktop Sidebar ─────────────────────────────────────────────
function SidebarTeamSwitcher() {
  const {
    activeTeamId,
    setActiveTeamId,
    myTeams,
    isLoading,
    canCreateTeam,
    isPlanLoading,
  } = useTeams();
  const { state } = useSidebar();
  const t = useTranslations("arenaNav.teamSwitcher");
  const collapsed = state === "collapsed";
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeTeam = myTeams?.find((tm: Team) => tm.id === activeTeamId);

  // Loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div
            className={cn(
              "flex h-12 items-center gap-3 rounded-xl px-3",
              collapsed && "h-10 justify-center px-0",
            )}
          >
            <div className="size-8 shrink-0 animate-pulse rounded-lg bg-arena-surface-el" />
            {!collapsed && (
              <div className="h-3 flex-1 animate-pulse rounded bg-arena-surface-el" />
            )}
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // No teams state
  if (!myTeams || myTeams.length === 0) {
    return (
      <>
        {sheetOpen && <CreateTeamSheet onClose={() => setSheetOpen(false)} />}
        <SidebarMenu>
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              size="lg"
              onClick={() => setSheetOpen(true)}
              className={cn(
                "h-12 rounded-xl border border-arena-primary/30 bg-arena-primary/5 transition-all hover:bg-arena-primary/10",
                collapsed && "h-10 w-10 justify-center border-none p-0",
              )}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-arena-primary/15 text-arena-primary">
                <ListTree className={cn(collapsed ? "size-3.5" : "size-4")} />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-arena-primary">
                    {t("noTeam")}
                  </p>
                  <p className="truncate text-[10px] text-arena-primary/70">
                    {t("createTeam")}
                  </p>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </>
    );
  }

  const subLabel =
    myTeams.length > 1 ? t("myTeams", { count: myTeams.length }) : t("myTeam");

  return (
    <>
      {sheetOpen && <CreateTeamSheet onClose={() => setSheetOpen(false)} />}
      <SidebarMenu>
        <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className={cn(
                  "h-12 rounded-xl border border-arena-border/50 bg-arena-surface-el/60 transition-all",
                  "hover:bg-arena-surface-el hover:border-arena-border",
                  "data-[state=open]:bg-arena-surface-el data-[state=open]:border-arena-primary/30",
                  collapsed &&
                    "h-10 w-10 justify-center border-none bg-transparent p-0",
                )}
                tooltip={activeTeam?.name ?? t("select")}
              >
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-lg bg-arena-primary/15 text-arena-primary",
                    collapsed ? "size-7" : "size-8",
                  )}
                >
                  <ListTree className={cn(collapsed ? "size-3.5" : "size-4")} />
                </div>

                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-arena-text">
                      {activeTeam?.name ?? t("select")}
                    </span>
                    <span className="block truncate text-[10px] text-arena-text-muted">
                      {subLabel}
                    </span>
                  </div>
                )}

                {!collapsed && (
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 text-arena-text-muted" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-64 rounded-xl border border-arena-border bg-arena-surface p-1 shadow-xl"
              align="start"
              side="right"
              sideOffset={8}
            >
              {myTeams.length > 1 && (
                <>
                  <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
                    {t("teamsLabel")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-arena-border" />
                  {myTeams.map((team: Team) => (
                    <DropdownMenuItem
                      key={team.id}
                      onClick={() => setActiveTeamId(team.id)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors",
                        "hover:bg-arena-surface-el focus:bg-arena-surface-el",
                        team.id === activeTeamId
                          ? "bg-arena-primary/10 text-arena-primary"
                          : "text-arena-text",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-md",
                          team.id === activeTeamId
                            ? "bg-arena-primary/20 text-arena-primary"
                            : "bg-arena-surface-el text-arena-text-muted",
                        )}
                      >
                        <ListTree className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{team.name}</p>
                        <p className="truncate text-[10px] text-arena-text-muted">
                          {team.slug}
                        </p>
                      </div>
                      {team.id === activeTeamId && (
                        <div className="size-1.5 shrink-0 rounded-full bg-arena-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-arena-border" />
                </>
              )}

              {!isPlanLoading &&
                (canCreateTeam ? (
                  <DropdownMenuItem
                    onClick={() => setSheetOpen(true)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-arena-text transition-colors hover:bg-arena-surface-el focus:bg-arena-surface-el"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-arena-surface-el text-arena-text-muted">
                      <Plus className="size-3.5" />
                    </div>
                    <span className="font-medium">{t("createNewTeam")}</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/arena/profile"
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-arena-surface-el focus:bg-arena-surface-el"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-500">
                        <Zap className="size-3.5" />
                      </div>
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        {t("upgradePlan")}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
