"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Timer, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Cta } from "@/components/arena/cta";
import { Logo } from "@/components/logo";
import { TournamentCard } from "./tournament-card";
import { deleteTournamentWithVerification } from "./tournament-persistence";
import { TournamentSetupSheet } from "./tournament-setup-sheet";
import { tournamentRepository } from "./tournament-store";
import type { Tournament } from "./types";

const LOADING_PLACEHOLDERS = ["first", "second"] as const;
export function TournamentHubView() {
  const t = useTranslations("Tournament");
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [deleteErrorIds, setDeleteErrorIds] = useState<Set<string>>(new Set());
  async function removeTournament(id: string) {
    setDeleteErrorIds(ids => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
    try {
      await deleteTournamentWithVerification(tournamentRepository, id);
      setTournaments(items => items.filter(item => item.id !== id));
    } catch {
      setDeleteErrorIds(ids => new Set(ids).add(id));
      throw new Error("Tournament deletion failed");
    }
  }
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
      <header className="flex items-center justify-between gap-3 pt-5 pb-6 sm:pt-8">
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
        <Link
          href="/timer"
          className="press flex min-h-11 shrink-0 items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface px-3 py-2 text-xs font-bold text-arena-text-sec transition-colors hover:border-arena-primary/40 hover:text-arena-primary"
        >
          <Timer size={14} /> {t("hub.openTimer")}
        </Link>
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
        {deleteErrorIds.size > 0 ? (
          <p role="alert" className="text-xs text-arena-danger">
            {t("hub.deleteError")}
          </p>
        ) : null}
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
                onDelete={() => removeTournament(tournament.id)}
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
