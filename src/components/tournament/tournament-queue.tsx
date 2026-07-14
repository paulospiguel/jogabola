"use client";

import { ListOrdered } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Tournament } from "./types";

interface TournamentQueueProps {
  tournament: Tournament;
}

export function TournamentQueue({ tournament }: TournamentQueueProps) {
  const t = useTranslations("Tournament.view");
  const teams = new Map(tournament.teams.map(team => [team.id, team]));

  return (
    <section aria-labelledby="queue-title">
      <h2
        id="queue-title"
        className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-arena-text-muted"
      >
        <ListOrdered size={16} aria-hidden="true" /> {t("queue")}
      </h2>
      <ol className="flex flex-wrap gap-2 rounded-[14px] border border-arena-border bg-arena-surface p-3">
        {tournament.queue.map((teamId, index) => {
          const team = teams.get(teamId);
          if (!team) return null;

          return (
            <li
              key={team.id}
              className="flex min-w-0 items-center gap-2 rounded-xl bg-arena-surface-el px-3 py-2"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-arena-surface-el text-xs font-bold text-arena-text-muted">
                {index + 1}
              </span>
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: team.color }}
                aria-hidden="true"
              />
              <span className="max-w-36 truncate text-sm font-semibold text-arena-text">
                {team.name}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
