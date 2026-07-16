export const CONSENT_SETTINGS_COOKIE = "cookie-consent-settings";
export const ANALYTICS_CONSENT_CHANGE_EVENT = "jb:analytics-consent-change";
export const CONSENT_VERSION = 2;
export const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

export type ConsentStatus = "accepted" | "declined" | "custom";

export interface ConsentSettings {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentRecord {
  status: ConsentStatus;
  settings: ConsentSettings;
  version: number;
  timestamp: string;
}

interface ConsentStorage {
  getItem(key: string): string | null;
}

interface ConsentStorageChange {
  key: string | null;
  newValue: string | null;
}

function parseConsentValue(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return null;
    }
  }
}

function hasBooleanSettings(value: unknown): value is ConsentSettings {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const settings = value as Record<string, unknown>;
  return (
    typeof settings.functional === "boolean" &&
    typeof settings.analytics === "boolean" &&
    typeof settings.marketing === "boolean"
  );
}

export function parseConsentRecord(
  value: string | null | undefined,
  now = Date.now(),
): ConsentRecord | null {
  if (!value) return null;

  const parsed = parseConsentValue(value);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }

  const candidate = parsed as Record<string, unknown>;
  if (
    candidate.version !== CONSENT_VERSION ||
    !["accepted", "declined", "custom"].includes(String(candidate.status)) ||
    !hasBooleanSettings(candidate.settings) ||
    typeof candidate.timestamp !== "string"
  ) {
    return null;
  }

  const timestamp = Date.parse(candidate.timestamp);
  const age = now - timestamp;
  if (!Number.isFinite(timestamp) || age < 0 || age > CONSENT_MAX_AGE_MS) {
    return null;
  }

  return candidate as unknown as ConsentRecord;
}

export function createConsentRecord(
  status: ConsentStatus,
  settings: ConsentSettings,
  now = new Date(),
): ConsentRecord {
  return {
    status,
    settings: { ...settings },
    version: CONSENT_VERSION,
    timestamp: now.toISOString(),
  };
}

export function parseAnalyticsConsent(
  value: string | null | undefined,
  now = Date.now(),
): boolean {
  return parseConsentRecord(value, now)?.settings.analytics === true;
}

export function getStoredAnalyticsConsent(
  storage: ConsentStorage,
  now = Date.now(),
): boolean {
  try {
    return parseAnalyticsConsent(storage.getItem(CONSENT_SETTINGS_COOKIE), now);
  } catch {
    return false;
  }
}

export function getAnalyticsConsentFromStorageChange(
  change: ConsentStorageChange,
  now = Date.now(),
): boolean | null {
  if (change.key !== null && change.key !== CONSENT_SETTINGS_COOKIE) {
    return null;
  }

  return parseAnalyticsConsent(change.newValue, now);
}
