import { format, isToday } from "date-fns";
import type { Locale } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { cn } from "@/lib/utils";
import type { SessionRow } from "../_types/calendar-events";
import { toDate } from "../_utils/calendar-event-utils";
import { CalendarEventCard } from "./calendar-event-card";

interface CalendarRangeViewProps {
  customRange: DateRange | undefined;
  dfLocale: Locale;
  emptyDescription: string;
  emptyTitle: string;
  events: SessionRow[];
  getStatusLabel: (status: SessionRow["status"]) => string | undefined;
  isPending: boolean;
  rangeHint: string;
  rangePlaceholder: string;
  todayLabel: string;
  totalEvents: number;
}

export function CalendarRangeView({
  customRange,
  dfLocale,
  emptyDescription,
  emptyTitle,
  events,
  getStatusLabel,
  isPending,
  rangeHint,
  rangePlaceholder,
  todayLabel,
  totalEvents,
}: CalendarRangeViewProps) {
  if (!customRange?.from) {
    return (
      <ArenaEmptyState
        className="py-12"
        description={rangeHint}
        icon={CalendarDays}
        title={rangePlaceholder}
      />
    );
  }

  if (!customRange.to) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 transition-opacity duration-200",
        isPending && "opacity-40",
      )}
    >
      {totalEvents === 0 ? (
        <ArenaEmptyState
          className="py-10"
          description={emptyDescription}
          icon={CalendarDays}
          title={emptyTitle}
        />
      ) : (
        Object.entries(groupEventsByDate(events)).map(
          ([dateKey, dayEvents]) => {
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
                      {todayLabel}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {dayEvents.map(event => (
                    <CalendarEventCard
                      key={event.id}
                      session={event}
                      statusLabel={getStatusLabel(event.status)}
                    />
                  ))}
                </div>
              </div>
            );
          },
        )
      )}
    </div>
  );
}

function groupEventsByDate(events: SessionRow[]): Record<string, SessionRow[]> {
  const grouped: Record<string, SessionRow[]> = {};
  const sortedEvents = [...events].sort(
    (first, second) =>
      toDate(first.startsAt).getTime() - toDate(second.startsAt).getTime(),
  );

  for (const event of sortedEvents) {
    const key = format(toDate(event.startsAt), "yyyy-MM-dd");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }

  return grouped;
}
