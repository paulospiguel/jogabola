"use client";

import { motion } from "framer-motion";
import { Plus, Shuffle, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Cta } from "@/components/arena/cta";
import { Stepper } from "@/components/timer/setup-drawer";
import type { SavedTeam } from "@/components/timer/types";
import { cn } from "@/lib/utils";
import { parsePlayerNames } from "./tournament-setup";
import { TournamentTeamCard } from "./tournament-team-card";
import type { TournamentTeam, WinnerStaysMode } from "./types";

const stepMotion = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

interface TeamsSetupStepProps {
  teams: TournamentTeam[];
  savedTeams: SavedTeam[];
  onAdd: () => void;
  onUpdate: (id: string, team: TournamentTeam) => void;
  onRemove: (id: string) => void;
}

export function TeamsSetupStep({
  teams,
  savedTeams,
  onAdd,
  onUpdate,
  onRemove,
}: TeamsSetupStepProps) {
  const t = useTranslations("Tournament");

  return (
    <motion.div {...stepMotion} className="flex flex-col gap-3">
      {teams.map(team => (
        <TournamentTeamCard
          key={team.id}
          team={team}
          savedTeams={savedTeams}
          canRemove={teams.length > 3}
          onChange={updated => onUpdate(team.id, updated)}
          onRemove={() => onRemove(team.id)}
        />
      ))}
      <Cta
        variant="secondary"
        size="md"
        disabled={teams.length >= 6}
        onClick={onAdd}
        className="btn-press gap-2"
      >
        <Plus size={16} /> {t("setup.addTeam")}
      </Cta>
    </motion.div>
  );
}

interface DrawSetupStepProps {
  drawInput: string;
  shuffleStart: boolean;
  onDrawInputChange: (value: string) => void;
  onDistribute: () => void;
  onShuffleStartChange: (value: boolean) => void;
}

export function DrawSetupStep({
  drawInput,
  shuffleStart,
  onDrawInputChange,
  onDistribute,
  onShuffleStartChange,
}: DrawSetupStepProps) {
  const t = useTranslations("Tournament");

  return (
    <motion.div {...stepMotion} className="flex flex-col gap-3">
      <div className="rounded-[16px] border border-arena-border bg-arena-surface p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-arena-primary/15 text-arena-primary">
            <Shuffle size={19} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-arena-text">
              {t("setup.drawPlayersTitle")}
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-arena-text-muted">
              {t("setup.drawPlayersDescription")}
            </p>
          </div>
        </div>
        <textarea
          value={drawInput}
          onChange={event => onDrawInputChange(event.target.value)}
          rows={6}
          className="mt-3 w-full resize-none rounded-[10px] border border-arena-border bg-arena-surface-el p-3 text-sm text-arena-text outline-none focus:border-arena-primary"
          placeholder={t("setup.drawPlaceholder")}
        />
        <Cta
          variant="secondary"
          size="md"
          fullWidth
          disabled={parsePlayerNames(drawInput).length === 0}
          onClick={onDistribute}
          className="btn-press mt-3 gap-2"
        >
          <Shuffle size={16} /> {t("setup.drawPlayers")}
        </Cta>
      </div>

      <button
        type="button"
        aria-pressed={shuffleStart}
        onClick={() => onShuffleStartChange(!shuffleStart)}
        className={cn(
          "press flex min-h-16 items-center gap-3 rounded-[14px] border px-4 text-left transition-colors",
          shuffleStart
            ? "border-arena-primary bg-arena-primary/10"
            : "border-arena-border bg-arena-surface hover:bg-arena-surface-el",
        )}
      >
        <Trophy
          size={19}
          className={cn(
            "shrink-0",
            shuffleStart ? "text-arena-primary" : "text-arena-highlight",
          )}
        />
        <span className="flex flex-1 flex-col">
          <span className="text-sm font-bold text-arena-text">
            {t("setup.shuffleOrder")}
          </span>
          <span className="text-xs text-arena-text-muted">
            {t("setup.shuffleOrderDescription")}
          </span>
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
            shuffleStart
              ? "bg-arena-primary/15 text-arena-primary"
              : "bg-arena-surface-el text-arena-text-muted",
          )}
        >
          {shuffleStart
            ? t("setup.shuffleEnabled")
            : t("setup.shuffleDisabled")}
        </span>
      </button>
    </motion.div>
  );
}

interface RulesSetupStepProps {
  mode: WinnerStaysMode;
  minutes: number;
  sound: boolean;
  onModeChange: (mode: WinnerStaysMode) => void;
  onMinutesChange: (minutes: number) => void;
  onSoundChange: (sound: boolean) => void;
}

export function RulesSetupStep({
  mode,
  minutes,
  sound,
  onModeChange,
  onMinutesChange,
  onSoundChange,
}: RulesSetupStepProps) {
  const t = useTranslations("Tournament");

  return (
    <motion.div {...stepMotion} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(["always", "maxTwoInARow"] as const).map(value => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => onModeChange(value)}
            className={cn(
              "press flex min-h-20 flex-col gap-1 rounded-[14px] border p-3 text-left transition-colors",
              mode === value
                ? "border-arena-primary bg-arena-primary/10"
                : "border-arena-border bg-arena-surface hover:bg-arena-surface-el",
            )}
          >
            <span className="text-sm font-bold text-arena-text">
              {t(`setup.modes.${value}.title`)}
            </span>
            <span className="text-xs leading-relaxed text-arena-text-muted">
              {t(`setup.modes.${value}.description`)}
            </span>
          </button>
        ))}
      </div>

      <Stepper
        label={t("setup.matchDuration")}
        value={minutes}
        suffix={t("setup.minutesSuffix")}
        min={1}
        max={60}
        step={1}
        onChange={onMinutesChange}
      />

      <button
        type="button"
        role="switch"
        aria-checked={sound}
        onClick={() => onSoundChange(!sound)}
        className="press flex min-h-12 items-center justify-between rounded-[12px] border border-arena-border bg-arena-surface px-3"
      >
        <span className="text-sm font-semibold text-arena-text">
          {t("setup.sound")}
        </span>
        <span
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            sound ? "bg-arena-primary" : "bg-arena-border",
          )}
        >
          <span
            className="absolute top-0.5 size-5 rounded-full bg-arena-text transition-all"
            style={{ left: sound ? 22 : 2 }}
          />
        </span>
      </button>
    </motion.div>
  );
}
