export interface AnalyticsClientLifecycle {
  initializeAsync(): Promise<unknown>;
  updateRuntimeOptions(options: {
    loggingEnabled: "browser-only" | "disabled";
  }): void;
  updateUserAsync(user: { userID: string }): Promise<unknown>;
  shutdown(): Promise<void>;
}

export interface AnalyticsRuntimeState {
  enabled: boolean;
  userID: string;
}

export async function transitionAnalyticsClient(
  client: AnalyticsClientLifecycle,
  previous: AnalyticsRuntimeState,
  next: AnalyticsRuntimeState,
): Promise<void> {
  if (previous.enabled && !next.enabled) {
    client.updateRuntimeOptions({ loggingEnabled: "disabled" });
    await client.shutdown();
    return;
  }

  if (!next.enabled) return;

  if (!previous.enabled) {
    client.updateRuntimeOptions({ loggingEnabled: "browser-only" });
    await client.initializeAsync();
  }

  if (!previous.enabled || previous.userID !== next.userID) {
    await client.updateUserAsync({ userID: next.userID });
  }
}

function statesMatch(
  left: AnalyticsRuntimeState,
  right: AnalyticsRuntimeState,
): boolean {
  return left.enabled === right.enabled && left.userID === right.userID;
}

const INITIAL_RUNTIME_STATE: AnalyticsRuntimeState = {
  enabled: false,
  userID: "anonymous",
};

export class AnalyticsLifecycleController {
  private appliedState: AnalyticsRuntimeState;
  private desiredState: AnalyticsRuntimeState;
  private running: Promise<void> | null = null;

  constructor(
    private readonly client: AnalyticsClientLifecycle,
    initialState: AnalyticsRuntimeState = INITIAL_RUNTIME_STATE,
  ) {
    this.appliedState = { ...initialState };
    this.desiredState = { ...initialState };
  }

  get currentState(): AnalyticsRuntimeState {
    return { ...this.appliedState };
  }

  transition(next: AnalyticsRuntimeState): Promise<void> {
    this.desiredState = { ...next };

    // Privacy must not wait for an in-flight identity or initialization request.
    if (!next.enabled) {
      this.client.updateRuntimeOptions({ loggingEnabled: "disabled" });
    }

    if (!this.running) {
      const run = this.drain();
      this.running = run;
      const clearRunning = () => {
        if (this.running === run) this.running = null;
      };
      void run.then(clearRunning, clearRunning);
    }

    return this.running;
  }

  private async drain(): Promise<void> {
    while (!statesMatch(this.appliedState, this.desiredState)) {
      const target = { ...this.desiredState };
      await transitionAnalyticsClient(this.client, this.appliedState, target);
      this.appliedState = target;
    }
  }
}
