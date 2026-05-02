"use client";

import { Calendar, CalendarDays, Clock, MapPin, Plus, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateEventSheet } from "@/components/arena/create-event-sheet";
import { JbUserMenu } from "@/components/arena/jb-user-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventView } from "@/types/events";

interface EventsListProps {
  upcoming: EventView[];
  past: EventView[];
  userId: string;
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
              <Trophy size={13} className="text-arena-primary" />
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

export function EventsList({ upcoming, past, userId }: EventsListProps) {
  const t = useTranslations("arenaEvents");
  const [sheet, setSheet] = useState(false);

  const hasEvents = upcoming.length > 0 || past.length > 0;

  return (
    <>
      {sheet ? (
        <CreateEventSheet
          organizerId={userId}
          onClose={() => setSheet(false)}
        />
      ) : null}

      <div className="jb-page">
        <div className="jb-page-inner">
          <header className="jb-topbar">
            <div>
              <div className="jb-kicker">{t("kicker")}</div>
              <div className="flex items-center gap-2">
                <Shield className="size-6 text-arena-primary" />
                <h1 className="jb-title">{t("title")}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/arena/calendar"
                className="jb-action h-12"
              >
                <CalendarDays size={14} strokeWidth={2} />
                {t("actions.viewCalendar")}
              </Link>
              <Button
                className="jb-action jb-action-primary"
                onClick={() => setSheet(true)}
                type="button"
                variant="ghost"
                size="sm"
              >
                <Plus size={14} strokeWidth={2.5} />
                {t("actions.create")}
              </Button>
              <JbUserMenu onlyAvatar />
            </div>
          </header>

          {!hasEvents ? (
            <div className="jb-card mx-auto grid max-w-md place-items-center px-6 py-14 text-center">
              <div className="mb-4 grid size-14 place-items-center rounded-[18px] border border-arena-border bg-arena-surface">
                <Calendar size={24} className="text-arena-text-muted" strokeWidth={1.5} />
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
                  {upcoming.map(event => (
                    <EventCard event={event} key={event.id} />
                  ))}
                </div>
              </section>

              <section>
                <div className="jb-section-label">{t("sections.past")}</div>
                <div className="jb-stack">
                  {past.length > 0 ? (
                    past.map(event => (
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
