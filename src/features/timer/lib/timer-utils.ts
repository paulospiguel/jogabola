import { GamePart, TimerMode, type AppSettings, type GameEvent } from "@/types/timer";

export const DEFAULT_TIMER_STORAGE_VERSION = 1;

type PersistedTimerPayload<T> = {
  version: number;
  value: T;
};

export function readPersistedTimerValue<T>(
  key: string,
  fallback: T,
  version = DEFAULT_TIMER_STORAGE_VERSION,
) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue) as T | PersistedTimerPayload<T>;
    if (
      parsedValue &&
      typeof parsedValue === "object" &&
      "version" in parsedValue &&
      "value" in parsedValue
    ) {
      return parsedValue.version === version ? parsedValue.value : fallback;
    }

    return parsedValue as T;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
}

export function writePersistedTimerValue<T>(
  key: string,
  value: T,
  version = DEFAULT_TIMER_STORAGE_VERSION,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: PersistedTimerPayload<T> = { version, value };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

export function getTimerValueForPart(
  settings: AppSettings,
  partTimes: Partial<Record<GamePart, number>>,
  gamePart: GamePart,
) {
  const existingTime = partTimes[gamePart];
  if (existingTime !== undefined) {
    return existingTime;
  }

  return settings.timerMode === TimerMode.COUNT_DOWN ||
    settings.timerMode === TimerMode.LOOP
    ? settings.durations[gamePart]
    : 0;
}

export function formatTimerValue(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function getElapsedSeconds(
  timerMode: TimerMode,
  duration: number,
  time: number,
) {
  return timerMode === TimerMode.COUNT_UP ? time : duration - time;
}

export function getTimerColor(
  timerMode: TimerMode,
  targetDuration: number,
  time: number,
) {
  if (timerMode === TimerMode.COUNT_UP) {
    return time > targetDuration ? "#ef4444" : "#3b82f6";
  }

  return time < 60 ? "#ef4444" : "#3b82f6";
}

export function createGameEventId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);
}

export function updateEventTimestamp(
  events: GameEvent[],
  eventId: string,
  nextSeconds: number,
) {
  return events.map((event) =>
    event.id === eventId
      ? {
          ...event,
          timestamp: nextSeconds,
          formattedTime: formatTimerValue(nextSeconds),
        }
      : event,
  );
}
