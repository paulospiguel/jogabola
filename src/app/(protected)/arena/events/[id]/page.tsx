import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getEvent } from "@/actions/match-sessions.actions";
import { auth } from "@/lib/auth";
import { EventDetail } from "./_components/event-detail";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ArenaEventDetailPage({ params }: Params) {
  const { id } = await params;
  const eventId = Number.parseInt(id, 10);

  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) {
    redirect("/auth/sign-in");
  }

  const result = await getEvent(eventId);
  const event = result.success ? result.data : null;

  if (!event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-arena-text-muted">
        Evento não encontrado.
      </div>
    );
  }

  // In the arena version, we assume the user has some level of access if they are here
  // We can pass isAdmin=true for now as it's the "Manage" view, 
  // but ideally we check if user is admin of the team.
  
  return (
    <div className="jb-page">
      <div className="jb-page-inner max-w-5xl">
        <EventDetail event={event as any} userId={user.id} canEdit={true} />
      </div>
    </div>
  );
}
