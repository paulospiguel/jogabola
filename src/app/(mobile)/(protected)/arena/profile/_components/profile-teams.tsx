"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Shield,
  Sliders,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INITIAL_TEAMS } from "../_fixtures/profile-mock";

interface TeamEntry {
  id: number;
  name: string;
  role: string;
  league: string;
  color: string;
  stats: ReadonlyArray<{ readonly value: string; readonly labelKey: string }>;
  expanded: boolean;
}

export function ProfileTeams() {
  const t = useTranslations("profilePage");
  const tSquad = useTranslations("arenaSquad");
  const [teamsList, setTeamsList] = useState<TeamEntry[]>(
    INITIAL_TEAMS.map(t => ({ ...t })),
  );

  const toggleExpand = (id: number) => {
    setTeamsList(prev =>
      prev.map(t => ({
        ...t,
        expanded: t.id === id ? !t.expanded : false,
      })),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted">
          {t("dashboard.associatedTeams")}
        </span>
        <span className="text-[10px] text-arena-text-muted font-medium">
          {t("dashboard.associatedTeamsCount", { count: teamsList.length })}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {teamsList.map(team => (
          <div
            key={team.id}
            className={cn(
              "rounded-[16px] border bg-arena-surface/85 transition-all duration-300 overflow-hidden",
              team.expanded
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
                    backgroundColor: `${team.color}15`,
                    border: `1px solid ${team.color}35`,
                  }}
                >
                  <Shield className="w-5 h-5" style={{ color: team.color }} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-arena-text truncate">{team.name}</span>
                    <span
                      className={cn(
                        "text-[9px] uppercase font-bold px-1.5 py-0.25 rounded",
                        team.role === "manager"
                          ? "bg-arena-primary/15 text-arena-primary border border-arena-primary/20"
                          : "bg-arena-info/15 text-arena-info border border-arena-info/20",
                      )}
                    >
                      {tSquad.has(`roles.${team.role}`) ? tSquad(`roles.${team.role}`) : team.role}
                    </span>
                  </div>
                  <span className="text-xs text-arena-text-muted block mt-0.5 truncate">
                    {team.league}
                  </span>
                </div>
              </div>
              <div className="text-arena-text-muted">
                {team.expanded ? (
                  <ChevronDown size={18} className="text-arena-text-sec" />
                ) : (
                  <ChevronRight size={18} />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {team.expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-arena-border/30"
                >
                  <div className="p-3.5 flex flex-col gap-4">
                    <div className="grid grid-cols-4 bg-arena-bg-sec/55 border border-arena-border/40 rounded-xl p-2.5 divide-x divide-arena-border/30">
                      {team.stats.map(s => (
                        <div key={s.labelKey} className="text-center flex flex-col">
                          <span className="text-sm font-extrabold font-sora text-arena-text">
                            {s.value}
                          </span>
                          <span className="text-[8px] uppercase font-bold tracking-wide text-arena-text-muted mt-0.5">
                            {t(s.labelKey)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
