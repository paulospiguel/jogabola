import { Statsig, StatsigUser } from "@statsig/statsig-node-core";
import { cookies } from "next/headers";
import { CONSENT_SETTINGS_COOKIE, parseAnalyticsConsent } from "@/lib/consent";

const INIT_TIMEOUT_MS = 250;
const FLUSH_TIMEOUT_MS = 250;
const INIT_RETRY_COOLDOWN_MS = 30_000;

interface ServerClientState {
  client: Statsig;
  initialization: Promise<Statsig | null>;
  key: string;
  retryAfter: number;
  status: "initializing" | "ready" | "failed";
}

interface FlushState {
  client: Statsig;
  operation: Promise<unknown>;
}

let clientState: ServerClientState | null = null;
let flushState: FlushState | null = null;
let warnedMissingKey = false;

async function waitWithTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T | null> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<null>(resolve => {
        timeout = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function createClientState(key: string): ServerClientState {
  const client = new Statsig(key, { initTimeoutMs: INIT_TIMEOUT_MS });
  const state: ServerClientState = {
    client,
    initialization: Promise.resolve(null),
    key,
    retryAfter: 0,
    status: "initializing",
  };

  try {
    state.initialization = client
      .initialize()
      .then(() => {
        state.status = "ready";
        return client;
      })
      .catch(() => {
        state.status = "failed";
        state.retryAfter = Date.now() + INIT_RETRY_COOLDOWN_MS;
        console.error("[Statsig] Server SDK initialization failed.");
        return null;
      });
  } catch {
    state.status = "failed";
    state.retryAfter = Date.now() + INIT_RETRY_COOLDOWN_MS;
    state.initialization = Promise.resolve(null);
    console.error("[Statsig] Server SDK initialization failed.");
  }

  clientState = state;
  return state;
}

async function getStatsigClient(): Promise<Statsig | null> {
  const key = process.env.STATSIG_SERVER_SECRET_KEY;
  if (!key) {
    if (!warnedMissingKey) {
      console.warn(
        "[Statsig] STATSIG_SERVER_SECRET_KEY is not set. Server events will be dropped.",
      );
      warnedMissingKey = true;
    }
    return null;
  }

  let state = clientState;
  if (!state || state.key !== key) {
    state = createClientState(key);
  } else if (state.status === "failed") {
    if (Date.now() < state.retryAfter) return null;
    state = createClientState(key);
  }

  if (state.status === "ready") return state.client;
  return waitWithTimeout(state.initialization, INIT_TIMEOUT_MS);
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
  let state = flushState;
  if (!state || state.client !== client) {
    const operation = client.flushEvents();
    state = { client, operation };
    flushState = state;

    const clearFlush = () => {
      if (flushState === state) flushState = null;
    };
    void operation.then(clearFlush, clearFlush);
  }

  await waitWithTimeout(state.operation, FLUSH_TIMEOUT_MS);
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

  let client: Statsig | null;
  try {
    client = await getStatsigClient();
  } catch {
    console.error("[Statsig] Server SDK setup failed.");
    return;
  }
  if (!client) return;

  try {
    client.logEvent(
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
