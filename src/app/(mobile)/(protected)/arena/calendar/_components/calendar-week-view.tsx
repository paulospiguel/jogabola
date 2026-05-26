import { format, isToday } from "date-fns";
import type { Locale } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SessionRow } from "../_types/calendar-events";
import { inferType, TYPE_CONFIG, toDate } from "../_utils/calendar-event-utils";
import { CalendarEventCard } from "./calendar-event-card";

interface CalendarWeekViewProps {
  dfLocale: Locale;
  emptyLabel: string;
  eventsByDate: Record<string, SessionRow[]>;
  getStatusLabel: (status: SessionRow["status"]) => string | undefined;
  isPending: boolean;
  todayLabel: string;
  weekDays: Date[];
}

export function CalendarWeekView({
  dfLocale,
  emptyLabel,
  eventsByDate,
  getStatusLabel,
  isPending,
  todayLabel,
  weekDays,
}: CalendarWeekViewProps) {
  return (
    <>
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
                dayEvents.map(event => {
                  const cfg = TYPE_CONFIG[inferType(event.title)];
                  return (
                    <Link
                      key={event.id}
                      href={`/arena/events/${event.id}`}
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
                          {format(toDate(event.startsAt), "HH:mm")}
                        </span>
                      </div>
                      <p className="font-bold text-[13px] leading-tight text-arena-text truncate">
                        {event.title}
                      </p>
                      <p className="text-[11px] text-arena-text-muted truncate mt-0.5">
                        {event.location}
                      </p>
                    </Link>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

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
                    {todayLabel}
                  </span>
                )}
              </div>
              {dayEvents.length === 0 ? (
                <p className="px-4 text-[12px] text-arena-text-muted/60">
                  {emptyLabel}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayEvents.map(event => (
                    <CalendarEventCard
                      key={event.id}
                      session={event}
                      statusLabel={getStatusLabel(event.status)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
