import { headers } from "next/headers";
import { getEvent } from "@/actions/match-sessions.actions";
import { getUserEventAttendanceStatus } from "@/actions/attendance.actions";
import { auth } from "@/lib/auth";
import { AthleteEventDetail } from "./_components/athlete-event-detail";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function AthleteEventPage({ params }: Params) {
  const { id } = await params;
  const eventId = Number.parseInt(id, 10);

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? "";
  const userName = session?.user?.name ?? "";

  const result = await getEvent(eventId);
  const event = result.success ? result.data : null;

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-arena-bg">
        <p className="text-arena-text-muted text-sm">Evento não encontrado.</p>
      </div>
    );
  }

  const myStatus = userId
    ? await getUserEventAttendanceStatus(eventId, userId)
    : null;

  return (
    <AthleteEventDetail
      event={event}
      userId={userId}
      userName={userName}
      initialMyStatus={myStatus}
    />
  );
}
