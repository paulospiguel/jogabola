import { headers } from "next/headers";
import { getEvents } from "@/actions/match-sessions.actions";
import { auth } from "@/lib/auth";
import { EventsListClient } from "./_components/events-list-client";

type ArenaEventListItem = {
  id: number;
  title: string;
  type: string;
  location: string;
  startDate: Date | string;
  status: string | null;
};

export default async function ArenaEventsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? "";

  const result = await getEvents({
    organizerId: userId,
    upcomingOnly: false,
    limit: 50,
  });
  const events: ArenaEventListItem[] = result.success
    ? (result.data ?? []).map(event => ({
        id: event.id,
        title: event.title,
        type: event.type,
        location: event.location,
        startDate: event.startDate,
        status: event.status,
      }))
    : [];

  return <EventsListClient events={events} userId={userId} />;
}
