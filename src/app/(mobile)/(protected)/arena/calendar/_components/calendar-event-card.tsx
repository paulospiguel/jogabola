import { EventRow } from "@/components/arena/event-row";
import type { SessionRow } from "../_types/calendar-events";
import { formatDuration, inferType } from "../_utils/calendar-event-utils";

interface CalendarEventCardProps {
  session: SessionRow;
  statusLabel?: string;
}

export function CalendarEventCard({
  session,
  statusLabel,
}: CalendarEventCardProps) {
  return (
    <EventRow
      href={`/arena/events/${session.id}`}
      title={session.title}
      type={inferType(session.title)}
      timeLabel={formatDuration(session.startsAt, session.endsAt)}
      location={session.location}
      statusLabel={statusLabel}
    />
  );
}
