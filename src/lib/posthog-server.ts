import { PostHog } from "posthog-node";

// Use a singleton pattern to avoid creating multiple instances
// in Next.js Server Actions and Route Handlers
let posthogClient: PostHog | null = null;

export function getPostHogServer() {
  if (posthogClient) {
    return posthogClient;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

  if (!apiKey) {
    console.warn("[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set. Server events will be dropped.");
    return null;
  }

  posthogClient = new PostHog(apiKey, {
    host: host,
    flushAt: 1,
    flushInterval: 0,
  });

  return posthogClient;
}

/**
 * Utility to safely track events from the server side.
 * Fails silently if PostHog is not configured.
 */
export function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  const client = getPostHogServer();
  if (client) {
    client.capture({
      distinctId,
      event,
      properties,
    });
  }
}
