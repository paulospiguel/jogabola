"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  MapPin,
  Plus,
  Shield,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AddPlayerSheet } from "@/components/arena/add-player-sheet";
import { JbAvatar } from "@/components/arena/avatar";
import { CreateEventSheet } from "@/components/arena/create-event-sheet";
import { CreateTeamSheet } from "@/components/arena/create-team-sheet";
import { Cta } from "@/components/arena/cta";
import { PlayerRow } from "@/components/arena/player-row";
import Loading from "@/components/loading";
import { useDashboardData } from "@/hooks/use-dashboard";
import { useEventAttendance } from "@/hooks/use-event-attendance";
import { FEATURES } from "@/lib/features";
import type { EventStatus } from "@/types/events";

interface ArenaDashboardProps {
  userId: string;
}

const EVENT_STATUS_CONFIG: Record<
  EventStatus,
  { className: string; label: string }
> = {
  scheduled: {
    className: "border-arena-info/25 bg-arena-info/10 text-arena-info",
    label: "status.scheduled",
  },
  confirmed: {
    className: "border-arena-success/25 bg-arena-success/10 text-arena-success",
    label: "status.confirmed",
  },
  cancelled: {
    className: "border-arena-danger/25 bg-arena-danger/10 text-arena-danger",
    label: "status.cancelled",
  },
};

function EventStatusBadge({ status }: { status: EventStatus }) {
  const t = useTranslations("arenaEvents");
  const config = EVENT_STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-lg border px-2 py-[3px] text-[11px] font-bold leading-none tracking-[0.2px] ${config.className}`}
    >
      {t(config.label)}
    </span>
  );
}

export function ArenaDashboard({ userId }: ArenaDashboardProps) {
  const t = useTranslations("arenaDashboard");
  const [sheet, setSheet] = useState<
    "create-event" | "add-player" | "create-team" | null
  >(null);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const queryClient = useQueryClient();

  const { activeTeamId, myTeams, events, squad, isLoading } =
    useDashboardData();

  const resolvedEventIndex = events[activeEventIndex] ? activeEventIndex : 0;
  const activeEvent = events[resolvedEventIndex] ?? null;
  const hasMultipleEvents = events.length > 1;
  const eventPosition = activeEvent ? resolvedEventIndex + 1 : 0;
  const {
    confirmed: eventConfirmed,
    reserves: eventReserves,
    pending: eventPending,
    isLoading: eventAttendanceLoading,
  } = useEventAttendance(activeEvent?.id ?? 0);

  const goToEvent = (direction: -1 | 1) => {
    if (events.length <= 1) return;
    setActiveEventIndex(current => {
      const next = current + direction;
      if (next < 0) return events.length - 1;
      if (next >= events.length) return 0;
      return next;
    });
  };

  const activeTeam = myTeams.find(
    (team: { id: number }) => team.id === activeTeamId,
  );

  useEffect(() => {
    setActiveEventIndex(current => {
      if (events.length === 0) return 0;
      return current >= events.length ? 0 : current;
    });
  }, [events.length]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-arena-bg text-arena-text-muted">
        <Loading text={t("loadingArena")} />
      </div>
    );
  }

  // No team selected / manager has no teams yet
  if (!activeTeamId || !activeTeam) {
    return (
      <>
        {sheet === "create-team" && (
          <CreateTeamSheet onClose={() => setSheet(null)} />
        )}
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-arena-bg text-arena-text-muted">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-arena-surface-el">
            <Shield className="size-7 text-arena-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-arena-text">
              {t("noTeam.title")}
            </h2>
            <p className="mt-1 text-sm text-arena-text-muted">
              {t("noTeam.description")}
            </p>
          </div>
          <Cta
            onClick={() => setSheet("create-team")}
            variant="primary"
            size="md"
          >
            <Plus size={15} />
            {t("noTeam.cta")}
          </Cta>
        </div>
      </>
    );
  }

  const weekEvents = events.filter(event => event.id !== activeEvent?.id);

  return (
    <>
      {sheet === "create-event" && (
        <CreateEventSheet
          onClose={() => setSheet(null)}
          onCreated={() => {
            void queryClient.invalidateQueries({
              queryKey: ["dashboard", "events", activeTeamId],
            });
          }}
          teamId={activeTeamId}
        />
      )}
      {sheet === "add-player" && (
        <AddPlayerSheet
          managerId={userId}
          teamId={activeTeamId}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === "create-team" && (
        <CreateTeamSheet onClose={() => setSheet(null)} />
      )}

      <motion.div
        className="jb-page"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="jb-page-inner">
          <header className="jb-topbar">
            <div>
              <div className="jb-kicker">{t("kicker")}</div>
              <div className="flex items-center gap-2">
                <Shield className="size-6 text-arena-primary" />
                <h1 className="jb-title">{activeTeam.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Cta
                variant="secondary"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => setSheet("add-player")}
              >
                <Users size={15} />
                {t("actions.player")}
              </Cta>
              <Cta
                variant="primary"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => setSheet("create-event")}
              >
                <Plus size={15} />
                {t("actions.event")}
              </Cta>
            </div>
          </header>

          <div className="jb-dashboard-grid">
            <section className="jb-stack">
              {activeEvent ? (
                <div className="jb-hero-card jb-hero-card--live relative overflow-hidden">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-[26px] place-items-center rounded-[7px] bg-arena-primary/[0.13]">
                        <Zap
                          size={13}
                          className="text-arena-primary"
                          strokeWidth={2}
                        />
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
                      {hasMultipleEvents && (
                        <span className="rounded-lg border border-arena-border bg-arena-bg/35 px-2 py-[5px] text-[10px] font-bold text-arena-text-muted">
                          {eventPosition}/{events.length}
                        </span>
                      )}
                      <EventStatusBadge status={activeEvent.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasMultipleEvents && (
                      <button
                        aria-label={t("hero.prevEvent")}
                        className="grid size-9 shrink-0 place-items-center rounded-xl border border-arena-border bg-arena-bg/45 text-arena-text-sec transition-colors hover:border-arena-primary/35 hover:text-arena-primary"
                        onClick={() => goToEvent(-1)}
                        type="button"
                      >
                        <ChevronLeft size={17} strokeWidth={2.5} />
                      </button>
                    )}

                    <Link
                      className="min-w-0 flex-1 text-inherit no-underline"
                      href={`/arena/events/${activeEvent.id}`}
                    >
                      <h2 className="mb-3 truncate text-base font-bold leading-tight text-arena-text md:text-xl">
                        {activeEvent.title}
                      </h2>

                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {[
                          { Icon: Calendar, label: activeEvent.date },
                          { Icon: Clock, label: activeEvent.time },
                          { Icon: MapPin, label: activeEvent.location },
                        ].map(({ Icon, label }) => (
                          <span
                            className="flex items-center gap-1.5"
                            key={label}
                          >
                            <Icon size={12} className="text-arena-text-muted" />
                            <span className="text-xs text-arena-text-sec">
                              {label}
                            </span>
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex -space-x-1">
                          {eventConfirmed.slice(0, 5).map(p => (
                            <JbAvatar
                              className="ring-2 ring-[#1B2430]"
                              id={p.id}
                              key={p.id}
                              name={p.name}
                              size={28}
                            />
                          ))}
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold text-arena-primary">
                          {t("hero.view")}
                          <ChevronRight size={14} />
                        </span>
                      </div>
                    </Link>

                    {hasMultipleEvents && (
                      <button
                        aria-label={t("hero.nextEvent")}
                        className="grid size-9 shrink-0 place-items-center rounded-xl border border-arena-border bg-arena-bg/45 text-arena-text-sec transition-colors hover:border-arena-primary/35 hover:text-arena-primary"
                        onClick={() => goToEvent(1)}
                        type="button"
                      >
                        <ChevronRight size={17} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty state — no events yet */
                <div className="jb-hero-card flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-arena-surface-el">
                    <Calendar className="size-6 text-arena-primary/60" />
                  </div>
                  <p className="text-sm font-semibold text-arena-text-sec">
                    {t("hero.noEvents")}
                  </p>
                  <Cta
                    variant="primary"
                    size="sm"
                    onClick={() => setSheet("create-event")}
                  >
                    <Plus size={14} />
                    {t("actions.createEvent")}
                  </Cta>
                </div>
              )}

              <div className="jb-stat-grid">
                {(
                  [
                    {
                      l: t("stats.confirmed"),
                      v: eventAttendanceLoading ? "..." : eventConfirmed.length,
                      cls: "text-arena-success",
                    },
                    {
                      l: t("stats.reserves"),
                      v: eventAttendanceLoading ? "..." : eventReserves.length,
                      cls: "text-arena-warning",
                    },
                    {
                      l: t("stats.pending"),
                      v: eventAttendanceLoading ? "..." : eventPending.length,
                      cls: "text-arena-text-muted",
                    },
                  ] as const
                ).map(s => (
                  <div className="jb-card px-2 py-3 text-center" key={s.l}>
                    <div className={`text-[22px] font-extrabold ${s.cls}`}>
                      {s.v}
                    </div>
                    <div className="mt-0.5 text-[10px] font-semibold text-arena-text-muted">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>

              <Cta
                variant="primary"
                size="md"
                fullWidth
                className="md:hidden"
                onClick={() => setSheet("create-event")}
              >
                <Plus size={16} strokeWidth={2.5} />
                {t("actions.createEvent")}
              </Cta>
            </section>

            <aside className="jb-stack">
              {/* This Week */}
              <section>
                <div className="jb-section-label flex items-center justify-between">
                  <span>{t("sections.thisWeek")}</span>
                  <Link
                    href="/arena/events"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-arena-info transition-colors hover:bg-arena-info/10"
                  >
                    <Calendar size={13} />
                    {t("sections.viewCalendar")}
                  </Link>
                </div>
                <div className="jb-stack">
                  {weekEvents.length > 0 ? (
                    weekEvents.map(e => {
                      const isGame = e.type === "match" || e.type === "partida";
                      return (
                        <Link
                          className="jb-card jb-list-row"
                          href={`/arena/events/${e.id}`}
                          key={e.id}
                        >
                          <span
                            className={`jb-icon-tile ${isGame ? "bg-arena-primary/[0.08]" : "bg-arena-info/[0.08]"}`}
                          >
                            {isGame ? (
                              <Trophy
                                size={20}
                                className="text-arena-primary"
                              />
                            ) : (
                              <Calendar size={20} className="text-arena-info" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-arena-text">
                              {e.title}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-arena-text-muted">
                              {e.date} · {e.time}
                            </span>
                          </span>
                          <EventStatusBadge status={e.status} />
                        </Link>
                      );
                    })
                  ) : (
                    <div className="jb-card px-4 py-6 text-center text-sm text-arena-text-muted">
                      {t("sections.noWeekEvents")}
                    </div>
                  )}
                </div>
              </section>

              {/* Squad preview */}
              <section>
                <div className="jb-section-label">{t("sections.squad")}</div>
                <div className="jb-stack">
                  {squad.length > 0 ? (
                    squad
                      .slice(0, 5)
                      .map(p => (
                        <PlayerRow
                          {...p}
                          key={p.id}
                          href={`/arena/squads/player/${p.id}`}
                        />
                      ))
                  ) : (
                    <div className="jb-card px-4 py-6 text-center text-sm text-arena-text-muted">
                      {t("sections.noSquad")}
                    </div>
                  )}

                  <Link className="jb-action" href="/arena/squads">
                    {t("sections.viewFullSquad")}
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </section>

              {/* Discover cards */}
              <section>
                <div className="jb-section-label">{t("sections.discover")}</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {FEATURES.rankings && (
                    <Link
                      href="/arena/rankings"
                      className="flex flex-col gap-2 rounded-[14px] border border-arena-border bg-arena-surface p-3.5 transition-all duration-150 hover:border-arena-primary/35 hover:bg-arena-surface-el active:scale-[0.97]"
                    >
                      <div className="flex size-9 items-center justify-center rounded-[11px] bg-arena-highlight/15 border border-arena-highlight/30">
                        <Trophy
                          size={18}
                          className="text-arena-highlight"
                          strokeWidth={1.7}
                        />
                        <Trophy
                          size={18}
                          className="text-arena-highlight"
                          strokeWidth={1.7}
                        />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-arena-text">
                          {t("sections.rankings")}
                        </div>
                        <div className="mt-0.5 text-[11px] text-arena-text-muted">
                          {t("sections.rankingsSub")}
                        </div>
                        <div className="text-[13px] font-bold text-arena-text">
                          {t("sections.rankings")}
                        </div>
                        <div className="mt-0.5 text-[11px] text-arena-text-muted">
                          {t("sections.rankingsSub")}
                        </div>
                      </div>
                    </Link>
                  )}
                  {FEATURES.seasonHistory && (
                    <Link
                      href="/arena/historical"
                      className="flex flex-col gap-2 rounded-[14px] border border-arena-border bg-arena-surface p-3.5 transition-all duration-150 hover:border-arena-primary/35 hover:bg-arena-surface-el active:scale-[0.97]"
                    >
                      <div className="flex size-9 items-center justify-center rounded-[11px] bg-arena-info/15 border border-arena-info/30">
                        <History
                          size={18}
                          className="text-arena-info"
                          strokeWidth={1.7}
                        />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-arena-text">
                          {t("sections.historical")}
                        </div>
                        <div className="mt-0.5 text-[11px] text-arena-text-muted">
                          {t("sections.historicalSub")}
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </motion.div>
    </>
  );
}
