"use client";

import { AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import trophyIcon from "@/assets/images/trophy.svg";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { buildTopScorerKeys } from "./tournament-result";
import { decodeTournamentResult } from "./tournament-share";

interface TournamentResultViewProps {
  data: string | null;
}

export function TournamentResultView({ data }: TournamentResultViewProps) {
  const t = useTranslations("Tournament.result");
  const result = data ? decodeTournamentResult(data) : null;

  if (!result) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center px-4 text-center">
        <div className="grid size-16 place-items-center rounded-full border border-arena-border bg-arena-surface text-arena-text-muted">
          <AlertCircle aria-hidden="true" className="size-8" />
        </div>
        <h1 className="mt-4 font-sora text-xl font-extrabold text-arena-text">
          {t("invalidTitle")}
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-arena-text-sec">
          {t("invalidDescription")}
        </p>
        <Link
          href="/timer/tournament"
          className="btn-press mt-5 rounded-[10px] bg-arena-primary px-4 py-2.5 text-sm font-bold text-arena-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-primary"
        >
          {t("openTournaments")}
        </Link>
      </main>
    );
  }

  const champion = result.teams.find(team => team.id === result.s[0][0]);
  const scorerKeys = buildTopScorerKeys(result.top);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-4 px-4 py-8">
      <Logo variant="white" href="/" size="header" />

      <header className="flex flex-col items-center gap-2 rounded-[18px] border border-arena-primary/40 bg-arena-primary/10 py-6 text-center">
        <Image src={trophyIcon} alt="" width={40} height={40} />
        <p className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
          {t("champion")} · {result.name}
        </p>
        <h1 className="font-sora text-xl font-extrabold text-arena-text">
          {champion?.n ?? t("teamFallback")}
        </h1>
      </header>

      <section
        aria-labelledby="tournament-result-standings"
        className="flex flex-col gap-1.5 rounded-[16px] border border-arena-border bg-arena-surface p-3"
      >
        <h2 id="tournament-result-standings" className="sr-only">
          {t("standings")}
        </h2>
        <ol className="flex flex-col gap-1.5">
          {result.s.map(([teamId, points, goalsFor, goalsAgainst]) => {
            const team = result.teams.find(
              candidate => candidate.id === teamId,
            );

            return (
              <li
                key={teamId}
                className="flex items-center justify-between rounded-[10px] bg-arena-surface-el px-2 py-1.5 text-sm"
              >
                <span className="flex min-w-0 items-center gap-1.5 font-bold text-arena-text">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      !team && "bg-arena-primary",
                    )}
                    style={team ? { backgroundColor: team.c } : undefined}
                  />
                  <span className="truncate">
                    {team?.n ?? t("teamFallback")}
                  </span>
                </span>
                <span className="font-sora font-extrabold tabular-nums text-arena-text">
                  {t("points", { count: points })}
                </span>
                <span className="sr-only">
                  {t("scoreAria", { goalsFor, goalsAgainst })}
                </span>
                <span
                  aria-hidden="true"
                  className="text-xs tabular-nums text-arena-text-sec"
                >
                  {t("score", { goalsFor, goalsAgainst })}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {result.top.length > 0 && (
        <section
          aria-labelledby="tournament-result-top-scorer"
          className="flex flex-col gap-1.5 rounded-[16px] border border-arena-border bg-arena-surface p-3"
        >
          <h2
            id="tournament-result-top-scorer"
            className="text-xs font-bold uppercase tracking-wide text-arena-text-muted"
          >
            {t("topScorer")}
          </h2>
          <ul className="flex flex-col gap-1.5">
            {result.top.map(([name, goals], index) => (
              <li
                key={scorerKeys[index]}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-semibold text-arena-text">{name}</span>
                <span className="font-sora font-extrabold tabular-nums text-arena-primary">
                  {t("goals", { count: goals })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/timer/tournament"
        className="btn-press mt-2 flex items-center justify-center rounded-[14px] bg-arena-primary py-3.5 font-extrabold text-arena-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-primary"
      >
        {t("createMine")}
      </Link>
    </main>
  );
}
