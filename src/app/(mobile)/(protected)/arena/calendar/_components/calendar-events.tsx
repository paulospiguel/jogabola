"use client";

import {
  addDays,
  addMonths,
  format,
  isSameMonth,
  isToday,
  startOfWeek,
  startOfYear,
} from "date-fns";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { SegmentedControl } from "@/components/arena/segmented-control";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCalendarEventsState } from "../_hooks/use-calendar-events-state";
import type {
  EventType,
  SessionRow,
  ViewMode,
} from "../_types/calendar-events";
import {
  getMonthGrid,
  inferType,
  TYPE_CONFIG,
  toDate,
} from "../_utils/calendar-event-utils";
import { CalendarEventCard } from "./calendar-event-card";

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

        {/* ============================================================ */}
        {/*  WEEK VIEW                                                    */}
        {/* ============================================================ */}
        {viewMode === "week" && (
          <>
            {/* Desktop 7-col grid */}
            <div
              className={cn(
                "hidden md:grid grid-cols-7 gap-2 transition-opacity duration-200",
                isPending && "opacity-40",
              )}
            >
              {weekDays.map(day => {
                const key = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDate[key] ?? [];
                const today = isToday(day);
                return (
                  <div key={key} className="flex flex-col gap-1.5">
                    <div
                      className="rounded-xl px-2 py-2 text-center"
                      style={
                        today
                          ? {
                              backgroundColor:
                                "color-mix(in srgb, var(--color-arena-primary) 12%, transparent)",
                              border:
                                "1px solid color-mix(in srgb, var(--color-arena-primary) 30%, transparent)",
                            }
                          : {
                              backgroundColor: "var(--color-arena-surface)",
                              border: "1px solid var(--color-arena-border)",
                            }
                      }
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: today
                            ? "var(--color-arena-primary)"
                            : "var(--color-arena-text-muted)",
                        }}
                      >
                        {format(day, "EEE", { locale: dfLocale })}
                      </p>
                      <p
                        className="text-[17px] font-extrabold"
                        style={{
                          color: today
                            ? "var(--color-arena-primary)"
                            : "var(--color-arena-text)",
                        }}
                      >
                        {format(day, "d")}
                      </p>
                    </div>
                    {dayEvents.length === 0 ? (
                      <div className="flex items-center justify-center h-full min-h-15 rounded-xl border border-dashed border-arena-border/50">
                        <span className="text-[11px] text-arena-text-muted/50">
                          —
                        </span>
                      </div>
                    ) : (
                      dayEvents.map(ev => {
                        const cfg = TYPE_CONFIG[inferType(ev.title)];
                        return (
                          <Link
                            key={ev.id}
                            href={`/arena/events/${ev.id}`}
                            className="block rounded-xl px-3 py-2.5 transition-all hover:brightness-110"
                            style={{
                              backgroundColor: cfg.bg,
                              border: `1px solid ${cfg.border}`,
                            }}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: cfg.dot }}
                              />
                              <span
                                className="text-[11px] font-bold"
                                style={{ color: cfg.text }}
                              >
                                {format(toDate(ev.startsAt), "HH:mm")}
                              </span>
                            </div>
                            <p className="font-bold text-[13px] leading-tight text-arena-text truncate">
                              {ev.title}
                            </p>
                            <p className="text-[11px] text-arena-text-muted truncate mt-0.5">
                              {ev.location}
                            </p>
                          </Link>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile stacked list */}
            <div
              className={cn(
                "md:hidden flex flex-col gap-4 transition-opacity duration-200",
                isPending && "opacity-40",
              )}
            >
              {weekDays.map(day => {
                const key = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDate[key] ?? [];
                const today = isToday(day);
                return (
                  <div key={key}>
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl mb-2"
                      style={
                        today
                          ? {
                              backgroundColor:
                                "color-mix(in srgb, var(--color-arena-primary) 12%, transparent)",
                              border:
                                "1px solid color-mix(in srgb, var(--color-arena-primary) 30%, transparent)",
                            }
                          : {
                              backgroundColor: "var(--color-arena-surface)",
                              border: "1px solid var(--color-arena-border)",
                            }
                      }
                    >
                      <span
                        className="text-[15px] font-extrabold"
                        style={{
                          color: today
                            ? "var(--color-arena-primary)"
                            : "var(--color-arena-text)",
                        }}
                      >
                        {format(day, "d")}
                      </span>
                      <span
                        className="text-[12px] font-bold uppercase tracking-wider"
                        style={{
                          color: today
                            ? "var(--color-arena-primary)"
                            : "var(--color-arena-text-muted)",
                        }}
                      >
                        {format(day, "EEEE", { locale: dfLocale })}
                      </span>
                      {today && (
                        <span className="ml-auto text-[10px] font-bold text-arena-primary bg-arena-primary/10 rounded-md px-1.5 py-0.5">
                          {t("today")}
                        </span>
                      )}
                    </div>
                    {dayEvents.length === 0 ? (
                      <p className="px-4 text-[12px] text-arena-text-muted/60">
                        {t("empty")}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {dayEvents.map(ev => (
                          <CalendarEventCard
                            key={ev.id}
                            session={ev}
                            statusLabel={getStatusLabel(ev.status)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/*  MONTH VIEW                                                   */}
        {/* ============================================================ */}
        {viewMode === "month" && (
          <div
            className={cn(
              "transition-opacity duration-200",
              isPending && "opacity-40",
            )}
          >
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {Array.from({ length: 7 }, (_, i) => {
                const day = addDays(
                  startOfWeek(new Date(), { weekStartsOn: 1 }),
                  i,
                );

                return (
                  <div
                    key={format(day, "yyyy-MM-dd")}
                    className="text-center text-[10px] font-bold uppercase tracking-wider text-arena-text-muted py-1.5"
                  >
                    {format(day, "EEE", { locale: dfLocale })}
                  </div>
                );
              })}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {getMonthGrid(monthStart).map(day => {
                const key = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDate[key] ?? [];
                const today = isToday(day);
                const inMonth = isSameMonth(day, monthStart);
                const dots = dayEvents.slice(0, 3);
                const overflow = dayEvents.length - 3;
                return (
                  <div
                    key={key}
                    className="flex flex-col items-center rounded-xl p-1.5 min-h-14 transition-colors"
                    style={{
                      backgroundColor: today
                        ? "color-mix(in srgb, var(--color-arena-primary) 10%, transparent)"
                        : dayEvents.length > 0 && inMonth
                          ? "var(--color-arena-surface)"
                          : "transparent",
                      border: today
                        ? "1px solid color-mix(in srgb, var(--color-arena-primary) 30%, transparent)"
                        : "1px solid transparent",
                      opacity: inMonth ? 1 : 0.3,
                    }}
                  >
                    <span
                      className="text-[13px] font-bold mb-1"
                      style={{
                        color: today
                          ? "var(--color-arena-primary)"
                          : "var(--color-arena-text)",
                      }}
                    >
                      {format(day, "d")}
                    </span>
                    {dots.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {dots.map(ev => {
                          const cfg = TYPE_CONFIG[inferType(ev.title)];
                          return (
                            <span
                              key={ev.id}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: cfg.dot }}
                            />
                          );
                        })}
                        {overflow > 0 && (
                          <span className="text-[9px] font-bold text-arena-text-muted">
                            +{overflow}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Event list below grid */}
            {totalEvents > 0 && (
              <div className="mt-6">
                <div className="jb-section-label mb-3">
                  {t("nav.eventCount", { count: totalEvents })}
                </div>
                <div className="flex flex-col gap-2">
                  {events
                    .sort(
                      (a, b) =>
                        toDate(a.startsAt).getTime() -
                        toDate(b.startsAt).getTime(),
                    )
                    .map(ev => (
                      <CalendarEventCard
                        key={ev.id}
                        session={ev}
                        statusLabel={getStatusLabel(ev.status)}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/*  YEAR VIEW                                                    */}
        {/* ============================================================ */}
        {viewMode === "year" && (
          <div
            className={cn(
              "transition-opacity duration-200",
              isPending && "opacity-40",
            )}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 12 }, (_, i) => {
                const mStart = addMonths(startOfYear(yearStart), i);
                const mLabel = format(mStart, "MMMM", { locale: dfLocale });
                const mEvents = events.filter(ev =>
                  isSameMonth(toDate(ev.startsAt), mStart),
                );
                const isCurrent = isSameMonth(mStart, new Date());
                return (
                  <button
                    key={format(mStart, "yyyy-MM")}
                    type="button"
                    onClick={() => {
                      setMonthStart(mStart);
                      setViewMode("month");
                    }}
                    className="flex flex-col gap-2 rounded-xl p-4 text-left transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{
                      backgroundColor: isCurrent
                        ? "color-mix(in srgb, var(--color-arena-primary) 8%, transparent)"
                        : "var(--color-arena-surface)",
                      border: isCurrent
                        ? "1px solid color-mix(in srgb, var(--color-arena-primary) 25%, transparent)"
                        : "1px solid var(--color-arena-border)",
                    }}
                  >
                    <span
                      className="text-[13px] font-extrabold capitalize"
                      style={{
                        color: isCurrent
                          ? "var(--color-arena-primary)"
                          : "var(--color-arena-text)",
                      }}
                    >
                      {mLabel}
                    </span>
                    {mEvents.length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-0.5">
                          {mEvents.slice(0, 8).map(ev => {
                            const cfg = TYPE_CONFIG[inferType(ev.title)];
                            return (
                              <span
                                key={ev.id}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: cfg.dot }}
                              />
                            );
                          })}
                          {mEvents.length > 8 && (
                            <span className="text-[10px] font-bold text-arena-text-muted">
                              +{mEvents.length - 8}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-arena-text-muted">
                          {t("nav.eventCount", { count: mEvents.length })}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] text-arena-text-muted/50">
                        {t("nav.noEvents")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  RANGE VIEW                                                   */}
        {/* ============================================================ */}
        {viewMode === "range" && !customRange?.from && (
          <ArenaEmptyState
            className="py-12"
            description={t("nav.rangeHint")}
            icon={CalendarDays}
            title={t("nav.rangePlaceholder")}
          />
        )}

        {viewMode === "range" && customRange?.from && customRange?.to && (
          <div
            className={cn(
              "flex flex-col gap-2 transition-opacity duration-200",
              isPending && "opacity-40",
            )}
          >
            {totalEvents === 0 ? (
              <ArenaEmptyState
                className="py-10"
                description={t("emptyState.description")}
                icon={CalendarDays}
                title={t("emptyState.title")}
              />
            ) : (
              (() => {
                const grouped: Record<string, SessionRow[]> = {};
                for (const ev of events.sort(
                  (a, b) =>
                    toDate(a.startsAt).getTime() - toDate(b.startsAt).getTime(),
                )) {
                  const key = format(toDate(ev.startsAt), "yyyy-MM-dd");
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(ev);
                }
                return Object.entries(grouped).map(([dateKey, dayEvents]) => {
                  const day = new Date(dateKey);
                  const today = isToday(day);
                  return (
                    <div key={dateKey} className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[12px] font-bold uppercase tracking-wider"
                          style={{
                            color: today
                              ? "var(--color-arena-primary)"
                              : "var(--color-arena-text-muted)",
                          }}
                        >
                          {format(day, "EEE, d MMM", { locale: dfLocale })}
                        </span>
                        {today && (
                          <span className="text-[10px] font-bold text-arena-primary bg-arena-primary/10 rounded-md px-1.5 py-0.5">
                            {t("today")}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {dayEvents.map(ev => (
                          <CalendarEventCard
                            key={ev.id}
                            session={ev}
                            statusLabel={getStatusLabel(ev.status)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
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
