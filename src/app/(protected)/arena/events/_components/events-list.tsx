"use client";

import {
  Calendar,
  CalendarDays,
  Clock,
  Layers,
  MapPin,
  Plus,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CreateEventSheet } from "@/components/arena/create-event-sheet";
import { JbUserMenu } from "@/components/arena/jb-user-menu";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/use-events";
import { useTeams } from "@/hooks/use-teams";
import { cn } from "@/lib/utils";
import type { EventStatus, EventView } from "@/types/events";

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
        "rounded-[5px] border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        cfg.className,
      )}
    >
      {t(cfg.label)}
    </span>
  );
}

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventCard({ event }: { event: EventView }) {
  const t = useTranslations("arenaEvents");
  const isGame = event.type === "partida" || event.type === "jogo";

  return (
    <Link
      className="jb-card block p-3.5 no-underline md:p-4"
      href={`/arena/events/${event.id}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "grid size-[26px] place-items-center rounded-[7px]",
              isGame ? "bg-arena-primary/[0.13]" : "bg-arena-info/[0.13]",
            )}
          >
            {isGame ? (
              <Shield size={13} className="text-arena-primary" />
            ) : (
              <Calendar size={13} className="text-arena-info" />
            )}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.8px]",
              isGame ? "text-arena-primary" : "text-arena-info",
            )}
          >
            {isGame ? t("types.match") : t("types.training")}
          </span>
        </div>
        <EventStatusBadge status={event.status} />
      </div>

      <div className="mb-2 text-sm font-semibold leading-snug text-arena-text md:text-base">
        {event.title}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        <span className="flex items-center gap-1">
          <Calendar size={11} className="text-arena-text-muted" />
          <span className="text-[11px] text-arena-text-muted">
            {formatDate(event.startDate)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} className="text-arena-text-muted" />
          <span className="text-[11px] text-arena-text-muted">
            {formatTime(event.startDate)}
          </span>
        </span>
        {event.location ? (
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-arena-text-muted" />
            <span className="text-[11px] text-arena-text-muted">
              {event.location}
            </span>
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export function EventsList({ upcoming, past }: EventsListProps) {
  const t = useTranslations("arenaEvents");
  const [sheet, setSheet] = useState(false);
  const { activeTeamId } = useTeams();
  const { events } = useEvents({
    upcomingOnly: false,
    limit: 50,
    enabled: Boolean(activeTeamId),
  });

  const { visibleUpcoming, visiblePast } = useMemo(() => {
    const source = activeTeamId ? events : [...upcoming, ...past];
    const now = new Date();

    return {
      visibleUpcoming: source.filter(event => new Date(event.startDate) >= now),
      visiblePast: source.filter(event => new Date(event.startDate) < now),
    };
  }, [activeTeamId, events, upcoming, past]);

  const hasEvents = visibleUpcoming.length > 0 || visiblePast.length > 0;

  return (
    <>
      {sheet ? (
        <CreateEventSheet
          onClose={() => setSheet(false)}
          teamId={activeTeamId ?? undefined}
        />
      ) : null}

      <div className="jb-page">
        <div className="jb-page-inner">
          <header className="jb-topbar flex w-full flex-col gap-2">
            <div className="flex w-full items-center justify-between">
              <div>
                <div className="jb-kicker">{t("kicker")}</div>
                <div className="flex items-center gap-2">
                  <Layers className="size-6 text-arena-primary" />
                  <h1 className="jb-title">{t("title")}</h1>
                </div>
              </div>

              <JbUserMenu onlyAvatar className="hidden md:block" />
            </div>

            <div className="flex w-full gap-2 flex-wrap justify-end">
              <Link
                href="/arena/calendar"
                className="jb-action h-12 flex-1 sm:flex-none"
              >
                <CalendarDays size={14} strokeWidth={2} />
                {t("actions.viewCalendar")}
              </Link>
              <Button
                className="jb-action jb-action-primary min-w-[135px] flex-1 md:flex-none"
                onClick={() => setSheet(true)}
                type="button"
                variant="ghost"
                size="sm"
              >
                <Plus size={14} strokeWidth={2.5} />
                {t("actions.create")}
              </Button>
            </div>
          </header>

          {!hasEvents ? (
            <div className="jb-card mx-auto grid max-w-md place-items-center px-6 py-14 text-center">
              <div className="mb-4 grid size-14 place-items-center rounded-[18px] border border-arena-border bg-arena-surface">
                <Calendar
                  size={24}
                  className="text-arena-text-muted"
                  strokeWidth={1.5}
                />
              </div>
              <div className="text-[15px] font-semibold text-arena-text">
                {t("empty.title")}
              </div>
              <div className="mt-1 text-sm text-arena-text-muted">
                {t("empty.subtitle")}
              </div>
              <Button
                className="jb-action jb-action-primary mt-5 px-5"
                onClick={() => setSheet(true)}
                type="button"
                variant="ghost"
                size="sm"
              >
                {t("actions.createEvent")}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.75fr)]">
              <section>
                <div className="jb-section-label">{t("sections.upcoming")}</div>
                <div className="jb-stack">
                  {visibleUpcoming.map(event => (
                    <EventCard event={event} key={event.id} />
                  ))}
                </div>
              </section>

              <section>
                <div className="jb-section-label">{t("sections.past")}</div>
                <div className="jb-stack">
                  {visiblePast.length > 0 ? (
                    visiblePast.map(event => (
                      <EventCard event={event} key={event.id} />
                    ))
                  ) : (
                    <div className="jb-card p-4 text-sm text-arena-text-muted">
                      {t("empty.noPast")}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
