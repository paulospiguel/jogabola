import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getEventRoster,
  getUserEventAttendanceStatus,
} from "@/actions/attendance.actions";
import { getEventMessages } from "@/actions/event-chat.actions";
import { getEvent } from "@/actions/match-sessions.actions";
import { LockedTeamProvider } from "@/components/arena/locked-team-context";
import { auth } from "@/lib/auth";
import { userCanAccessTeam, userIsTeamOwner } from "@/lib/team-access";
import { EventDetail } from "./_components/event-detail";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ArenaEventDetailPage({ params }: Params) {
  const { id } = await params;
  // id can be slug or numeric id
  const eventIdOrSlug = id;
  const t = await getTranslations("arenaEvents");

  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  // Fetch event first so we have the slug and id
  const result = await getEvent(eventIdOrSlug);
  const event = result.success ? result.data : null;

  if (!event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-arena-text-muted">
        {t("eventNotFound")}
      </div>
    );
  }

  const eventId = event.id;

  if (!user) {
    redirect(`/event/${event.slug || event.id}`);
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

  // Only the team owner (captain) can edit/manage the event
  const canEdit = await userIsTeamOwner(user.id, event.teamId);

  return (
    <div className="jb-page" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="jb-page-inner max-w-5xl">
        <LockedTeamProvider teamId={event.teamId}>
          <EventDetail
            event={event}
            userId={user.id}
            canEdit={canEdit}
            mainRoster={roster.main}
            canChat={canChat}
            initialChatMessages={initialChatMessages}
            initialMyStatus={
              await getUserEventAttendanceStatus(eventId, user.id)
            }
          />
        </LockedTeamProvider>
      </div>
    </div>
  );
}
