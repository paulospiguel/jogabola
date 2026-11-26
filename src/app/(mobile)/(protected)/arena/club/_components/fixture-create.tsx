"use client";

import { ArrowLeft, ListChecks, Lock } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArenaEmptyState } from "@/components/arena/empty-state";
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

const SECONDARY_LINK = cn(
  CLUB_LINK_BUTTON_CLASS,
  "h-9 rounded-[10px] border border-arena-border bg-arena-surface px-4 text-xs text-arena-text-sec hover:bg-arena-surface-el",
);

/** "Novo jogo": checks presentation-level prerequisites, then shows the form. */
export function FixtureCreate() {
  const t = useTranslations("arenaClubCalendar.create");
  const { club, isAdmin, canCreateFixtures } = useClub();
  const seasonsQuery = useClubSeasons(club.id);
  const opponentsQuery = useClubOpponents(club.id);
  const fixturesQuery = useClubFixtures(club.id);
  const calendarHref = `/arena/club/${club.id}`;

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
  } else if (!seasonsQuery.data?.length || !opponentsQuery.data?.length) {
    body = (
      <ArenaEmptyState
        icon={ListChecks}
        title={t("missingSetupTitle")}
        description={isAdmin ? t("missingSetupAdmin") : t("missingSetupMember")}
        action={
          isAdmin ? (
            <Link
              href={`/arena/club/${club.id}/settings`}
              className={cn(
                CLUB_LINK_BUTTON_CLASS,
                "h-9 rounded-[10px] bg-arena-primary px-4 text-xs text-arena-bg hover:bg-arena-primary/90",
              )}
            >
              {t("goToSettings")}
            </Link>
          ) : (
            <Link href={calendarHref} className={SECONDARY_LINK}>
              {t("backToCalendar")}
            </Link>
          )
        }
      />
    );
  } else {
    body = (
      <FixtureForm
        seasons={seasonsQuery.data}
        opponents={opponentsQuery.data}
        fixtures={fixturesQuery.data ?? []}
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
            "size-9 rounded-[10px] border border-arena-border bg-arena-surface text-arena-text-sec hover:bg-arena-surface-el",
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
    </section>
  );
}
