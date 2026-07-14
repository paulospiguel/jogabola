"use client";

import { Plus, Trash2, UserRound, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { uid } from "@/components/timer/format";
import { onColor, TEAM_COLORS } from "@/components/timer/team-color";
import type { SavedTeam } from "@/components/timer/types";
import { cn } from "@/lib/utils";
import { TOURNAMENT_NAME_MAX_LENGTH } from "./tournament-setup";
import type { TournamentTeam } from "./types";

interface TournamentTeamCardProps {
  team: TournamentTeam;
  savedTeams: SavedTeam[];
  canRemove: boolean;
  onChange: (team: TournamentTeam) => void;
  onRemove: () => void;
}

export function TournamentTeamCard({
  team,
  savedTeams,
  canRemove,
  onChange,
  onRemove,
}: TournamentTeamCardProps) {
  const t = useTranslations("Tournament");
  const [playerDraft, setPlayerDraft] = useState("");

  function addPlayer() {
    const name = playerDraft.trim().slice(0, TOURNAMENT_NAME_MAX_LENGTH);
    if (!name) return;

    onChange({
      ...team,
      players: [...team.players, { id: uid(), name }],
    });
    setPlayerDraft("");
  }

  function applySavedTeam(saved: SavedTeam) {
    onChange({
      ...team,
      name: saved.name.slice(0, TOURNAMENT_NAME_MAX_LENGTH),
      color: saved.color,
      players: saved.players.map(player => ({
        id: uid(),
        name: player.name.slice(0, TOURNAMENT_NAME_MAX_LENGTH),
      })),
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3">
      <div className="flex items-center gap-2">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-[10px] text-sm font-extrabold"
          style={{ backgroundColor: team.color, color: onColor(team.color) }}
        >
          {team.name.slice(0, 1).toUpperCase() || <UserRound size={15} />}
        </span>
        <input
          value={team.name}
          maxLength={TOURNAMENT_NAME_MAX_LENGTH}
          onChange={event => onChange({ ...team, name: event.target.value })}
          className="h-11 min-w-0 flex-1 rounded-[10px] border border-arena-border bg-arena-surface-el px-3 text-sm font-semibold text-arena-text outline-none focus:border-arena-primary"
          placeholder={t("setup.teamNamePlaceholder")}
        />
        <button
          type="button"
          disabled={!canRemove}
          onClick={onRemove}
          className="press grid size-11 shrink-0 place-items-center rounded-[10px] border border-arena-border text-arena-text-muted transition-colors hover:text-arena-danger disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={t("setup.removeTeam", { name: team.name })}
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TEAM_COLORS.map(color => (
          <button
            key={color}
            type="button"
            aria-label={t("setup.chooseColor", { color })}
            aria-pressed={team.color === color}
            onClick={() => onChange({ ...team, color })}
            className={cn(
              "press size-8 rounded-full border-2 transition-all",
              team.color === color
                ? "border-arena-text ring-2 ring-arena-primary ring-offset-2 ring-offset-arena-surface"
                : "border-transparent",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {savedTeams.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {savedTeams.map(saved => (
            <button
              key={saved.id}
              type="button"
              onClick={() => applySavedTeam(saved)}
              className="press rounded-full border border-arena-border bg-arena-surface-el px-2.5 py-1.5 text-xs font-semibold text-arena-text-sec transition-colors hover:border-arena-primary"
            >
              {t("setup.savedTeam", {
                name: saved.name,
                count: saved.players.length,
              })}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          value={playerDraft}
          maxLength={TOURNAMENT_NAME_MAX_LENGTH}
          onChange={event => setPlayerDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") {
              event.preventDefault();
              addPlayer();
            }
          }}
          className="h-11 min-w-0 flex-1 rounded-[10px] border border-arena-border bg-arena-surface-el px-3 text-sm text-arena-text outline-none focus:border-arena-primary"
          placeholder={t("setup.playerPlaceholder")}
        />
        <button
          type="button"
          onClick={addPlayer}
          className="press grid size-11 shrink-0 place-items-center rounded-[10px] bg-arena-primary text-arena-bg"
          aria-label={t("setup.addPlayer")}
        >
          <Plus size={18} />
        </button>
      </div>

      {team.players.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {team.players.map(player => (
            <div key={player.id} className="flex items-center gap-2">
              <UserRound size={14} className="shrink-0 text-arena-text-muted" />
              <input
                value={player.name}
                maxLength={TOURNAMENT_NAME_MAX_LENGTH}
                onChange={event =>
                  onChange({
                    ...team,
                    players: team.players.map(item =>
                      item.id === player.id
                        ? { ...item, name: event.target.value }
                        : item,
                    ),
                  })
                }
                aria-label={t("setup.editPlayer", { name: player.name })}
                className="h-9 min-w-0 flex-1 rounded-lg border border-arena-border bg-arena-surface-el px-2.5 text-xs font-semibold text-arena-text outline-none focus:border-arena-primary"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...team,
                    players: team.players.filter(item => item.id !== player.id),
                  })
                }
                className="press grid size-9 place-items-center rounded-lg text-arena-text-muted hover:text-arena-danger"
                aria-label={t("setup.removePlayer", { name: player.name })}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
