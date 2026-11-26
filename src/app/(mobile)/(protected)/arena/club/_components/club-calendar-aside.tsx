"use client";

import { Clock, Link2, Trophy } from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import type { FixtureDto } from "../_hooks/use-club-calendar";
import { CLUB_CALENDAR_TIME_ZONE } from "../_utils/club-calendar-time";
import { useClub } from "./club-context";

interface ClubCalendarAsideProps {
  upcoming: FixtureDto[];
  totalCount: number;
  isLoading: boolean;
}

/** Desktop side panel: next fixture, quick numbers and calendar context. */
export function ClubCalendarAside({
  upcoming,
  totalCount,
  isLoading,
}: ClubCalendarAsideProps) {
  const t = useTranslations("arenaClubCalendar.aside");
  const format = useFormatter();
  const { club } = useClub();
  const next = upcoming[0];
  const linkedUpcoming = upcoming.filter(
    f => f.linkedMatchSessionId !== null,
  ).length;

  const stats = [
    { label: t("upcoming"), value: upcoming.length },
    { label: t("linked"), value: linkedUpcoming },
    { label: t("total"), value: totalCount },
  ];

  return (
    <aside
      aria-label={t("label")}
      className="flex flex-col gap-3 md:sticky md:top-6"
    >
      {isLoading ? (
        <div className="jb-skeleton hidden h-[132px] rounded-[18px] md:block" />
      ) : next ? (
        <Link
          href={`/arena/club/${club.id}/fixtures/${next.id}`}
          className="btn-press jb-hero-card hidden transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-primary md:block"
        >
          <div className="jb-kicker flex items-center gap-1.5">
            <Trophy size={12} strokeWidth={2} aria-hidden="true" />
            {t("nextFixture")}
          </div>
          <div className="mt-2 font-[family-name:var(--font-sora)] text-lg font-extrabold leading-tight text-arena-text">
            {next.team.name}
            <span className="mx-1.5 text-arena-text-muted">{t("vs")}</span>
            {next.opponent.name}
          </div>
          <div className="mt-1 text-xs font-semibold text-arena-primary">
            {next.competitionName}
          </div>
          <div className="mt-3 text-[13px] font-semibold text-arena-text-sec">
            {format.dateTime(new Date(next.startsAt), {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: CLUB_CALENDAR_TIME_ZONE,
            })}
          </div>
        </Link>
      ) : null}

      <dl className="jb-stat-grid">
        {stats.map(stat => (
          <div key={stat.label} className="jb-card px-3 py-2.5">
            <dt className="text-[10px] font-bold uppercase tracking-[0.5px] text-arena-text-muted">
              {stat.label}
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-sora)] text-xl font-extrabold text-arena-text">
              {isLoading ? "–" : stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="jb-card flex flex-col gap-2 px-3.5 py-3 text-[11px] text-arena-text-muted">
        <p className="flex items-center gap-2">
          <Clock size={13} strokeWidth={2} aria-hidden="true" />
          {t("timeZone", { zone: CLUB_CALENDAR_TIME_ZONE })}
        </p>
        <p className="flex items-center gap-2">
          <Link2 size={13} strokeWidth={2} aria-hidden="true" />
          {t("linkHint")}
        </p>
      </div>
    </aside>
  );
}
