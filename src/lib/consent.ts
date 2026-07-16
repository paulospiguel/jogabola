export const CONSENT_SETTINGS_COOKIE = "cookie-consent-settings";
export const ANALYTICS_CONSENT_CHANGE_EVENT = "jb:analytics-consent-change";

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

export function parseAnalyticsConsent(
  value: string | null | undefined,
): boolean {
  if (!value) return false;

  const parsed = parseConsentValue(value);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return false;
  }

  return (parsed as Record<string, unknown>).analytics === true;
}

interface ConsentStorage {
  getItem(key: string): string | null;
}

export function getStoredAnalyticsConsent(storage: ConsentStorage): boolean {
  try {
    return parseAnalyticsConsent(storage.getItem(CONSENT_SETTINGS_COOKIE));
  } catch {
    return false;
  }
}
