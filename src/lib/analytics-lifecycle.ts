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
  private generation = 0;

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
    this.generation += 1;

    // Privacy must not wait for an in-flight identity or initialization request.
    if (!next.enabled) {
      this.client.updateRuntimeOptions({ loggingEnabled: "disabled" });
    }

    if (!this.running) this.startDrain();

    const running = this.running;
    if (!running) throw new Error("Analytics lifecycle failed to start");
    return running;
  }

  private startDrain(): void {
    // Start on the next microtask so `running` is installed atomically before
    // a second synchronous transition can update the desired state.
    const run = Promise.resolve().then(() => this.drain());
    this.running = run;

    const finish = (succeeded: boolean) => {
      if (this.running !== run) return;
      this.running = null;

      // A transition can arrive while the previous run is settling.
      if (
        succeeded &&
        !statesMatch(this.appliedState, this.desiredState) &&
        !this.running
      ) {
        this.startDrain();
      }
    };
    void run.then(
      () => finish(true),
      () => finish(false),
    );
  }

  private async drain(): Promise<void> {
    try {
      while (!statesMatch(this.appliedState, this.desiredState)) {
        const target = { ...this.desiredState };
        const generation = this.generation;
        await this.applyTransition(target, generation);
      }
    } catch (error) {
      this.client.updateRuntimeOptions({ loggingEnabled: "disabled" });
      this.appliedState = {
        enabled: false,
        userID: this.appliedState.userID,
      };
      this.desiredState = { ...this.appliedState };
      this.generation += 1;
      throw error;
    }
  }

  private async applyTransition(
    target: AnalyticsRuntimeState,
    generation: number,
  ): Promise<void> {
    const previous = this.appliedState;

    if (previous.enabled && !target.enabled) {
      this.client.updateRuntimeOptions({ loggingEnabled: "disabled" });
      await this.client.shutdown();
      this.appliedState = { enabled: false, userID: previous.userID };
      return;
    }

    if (!previous.enabled && target.enabled) {
      this.client.updateRuntimeOptions({ loggingEnabled: "browser-only" });
      await this.client.initializeAsync();
      this.appliedState = { enabled: true, userID: previous.userID };

      if (generation !== this.generation) {
        if (!this.desiredState.enabled) {
          this.client.updateRuntimeOptions({ loggingEnabled: "disabled" });
        } else {
          this.client.updateRuntimeOptions({ loggingEnabled: "browser-only" });
        }
        return;
      }

      await this.client.updateUserAsync({ userID: target.userID });
      this.appliedState = target;
      return;
    }

    if (target.enabled) {
      this.client.updateRuntimeOptions({ loggingEnabled: "browser-only" });
      await this.client.updateUserAsync({ userID: target.userID });
      this.appliedState = target;
      return;
    }

    this.appliedState = target;
  }
}
