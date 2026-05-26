import { addDays, format, isSameMonth, isToday, startOfWeek } from "date-fns";
import type { Locale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { SessionRow } from "../_types/calendar-events";
import {
  getMonthGrid,
  inferType,
  TYPE_CONFIG,
  toDate,
} from "../_utils/calendar-event-utils";
import { CalendarEventCard } from "./calendar-event-card";

interface CalendarMonthViewProps {
  dfLocale: Locale;
  eventCountLabel: string;
  events: SessionRow[];
  eventsByDate: Record<string, SessionRow[]>;
  getStatusLabel: (status: SessionRow["status"]) => string | undefined;
  isPending: boolean;
  monthStart: Date;
  totalEvents: number;
}

export function CalendarMonthView({
  dfLocale,
  eventCountLabel,
  events,
  eventsByDate,
  getStatusLabel,
  isPending,
  monthStart,
  totalEvents,
}: CalendarMonthViewProps) {
  return (
    <div
      className={cn(
        "transition-opacity duration-200",
        isPending && "opacity-40",
      )}
    >
      <div className="grid grid-cols-7 gap-1 mb-1">
        {Array.from({ length: 7 }, (_, index) => {
          const day = addDays(
            startOfWeek(new Date(), { weekStartsOn: 1 }),
            index,
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
                  {dots.map(event => {
                    const cfg = TYPE_CONFIG[inferType(event.title)];
                    return (
                      <span
                        key={event.id}
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

      {totalEvents > 0 && (
        <div className="mt-6">
          <div className="jb-section-label mb-3">{eventCountLabel}</div>
          <div className="flex flex-col gap-2">
            {events
              .sort(
                (first, second) =>
                  toDate(first.startsAt).getTime() -
                  toDate(second.startsAt).getTime(),
              )
              .map(event => (
                <CalendarEventCard
                  key={event.id}
                  session={event}
                  statusLabel={getStatusLabel(event.status)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
