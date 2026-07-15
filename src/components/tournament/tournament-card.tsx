"use client";

import { motion } from "framer-motion";
import { ChevronRight, Trash2, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Tournament } from "./types";

const STATUS_STYLES: Record<Tournament["status"], string> = {
  setup: "bg-arena-surface-el text-arena-text-muted",
  running: "bg-arena-primary/15 text-arena-primary",
  ended: "bg-arena-highlight/15 text-arena-highlight",
};

interface TournamentCardProps {
  tournament: Tournament;
  index: number;
  onOpen: () => void;
  onDelete: () => Promise<void>;
}

export function TournamentCard({
  tournament,
  index,
  onOpen,
  onDelete,
}: TournamentCardProps) {
  const t = useTranslations("Tournament");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const tournamentName = tournament.name || t("fallbackName");
  const currentTeams = tournament.currentPair
    ?.map(teamId => tournament.teams.find(team => team.id === teamId)?.name)
    .filter((name): name is string => Boolean(name));

  useEffect(() => {
    if (!confirmingDelete) return;
    const timeout = window.setTimeout(() => setConfirmingDelete(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [confirmingDelete]);

  async function handleDelete() {
    if (deleting) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    setConfirmingDelete(false);
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setDeleting(false);
    }
  }

  const deleteLabel = deleting
    ? t("hub.deletingTournament", { name: tournamentName })
    : confirmingDelete
      ? t("hub.confirmDeleteTournament", { name: tournamentName })
      : t("hub.deleteTournament", { name: tournamentName });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="press group flex min-h-20 w-full items-center gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3 text-left transition-colors hover:border-arena-primary/40 hover:bg-arena-surface-el"
    >
      <button
        type="button"
        onClick={onOpen}
        className="btn-press flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-arena-highlight/15 text-arena-highlight">
          <Trophy size={21} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-bold text-arena-text">
            {tournamentName}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                STATUS_STYLES[tournament.status],
              )}
            >
              {t(`status.${tournament.status}`)}
            </span>
            <span className="text-xs text-arena-text-muted">
              {t("hub.teamCount", { count: tournament.teams.length })}
            </span>
          </span>
          {currentTeams?.length === 2 ? (
            <span className="mt-1 truncate text-xs text-arena-text-sec">
              {t("hub.currentPair", {
                teamA: currentTeams[0],
                teamB: currentTeams[1],
              })}
            </span>
          ) : null}
        </span>
        <ChevronRight
          size={18}
          className="shrink-0 text-arena-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-arena-primary"
        />
      </button>
      <button
        type="button"
        aria-label={deleteLabel}
        aria-busy={deleting}
        disabled={deleting}
        onClick={() => void handleDelete()}
        onBlur={() => setConfirmingDelete(false)}
        className="btn-press grid min-h-11 min-w-11 place-items-center rounded-xl px-2 text-xs font-bold text-arena-danger transition-colors hover:bg-arena-danger/15 disabled:cursor-wait disabled:opacity-70"
      >
        {deleting ? (
          t("hub.deleting")
        ) : confirmingDelete ? (
          t("hub.deleteConfirm")
        ) : (
          <Trash2 size={18} />
        )}
      </button>
    </motion.div>
  );
}
