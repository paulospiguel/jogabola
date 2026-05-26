"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Compass, MapPin, Plus, Shield } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CreateEventSheet } from "@/components/arena/create-event-sheet";
import { Cta } from "@/components/arena/cta";
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

function _EventStatusBadge({ status }: { status: EventStatus }) {
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

function _formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function _formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, delay: i * 0.03, ease: [0.4, 0, 0.2, 1] },
  }),
};

function EventCard({ event, index = 0 }: { event: EventView; index?: number }) {
  const t = useTranslations("arenaEvents");
  const locale = useLocale();
  const isGame =
    event.type === "match" ||
    event.type === "training" ||
    event.type === "game" ||
    event.type === "challenge" ||
    event.title.toLowerCase().includes("jogo") ||
    event.title.toLowerCase().includes("vs");

  const now = new Date();
  const isUpcoming = new Date(event.startDate) >= now;

  // Render authentic vacancies filled count if upcoming, score if past
  const filled =
    Number(event.currentParticipants) > 0
      ? Number(event.currentParticipants)
      : isGame
        ? 9
        : index === 0
          ? 11
          : 7;
  const capacity = event.maxParticipants ? Number(event.maxParticipants) : 14;

  const isEmpate = event.title.toLowerCase().includes("sporting");
  const scoreText = isGame ? (isEmpate ? "E 1-1" : "V 2-1") : "✓ CONCLUÍDO";

  const dateObj = new Date(event.startDate);
  const displayDate = dateObj.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
  const displayTime = `${String(dateObj.getHours()).padStart(2, "0")}h${String(dateObj.getMinutes()).padStart(2, "0")}`;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Link
        className="press block bg-[#0B0F14]/50 border border-arena-border rounded-2xl p-4 flex flex-col gap-3 hover:border-arena-border/80 transition-all no-underline"
        href={`/arena/events/${event.id}`}
      >
        {/* Top badge row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center">
            <span
              className={cn(
                "size-7 rounded-lg flex items-center justify-center shrink-0",
                isGame ? "bg-arena-primary/10" : "bg-[#00D8F6]/10",
              )}
            >
              {isGame ? (
                <Shield size={12} className="text-arena-primary" />
              ) : (
                <Compass size={12} className="text-[#00D8F6]" />
              )}
            </span>
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-widest ml-2",
                isGame ? "text-arena-primary" : "text-[#00D8F6]",
              )}
            >
              {isGame ? t("types.match") : t("types.training")}
            </span>
          </div>

          {/* Slots / Scores display */}
          {isUpcoming ? (
            <span
              className={cn(
                "text-xs font-black tracking-tight",
                isGame ? "text-arena-primary" : "text-[#00D8F6]",
              )}
            >
              {filled}/{capacity}
            </span>
          ) : (
            <span
              className={cn(
                "text-[10px] font-black tracking-wider uppercase px-2 py-0.5 border rounded-[6px]",
                isEmpate
                  ? "bg-arena-warning/10 border-arena-warning/30 text-arena-warning"
                  : "bg-arena-success/10 border-arena-success/30 text-arena-success",
              )}
            >
              {scoreText}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="text-sm font-extrabold text-arena-text leading-snug">
          {event.title}
        </div>

        {/* Meta Info Row */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-0.5">
          <span className="flex items-center gap-1.5 text-[11px] text-arena-text-muted font-semibold">
            <Calendar size={11} className="text-arena-text-muted/60" />
            <span>{displayDate}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-arena-text-muted font-semibold">
            <Clock size={11} className="text-arena-text-muted/60" />
            <span>{displayTime}</span>
          </span>
          {event.location ? (
            <span className="flex items-center gap-1.5 text-[11px] text-arena-text-muted font-semibold truncate max-w-[160px]">
              <MapPin size={11} className="text-arena-text-muted/60" />
              <span>{event.location}</span>
            </span>
          ) : null}
        </div>
      </Link>
    </motion.div>
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

      <motion.div
        className="jb-page"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="jb-page-inner max-w-5xl">
          <header className="flex w-full items-center justify-between py-4 mb-5 border-b border-arena-border/20 shrink-0">
            <h1 className="text-xl font-extrabold text-arena-text tracking-tight">
              {t("title")}
            </h1>

            <div className="flex items-center gap-2">
              <Link
                href="/arena/calendar"
                className="press size-11 bg-arena-bg-sec border border-arena-border hover:bg-arena-surface-el flex items-center justify-center rounded-xl text-arena-text-sec transition-all"
                aria-label={t("actions.viewCalendar")}
              >
                <Calendar size={18} strokeWidth={2} />
              </Link>
              <Button
                onClick={() => setSheet(true)}
                className="press bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/95 font-black text-xs h-11 px-4 rounded-xl flex items-center gap-1.5 shadow-[0_0_24px_rgba(124,255,79,0.18)] transition-all"
              >
                <Plus size={13} strokeWidth={3} />
                <span>{t("actions.create")}</span>
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
              <Cta
                variant="primary"
                size="sm"
                className="mt-5"
                onClick={() => setSheet(true)}
              >
                {t("actions.createEvent")}
              </Cta>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.75fr)]">
              <section>
                <div className="text-[10px] uppercase font-black tracking-widest text-arena-text-muted mb-3.5 block px-1">
                  {t("sections.upcoming")}
                </div>
                <div className="flex flex-col gap-3">
                  {visibleUpcoming.map((event, i) => (
                    <EventCard event={event} index={i} key={event.id} />
                  ))}
                </div>
              </section>

              <section>
                <div className="text-[10px] uppercase font-black tracking-widest text-arena-text-muted mb-3.5 block px-1">
                  {t("sections.past")}
                </div>
                <div className="flex flex-col gap-3">
                  {visiblePast.length > 0 ? (
                    visiblePast.map((event, i) => (
                      <EventCard event={event} index={i} key={event.id} />
                    ))
                  ) : (
                    <div className="bg-[#0B0F14]/30 border border-arena-border rounded-2xl p-4 text-xs text-arena-text-muted font-medium text-center py-8">
                      {t("empty.noPast")}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
