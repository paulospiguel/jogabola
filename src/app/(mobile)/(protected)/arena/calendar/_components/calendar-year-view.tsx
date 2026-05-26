import { addMonths, format, isSameMonth, startOfYear } from "date-fns";
import type { Locale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { SessionRow } from "../_types/calendar-events";
import { inferType, TYPE_CONFIG, toDate } from "../_utils/calendar-event-utils";

interface CalendarYearViewProps {
  dfLocale: Locale;
  events: SessionRow[];
  getEventCountLabel: (count: number) => string;
  isPending: boolean;
  noEventsLabel: string;
  onSelectMonth: (monthStart: Date) => void;
  yearStart: Date;
}

export function CalendarYearView({
  dfLocale,
  events,
  getEventCountLabel,
  isPending,
  noEventsLabel,
  onSelectMonth,
  yearStart,
}: CalendarYearViewProps) {
  return (
    <div
      className={cn(
        "transition-opacity duration-200",
        isPending && "opacity-40",
      )}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }, (_, index) => {
          const monthStart = addMonths(startOfYear(yearStart), index);
          const monthLabel = format(monthStart, "MMMM", { locale: dfLocale });
          const monthEvents = events.filter(event =>
            isSameMonth(toDate(event.startsAt), monthStart),
          );
          const isCurrent = isSameMonth(monthStart, new Date());
          return (
            <button
              key={format(monthStart, "yyyy-MM")}
              type="button"
              onClick={() => onSelectMonth(monthStart)}
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
                {monthLabel}
              </span>
              {monthEvents.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-0.5">
                    {monthEvents.slice(0, 8).map(event => {
                      const cfg = TYPE_CONFIG[inferType(event.title)];
                      return (
                        <span
                          key={event.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: cfg.dot }}
                        />
                      );
                    })}
                    {monthEvents.length > 8 && (
                      <span className="text-[10px] font-bold text-arena-text-muted">
                        +{monthEvents.length - 8}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-arena-text-muted">
                    {getEventCountLabel(monthEvents.length)}
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-arena-text-muted/50">
                  {noEventsLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
