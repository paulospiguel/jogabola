"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { uid } from "./format";
import { defaultTeamColor, onColor, TEAM_COLORS } from "./team-color";
import type {
  MatchConfig,
  MatchType,
  Player,
  SavedTeam,
  Team,
  TimerMode,
} from "./types";
import { loadTeams } from "./use-match-store";

interface SetupDrawerProps {
  onClose: () => void;
  onCreate: (
    type: MatchType,
    teamA: Team,
    teamB: Team,
    config: MatchConfig,
  ) => void;
}

function blankTeam(side: "A" | "B"): Team {
  return {
    name: side === "A" ? "Equipa A" : "Equipa B",
    color: defaultTeamColor(side),
    players: [],
  };
}

function TeamEditor({
  team,
  saved,
  onChange,
}: {
  team: Team;
  saved: SavedTeam[];
  onChange: (t: Team) => void;
}) {
  const [draft, setDraft] = useState("");

  function addPlayer() {
    const name = draft.trim();
    if (!name) return;
    const p: Player = { id: uid(), name };
    onChange({ ...team, players: [...team.players, p] });
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3">
      <div className="flex items-center gap-2">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold"
          style={{ background: team.color, color: onColor(team.color) }}
        >
          {team.name.slice(0, 1).toUpperCase()}
        </span>
        <input
          value={team.name}
          onChange={e => onChange({ ...team, name: e.target.value })}
          className="h-10 flex-1 rounded-[10px] border border-arena-border bg-arena-surface-el px-3 text-sm font-semibold text-arena-text outline-none focus:border-arena-primary"
          placeholder="Nome da equipa"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TEAM_COLORS.map(c => (
          <button
            key={c}
            type="button"
            aria-label={`Cor ${c}`}
            onClick={() => onChange({ ...team, color: c })}
            className="size-7 rounded-full ring-2 ring-offset-2 ring-offset-arena-surface transition"
            style={{
              background: c,
              boxShadow: team.color === c ? `0 0 0 2px ${c}` : "none",
              outline: team.color === c ? "2px solid #fff" : "none",
            }}
          />
        ))}
      </div>

      {saved.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {saved.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                onChange({
                  name: s.name,
                  color: s.color,
                  players: s.players.map(p => ({ ...p })),
                })
              }
              className="rounded-full border border-arena-border bg-arena-surface-el px-2.5 py-1 text-xs font-semibold text-arena-text-sec hover:border-arena-primary"
            >
              {s.name} · {s.players.length}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPlayer();
            }
          }}
          className="h-10 flex-1 rounded-[10px] border border-arena-border bg-arena-surface-el px-3 text-sm text-arena-text outline-none focus:border-arena-primary"
          placeholder="Adicionar jogador"
        />
        <button
          type="button"
          onClick={addPlayer}
          className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-arena-primary text-arena-bg"
          aria-label="Adicionar jogador"
        >
          <Plus size={18} />
        </button>
      </div>

      {team.players.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {team.players.map(p => (
            <span
              key={p.id}
              className="flex items-center gap-1 rounded-full bg-arena-surface-el px-2.5 py-1 text-xs font-semibold text-arena-text"
            >
              {p.name}
              <button
                type="button"
                aria-label={`Remover ${p.name}`}
                onClick={() =>
                  onChange({
                    ...team,
                    players: team.players.filter(x => x.id !== p.id),
                  })
                }
                className="text-arena-text-muted hover:text-arena-danger"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Stepper({
  label,
  value,
  suffix,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[12px] border border-arena-border bg-arena-surface px-3 py-2.5">
      <span className="text-sm font-semibold text-arena-text">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`${label}: −`}
          onClick={() => onChange(Math.max(min, value - step))}
          className="press grid size-8 place-items-center rounded-lg border border-arena-border bg-arena-surface-el text-arena-text-sec"
        >
          <Minus size={15} />
        </button>
        <span className="w-14 text-center font-sora text-base font-bold text-arena-text tabular-nums">
          {value}
          {suffix ? (
            <span className="ml-0.5 text-xs text-arena-text-muted">
              {suffix}
            </span>
          ) : null}
        </span>
        <button
          type="button"
          aria-label={`${label}: +`}
          onClick={() => onChange(Math.min(max, value + step))}
          className="press grid size-8 place-items-center rounded-lg border border-arena-border bg-arena-surface-el text-arena-text-sec"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

export function SetupDrawer({ onClose, onCreate }: SetupDrawerProps) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<MatchType>("jogo");
  const [teamA, setTeamA] = useState<Team>(() => blankTeam("A"));
  const [teamB, setTeamB] = useState<Team>(() => blankTeam("B"));
  const [mode, setMode] = useState<TimerMode>("down");
  const [minutes, setMinutes] = useState(25);
  const [periods, setPeriods] = useState(2);
  const [sound, setSound] = useState(true);
  const saved = loadTeams();

  const titles = ["Tipo", "Equipas", "Cronómetro"];

  function finish() {
    onCreate(type, teamA, teamB, {
      mode,
      periodLenSec: minutes * 60,
      periods,
      sound,
    });
  }

  return (
    <BottomSheet onClose={onClose} title={`Novo · ${titles[step]}`}>
      <div className="flex flex-col gap-4 overflow-y-auto pb-1">
        {/* step dots */}
        <div className="flex justify-center gap-1.5">
          {titles.map((t, i) => (
            <span
              key={t}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 22 : 8,
                background:
                  i <= step
                    ? "var(--color-arena-primary)"
                    : "var(--color-arena-border)",
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="t0"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="grid grid-cols-2 gap-3"
            >
              {(["jogo", "treino"] as const).map(tp => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setType(tp)}
                  className="flex flex-col items-center gap-2 rounded-[16px] border p-5 transition-colors"
                  style={{
                    borderColor:
                      type === tp
                        ? "var(--color-arena-primary)"
                        : "var(--color-arena-border)",
                    background:
                      type === tp
                        ? "rgba(124,255,79,.12)"
                        : "var(--color-arena-surface)",
                  }}
                >
                  <span className="text-3xl">
                    {tp === "jogo" ? "🏆" : "🎯"}
                  </span>
                  <span className="text-sm font-bold text-arena-text capitalize">
                    {tp}
                  </span>
                </button>
              ))}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="t1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="flex flex-col gap-3"
            >
              <TeamEditor team={teamA} saved={saved} onChange={setTeamA} />
              <TeamEditor team={teamB} saved={saved} onChange={setTeamB} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="t2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["down", "Regressivo", "45 → 0"],
                    ["up", "Cronológico", "0 → 45"],
                  ] as const
                ).map(([m, label, hint]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className="flex flex-col gap-0.5 rounded-[14px] border p-3 text-left transition-colors"
                    style={{
                      borderColor:
                        mode === m
                          ? "var(--color-arena-primary)"
                          : "var(--color-arena-border)",
                      background:
                        mode === m
                          ? "rgba(124,255,79,.12)"
                          : "var(--color-arena-surface)",
                    }}
                  >
                    <span className="text-sm font-bold text-arena-text">
                      {label}
                    </span>
                    <span className="font-mono text-xs text-arena-text-muted">
                      {hint}
                    </span>
                  </button>
                ))}
              </div>

              <Stepper
                label="Duração da parte"
                value={minutes}
                suffix="min"
                min={1}
                max={120}
                step={1}
                onChange={setMinutes}
              />
              <Stepper
                label="Número de partes"
                value={periods}
                min={1}
                max={6}
                step={1}
                onChange={setPeriods}
              />

              <button
                type="button"
                onClick={() => setSound(s => !s)}
                className="flex items-center justify-between rounded-[12px] border border-arena-border bg-arena-surface px-3 py-2.5"
              >
                <span className="text-sm font-semibold text-arena-text">
                  Som + vibração
                </span>
                <span
                  className="relative h-6 w-11 rounded-full transition-colors"
                  style={{
                    background: sound
                      ? "var(--color-arena-primary)"
                      : "var(--color-arena-border)",
                  }}
                >
                  <span
                    className="absolute top-0.5 size-5 rounded-full bg-white transition-all"
                    style={{ left: sound ? 22 : 2 }}
                  />
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 pt-1">
          {step > 0 && (
            <Cta
              variant="secondary"
              onClick={() => setStep(s => s - 1)}
              className="flex-1"
            >
              Voltar
            </Cta>
          )}
          {step < 2 ? (
            <Cta onClick={() => setStep(s => s + 1)} className="flex-1">
              Continuar
            </Cta>
          ) : (
            <Cta onClick={finish} className="flex-1">
              Começar
            </Cta>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
