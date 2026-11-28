"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Link2,
  Link2Off,
  MapPin,
  Shield,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { unlinkMatchSession } from "@/actions/fixtures.actions";
import { Cta } from "@/components/arena/cta";
import { cn } from "@/lib/utils";
import {
  clubCalendarKeys,
  type FixtureDto,
  useCallup,
  useFixture,
  useInvalidateClub,
} from "../_hooks/use-club-calendar";
import { useClubMessages } from "../_hooks/use-club-messages";
import { clubErrorCode, unwrapClubResult } from "../_utils/club-action-error";
import { CLUB_CALENDAR_TIME_ZONE } from "../_utils/club-calendar-time";
import { useClub } from "./club-context";
import {
  CLUB_LINK_BUTTON_CLASS,
  ClubQueryProblem,
  ClubSkeletonRows,
} from "./club-ui";
import { ConfirmSheet } from "./confirm-sheet";
import { LinkCallupSheet } from "./link-callup-sheet";

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <Icon
        size={16}
        strokeWidth={1.8}
        className="shrink-0 text-arena-text-muted"
        aria-hidden="true"
      />
      <dt className="w-24 shrink-0 text-[11px] font-bold uppercase tracking-[0.5px] text-arena-text-muted">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 truncate text-sm font-semibold text-arena-text">
        {value}
      </dd>
    </div>
  );
}

function CallupPanel({ fixture }: { fixture: FixtureDto }) {
  const t = useTranslations("arenaClubCalendar.detail");
  const messages = useClubMessages();
  const format = useFormatter();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateClub();
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const callupQuery = useCallup(fixture.linkedMatchSessionId);
  // After linking or unlinking, the button that opened the sheet is gone;
  // move focus to the main action of the new state instead of losing it.
  const openCallupRef = useRef<HTMLAnchorElement | null>(null);
  const linkButtonRef = useRef<HTMLButtonElement | null>(null);
  const focusAfterChange = useRef(false);
  const linkedState = fixture.linkedMatchSessionId !== null;
  useEffect(() => {
    if (!focusAfterChange.current) return;
    focusAfterChange.current = false;
    (linkedState ? openCallupRef : linkButtonRef).current?.focus();
  }, [linkedState]);

  const unlink = useMutation({
    mutationFn: async () =>
      unwrapClubResult(await unlinkMatchSession({ fixtureId: fixture.id })),
    onSuccess: async updated => {
      focusAfterChange.current = true;
      queryClient.setQueryData(clubCalendarKeys.fixture(updated.id), updated);
      await invalidate(updated.clubId);
      setUnlinking(false);
    },
  });

  const linkedId = fixture.linkedMatchSessionId;
  const callup = callupQuery.data;

  return (
    <section aria-labelledby="fixture-callup-heading" className="jb-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3
          id="fixture-callup-heading"
          className="flex items-center gap-2 text-sm font-bold text-arena-text"
        >
          <Link2 size={15} strokeWidth={2} aria-hidden="true" />
          {t("callupTitle")}
        </h3>
      </div>

      {linkedId === null ? (
        <div className="flex flex-col gap-3">
          <p className="text-xs leading-5 text-arena-text-muted">
            {fixture.canManage ? t("notLinkedOwner") : t("notLinkedReadOnly")}
          </p>
          {fixture.canManage && (
            <Cta
              ref={linkButtonRef}
              size="md"
              className="btn-press self-start"
              onClick={() => setLinking(true)}
            >
              <Link2
                size={15}
                strokeWidth={2.2}
                className="mr-2"
                aria-hidden="true"
              />
              {t("linkCta")}
            </Cta>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {callupQuery.isLoading ? (
            <ClubSkeletonRows rows={1} />
          ) : (
            <div className="rounded-[12px] border border-arena-border bg-arena-surface-el px-3.5 py-3">
              <div className="truncate text-sm font-bold text-arena-text">
                {callup?.title ?? t("callupFallback", { id: linkedId })}
              </div>
              {callup && (
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-arena-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={12} aria-hidden="true" />
                    {format.dateTime(new Date(callup.startDate), {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} aria-hidden="true" />
                    {callup.location}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Link
              ref={openCallupRef}
              href={`/arena/events/${linkedId}`}
              className={cn(
                CLUB_LINK_BUTTON_CLASS,
                "h-11 rounded-[12px] bg-arena-primary px-4 text-sm md:h-10 text-arena-bg hover:bg-arena-primary/90",
              )}
            >
              <ExternalLink size={15} strokeWidth={2.2} aria-hidden="true" />
              {t("openCallup")}
            </Link>
            {fixture.canManage && (
              <Cta
                variant="secondary"
                size="md"
                className="btn-press md:h-10"
                onClick={() => setUnlinking(true)}
              >
                <Link2Off
                  size={15}
                  strokeWidth={2.2}
                  className="mr-2"
                  aria-hidden="true"
                />
                {t("unlinkCta")}
              </Cta>
            )}
          </div>
        </div>
      )}

      {linking && (
        <LinkCallupSheet
          fixture={fixture}
          onLinked={() => {
            focusAfterChange.current = true;
          }}
          onClose={() => setLinking(false)}
        />
      )}
      {unlinking && (
        <ConfirmSheet
          title={t("unlinkTitle")}
          description={t("unlinkDescription")}
          confirmLabel={t("unlinkConfirm")}
          pendingLabel={t("unlinkPending")}
          cancelLabel={t("cancel")}
          isPending={unlink.isPending}
          errorMessage={
            unlink.error ? messages.error(clubErrorCode(unlink.error)) : ""
          }
          onConfirm={() => unlink.mutate()}
          onClose={() => {
            unlink.reset();
            setUnlinking(false);
          }}
        />
      )}
    </section>
  );
}

export function FixtureDetail({ fixtureId }: { fixtureId: number | null }) {
  const t = useTranslations("arenaClubCalendar.detail");
  const format = useFormatter();
  const { club } = useClub();
  const query = useFixture(fixtureId);
  const calendarHref = `/arena/club/${club.id}`;
  // A fixture from another club is reported as not found, like the server does.
  const fixture = query.data?.clubId === club.id ? query.data : undefined;

  let body: React.ReactNode;
  if (fixtureId === null || (query.data && !fixture)) {
    body = (
      <ClubQueryProblem
        code="FIXTURE_NOT_FOUND"
        onRetry={() => undefined}
        backHref={calendarHref}
      />
    );
  } else if (query.isLoading) {
    body = <ClubSkeletonRows rows={3} />;
  } else if (!fixture) {
    body = (
      <ClubQueryProblem
        code={clubErrorCode(query.error)}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
        backHref={calendarHref}
      />
    );
  } else {
    const startsAt = new Date(fixture.startsAt);
    body = (
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)] md:items-start">
        <div className="flex flex-col gap-3">
          <div className="jb-hero-card">
            <div className="jb-kicker flex items-center gap-1.5 text-arena-primary">
              <Trophy size={12} strokeWidth={2} aria-hidden="true" />
              {fixture.competitionName}
            </div>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-extrabold leading-tight text-arena-text">
              {fixture.team.name}
              <span className="mx-2 text-base text-arena-text-muted">
                {t("vs")}
              </span>
              {fixture.opponent.name}
            </h2>
            <p className="mt-3 text-sm font-semibold text-arena-text-sec">
              {format.dateTime(startsAt, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: CLUB_CALENDAR_TIME_ZONE,
              })}
              {" · "}
              <span className="text-arena-text">
                {format.dateTime(startsAt, {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: CLUB_CALENDAR_TIME_ZONE,
                })}
              </span>
            </p>
          </div>
          <dl className="jb-card divide-y divide-arena-border">
            <DetailItem
              icon={Shield}
              label={t("team")}
              value={fixture.team.name}
            />
            <DetailItem
              icon={CalendarDays}
              label={t("season")}
              value={fixture.season.name}
            />
            <DetailItem
              icon={Trophy}
              label={t("competition")}
              value={fixture.competitionName}
            />
          </dl>
          <p className="px-1 text-[11px] text-arena-text-muted">
            {t("timeZoneNote", { zone: CLUB_CALENDAR_TIME_ZONE })}
          </p>
        </div>
        <CallupPanel fixture={fixture} />
      </div>
    );
  }

  return (
    <section aria-label={t("label")} className="flex flex-col gap-4">
      <Link
        href={calendarHref}
        className={cn(
          CLUB_LINK_BUTTON_CLASS,
          "h-11 self-start rounded-[10px] px-2 text-xs md:h-9 text-arena-text-sec hover:text-arena-text",
        )}
      >
        <ArrowLeft size={15} aria-hidden="true" />
        {t("backToCalendar")}
      </Link>
      {body}
    </section>
  );
}
