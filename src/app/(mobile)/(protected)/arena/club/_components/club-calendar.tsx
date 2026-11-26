"use client";

import { CalendarPlus, CalendarX2, Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { SegmentedControl } from "@/components/arena/segmented-control";
import { cn } from "@/lib/utils";
import { useClubFixtures, useClubSeasons } from "../_hooks/use-club-calendar";
import { clubErrorCode } from "../_utils/club-action-error";
import {
  type FixtureScope,
  filterFixtures,
  partitionFixtures,
  teamsInFixtures,
} from "../_utils/club-calendar-view";
import { ClubCalendarAside } from "./club-calendar-aside";
import { useClub } from "./club-context";
import {
  CLUB_LINK_BUTTON_CLASS,
  ClubQueryProblem,
  ClubSkeletonRows,
} from "./club-ui";
import { FixtureList } from "./fixture-list";

interface ChipOption {
  id: number | null;
  label: string;
}

function FilterChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ChipOption[];
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <fieldset aria-label={label} className="jb-toolbar min-w-0">
      {options.map(option => {
        const active = option.id === value;
        return (
          <button
            key={option.id ?? "all"}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "jb-chip btn-press min-h-11 transition md:min-h-9-transform active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-arena-primary",
              active && "jb-chip-active",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}

export function ClubCalendar() {
  const t = useTranslations("arenaClubCalendar.calendar");
  const { club, canCreateFixtures } = useClub();
  const fixturesQuery = useClubFixtures(club.id);
  const seasonsQuery = useClubSeasons(club.id);
  const [scope, setScope] = useState<FixtureScope>("upcoming");
  const [seasonId, setSeasonId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  // Captured once per mount so the partition stays stable across renders.
  const [now] = useState(() => new Date());

  const allFixtures = fixturesQuery.data ?? [];
  const { upcoming, past } = partitionFixtures(allFixtures, now);
  const visible = filterFixtures(scope === "upcoming" ? upcoming : past, {
    seasonId,
    teamId,
  });
  const teams = teamsInFixtures(allFixtures);
  const seasons = seasonsQuery.data ?? [];
  const hasFilters = seasonId !== null || teamId !== null;
  const newFixtureHref = `/arena/club/${club.id}/fixtures/new`;

  const createAction = canCreateFixtures ? (
    <Link
      href={newFixtureHref}
      className={cn(
        CLUB_LINK_BUTTON_CLASS,
        "h-11 rounded-[10px] bg-arena-primary px-4 md:h-9 text-xs text-arena-bg hover:bg-arena-primary/90",
      )}
    >
      <CalendarPlus size={14} strokeWidth={2.2} aria-hidden="true" />
      {t("newFixture")}
    </Link>
  ) : undefined;

  let content: React.ReactNode;
  if (fixturesQuery.isLoading) {
    content = <ClubSkeletonRows rows={4} />;
  } else if (fixturesQuery.error && !fixturesQuery.data) {
    content = (
      <ClubQueryProblem
        code={clubErrorCode(fixturesQuery.error)}
        onRetry={() => void fixturesQuery.refetch()}
        isRetrying={fixturesQuery.isFetching}
      />
    );
  } else if (allFixtures.length === 0) {
    content = (
      <ArenaEmptyState
        icon={CalendarX2}
        title={t("emptyTitle")}
        description={
          canCreateFixtures ? t("emptyDescription") : t("emptyReadOnly")
        }
        action={createAction}
        className="py-10"
      />
    );
  } else if (visible.length === 0) {
    content = (
      <ArenaEmptyState
        icon={CalendarX2}
        title={t(scope === "upcoming" ? "noUpcomingTitle" : "noPastTitle")}
        description={hasFilters ? t("noFilteredDescription") : undefined}
        action={
          hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setSeasonId(null);
                setTeamId(null);
              }}
              className={cn(
                CLUB_LINK_BUTTON_CLASS,
                "h-11 rounded-[10px] border border-arena-border md:h-9 bg-arena-surface px-4 text-xs text-arena-text-sec hover:bg-arena-surface-el",
              )}
            >
              {t("clearFilters")}
            </button>
          ) : (
            createAction
          )
        }
      />
    );
  } else {
    content = <FixtureList fixtures={visible} clubId={club.id} />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_300px] md:items-start lg:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-labelledby="club-calendar-heading" className="min-w-0">
        <h2 id="club-calendar-heading" className="sr-only">
          {t("heading")}
        </h2>
        <div className="mb-3 flex flex-col gap-2.5">
          <SegmentedControl
            buttonClassName="h-11 md:h-9"
            ariaLabel={t("scopeLabel")}
            value={scope}
            onChange={setScope}
            options={[
              {
                id: "upcoming",
                label: t("upcoming", { count: upcoming.length }),
              },
              { id: "past", label: t("past", { count: past.length }) },
            ]}
            className="self-start"
          />
          {seasons.length > 1 && (
            <FilterChips
              label={t("seasonFilter")}
              value={seasonId}
              onChange={setSeasonId}
              options={[
                { id: null, label: t("allSeasons") },
                ...seasons.map(s => ({ id: s.id, label: s.name })),
              ]}
            />
          )}
          {teams.length > 1 && (
            <FilterChips
              label={t("teamFilter")}
              value={teamId}
              onChange={setTeamId}
              options={[
                { id: null, label: t("allTeams") },
                ...teams.map(team => ({ id: team.id, label: team.name })),
              ]}
            />
          )}
        </div>
        <div aria-live="polite" aria-busy={fixturesQuery.isFetching}>
          {content}
        </div>
      </section>

      <ClubCalendarAside
        upcoming={upcoming}
        totalCount={allFixtures.length}
        isLoading={fixturesQuery.isLoading}
      />

      {canCreateFixtures && (
        <Link
          href={newFixtureHref}
          aria-label={t("newFixture")}
          className={cn(
            CLUB_LINK_BUTTON_CLASS,
            "fixed right-5 bottom-[96px] z-30 size-14 rounded-full bg-arena-primary text-arena-bg shadow-[0_0_32px_rgba(124,255,79,0.25)] md:hidden",
          )}
        >
          <Plus size={22} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
