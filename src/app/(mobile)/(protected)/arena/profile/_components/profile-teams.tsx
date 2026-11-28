"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Shield,
  Shirt,
  Sliders,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { setMyAthleteStatus } from "@/actions/team-staff.actions";
import { avatarColor } from "@/components/arena/tokens";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTeams } from "@/hooks/use-teams";
import { useToast } from "@/hooks/use-toast-custom";
import { invalidateStaffChange, staffErrorKey } from "@/lib/staff-ui";
import { cn } from "@/lib/utils";

interface TeamEntry {
  id: number;
  name: string;
  slug: string;
  location: string | null;
  role: string;
  isAthlete: boolean;
  isOwnerOrStaff: boolean;
  /** Roster (Plantel) rows only. */
  memberCount: number;
}

interface ProfileTeamsProps {
  teams: TeamEntry[];
}

export function ProfileTeams({ teams }: ProfileTeamsProps) {
  const t = useTranslations("profilePage");
  const tSquad = useTranslations("arenaSquad");
  const tStaff = useTranslations("teamStaff");
  const { toast } = useToast();
  const { refetch } = useTeams();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // Optimistic athlete status per team, rolled back on error.
  const [athleteOverrides, setAthleteOverrides] = useState<
    Record<number, boolean>
  >({});
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  const setPending = (teamId: number, pending: boolean) =>
    setPendingIds(prev => {
      const next = new Set(prev);
      if (pending) next.add(teamId);
      else next.delete(teamId);
      return next;
    });

  const handleAthleteToggle = async (team: TeamEntry, isAthlete: boolean) => {
    const previous = athleteOverrides[team.id];
    setAthleteOverrides(prev => ({ ...prev, [team.id]: isAthlete }));
    setPending(team.id, true);
    let errorCode: string | undefined;
    let failed = false;
    try {
      const result = await setMyAthleteStatus({ teamId: team.id, isAthlete });
      if (result.success) {
        await Promise.all([
          refetch(),
          invalidateStaffChange(queryClient, team.id),
        ]);
      } else {
        failed = true;
        errorCode = result.error.code;
      }
    } catch {
      failed = true;
    } finally {
      setPending(team.id, false);
    }
    if (!failed) return;
    setAthleteOverrides(prev => {
      const next = { ...prev };
      if (previous === undefined) delete next[team.id];
      else next[team.id] = previous;
      return next;
    });
    toast.error(tStaff(staffErrorKey(errorCode)));
  };

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  if (teams.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted">
            {t("dashboard.associatedTeams")}
          </span>
        </div>
        <div className="rounded-[16px] border border-arena-border bg-arena-surface/85 p-6 text-center">
          <p className="text-sm text-arena-text-muted">
            {t("dashboard.noTeams")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted">
          {t("dashboard.associatedTeams")}
        </span>
        <span className="text-[10px] text-arena-text-muted font-medium">
          {t("dashboard.associatedTeamsCount", { count: teams.length })}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {teams.map(team => {
          const color = avatarColor(team.id);
          const expanded = expandedId === team.id;
          const isAthlete = athleteOverrides[team.id] ?? team.isAthlete;
          const memberCount =
            team.memberCount +
            (isAthlete === team.isAthlete ? 0 : isAthlete ? 1 : -1);
          const switchId = `athlete-toggle-${team.id}`;
          return (
            <div
              key={team.id}
              className={cn(
                "rounded-[16px] border bg-arena-surface/85 transition-all duration-300 overflow-hidden",
                expanded
                  ? "border-arena-primary/40 ring-1 ring-arena-primary/10"
                  : "border-arena-border hover:border-arena-border/80",
              )}
            >
              <button
                type="button"
                onClick={() => toggleExpand(team.id)}
                className="w-full flex items-center justify-between p-3.5 text-left transition-colors active:bg-arena-surface-el/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${color}15`,
                      border: `1px solid ${color}35`,
                    }}
                  >
                    <Shield
                      className="w-5 h-5"
                      style={{ color }}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-arena-text truncate">
                        {team.name}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] uppercase font-bold px-1.5 py-0.25 rounded",
                          team.role !== "player"
                            ? "bg-arena-primary/15 text-arena-primary border border-arena-primary/20"
                            : "bg-arena-info/15 text-arena-info border border-arena-info/20",
                        )}
                      >
                        {tSquad.has(`roles.${team.role}`)
                          ? tSquad(`roles.${team.role}`)
                          : team.role}
                      </span>
                    </div>
                    <span className="text-xs text-arena-text-muted block mt-0.5 truncate">
                      {[
                        t("dashboard.playersCountLabel", {
                          count: memberCount,
                        }),
                        team.location,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                </div>
                <div className="text-arena-text-muted">
                  {expanded ? (
                    <ChevronDown size={18} className="text-arena-text-sec" />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </div>
              </button>

              {team.isOwnerOrStaff && (
                <div className="flex items-center justify-between gap-3 border-t border-arena-border/30 px-3.5 py-3">
                  <label
                    className="flex min-w-0 items-center gap-2.5 text-[13px] font-semibold text-arena-text-sec"
                    htmlFor={switchId}
                  >
                    <Shirt
                      className="shrink-0 text-arena-text-muted"
                      size={16}
                      strokeWidth={2}
                    />
                    <span className="truncate">{t("athleteToggle")}</span>
                  </label>
                  <Switch
                    checked={isAthlete}
                    className="press data-[state=checked]:border-arena-primary data-[state=checked]:bg-arena-primary"
                    disabled={pendingIds.has(team.id)}
                    id={switchId}
                    onCheckedChange={checked =>
                      handleAthleteToggle(team, checked)
                    }
                  />
                </div>
              )}

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-arena-border/30"
                  >
                    <div className="p-3.5 flex items-center gap-2">
                      <Button
                        className="flex-1 bg-arena-surface border border-arena-primary/30 text-arena-primary font-bold hover:bg-arena-primary/10 h-10 rounded-xl text-xs gap-1.5 transition-all"
                        variant="outline"
                      >
                        <Shield className="w-3.5 h-3.5" strokeWidth={2.2} />
                        {t("dashboard.viewRound")}
                      </Button>
                      <Button className="flex-1 bg-arena-bg-sec border border-arena-border text-arena-text font-bold hover:bg-arena-surface-el h-10 rounded-xl text-xs gap-1.5 transition-all">
                        <Calendar className="w-3.5 h-3.5 text-arena-text-sec" />
                        {t("dashboard.events")}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-10 h-10 bg-arena-bg-sec border border-arena-border rounded-xl hover:bg-arena-surface-el flex items-center justify-center shrink-0"
                      >
                        <Sliders className="w-4 h-4 text-arena-text-sec" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
