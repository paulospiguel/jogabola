"use client";

import { motion } from "framer-motion";
import { Plus, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { onColor } from "./team-color";
import type { Player } from "./types";

interface PlayerPickerProps {
  /** Full list of players currently in this team (already persisted). */
  players: Player[];
  /** Currently selected player id (null = none). */
  selectedId: string | null;
  /** Team colour for active pill styling. */
  teamColor: string;
  /** Called when the user taps a player pill. */
  onSelect: (id: string) => void;
  /**
   * Called when the user confirms a new player name.
   * The parent creates the Player (with a uid), persists it to match state,
   * and returns the new Player so the picker can auto-select it.
   */
  onAddPlayer: (name: string) => Player;
  /** Section label shown above the grid. Defaults to "Jogador". */
  label?: string;
  /** Player id to exclude from the rendered list (e.g. scorer in assist picker). */
  excludeId?: string;
  /** Optional controlled draft, used when the parent owns the submit flow. */
  draft?: string;
  onDraftChange?: (value: string) => void;
  /** Overrides the default add-player action, including empty subsequent submits. */
  onSubmitDraft?: (value: string) => void;
}

function PlayerPill({
  player,
  active,
  color,
  onClick,
}: {
  player: Player;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-2 rounded-[12px] border px-3 py-2.5 text-left text-sm font-semibold transition-colors"
      style={{
        borderColor: active ? color : "var(--color-arena-border)",
        background: active ? `${color}1f` : "var(--color-arena-surface)",
        color: "var(--color-arena-text)",
      }}
    >
      <span
        className="grid size-6 shrink-0 place-items-center rounded-md text-[10px] font-extrabold"
        style={{ background: color, color: onColor(color) }}
      >
        {player.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="truncate">{player.name}</span>
    </motion.button>
  );
}

export function PlayerPicker({
  players,
  selectedId,
  teamColor,
  onSelect,
  onAddPlayer,
  label = "Jogador",
  excludeId,
  draft: controlledDraft,
  onDraftChange,
  onSubmitDraft,
}: PlayerPickerProps) {
  const t = useTranslations("timer.match.playerPicker");
  const [internalDraft, setInternalDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const draft = controlledDraft ?? internalDraft;

  function updateDraft(value: string) {
    if (onDraftChange) {
      onDraftChange(value);
      return;
    }
    setInternalDraft(value);
  }

  const visible = excludeId ? players.filter(p => p.id !== excludeId) : players;

  function commit() {
    const name = draft.trim();
    if (onSubmitDraft) {
      onSubmitDraft(name);
      return;
    }
    if (!name) return;
    const newPlayer = onAddPlayer(name);
    onSelect(newPlayer.id);
    updateDraft("");
    inputRef.current?.blur();
  }

  return (
    <section className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wide text-arena-text-muted">
        {label}
      </span>

      {visible.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {visible.map(p => (
            <PlayerPill
              key={p.id}
              player={p}
              active={selectedId === p.id}
              color={teamColor}
              onClick={() => onSelect(p.id)}
            />
          ))}
        </div>
      )}

      {/* Inline add-player field */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={e => updateDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={
            visible.length === 0 ? t("emptyPlaceholder") : t("addPlaceholder")
          }
          className="h-10 flex-1 rounded-[10px] border border-arena-border bg-arena-surface-el px-3 text-sm text-arena-text outline-none placeholder:text-arena-text-muted focus:border-arena-primary"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          disabled={!draft.trim()}
          onClick={commit}
          aria-label={t("addPlayer")}
          className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-arena-primary text-arena-bg disabled:opacity-40"
        >
          {visible.length === 0 ? <UserPlus size={16} /> : <Plus size={18} />}
        </motion.button>
      </div>
    </section>
  );
}
