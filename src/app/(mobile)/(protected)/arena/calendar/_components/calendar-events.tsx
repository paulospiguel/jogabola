"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { SegmentedControl } from "@/components/arena/segmented-control";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCalendarEventsState } from "../_hooks/use-calendar-events-state";
import type {
  EventType,
  SessionRow,
  ViewMode,
} from "../_types/calendar-events";
import { TYPE_CONFIG } from "../_utils/calendar-event-utils";
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
    if (!status || status === "scheduled") return undefined;
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

        {/* View mode tabs */}
        <div className="mb-4 flex">
          <SegmentedControl
            ariaLabel={t("views.ariaLabel")}
            onChange={switchMode}
            options={viewOptions}
            value={viewMode}
          />
        </div>

        {/* Nav bar — week / month / year */}
        {viewMode !== "range" && (
          <div
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-5"
            style={{
              backgroundColor: "var(--color-arena-surface)",
              border: "1px solid var(--color-arena-border)",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("prev")}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-arena-text-sec hover:bg-arena-surface-el hover:text-arena-text transition-colors disabled:opacity-40"
              aria-label={t("nav.prev")}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[13px] font-bold text-arena-text">
                {navLabel}
              </span>
              <span className="text-[11px] text-arena-text-muted">
                {totalEvents === 0
                  ? t("nav.noEvents")
                  : t("nav.eventCount", { count: totalEvents })}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate("next")}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-arena-text-sec hover:bg-arena-surface-el hover:text-arena-text transition-colors disabled:opacity-40"
              aria-label={t("nav.next")}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Range picker trigger */}
        {viewMode === "range" && (
          <div className="mb-5 flex flex-col gap-2">
            <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-arena-surface-el w-full"
                  style={{
                    backgroundColor: "var(--color-arena-surface)",
                    border: "1px solid var(--color-arena-border)",
                  }}
                >
                  <Calendar size={16} className="text-arena-primary shrink-0" />
                  <span className="text-arena-text flex-1 text-left">
                    {customRange?.from && customRange?.to
                      ? navLabel
                      : t("nav.rangePlaceholder")}
                  </span>
                  <ChevronRight size={14} className="text-arena-text-muted" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="start"
                style={{
                  backgroundColor: "var(--color-arena-surface)",
                  border: "1px solid var(--color-arena-border)",
                }}
              >
                <CalendarPicker
                  mode="range"
                  selected={customRange}
                  onSelect={range => {
                    setCustomRange(range);
                    if (range?.from && range?.to) {
                      setRangeOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                  weekStartsOn={1}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
            {customRange?.from && customRange?.to && (
              <p className="text-[11px] text-arena-text-muted px-1">
                {totalEvents === 0
                  ? t("nav.noEvents")
                  : t("nav.eventCount", { count: totalEvents })}
              </p>
            )}
          </div>
        )}

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
