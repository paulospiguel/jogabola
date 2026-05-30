import { NextResponse } from "next/server";
import { getAblyRest } from "@/lib/ably";
import { getAuthUser } from "@/lib/action-helpers";

/** Issues a short-lived Ably token scoped to event chat channels.
 * Keeps ABLY_API_KEY server-side; the browser authenticates via this endpoint. */
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const rest = getAblyRest();
    const tokenRequest = await rest.auth.createTokenRequest({
      clientId: user.id,
      capability: JSON.stringify({
        "event-chat:*": ["subscribe", "history"],
      }),
    });
    return NextResponse.json(tokenRequest);
  } catch (err) {
    console.error("Ably token request failed:", err);
    return NextResponse.json({ error: "ABLY_UNAVAILABLE" }, { status: 500 });
  }
}
