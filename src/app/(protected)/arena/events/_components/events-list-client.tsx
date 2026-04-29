"use client";

import { Calendar, Clock, MapPin, Plus, Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CreateEventSheet } from "@/components/arena/create-event-sheet";
import { C } from "@/components/arena/tokens";

interface EventItem {
  id: number;
  title: string;
  type: string;
  location: string;
  startDate: Date | string;
  status: string | null;
}

interface EventsListClientProps {
  events: EventItem[];
  userId: string;
}

function eventDate(d: Date | string) {
  return typeof d === "string" ? new Date(d) : d;
}

function formatDate(d: Date | string) {
  return eventDate(d).toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(d: Date | string) {
  return eventDate(d).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isUpcoming(d: Date | string) {
  return eventDate(d) >= new Date();
}

function EventCard({ event }: { event: EventItem }) {
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
            className="grid size-[26px] place-items-center rounded-[7px]"
            style={{ background: isGame ? `${C.primary}20` : `${C.info}20` }}
          >
            {isGame ? (
              <Trophy size={13} color={C.primary} />
            ) : (
              <Calendar size={13} color={C.info} />
            )}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.8px]"
            style={{ color: isGame ? C.primary : C.info }}
          >
            {isGame ? t("types.match") : t("types.training")}
          </span>
        </div>
      </div>

      <div className="mb-2 text-sm font-semibold leading-snug text-[#F5F7FA] md:text-base">
        {event.title}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        <span className="flex items-center gap-1">
          <Calendar size={11} color={C.textMuted} />
          <span className="text-[11px] text-[#6B7280]">
            {formatDate(event.startDate)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} color={C.textMuted} />
          <span className="text-[11px] text-[#6B7280]">
            {formatTime(event.startDate)}
          </span>
        </span>
        {event.location ? (
          <span className="flex items-center gap-1">
            <MapPin size={11} color={C.textMuted} />
            <span className="text-[11px] text-[#6B7280]">{event.location}</span>
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export function EventsListClient({ events, userId }: EventsListClientProps) {
  const t = useTranslations("arenaEvents");
  const [sheet, setSheet] = useState(false);

  const { upcoming, past } = useMemo(
    () => ({
      upcoming: events.filter(e => isUpcoming(e.startDate)),
      past: events.filter(e => !isUpcoming(e.startDate)),
    }),
    [events],
  );

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
              <h1 className="jb-title">{t("title")}</h1>
            </div>
            <button
              className="jb-action jb-action-primary"
              onClick={() => setSheet(true)}
              type="button"
            >
              <Plus size={14} strokeWidth={2.5} />
              {t("actions.create")}
            </button>
          </header>

          {events.length === 0 ? (
            <div className="jb-card mx-auto grid max-w-md place-items-center px-6 py-14 text-center">
              <div className="mb-4 grid size-14 place-items-center rounded-[18px] border border-[#263244] bg-[#151C26]">
                <Calendar size={24} color={C.textMuted} strokeWidth={1.5} />
              </div>
              <div className="text-[15px] font-semibold text-[#F5F7FA]">
                {t("empty.title")}
              </div>
              <div className="mt-1 text-sm text-[#6B7280]">
                {t("empty.subtitle")}
              </div>
              <button
                className="jb-action jb-action-primary mt-5 px-5"
                onClick={() => setSheet(true)}
                type="button"
              >
                {t("actions.createEvent")}
              </button>
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
                    <div className="jb-card p-4 text-sm text-[#6B7280]">
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
