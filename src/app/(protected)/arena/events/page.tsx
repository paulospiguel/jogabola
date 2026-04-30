import { getEvents } from "@/actions/match-sessions.actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventsListClient } from "./_components/events-list-client";
import type { EventView } from "@/types/events";

export default async function ArenaEventsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? "";

  const result = await getEvents({ organizerId: userId, upcomingOnly: false, limit: 50 });
  const events: EventView[] = result.success ? (result.data ?? []) : [];

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startDate) >= now);
  const past = events.filter((e) => new Date(e.startDate) < now);

  return <EventsListClient upcoming={upcoming} past={past} userId={userId} />;
}
