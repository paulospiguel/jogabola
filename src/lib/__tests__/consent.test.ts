import { describe, expect, it } from "vitest";
import {
  CONSENT_MAX_AGE_MS,
  CONSENT_SETTINGS_COOKIE,
  CONSENT_VERSION,
  createConsentRecord,
  getAnalyticsConsentFromStorageChange,
  getStoredAnalyticsConsent,
  parseAnalyticsConsent,
  parseConsentRecord,
} from "@/lib/consent";

const NOW = Date.parse("2026-07-16T09:00:00.000Z");
const validSettings = {
  functional: true,
  analytics: true,
  marketing: false,
};

function record(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    status: "custom",
    settings: validSettings,
    version: CONSENT_VERSION,
    timestamp: new Date(NOW).toISOString(),
    ...overrides,
  });
}

describe("parseAnalyticsConsent", () => {
  it("allows a current, unexpired and explicit analytics preference", () => {
    expect(parseAnalyticsConsent(record(), NOW)).toBe(true);
    expect(parseAnalyticsConsent(encodeURIComponent(record()), NOW)).toBe(true);
  });

  it("denies an explicit analytics refusal in a valid record", () => {
    expect(
      parseAnalyticsConsent(
        record({ settings: { ...validSettings, analytics: false } }),
        NOW,
      ),
    ).toBe(false);
  });

  it("denies legacy or incompatible consent versions", () => {
    expect(
      parseAnalyticsConsent(record({ version: CONSENT_VERSION - 1 }), NOW),
    ).toBe(false);
    expect(parseAnalyticsConsent('{"analytics":true}', NOW)).toBe(false);
  });

  it("denies expired consent", () => {
    const expired = new Date(NOW - CONSENT_MAX_AGE_MS - 1).toISOString();

    expect(parseAnalyticsConsent(record({ timestamp: expired }), NOW)).toBe(
      false,
    );
  });

  it.each([
    undefined,
    null,
    "",
    "invalid",
    "not-a-date",
  ])("denies an absent or invalid timestamp %s", timestamp => {
    const value =
      timestamp === undefined
        ? JSON.stringify({
            status: "custom",
            settings: validSettings,
            version: CONSENT_VERSION,
          })
        : record({ timestamp });

    expect(parseAnalyticsConsent(value, NOW)).toBe(false);
  });

  it("denies consent timestamps in the future", () => {
    expect(
      parseAnalyticsConsent(
        record({ timestamp: new Date(NOW + 1).toISOString() }),
        NOW,
      ),
    ).toBe(false);
  });

  it.each([
    undefined,
    null,
    "",
    "not-json",
    "true",
    "[]",
    '"analytics"',
    "42",
    "null",
    record({ status: "unknown" }),
    record({ settings: { analytics: true } }),
    record({ settings: { ...validSettings, analytics: "true" } }),
  ])("denies unexpected preference format %s", value => {
    expect(parseAnalyticsConsent(value, NOW)).toBe(false);
  });
});

describe("consent records", () => {
  it("creates the same versioned proof used by client storage and cookies", () => {
    const created = createConsentRecord("custom", validSettings, new Date(NOW));

    expect(created).toEqual({
      status: "custom",
      settings: validSettings,
      version: CONSENT_VERSION,
      timestamp: "2026-07-16T09:00:00.000Z",
    });
    expect(parseConsentRecord(JSON.stringify(created), NOW)).toEqual(created);
  });

  it("reads a valid shared proof from browser storage", () => {
    const storage = {
      getItem: (key: string) =>
        key === CONSENT_SETTINGS_COOKIE ? record() : null,
    };

    expect(getStoredAnalyticsConsent(storage, NOW)).toBe(true);
  });

  it("defaults to denied when browser storage is unavailable", () => {
    const storage = {
      getItem: () => {
        throw new Error("storage unavailable");
      },
    };

    expect(getStoredAnalyticsConsent(storage, NOW)).toBe(false);
  });
});

describe("cross-tab storage changes", () => {
  it("turns analytics off immediately when another tab revokes consent", () => {
    const revoked = record({
      status: "declined",
      settings: { functional: false, analytics: false, marketing: false },
    });

    expect(
      getAnalyticsConsentFromStorageChange(
        { key: CONSENT_SETTINGS_COOKIE, newValue: revoked },
        NOW,
      ),
    ).toBe(false);
  });

  it("ignores storage events for unrelated keys", () => {
    expect(
      getAnalyticsConsentFromStorageChange(
        { key: "unrelated", newValue: record() },
        NOW,
      ),
    ).toBeNull();
  });
});
