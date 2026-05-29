import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getEventRoster,
  getUserEventAttendanceStatus,
} from "@/actions/attendance.actions";
import { getEventMessages } from "@/actions/event-chat.actions";
import { getEvent } from "@/actions/match-sessions.actions";
import { auth } from "@/lib/auth";
import { userCanAccessTeam } from "@/lib/team-access";
import { EventDetail } from "./_components/event-detail";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ArenaEventDetailPage({ params }: Params) {
  const { id } = await params;
  const eventId = Number.parseInt(id, 10);
  const t = await getTranslations("arenaEvents");

  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) {
    redirect(`/event/${eventId}`);
  }

  const result = await getEvent(eventId);
  const event = result.success ? result.data : null;

  if (!event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-arena-text-muted">
        {t("eventNotFound")}
      </div>
    );
  }

  const rosterResult = await getEventRoster(eventId);
  const roster = rosterResult.success
    ? rosterResult.data
    : { main: [], reserves: [] };

  const chatResult = await getEventMessages(eventId);
  const canChat = chatResult.success;
  const initialChatMessages = chatResult.success ? chatResult.data : [];

  const canAccessTeam = await userCanAccessTeam(user.id, event.teamId);
  if (!canAccessTeam) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-arena-text-muted">
        {t("eventNotFound")}
      </div>
    );
  }

  return (
    <div className="jb-page">
      <div className="jb-page-inner max-w-5xl">
        <EventDetail
          event={event}
          userId={user.id}
          canEdit={true}
          mainRoster={roster.main}
          reservesRoster={roster.reserves}
          canChat={canChat}
          initialChatMessages={initialChatMessages}
          initialMyStatus={await getUserEventAttendanceStatus(eventId, user.id)}
        />
      </div>
    </div>
  );
}
