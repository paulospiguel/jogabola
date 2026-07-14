"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Plus, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Cta } from "@/components/arena/cta";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { TournamentSetupSheet } from "./tournament-setup-sheet";
import { tournamentRepository } from "./tournament-store";
import type { Tournament } from "./types";

const STATUS_STYLES: Record<Tournament["status"], string> = {
  setup: "bg-arena-surface-el text-arena-text-muted",
  running: "bg-arena-primary/15 text-arena-primary",
  ended: "bg-arena-highlight/15 text-arena-highlight",
};

const LOADING_PLACEHOLDERS = ["first", "second"] as const;

interface TournamentCardProps {
  tournament: Tournament;
  index: number;
  onOpen: () => void;
}

function TournamentCard({ tournament, index, onOpen }: TournamentCardProps) {
  const t = useTranslations("Tournament");
  const currentTeams = tournament.currentPair
    ?.map(teamId => tournament.teams.find(team => team.id === teamId)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onOpen}
      className="press group flex min-h-20 w-full items-center gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3 text-left transition-colors hover:border-arena-primary/40 hover:bg-arena-surface-el"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-arena-highlight/15 text-arena-highlight">
        <Trophy size={21} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-bold text-arena-text">
          {tournament.name || t("fallbackName")}
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
    </motion.button>
  );
}

export function TournamentHubView() {
  const t = useTranslations("Tournament");
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    tournamentRepository.list().then(items => {
      if (!mounted) return;
      setTournaments(items);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col px-4 pb-12 sm:px-6">
      <header className="flex items-center justify-between gap-4 pt-5 pb-6 sm:pt-8">
        <div className="flex min-w-0 items-center gap-3">
          <Logo variant="white" size="header" className="shrink-0" />
          <span className="h-7 w-px bg-arena-border" aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="truncate font-sora text-lg font-extrabold text-arena-text sm:text-xl">
              {t("title")}
            </h1>
            <p className="truncate text-xs text-arena-text-sec">
              {t("hub.subtitle")}
            </p>
          </div>
        </div>
      </header>

      <Cta
        onClick={() => setSetupOpen(true)}
        fullWidth
        className="btn-press gap-2 shadow-[0_0_32px_rgba(124,255,79,.16)] sm:self-end sm:w-auto"
      >
        <Plus size={20} /> {t("hub.newTournament")}
      </Cta>

      <section className="mt-7 flex flex-col gap-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
          {t("hub.saved")}
        </h2>

        {loading ? (
          <output
            className="flex flex-col gap-2.5"
            aria-label={t("hub.loading")}
          >
            {LOADING_PLACEHOLDERS.map(placeholder => (
              <div
                key={placeholder}
                className="h-20 animate-pulse rounded-[16px] border border-arena-border bg-arena-surface"
              />
            ))}
          </output>
        ) : tournaments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-[16px] border border-arena-border border-dashed bg-arena-surface/40 px-5 py-10 text-center"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-arena-highlight/15 text-arena-highlight">
              <Trophy size={25} />
            </span>
            <h3 className="mt-3 text-sm font-bold text-arena-text">
              {t("hub.emptyTitle")}
            </h3>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-arena-text-muted">
              {t("hub.emptyDescription")}
            </p>
            <Cta
              size="md"
              onClick={() => setSetupOpen(true)}
              className="btn-press mt-4 gap-2"
            >
              <Plus size={16} /> {t("hub.emptyCta")}
            </Cta>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {tournaments.map((tournament, index) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                index={index}
                onOpen={() => router.push(`/timer/tournament/${tournament.id}`)}
              />
            ))}
          </AnimatePresence>
        )}
      </section>

      {setupOpen ? (
        <TournamentSetupSheet onClose={() => setSetupOpen(false)} />
      ) : null}
    </main>
  );
}
