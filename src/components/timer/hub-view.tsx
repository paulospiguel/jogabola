"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Timer, Trash2, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import { useAnalytics } from "@/providers/analytics";
import { formatMatchDate, uid } from "./format";
import {
  createSetupNavigationState,
  reduceSetupNavigationState,
  shouldOpenSetup,
  TIMER_HUB_HREF,
} from "./navigation";
import { SetupDrawer } from "./setup-drawer";
import type { Match, MatchConfig, MatchType, Team } from "./types";
import {
  createMatch,
  deleteMatch,
  loadStandaloneMatches,
  saveTeam,
  score,
  upsertMatch,
} from "./use-match-store";

const STATUS_LABEL: Record<
  Match["state"]["status"],
  { label: string; cls: string }
> = {
  idle: {
    label: "Por começar",
    cls: "bg-arena-surface-el text-arena-text-muted",
  },
  running: {
    label: "A decorrer",
    cls: "bg-arena-primary/15 text-arena-primary",
  },
  paused: { label: "Em pausa", cls: "bg-arena-warning/15 text-arena-warning" },
  ended: { label: "Terminado", cls: "bg-arena-surface-el text-arena-text-sec" },
};

function MatchCard({
  match,
  onOpen,
  onDelete,
}: {
  match: Match;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!confirmDelete) return;

    const timeoutId = window.setTimeout(() => setConfirmDelete(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [confirmDelete]);

  const s = score(match);
  const st = STATUS_LABEL[match.state.status];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group flex items-center gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3 transition-colors hover:border-arena-primary/40 hover:bg-arena-surface-el"
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 items-center gap-3 text-left"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-arena-surface-el text-base">
          {match.type === "jogo" ? "🏆" : "🎯"}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-bold text-arena-text">
            {match.teams.A.name}{" "}
            <span className="text-arena-text-muted">vs</span>{" "}
            {match.teams.B.name}
          </span>
          <span className="mt-1 flex items-center gap-2">
            <span
              className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}
            >
              {st.label}
            </span>
            <span className="text-[10px] text-arena-text-muted">
              {formatMatchDate(match.createdAt)}
            </span>
          </span>
        </div>
        <span className="font-sora text-xl font-extrabold tabular-nums text-arena-text">
          {s.A}-{s.B}
        </span>
      </button>
      <button
        type="button"
        aria-label={
          confirmDelete ? "Confirmar eliminação do jogo" : "Eliminar jogo"
        }
        onClick={() => {
          if (confirmDelete) {
            onDelete();
            return;
          }
          setConfirmDelete(true);
        }}
        onBlur={() => setConfirmDelete(false)}
        className={`btn-press min-h-11 min-w-11 shrink-0 transition ${
          confirmDelete
            ? "rounded-lg bg-arena-danger px-2.5 py-2 text-xs font-bold text-white"
            : "rounded-lg p-2 text-arena-text-muted opacity-60 hover:text-arena-danger hover:opacity-100"
        }`}
      >
        {confirmDelete ? "Sim?" : <Trash2 size={16} />}
      </button>
    </motion.div>
  );
}

export function HubView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openSetupFromUrl = shouldOpenSetup(searchParams);
  const { logEvent } = useAnalytics();
  const [matches, setMatches] = useState<Match[]>([]);
  const [setupNavigation, dispatchSetupNavigation] = useReducer(
    reduceSetupNavigationState,
    undefined,
    createSetupNavigationState,
  );

  useEffect(() => {
    dispatchSetupNavigation({
      type: "url_changed",
      requested: openSetupFromUrl,
    });
  }, [openSetupFromUrl]);

  useEffect(() => {
    setMatches(loadStandaloneMatches());
  }, []);

  function handleCreate(
    type: MatchType,
    teamA: Team,
    teamB: Team,
    config: MatchConfig,
  ) {
    const match = createMatch(type, teamA, teamB, config);
    logEvent("timer_match_created", undefined, { type });
    upsertMatch(match);
    for (const t of [teamA, teamB]) {
      if (t.players.length > 0) {
        saveTeam({
          id: uid(),
          name: t.name,
          color: t.color,
          players: t.players,
        });
      }
    }
    dispatchSetupNavigation({ type: "close" });
    router.push(`/timer/jogo/${match.id}`);
  }

  function remove(id: string) {
    deleteMatch(id);
    setMatches(loadStandaloneMatches());
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-4 pb-10">
      <header className="flex items-center justify-between gap-3 pt-6 pb-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-arena-primary/15 ring-1 ring-arena-primary/40">
            <Timer size={20} className="text-arena-primary" />
          </span>
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate font-sora text-lg font-extrabold leading-none text-arena-text">
              Cronómetro
            </h1>
            <span className="block max-w-full truncate text-xs text-arena-text-sec">
              Gestor de jogos &amp; treinos
            </span>
          </div>
        </div>
        <Link
          href="/timer/tournament"
          className="press flex min-h-11 shrink-0 items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface px-3 py-2 text-xs font-bold text-arena-text-sec transition-colors hover:border-arena-primary/40 hover:text-arena-primary"
        >
          <Trophy size={14} /> Torneios
        </Link>
      </header>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => dispatchSetupNavigation({ type: "open" })}
        className="flex items-center justify-center gap-2 rounded-[16px] bg-arena-primary py-4 font-extrabold text-arena-bg shadow-[0_0_32px_rgba(124,255,79,.18)]"
      >
        <Plus size={20} /> Novo jogo / treino
      </motion.button>

      <section className="mt-7 flex flex-col gap-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
          Recentes
        </h2>
        {matches.length === 0 ? (
          <div className="rounded-[16px] border border-arena-border border-dashed bg-arena-surface/40 px-4 py-10 text-center">
            <span className="text-3xl">⚽</span>
            <p className="mt-2 text-sm font-semibold text-arena-text">
              Sem jogos ainda
            </p>
            <p className="mt-1 text-xs text-arena-text-muted">
              Cria o primeiro jogo ou treino acima.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {matches.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                onOpen={() => router.push(`/timer/jogo/${m.id}`)}
                onDelete={() => remove(m.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </section>

      {setupNavigation.isOpen && (
        <SetupDrawer
          onClose={() => {
            dispatchSetupNavigation({ type: "close" });
            if (openSetupFromUrl) router.replace(TIMER_HUB_HREF);
          }}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
