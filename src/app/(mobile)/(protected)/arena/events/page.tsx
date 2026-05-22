import { getEvents } from "@/actions/match-sessions.actions";
import type { EventView } from "@/types/events";
import { EventsList } from "./_components/events-list";

export default async function ArenaEventsPage() {
  const result = await getEvents({
    upcomingOnly: false,
    limit: 50,
  });
  const events: EventView[] = result.success ? (result.data ?? []) : [];

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.startDate) >= now);
  const past = events.filter(e => new Date(e.startDate) < now);

  return <EventsList upcoming={upcoming} past={past} />;
}
