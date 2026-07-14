"use client";

import { useTranslations } from "next-intl";
import { computeStandings } from "./standings";
import type { Tournament } from "./types";

interface StandingsTableProps {
  tournament: Tournament;
}

export function StandingsTable({ tournament }: StandingsTableProps) {
  const t = useTranslations("Tournament.view.standings");
  const teams = new Map(tournament.teams.map(team => [team.id, team]));
  const standings = computeStandings(tournament);

  return (
    <section aria-labelledby="standings-title">
      <h2
        id="standings-title"
        className="mb-2 text-xs font-bold uppercase tracking-wide text-arena-text-muted"
      >
        {t("title")}
      </h2>
      <div className="overflow-hidden rounded-[14px] border border-arena-border bg-arena-surface">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-arena-surface-el text-[10px] font-bold uppercase tracking-wide text-arena-text-muted">
            <tr>
              <th className="w-auto px-3 py-2.5 text-left">{t("team")}</th>
              <th className="w-12 px-1 py-2.5 text-center">{t("played")}</th>
              <th className="w-12 px-1 py-2.5 text-center">
                {t("goalDifference")}
              </th>
              <th className="w-12 px-3 py-2.5 text-right">{t("points")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-arena-border">
            {standings.map((standing, index) => {
              const team = teams.get(standing.teamId);
              if (!team) return null;

              return (
                <tr key={standing.teamId}>
                  <td className="px-3 py-3">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="w-4 shrink-0 text-center text-xs font-bold text-arena-text-muted">
                        {index + 1}
                      </span>
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: team.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-semibold text-arena-text">
                        {team.name}
                      </span>
                    </span>
                  </td>
                  <td className="px-1 py-3 text-center text-arena-text-sec">
                    {standing.played}
                  </td>
                  <td className="px-1 py-3 text-center text-arena-text-sec">
                    {standing.gd > 0 ? `+${standing.gd}` : standing.gd}
                  </td>
                  <td className="px-3 py-3 text-right font-extrabold text-arena-primary">
                    {standing.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
