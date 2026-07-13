import { NextResponse } from "next/server";
import { canParticipateInChat } from "@/actions/event-chat.actions";
import { getAblyRest } from "@/lib/ably";
import { getAuthUser } from "@/lib/action-helpers";

/** Issues a short-lived Ably token scoped to event chat channels.
 * Keeps ABLY_API_KEY server-side; the browser authenticates via this endpoint. */
export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const eventId = Number(new URL(req.url).searchParams.get("eventId"));
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return NextResponse.json({ error: "INVALID_EVENT_ID" }, { status: 400 });
  }
  if (!(await canParticipateInChat(eventId, user.id))) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const rest = getAblyRest();
    const tokenRequest = await rest.auth.createTokenRequest({
      clientId: user.id,
      capability: JSON.stringify({
        [`event-chat:${eventId}`]: ["subscribe", "history"],
      }),
    });
    return NextResponse.json(tokenRequest);
  } catch (err) {
    console.error("Ably token request failed:", err);
    return NextResponse.json({ error: "ABLY_UNAVAILABLE" }, { status: 500 });
  }
}
