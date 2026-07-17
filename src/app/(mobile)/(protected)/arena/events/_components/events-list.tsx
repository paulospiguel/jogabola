"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { JbAvatar } from "@/components/arena/avatar";
import { CreateEventSheet } from "@/components/arena/create-event-sheet";
import { Cta } from "@/components/arena/cta";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import {
  ArenaQueryError,
  deriveQueryViewState,
} from "@/components/arena/query-state";
import { Button } from "@/components/ui/button";
import { useEventAttendance } from "@/hooks/use-event-attendance";
import { useEvents } from "@/hooks/use-events";
import { useTeams } from "@/hooks/use-teams";
import { cn } from "@/lib/utils";
import type { EventStatus, EventView } from "@/types/events";
import { partitionEventsByDate } from "../_utils/events-view";

interface EventsListProps {
  upcoming: EventView[];
  past: EventView[];
}

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> =
  {
    scheduled: {
      label: "status.scheduled",
      className: "text-arena-info bg-arena-info/10 border-arena-info/25",
    },
    confirmed: {
      label: "status.confirmed",
      className:
        "text-arena-success bg-arena-success/10 border-arena-success/25",
    },
    cancelled: {
      label: "status.cancelled",
      className: "text-arena-danger bg-arena-danger/10 border-arena-danger/25",
    },
  };

function EventStatusBadge({ status }: { status: EventStatus }) {
  const t = useTranslations("arenaEvents");
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg border px-2 py-[3px] text-[10px] font-bold uppercase leading-none tracking-[0.4px]",
        cfg.className,
      )}
    >
      {t(cfg.label)}
    </span>
  );
}

function isGameEvent(event: EventView) {
  return (
    event.type === "match" ||
    event.type === "game" ||
    event.type === "partida" ||
    event.title.toLowerCase().includes("vs")
  );
}

function useEventDateParts(event: EventView | null) {
  const locale = useLocale();
  return useMemo(() => {
    if (!event) return { date: "", time: "" };
    const d = new Date(event.startDate);
    return {
      date: d.toLocaleDateString(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      time: `${String(d.getHours()).padStart(2, "0")}h${String(
        d.getMinutes(),
      ).padStart(2, "0")}`,
    };
  }, [event, locale]);
}

function formatRowDateTime(event: EventView, locale: string) {
  const d = new Date(event.startDate);
  const date = d.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = `${String(d.getHours()).padStart(2, "0")}h${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
  return `${date} · ${time}`;
}

function EventRowItem({ event }: { event: EventView }) {
  const locale = useLocale();
  const game = isGameEvent(event);
  return (
    <Link className="jb-card jb-list-row" href={`/arena/events/${event.id}`}>
      <span
        className={cn(
          "jb-icon-tile",
          game ? "bg-arena-primary/[0.08]" : "bg-arena-info/[0.08]",
        )}
      >
        {game ? (
          <Trophy size={20} className="text-arena-primary" />
        ) : (
          <Calendar size={20} className="text-arena-info" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-arena-text">
          {event.title}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-arena-text-muted">
          {formatRowDateTime(event, locale)}
        </span>
      </span>
      <EventStatusBadge status={event.status} />
    </Link>
  );
}

function HeroCard({
  event,
  position,
  total,
  onPrev,
  onNext,
}: {
  event: EventView;
  position: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("arenaEvents");
  const { date, time } = useEventDateParts(event);
  const { confirmed } = useEventAttendance(event.id);
  const hasMultiple = total > 1;

  return (
    <div className="jb-hero-card jb-hero-card--live relative overflow-hidden">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-[26px] place-items-center rounded-[7px] bg-arena-primary/[0.13]">
            <Zap size={13} className="text-arena-primary" strokeWidth={2} />
          </span>
          <span className="jb-kicker text-arena-primary">
            {t("hero.nextMatch")}
          </span>
          <span
            className="size-[5px] rounded-full bg-arena-primary"
            style={{ animation: "jb-pulse 2s infinite" }}
          />
        </div>
        <div className="flex items-center gap-2">
          {hasMultiple && (
            <span className="rounded-lg border border-arena-border bg-arena-bg/35 px-2 py-[5px] text-[10px] font-bold text-arena-text-muted">
              {position}/{total}
            </span>
          )}
          <EventStatusBadge status={event.status} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasMultiple && (
          <button
            aria-label={t("hero.prevEvent")}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-arena-border bg-arena-bg/45 text-arena-text-sec transition-colors hover:border-arena-primary/35 hover:text-arena-primary"
            onClick={onPrev}
            type="button"
          >
            <ChevronLeft size={17} strokeWidth={2.5} />
          </button>
        )}

        <Link
          className="min-w-0 flex-1 text-inherit no-underline"
          href={`/arena/events/${event.id}`}
        >
          <h2 className="mb-3 truncate text-base font-bold leading-tight text-arena-text md:text-xl">
            {event.title}
          </h2>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {[
              { Icon: Calendar, label: date },
              { Icon: Clock, label: time },
              { Icon: MapPin, label: event.location },
            ]
              .filter(item => Boolean(item.label))
              .map(({ Icon, label }) => (
                <span className="flex items-center gap-1.5" key={label}>
                  <Icon size={12} className="text-arena-text-muted" />
                  <span className="text-xs text-arena-text-sec">{label}</span>
                </span>
              ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex -space-x-1">
              {confirmed.slice(0, 5).map(p => (
                <JbAvatar
                  className="ring-2 ring-[#1B2430]"
                  id={p.id}
                  key={p.id}
                  name={p.name}
                  size={28}
                />
              ))}
              {confirmed.length > 5 && (
                <span className="grid size-7 place-items-center rounded-full border border-arena-border bg-arena-surface-el text-[10px] font-bold text-arena-text-muted ring-2 ring-[#1B2430]">
                  +{confirmed.length - 5}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold text-arena-primary">
              {t("hero.view")}
              <ChevronRight size={14} />
            </span>
          </div>
        </Link>

        {hasMultiple && (
          <button
            aria-label={t("hero.nextEvent")}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-arena-border bg-arena-bg/45 text-arena-text-sec transition-colors hover:border-arena-primary/35 hover:text-arena-primary"
            onClick={onNext}
            type="button"
          >
            <ChevronRight size={17} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

function HeroStats({ eventId }: { eventId: number }) {
  const t = useTranslations("arenaEvents");
  const { confirmed, reserves, pending, isLoading } =
    useEventAttendance(eventId);

  const stats = [
    {
      l: t("stats.confirmed"),
      v: isLoading ? "…" : confirmed.length,
      cls: "text-arena-success",
    },
    {
      l: t("stats.reserves"),
      v: isLoading ? "…" : reserves.length,
      cls: "text-arena-warning",
    },
    {
      l: t("stats.pending"),
      v: isLoading ? "…" : pending.length,
      cls: "text-arena-text-muted",
    },
  ] as const;

  return (
    <div className="jb-stat-grid">
      {stats.map(s => (
        <div className="jb-card px-2 py-3 text-center" key={s.l}>
          <div className={`text-[22px] font-extrabold ${s.cls}`}>{s.v}</div>
          <div className="mt-0.5 text-[10px] font-semibold text-arena-text-muted">
            {s.l}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Structural loading placeholder for the events list's initial fetch.
 * Mirrors `DashboardSkeleton`'s `animate-pulse` + `bg-arena-surface-el`
 * convention (established in Task 3) rather than the unused `.jb-skeleton`
 * CSS shimmer, so both skeletons in the app read as one visual language.
 */
function EventsListSkeleton() {
  return (
    <div className="jb-dashboard-grid" aria-hidden="true">
      <section className="jb-stack min-w-0">
        <div className="h-3 w-28 animate-pulse rounded-full bg-arena-surface-el" />
        <div className="jb-hero-card">
          <div className="mb-3 h-4 w-24 animate-pulse rounded-full bg-arena-surface-el" />
          <div className="mb-3 h-5 w-2/3 animate-pulse rounded-lg bg-arena-surface-el" />
          <div className="flex flex-wrap gap-3">
            <div className="h-3 w-16 animate-pulse rounded-full bg-arena-surface-el" />
            <div className="h-3 w-16 animate-pulse rounded-full bg-arena-surface-el" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-arena-surface-el" />
          </div>
        </div>
        <div className="jb-stat-grid">
          {[0, 1, 2].map(i => (
            <div
              className="jb-card h-16 animate-pulse"
              key={`hero-stat-${i}`}
            />
          ))}
        </div>
      </section>

      <aside className="jb-stack min-w-0">
        <section>
          <div className="mb-2 h-3 w-24 animate-pulse rounded-full bg-arena-surface-el" />
          <div className="jb-stack">
            {[0, 1].map(i => (
              <div
                className="jb-card h-14 animate-pulse"
                key={`week-row-${i}`}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 h-3 w-16 animate-pulse rounded-full bg-arena-surface-el" />
          <div className="jb-stack">
            {[0, 1, 2].map(i => (
              <div
                className="jb-card h-14 animate-pulse"
                key={`past-row-${i}`}
              />
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

export function EventsList({ upcoming, past }: EventsListProps) {
  const t = useTranslations("arenaEvents");
  const [sheet, setSheet] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const queryClient = useQueryClient();
  const { activeTeamId, activeTeamCanManage } = useTeams();
  const {
    events,
    isLoading: eventsLoading,
    isRefetching: eventsRefetching,
    error: eventsError,
    refetch: refetchEvents,
  } = useEvents({
    upcomingOnly: false,
    limit: 50,
    enabled: Boolean(activeTeamId),
  });

  // Server-rendered snapshot (from the page's initial fetch). Used only
  // while the client-scoped query hasn't settled yet — either there's no
  // active team, or its first fetch is still in flight — so switching to
  // the client query never flashes the list to blank. Once the query
  // settles (`!eventsLoading`), `events` is trusted as-is, including a
  // genuinely empty array: that's the real "this team has zero events"
  // answer, and must not keep showing stale fallback content forever.
  const fallbackEvents = useMemo(
    () => [...upcoming, ...past],
    [upcoming, past],
  );
  const hasSettledQueryData = Boolean(activeTeamId) && !eventsLoading;
  const sourceEvents = hasSettledQueryData ? events : fallbackEvents;

  const hasContent = sourceEvents.length > 0;
  const eventsViewState = deriveQueryViewState({
    hasData: hasContent,
    isInitialLoading:
      Boolean(activeTeamId) && eventsLoading && fallbackEvents.length === 0,
    isFetching: Boolean(activeTeamId) && (eventsLoading || eventsRefetching),
    error: activeTeamId ? eventsError : null,
  });

  const { upcoming: visibleUpcoming, past: visiblePast } = useMemo(
    () => partitionEventsByDate(sourceEvents, new Date()),
    [sourceEvents],
  );

  const safeIndex = visibleUpcoming[activeIndex] ? activeIndex : 0;
  const featured = visibleUpcoming[safeIndex] ?? null;
  const weekEvents = visibleUpcoming.filter((_, i) => i !== safeIndex);
  const total = visibleUpcoming.length;

  const goTo = (direction: -1 | 1) => {
    if (total <= 1) return;
    setActiveIndex(current => {
      const next = current + direction;
      if (next < 0) return total - 1;
      if (next >= total) return 0;
      return next;
    });
  };

  return (
    <>
      {sheet ? (
        <CreateEventSheet
          onClose={() => setSheet(false)}
          onCreated={() => {
            void queryClient.invalidateQueries({ queryKey: ["events"] });
          }}
          teamId={activeTeamId ?? undefined}
        />
      ) : null}

      <motion.div
        className="jb-page"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="jb-page-inner">
          <header className="mb-4 flex w-full shrink-0 items-center justify-between">
            <div>
              <div className="jb-kicker">{t("kicker")}</div>
              <h1 className="jb-title">{t("title")}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/arena/calendar"
                className="press flex size-11 items-center justify-center rounded-xl border border-arena-border bg-arena-bg-sec text-arena-text-sec transition-all hover:bg-arena-surface-el"
                aria-label={t("actions.viewCalendar")}
              >
                <Calendar size={18} strokeWidth={2} />
              </Link>
              {activeTeamCanManage && (
                <Button
                  onClick={() => setSheet(true)}
                  className="press hidden h-11 items-center gap-1.5 rounded-xl bg-arena-primary px-4 text-xs font-black text-[#0B0F14] shadow-[0_0_24px_rgba(124,255,79,0.18)] transition-all hover:bg-arena-primary/95 md:flex"
                >
                  <Plus size={13} strokeWidth={3} />
                  <span>{t("actions.create")}</span>
                </Button>
              )}
            </div>
          </header>

          {eventsViewState.status === "loading" ? (
            <EventsListSkeleton />
          ) : eventsViewState.status === "error" ? (
            <ArenaQueryError
              title={t("empty.errorTitle")}
              description={t("empty.errorDescription")}
              retryLabel={t("actions.retry")}
              onRetry={() => void refetchEvents()}
              isRetrying={eventsRefetching}
            />
          ) : (
            <div className="jb-dashboard-grid min-w-0">
              <section className="jb-stack min-w-0 w-full">
                <div className="jb-section-label">
                  {t("sections.upcomingEvents")}
                </div>

                {featured ? (
                  <>
                    <HeroCard
                      event={featured}
                      position={safeIndex + 1}
                      total={total}
                      onPrev={() => goTo(-1)}
                      onNext={() => goTo(1)}
                    />
                    <HeroStats eventId={featured.id} />
                  </>
                ) : (
                  <ArenaEmptyState
                    icon={Calendar}
                    title={t("empty.title")}
                    description={
                      activeTeamCanManage
                        ? t("empty.subtitle")
                        : t("hero.noEventsMemberDescription")
                    }
                    action={
                      activeTeamCanManage ? (
                        <Cta
                          variant="primary"
                          size="sm"
                          onClick={() => setSheet(true)}
                        >
                          <Plus size={14} />
                          {t("actions.createEvent")}
                        </Cta>
                      ) : (
                        <Link href="/arena/calendar" className="jb-action">
                          <Calendar size={14} />
                          {t("actions.viewCalendar")}
                        </Link>
                      )
                    }
                  />
                )}

                {activeTeamCanManage && (
                  <Cta
                    variant="primary"
                    size="md"
                    fullWidth
                    className="md:hidden"
                    onClick={() => setSheet(true)}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    {t("actions.createEvent")}
                  </Cta>
                )}
              </section>

              {/* "Esta semana" and "Anteriores" always render, independently
                  of whether "Próximos" has an active/featured event — an
                  empty upcoming section must never hide the team's history. */}
              <aside className="jb-stack min-w-0 w-full">
                <section>
                  <div className="jb-section-label">
                    {t("sections.thisWeek")}
                  </div>
                  <div className="jb-stack">
                    {weekEvents.length > 0 ? (
                      weekEvents.map((event, i) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.18,
                            delay: i * 0.03,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                        >
                          <EventRowItem event={event} />
                        </motion.div>
                      ))
                    ) : (
                      <div className="jb-card px-4 py-6 text-center text-sm text-arena-text-muted">
                        {t("sections.noWeekEvents")}
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <div className="jb-section-label">{t("sections.past")}</div>
                  <div className="jb-stack">
                    {visiblePast.length > 0 ? (
                      visiblePast.slice(0, 6).map((event, i) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.18,
                            delay: i * 0.03,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                        >
                          <EventRowItem event={event} />
                        </motion.div>
                      ))
                    ) : (
                      <div className="jb-card px-4 py-6 text-center text-sm text-arena-text-muted">
                        {t("empty.noPast")}
                      </div>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
