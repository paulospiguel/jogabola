import { Statsig, StatsigUser } from "@statsig/statsig-node-core";

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
      .catch(error => {
        console.error("[Statsig] Server SDK initialization failed:", error);
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

export function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): void {
  void getStatsigClient().then(client => {
    client?.logEvent(
      new StatsigUser({ userID: distinctId }),
      event,
      null,
      toMetadata(properties),
    );
  });
}
