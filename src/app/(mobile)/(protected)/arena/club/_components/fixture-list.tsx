"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Link2 } from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import type { FixtureDto } from "../_hooks/use-club-calendar";
import {
  CLUB_CALENDAR_TIME_ZONE,
  dateKeyToNoonUtc,
} from "../_utils/club-calendar-time";
import { groupFixturesByDay } from "../_utils/club-calendar-view";
import { CLUB_STAGGER } from "./club-ui";

export function LinkedCallupBadge() {
  const t = useTranslations("arenaClubCalendar.fixture");
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-[4px] border border-arena-info/35 bg-arena-info/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.5px] text-arena-info">
      <Link2 size={10} strokeWidth={2.4} aria-hidden="true" />
      {t("linkedBadge")}
    </span>
  );
}

function FixtureRow({
  fixture,
  clubId,
}: {
  fixture: FixtureDto;
  clubId: number;
}) {
  const t = useTranslations("arenaClubCalendar.fixture");
  const format = useFormatter();
  const time = format.dateTime(new Date(fixture.startsAt), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CLUB_CALENDAR_TIME_ZONE,
  });

  return (
    <Link
      href={`/arena/club/${clubId}/fixtures/${fixture.id}`}
      className="btn-press jb-card jb-list-row group min-w-0 transition-[transform,background-color,border-color] duration-150 hover:border-arena-primary/45 hover:bg-arena-surface-el active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-primary"
      aria-label={t("rowLabel", {
        team: fixture.team.name,
        opponent: fixture.opponent.name,
        competition: fixture.competitionName,
        hour: time,
      })}
    >
      <span className="flex w-14 shrink-0 flex-col items-center justify-center rounded-[10px] border border-arena-border bg-arena-surface-el py-2 font-[family-name:var(--font-sora)] text-[15px] font-extrabold text-arena-text">
        {time}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.6px] text-arena-primary">
            {fixture.competitionName}
          </span>
          {fixture.linkedMatchSessionId !== null && <LinkedCallupBadge />}
        </span>
        <span className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-arena-text">
          {t("versus", {
            team: fixture.team.name,
            opponent: fixture.opponent.name,
          })}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-arena-text-muted">
          {fixture.season.name}
        </span>
      </span>
      <ChevronRight
        size={16}
        className="shrink-0 text-arena-text-muted transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

interface FixtureListProps {
  fixtures: FixtureDto[];
  clubId: number;
}

/** Fixtures grouped by calendar day in the club calendar's time zone. */
export function FixtureList({ fixtures, clubId }: FixtureListProps) {
  const format = useFormatter();
  const reduceMotion = useReducedMotion();
  const groups = groupFixturesByDay(fixtures, CLUB_CALENDAR_TIME_ZONE);

  return (
    <motion.ol
      className="flex flex-col gap-4"
      variants={CLUB_STAGGER.container}
      initial={reduceMotion ? false : "initial"}
      animate="animate"
    >
      {groups.map(group => (
        <motion.li
          key={group.dayKey}
          variants={CLUB_STAGGER.item}
          className="min-w-0"
        >
          <h3 className="jb-section-label pt-0">
            {format.dateTime(dateKeyToNoonUtc(group.dayKey), {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </h3>
          <ul className="jb-stack">
            {group.fixtures.map(fixture => (
              <li key={fixture.id} className="min-w-0">
                <FixtureRow fixture={fixture} clubId={clubId} />
              </li>
            ))}
          </ul>
        </motion.li>
      ))}
    </motion.ol>
  );
}
