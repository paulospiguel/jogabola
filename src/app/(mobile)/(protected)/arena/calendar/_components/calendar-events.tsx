"use client";

import { Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { EVENT_STATUS } from "@/constants/event-status";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { useCalendarEventsState } from "../_hooks/use-calendar-events-state";
import type {
  EventType,
  SessionRow,
  ViewMode,
} from "../_types/calendar-events";
import { TYPE_CONFIG } from "../_utils/calendar-event-utils";
import { CalendarControls } from "./calendar-controls";
import { CalendarMonthView } from "./calendar-month-view";
import { CalendarRangeView } from "./calendar-range-view";
import { CalendarWeekView } from "./calendar-week-view";
import { CalendarYearView } from "./calendar-year-view";

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

interface CalendarEventsProps {
  initialEvents: SessionRow[];
  initialWeekStart: string;
}

export function CalendarEvents({
  initialEvents,
  initialWeekStart,
}: CalendarEventsProps) {
  const t = useTranslations("arenaCalendar");
  const {
    customRange,
    dfLocale,
    events,
    eventsByDate,
    isPending,
    monthStart,
    navigate,
    navLabel,
    rangeOpen,
    setCustomRange,
    setMonthStart,
    setRangeOpen,
    setViewMode,
    switchMode,
    totalEvents,
    viewMode,
    weekDays,
    yearStart,
  } = useCalendarEventsState({ initialEvents, initialWeekStart });
  const viewOptions = [
    { id: "week", label: t("views.week") },
    { id: "month", label: t("views.month") },
    { id: "year", label: t("views.year") },
    { id: "range", label: t("views.range") },
  ] satisfies Array<{ id: ViewMode; label: string }>;
  const getStatusLabel = (status: SessionRow["status"]) => {
    if (!status || status === EVENT_STATUS.SCHEDULED) return undefined;
    return t(`status.${status}`);
  };

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        {/* Header */}
        <header className="jb-topbar">
          <div>
            <div className="jb-kicker">{t("hero.eyebrow")}</div>
            <h1 className="jb-title">{t("hero.title")}</h1>
          </div>
        </header>

        <CalendarControls
          ariaLabel={t("views.ariaLabel")}
          customRange={customRange}
          eventCountLabel={t("nav.eventCount", { count: totalEvents })}
          isPending={isPending}
          navLabel={navLabel}
          navigate={navigate}
          nextLabel={t("nav.next")}
          noEventsLabel={t("nav.noEvents")}
          onRangeChange={setCustomRange}
          onViewModeChange={switchMode}
          prevLabel={t("nav.prev")}
          rangeOpen={rangeOpen}
          rangePlaceholder={t("nav.rangePlaceholder")}
          setRangeOpen={setRangeOpen}
          totalEvents={totalEvents}
          viewMode={viewMode}
          viewOptions={viewOptions}
        />

        {viewMode === "week" && (
          <CalendarWeekView
            dfLocale={dfLocale}
            emptyLabel={t("empty")}
            eventsByDate={eventsByDate}
            getStatusLabel={getStatusLabel}
            isPending={isPending}
            todayLabel={t("today")}
            weekDays={weekDays}
          />
        )}

        {viewMode === "month" && (
          <CalendarMonthView
            dfLocale={dfLocale}
            eventCountLabel={t("nav.eventCount", { count: totalEvents })}
            events={events}
            eventsByDate={eventsByDate}
            getStatusLabel={getStatusLabel}
            isPending={isPending}
            monthStart={monthStart}
            totalEvents={totalEvents}
          />
        )}

        {viewMode === "year" && (
          <CalendarYearView
            dfLocale={dfLocale}
            events={events}
            getEventCountLabel={count => t("nav.eventCount", { count })}
            isPending={isPending}
            noEventsLabel={t("nav.noEvents")}
            onSelectMonth={selectedMonthStart => {
              setMonthStart(selectedMonthStart);
              setViewMode("month");
            }}
            yearStart={yearStart}
          />
        )}

        {viewMode === "range" && (
          <CalendarRangeView
            customRange={customRange}
            dfLocale={dfLocale}
            emptyDescription={t("emptyState.description")}
            emptyTitle={t("emptyState.title")}
            events={events}
            getStatusLabel={getStatusLabel}
            isPending={isPending}
            rangeHint={t("nav.rangeHint")}
            rangePlaceholder={t("nav.rangePlaceholder")}
            todayLabel={t("today")}
            totalEvents={totalEvents}
          />
        )}

        {/* Empty state for week/month/year */}
        {viewMode !== "range" && totalEvents === 0 && !isPending && (
          <ArenaEmptyState
            className="mt-8 py-10"
            description={t("emptyState.description")}
            icon={Calendar}
            title={t("emptyState.title")}
          />
        )}

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-2">
          {(
            Object.entries(TYPE_CONFIG) as [
              EventType,
              (typeof TYPE_CONFIG)[EventType],
            ][]
          ).map(([type, cfg]) => (
            <div
              key={type}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold"
              style={{
                backgroundColor: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.text,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cfg.dot }}
              />
              {t(`legend.${type}`)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
