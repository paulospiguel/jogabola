import { headers } from "next/headers";
import { getEvent } from "@/actions/match-sessions.actions";
import { auth } from "@/lib/auth";
import { EventDetailClient } from "./_components/event-detail-client";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ArenaEventDetailPage({ params }: Params) {
  const { id } = await params;
  const eventId = Number.parseInt(id, 10);

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? "";

  const result = await getEvent(eventId);
  const event = result.success ? result.data : null;

  if (!event) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0B0F14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#A7B0BE",
          fontSize: 14,
        }}
      >
        Evento não encontrado.
      </div>
    );
  }

  return <EventDetailClient event={event} userId={userId} />;
}
