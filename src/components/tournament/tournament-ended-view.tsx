"use client";

import { ArrowLeft, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { StandingsTable } from "./tournament-standings-table";
import type { Tournament } from "./types";

interface TournamentEndedViewProps {
  tournament: Tournament;
  onBack: () => void;
}

export function TournamentEndedView({
  tournament,
  onBack,
}: TournamentEndedViewProps) {
  const t = useTranslations("Tournament.view");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col px-4 py-6 sm:px-6 sm:py-8">
      <button
        type="button"
        onClick={onBack}
        className="press mb-8 flex min-h-11 w-fit items-center gap-2 rounded-lg px-1 text-sm font-semibold text-arena-text-sec focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-arena-primary"
      >
        <ArrowLeft size={17} aria-hidden="true" /> {t("back")}
      </button>
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-arena-highlight/15 text-arena-highlight">
          <Trophy size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-arena-text">
          {t("endedTitle")}
        </h1>
        <p className="mt-1 text-sm text-arena-text-muted">
          {t("endedDescription")}
        </p>
      </div>
      <div className="mt-8">
        <StandingsTable tournament={tournament} />
      </div>
    </main>
  );
}
