import { endOfMonth, startOfMonth, startOfWeek } from "date-fns";
import { getCalendarEvents } from "@/actions/match-sessions.actions";
import { CalendarEvents } from "./_components/calendar-events";

export default async function CalendarioPage() {
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const result = await getCalendarEvents(from, to);
  const events = result.success ? result.data : [];

  return (
    <CalendarEvents
      initialEvents={events}
      initialWeekStart={weekStart.toISOString()}
    />
  );
}
