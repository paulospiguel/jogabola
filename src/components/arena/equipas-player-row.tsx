"use client";

import type { BalancedPlayer } from "@/actions/team-balancer.actions";
import { JbAvatar } from "@/components/arena/avatar";
import type { Guest } from "@/components/arena/guests-sheet";
import { cn } from "@/lib/utils";

type PlayerRowPlayer =
  | BalancedPlayer
  | (Guest & { isGuest: true; image: null });

interface PlayerRowProps {
  player: PlayerRowPlayer;
  rank?: number;
  color?: string;
  selected?: boolean;
  muted?: boolean;
  onPress?: () => void;
}

export function PlayerRow({
  player,
  rank,
  color,
  selected,
  muted,
  onPress,
}: PlayerRowProps) {
  const isGuest = "level" in player || (player as { isGuest?: boolean }).isGuest;
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!onPress}
      className={cn(
        "flex items-center gap-2.5 rounded-[11px] border px-3 py-2 text-left transition-all duration-100",
        onPress && "active:scale-[0.97] cursor-pointer",
        selected
          ? "border-arena-primary/55 bg-arena-primary/10"
          : muted
            ? "border-arena-border/30 bg-arena-surface opacity-40"
            : "border-arena-border bg-arena-surface",
      )}
    >
      {rank !== undefined && (
        <span className="w-5 shrink-0 text-[11px] font-bold text-arena-text-muted">
          {rank}
        </span>
      )}

      <JbAvatar
        name={player.name}
        image={"image" in player ? player.image : null}
        size={28}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold text-arena-text">
            {player.name}
          </span>
          {isGuest && (
            <span className="shrink-0 rounded px-1 py-px text-[9px] font-bold tracking-wide text-arena-text-muted uppercase">
              convidado
            </span>
          )}
        </div>
      </div>

      {player.rating > 0 && (
        <span
          className="shrink-0 text-[12px] font-bold"
          style={{ color: color ?? "#7CFF4F" }}
        >
          {player.rating.toFixed(1)}
        </span>
      )}
    </button>
  );
}
