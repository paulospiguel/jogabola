"use client";

import { Play, Swords } from "lucide-react";
import { useTranslations } from "next-intl";
import { Cta } from "@/components/arena/cta";
import { onColor } from "@/components/timer/team-color";
import type { TournamentTeam } from "./types";

interface TournamentPairingProps {
  teamA: TournamentTeam;
  teamB: TournamentTeam;
  starting: boolean;
  onStart: () => void;
}

function TeamBadge({ team }: { team: TournamentTeam }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <span
        className="grid size-14 place-items-center rounded-2xl text-lg font-black"
        style={{ backgroundColor: team.color, color: onColor(team.color) }}
        aria-hidden="true"
      >
        {team.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="max-w-full truncate text-sm font-extrabold text-arena-text">
        {team.name}
      </span>
    </div>
  );
}

export function TournamentPairing({
  teamA,
  teamB,
  starting,
  onStart,
}: TournamentPairingProps) {
  const t = useTranslations("Tournament.view");

  return (
    <section
      aria-labelledby="pairing-title"
      className="rounded-[16px] border border-arena-border bg-arena-surface p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center gap-2 text-arena-primary">
        <Swords size={17} aria-hidden="true" />
        <h2
          id="pairing-title"
          className="text-xs font-bold uppercase tracking-wide"
        >
          {t("currentMatch")}
        </h2>
      </div>
      <div
        className="flex items-start gap-3"
        role="img"
        aria-label={t("versus", { teamA: teamA.name, teamB: teamB.name })}
      >
        <TeamBadge team={teamA} />
        <span className="pt-5 text-xs font-black uppercase text-arena-text-muted">
          {t("versusShort")}
        </span>
        <TeamBadge team={teamB} />
      </div>
      <Cta
        fullWidth
        onClick={onStart}
        disabled={starting}
        className="btn-press mt-5 gap-2"
      >
        <Play size={18} fill="currentColor" aria-hidden="true" />
        {starting ? t("starting") : t("startMatch")}
      </Cta>
    </section>
  );
}
