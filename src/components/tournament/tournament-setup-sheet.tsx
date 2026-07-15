"use client";

import { AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { uid } from "@/components/timer/format";
import { defaultTeamColor, TEAM_COLORS } from "@/components/timer/team-color";
import type { Player, SavedTeam } from "@/components/timer/types";
import { loadTeams } from "@/components/timer/use-match-store";
import { cn } from "@/lib/utils";
import { drawPlayers, mulberry32 } from "./draw";
import { initQueue } from "./engine";
import { saveTournamentWithVerification } from "./tournament-persistence";
import {
  parsePlayerNames,
  resolveStartingOrder,
  TOURNAMENT_NAME_MAX_LENGTH,
} from "./tournament-setup";
import {
  DrawSetupStep,
  RulesSetupStep,
  TeamsSetupStep,
} from "./tournament-setup-steps";
import { tournamentRepository } from "./tournament-store";
import type { Tournament, TournamentTeam, WinnerStaysMode } from "./types";

interface TournamentSetupSheetProps {
  onClose: () => void;
}

function createBlankTeam(index: number, teamName: (index: number) => string) {
  return {
    id: uid(),
    name: teamName(index + 1),
    color: TEAM_COLORS[index % TEAM_COLORS.length] ?? defaultTeamColor("A"),
    players: [],
  } satisfies TournamentTeam;
}

export function TournamentSetupSheet({ onClose }: TournamentSetupSheetProps) {
  const t = useTranslations("Tournament");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [teams, setTeams] = useState<TournamentTeam[]>(() =>
    Array.from({ length: 3 }, (_, index) =>
      createBlankTeam(index, number => t("setup.defaultTeam", { number })),
    ),
  );
  const [savedTeams] = useState<SavedTeam[]>(() => loadTeams());
  const [drawInput, setDrawInput] = useState("");
  const [mode, setMode] = useState<WinnerStaysMode>("always");
  const [minutes, setMinutes] = useState(5);
  const [sound, setSound] = useState(true);
  const [shuffleStart, setShuffleStart] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savingRef = useRef(false);
  const stepTitles = [
    t("setup.steps.teams"),
    t("setup.steps.rules"),
    t("setup.steps.draw"),
  ];
  const hasValidTeams = teams.every(
    team =>
      team.name.trim().length > 0 &&
      team.players.every(player => player.name.trim().length > 0),
  );

  function updateTeam(id: string, team: TournamentTeam) {
    setTeams(current => current.map(item => (item.id === id ? team : item)));
  }

  function addTeam() {
    if (teams.length >= 6) return;
    setTeams(current => [
      ...current,
      createBlankTeam(current.length, number =>
        t("setup.defaultTeam", { number }),
      ),
    ]);
  }

  function removeTeam(id: string) {
    if (teams.length <= 3) return;
    setTeams(current => current.filter(team => team.id !== id));
  }

  function moveTeam(index: number, direction: -1 | 1) {
    setTeams(current => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function distributePlayers() {
    const names = parsePlayerNames(drawInput);
    if (names.length === 0) return;
    const groups = drawPlayers(names, teams.length, Math.random);

    setTeams(current =>
      current.map((team, index) => ({
        ...team,
        players: (groups[index] ?? []).map(
          name => ({ id: uid(), name }) satisfies Player,
        ),
      })),
    );
  }

  async function finish() {
    if (
      !hasValidTeams ||
      teams.length < 3 ||
      teams.length > 6 ||
      savingRef.current
    ) {
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    const normalizedTeams = teams.map(team => ({
      ...team,
      name: team.name.trim().slice(0, TOURNAMENT_NAME_MAX_LENGTH),
      players: team.players.map(player => ({
        ...player,
        name: player.name.trim().slice(0, TOURNAMENT_NAME_MAX_LENGTH),
      })),
    }));
    const startingOrder = resolveStartingOrder(
      normalizedTeams,
      shuffleStart,
      mulberry32(Date.now()),
    );
    const initial = initQueue(startingOrder.map(team => team.id));
    const tournament: Tournament = {
      id: uid(),
      name: t("fallbackName"),
      createdAt: Date.now(),
      teams: normalizedTeams,
      config: {
        mode,
        matchLenSec: minutes * 60,
        timerMode: "down",
        sound,
      },
      matches: [],
      queue: initial.queue,
      currentPair: initial.currentPair,
      status: "running",
    };

    try {
      await saveTournamentWithVerification(tournamentRepository, tournament);
      onClose();
      router.push(`/timer/tournament/${tournament.id}`);
    } catch {
      savingRef.current = false;
      setSaving(false);
      setSaveError(true);
    }
  }

  return (
    <BottomSheet
      onClose={onClose}
      title={t("setup.title", { step: stepTitles[step] })}
    >
      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pb-1">
        <div className="flex justify-center gap-1.5" aria-hidden="true">
          {stepTitles.map((title, index) => (
            <span
              key={title}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                index === step ? "w-[22px]" : "w-2",
                index <= step ? "bg-arena-primary" : "bg-arena-border",
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <TeamsSetupStep
              key="teams"
              teams={teams}
              savedTeams={savedTeams}
              onAdd={addTeam}
              onUpdate={updateTeam}
              onRemove={removeTeam}
            />
          ) : null}
          {step === 1 ? (
            <RulesSetupStep
              key="rules"
              mode={mode}
              minutes={minutes}
              sound={sound}
              onModeChange={setMode}
              onMinutesChange={setMinutes}
              onSoundChange={setSound}
            />
          ) : null}
          {step === 2 ? (
            <DrawSetupStep
              key="draw"
              teams={teams}
              drawInput={drawInput}
              shuffleStart={shuffleStart}
              onDrawInputChange={setDrawInput}
              onDistribute={distributePlayers}
              onShuffleStartChange={setShuffleStart}
              onMoveTeam={moveTeam}
            />
          ) : null}
        </AnimatePresence>

        <div className="sticky bottom-0 flex gap-2 bg-arena-bg-sec pt-2">
          {step > 0 ? (
            <Cta
              variant="secondary"
              onClick={() => setStep(current => current - 1)}
              className="btn-press flex-1"
            >
              {t("setup.back")}
            </Cta>
          ) : null}
          {step < 2 ? (
            <Cta
              onClick={() => setStep(current => current + 1)}
              disabled={step === 0 && !hasValidTeams}
              className="btn-press flex-1"
            >
              {t("setup.continue")}
            </Cta>
          ) : (
            <Cta
              onClick={finish}
              disabled={!hasValidTeams || saving}
              className="btn-press flex-1 gap-2"
            >
              <Trophy size={18} />
              {saving ? t("setup.saving") : t("setup.start")}
            </Cta>
          )}
        </div>
        {saveError ? (
          <p role="alert" className="text-sm text-arena-danger">
            {t("setup.saveError")}
          </p>
        ) : null}
      </div>
    </BottomSheet>
  );
}
