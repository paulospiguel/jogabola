import { Statsig, StatsigUser } from "@statsig/statsig-node-core";
import { cookies } from "next/headers";
import { CONSENT_SETTINGS_COOKIE, parseAnalyticsConsent } from "@/lib/consent";

let clientPromise: Promise<Statsig | null> | null = null;
let warnedMissingKey = false;
const INIT_TIMEOUT_MS = 250;
const FLUSH_TIMEOUT_MS = 250;

async function initializeWithTimeout(client: Statsig): Promise<Statsig | null> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      client.initialize().then(() => client),
      new Promise<null>(resolve => {
        timeout = setTimeout(() => resolve(null), INIT_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function getStatsigClient(): Promise<Statsig | null> {
  const key = process.env.STATSIG_SERVER_SECRET_KEY;
  if (!key) {
    if (!warnedMissingKey) {
      console.warn(
        "[Statsig] STATSIG_SERVER_SECRET_KEY is not set. Server events will be dropped.",
      );
      warnedMissingKey = true;
    }
    return Promise.resolve(null);
  }

  if (!clientPromise) {
    const client = new Statsig(key, { initTimeoutMs: INIT_TIMEOUT_MS });
    clientPromise = initializeWithTimeout(client)
      .then(initializedClient => {
        if (!initializedClient) {
          console.error("[Statsig] Server SDK initialization timed out.");
          clientPromise = null;
        }
        return initializedClient;
      })
      .catch(() => {
        console.error("[Statsig] Server SDK initialization failed.");
        clientPromise = null;
        return null;
      });
  }
  return clientPromise;
}

function toMetadata(properties?: Record<string, unknown>) {
  if (!properties) return undefined;
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      if (
        value == null ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        return [key, value];
      }
      return [key, JSON.stringify(value)];
    }),
  );
}

async function flushEventsWithTimeout(client: Statsig): Promise<void> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      client.flushEvents(),
      new Promise<void>(resolve => {
        timeout = setTimeout(resolve, FLUSH_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function hasAnalyticsConsent(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return parseAnalyticsConsent(
      cookieStore.get(CONSENT_SETTINGS_COOKIE)?.value,
    );
  } catch {
    return false;
  }
}

export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  if (!(await hasAnalyticsConsent())) return;

  const client = await getStatsigClient();
  if (!client) return;

  try {
    client?.logEvent(
      new StatsigUser({ userID: distinctId }),
      event,
      null,
      toMetadata(properties),
    );
    await flushEventsWithTimeout(client);
  } catch {
    console.error("[Statsig] Server event delivery failed.");
  }
}
