import { Statsig, StatsigUser } from "@statsig/statsig-node-core";
import { cookies } from "next/headers";
import { CONSENT_SETTINGS_COOKIE, parseAnalyticsConsent } from "@/lib/consent";

const INIT_TIMEOUT_MS = 250;
const FLUSH_TIMEOUT_MS = 250;
const RETRY_COOLDOWN_MS = 30_000;

interface ServerClientState {
  client: Statsig;
  generation: number;
  initialization: Promise<Statsig | null>;
  key: string;
  retryAfter: number;
  status: "initializing" | "ready" | "cooldown";
}

interface FlushState {
  client: Statsig;
  coveredRequest: number;
  generation: number;
  operation: Promise<unknown>;
  retryAfter: number;
  status: "pending" | "cooldown";
}

interface WaitResult<T> {
  timedOut: boolean;
  value: T | null;
}

let clientGeneration = 0;
let clientState: ServerClientState | null = null;
let flushGeneration = 0;
let flushedRequest = 0;
let flushRequest = 0;
let flushState: FlushState | null = null;
let warnedMissingKey = false;

async function waitWithTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<WaitResult<T>> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation.then(value => ({ timedOut: false, value })),
      new Promise<WaitResult<T>>(resolve => {
        timeout = setTimeout(
          () => resolve({ timedOut: true, value: null }),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function putClientOnCooldown(state: ServerClientState): void {
  if (clientState !== state) return;
  state.status = "cooldown";
  state.retryAfter = Date.now() + RETRY_COOLDOWN_MS;
  state.generation += 1;
}

function createClientState(key: string): ServerClientState {
  const client = new Statsig(key, { initTimeoutMs: INIT_TIMEOUT_MS });
  const generation = ++clientGeneration;
  const state: ServerClientState = {
    client,
    generation,
    initialization: Promise.resolve(null),
    key,
    retryAfter: 0,
    status: "initializing",
  };
  clientState = state;

  try {
    state.initialization = client
      .initialize()
      .then(() => {
        if (
          clientState === state &&
          state.generation === generation &&
          state.status === "initializing"
        ) {
          state.status = "ready";
          return client;
        }
        return null;
      })
      .catch(() => {
        if (clientState === state && state.generation === generation) {
          putClientOnCooldown(state);
          console.error("[Statsig] Server SDK initialization failed.");
        }
        return null;
      });
  } catch {
    putClientOnCooldown(state);
    state.initialization = Promise.resolve(null);
    console.error("[Statsig] Server SDK initialization failed.");
  }

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
  } else if (state.status === "cooldown") {
    if (Date.now() < state.retryAfter) return null;
    state = createClientState(key);
  }

  if (state.status === "ready") return state.client;

  const result = await waitWithTimeout(state.initialization, INIT_TIMEOUT_MS);
  if (result.timedOut) {
    putClientOnCooldown(state);
    return null;
  }
  return result.value;
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

function putFlushOnCooldown(state: FlushState): void {
  if (flushState !== state) return;
  state.status = "cooldown";
  state.retryAfter = Date.now() + RETRY_COOLDOWN_MS;
  state.generation += 1;
}

function createFlushState(client: Statsig): FlushState {
  const generation = ++flushGeneration;
  const state: FlushState = {
    client,
    coveredRequest: flushRequest,
    generation,
    operation: Promise.resolve(),
    retryAfter: 0,
    status: "pending",
  };
  flushState = state;

  let flushOperation: Promise<unknown>;
  try {
    flushOperation = client.flushEvents();
  } catch (error) {
    putFlushOnCooldown(state);
    throw error;
  }

  const operation = flushOperation.then(
    value => {
      if (
        flushState === state &&
        state.generation === generation &&
        state.status === "pending"
      ) {
        flushedRequest = Math.max(flushedRequest, state.coveredRequest);
        flushState = null;
      }
      return value;
    },
    error => {
      if (flushState === state && state.generation === generation) {
        putFlushOnCooldown(state);
      }
      throw error;
    },
  );
  state.operation = operation;
  void operation.catch(() => undefined);
  return state;
}

async function flushEventsWithTimeout(client: Statsig): Promise<void> {
  const requestedFlush = ++flushRequest;

  while (flushedRequest < requestedFlush) {
    let state = flushState;
    if (!state || state.client !== client) {
      state = createFlushState(client);
    } else if (state.status === "cooldown") {
      if (Date.now() < state.retryAfter) return;
      state = createFlushState(client);
    }

    const result = await waitWithTimeout(state.operation, FLUSH_TIMEOUT_MS);
    if (result.timedOut) {
      putFlushOnCooldown(state);
      return;
    }
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
