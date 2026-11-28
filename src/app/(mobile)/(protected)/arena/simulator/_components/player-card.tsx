"use client";

import { useTranslations } from "next-intl";
import awayPortraits from "@/assets/simulator/away-portraits.webp";
import homePortraits from "@/assets/simulator/home-portraits.webp";
import type { Player, playerRole } from "../_simulation/match";

export interface PlayerSelection {
  player: Player;
  slot: number;
  second: number;
}

function PlayerPortrait({ number, side }: Player) {
  const t = useTranslations("matchSimulator");
  const atlas = side === 0 ? homePortraits : awayPortraits;
  const index = number - 1;
  const column = index % 4;
  const row = Math.floor(index / 4);
  return (
    <div
      className="aspect-square w-32 shrink-0 rounded-lg border border-white/10 bg-[#193631] bg-size-[400%_400%] bg-no-repeat"
      role="img"
      aria-label={t("playerCard.portrait", { number })}
      style={{
        backgroundImage: `url("${atlas.src}")`,
        backgroundPosition: `${(column / 3) * 100}% ${(row / 3) * 100}%`,
      }}
    />
  );
}

export function PlayerCard({
  player,
  second,
  role,
}: PlayerSelection & { role: ReturnType<typeof playerRole> }) {
  const t = useTranslations("matchSimulator");
  const minute = Math.floor(second / 60);
  const timestamp = `${String(minute).padStart(2, "0")}:${String(Math.floor(second % 60)).padStart(2, "0")}`;
  return (
    <div className="flex flex-wrap items-start gap-4">
      <PlayerPortrait {...player} />
      <dl className="grid flex-1 gap-2 text-sm text-arena-text-sec">
        <div>
          <dt>{t("playerCard.team")}</dt>
          <dd className="font-medium text-white">
            {t(player.side === 0 ? "home" : "away")}
          </dd>
        </div>
        <div>
          <dt>{t("position")}</dt>
          <dd className="font-medium text-white">
            {t(role === "keeper" ? role : `playerCard.${role}`)}
          </dd>
        </div>
        <div>
          <dt>{t("playerCard.time")}</dt>
          <dd className="font-medium text-white">{timestamp}</dd>
        </div>
      </dl>
    </div>
  );
}
