"use client";

import { ArrowLeft, CalendarRange, ListChecks, Lock } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Cta } from "@/components/arena/cta";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { currentFootballSeason } from "@/lib/club-season";
import { cn } from "@/lib/utils";
import {
  useClubFixtures,
  useClubOpponents,
  useClubSeasons,
} from "../_hooks/use-club-calendar";
import { clubErrorCode } from "../_utils/club-action-error";
import { useClub } from "./club-context";
import {
  CLUB_LINK_BUTTON_CLASS,
  ClubQueryProblem,
  ClubSkeletonRows,
} from "./club-ui";
import { FixtureForm } from "./fixture-form";
import { SeasonFormSheet } from "./season-form-sheet";

const SECONDARY_LINK = cn(
  CLUB_LINK_BUTTON_CLASS,
  "h-11 rounded-[10px] border border-arena-border md:h-9 bg-arena-surface px-4 text-xs text-arena-text-sec hover:bg-arena-surface-el",
);

/** "Novo jogo": checks presentation-level prerequisites, then shows the form. */
export function FixtureCreate() {
  const t = useTranslations("arenaClubCalendar.create");
  const { club, isAdmin, canCreateFixtures } = useClub();
  const seasonsQuery = useClubSeasons(club.id);
  const opponentsQuery = useClubOpponents(club.id);
  const fixturesQuery = useClubFixtures(club.id);
  const calendarHref = `/arena/club/${club.id}`;
  const [creatingSeason, setCreatingSeason] = useState(false);
  const hasSeasons = Boolean(seasonsQuery.data?.length);
  const hasOpponents = Boolean(opponentsQuery.data?.length);

  let body: React.ReactNode;
  if (!canCreateFixtures) {
    body = (
      <ArenaEmptyState
        icon={Lock}
        title={t("forbiddenTitle")}
        description={t("forbiddenDescription")}
        action={
          <Link href={calendarHref} className={SECONDARY_LINK}>
            {t("backToCalendar")}
          </Link>
        }
      />
    );
  } else if (seasonsQuery.isLoading || opponentsQuery.isLoading) {
    body = <ClubSkeletonRows rows={5} />;
  } else if (seasonsQuery.error || opponentsQuery.error) {
    body = (
      <ClubQueryProblem
        code={clubErrorCode(seasonsQuery.error ?? opponentsQuery.error)}
        onRetry={() => {
          void seasonsQuery.refetch();
          void opponentsQuery.refetch();
        }}
        isRetrying={seasonsQuery.isFetching || opponentsQuery.isFetching}
        backHref={calendarHref}
      />
    );
  } else if (isAdmin && !hasSeasons) {
    // Clubs open their first season on creation; this covers a club whose
    // seasons were all removed. The fix is one tap away, never a dead end.
    body = (
      <ArenaEmptyState
        icon={CalendarRange}
        title={t("missingSeasonTitle")}
        description={t("missingSeasonAdmin")}
        action={
          <Cta
            size="md"
            className="btn-press"
            onClick={() => setCreatingSeason(true)}
          >
            {t("createSeasonCta")}
          </Cta>
        }
      />
    );
  } else if (!isAdmin && (!hasSeasons || !hasOpponents)) {
    body = (
      <ArenaEmptyState
        icon={ListChecks}
        title={t("missingSetupTitle")}
        description={t("missingSetupMember")}
        action={
          <Link href={calendarHref} className={SECONDARY_LINK}>
            {t("backToCalendar")}
          </Link>
        }
      />
    );
  } else {
    body = (
      <FixtureForm
        seasons={seasonsQuery.data ?? []}
        opponents={opponentsQuery.data ?? []}
        fixtures={fixturesQuery.data ?? []}
        canCreateOpponent={isAdmin}
      />
    );
  }

  return (
    <section
      aria-labelledby="fixture-create-heading"
      className="mx-auto max-w-3xl"
    >
      <div className="mb-4 flex items-center gap-2">
        <Link
          href={calendarHref}
          aria-label={t("backToCalendar")}
          className={cn(
            CLUB_LINK_BUTTON_CLASS,
            "size-11 shrink-0 rounded-[10px] border md:size-9 border-arena-border bg-arena-surface text-arena-text-sec hover:bg-arena-surface-el",
          )}
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </Link>
        <h2
          id="fixture-create-heading"
          className="text-lg font-extrabold text-arena-text"
        >
          {t("title")}
        </h2>
      </div>
      {body}
      {creatingSeason && (
        <SeasonFormSheet
          clubId={club.id}
          season={null}
          defaults={currentFootballSeason()}
          onClose={() => setCreatingSeason(false)}
        />
      )}
    </section>
  );
}
