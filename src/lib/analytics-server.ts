import { Statsig, StatsigUser } from "@statsig/statsig-node-core";
import { cookies } from "next/headers";
import { CONSENT_SETTINGS_COOKIE, parseAnalyticsConsent } from "@/lib/consent";

let clientPromise: Promise<Statsig | null> | null = null;
let warnedMissingKey = false;

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
    const client = new Statsig(key);
    clientPromise = client
      .initialize()
      .then(() => client)
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
  } catch {
    console.error("[Statsig] Server event logging failed.");
  }
}
