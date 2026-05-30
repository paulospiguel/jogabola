import Ably from "ably";

let restClient: Ably.Rest | null = null;

/** Server-side Ably REST client. Uses ABLY_API_KEY (never exposed to client). */
export function getAblyRest(): Ably.Rest {
  const key = process.env.ABLY_API_KEY;
  if (!key) {
    throw new Error("ABLY_API_KEY is required");
  }
  if (!restClient) {
    restClient = new Ably.Rest(key);
  }
  return restClient;
}

/** Channel name for an event's chat. */
export function eventChannelName(eventId: number): string {
  return `event-chat:${eventId}`;
}

export const EVENT_CHAT_MESSAGE_EVENT = "message";
