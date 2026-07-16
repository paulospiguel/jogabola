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
