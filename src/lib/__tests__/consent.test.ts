import { describe, expect, it } from "vitest";
import {
  getStoredAnalyticsConsent,
  parseAnalyticsConsent,
} from "@/lib/consent";

describe("parseAnalyticsConsent", () => {
  it("denies analytics when no preference exists", () => {
    expect(parseAnalyticsConsent(undefined)).toBe(false);
    expect(parseAnalyticsConsent(null)).toBe(false);
    expect(parseAnalyticsConsent("")).toBe(false);
  });

  it("denies analytics when the preference is invalid JSON", () => {
    expect(parseAnalyticsConsent("not-json")).toBe(false);
  });

  it("denies analytics when analytics is explicitly false", () => {
    expect(parseAnalyticsConsent('{"analytics":false}')).toBe(false);
  });

  it("allows analytics only when analytics is explicitly true", () => {
    expect(parseAnalyticsConsent('{"analytics":true}')).toBe(true);
  });

  it("supports URI-encoded cookie values", () => {
    expect(
      parseAnalyticsConsent(
        encodeURIComponent('{"functional":true,"analytics":true}'),
      ),
    ).toBe(true);
  });

  it.each([
    "true",
    "[]",
    '"analytics"',
    "42",
    "null",
    '{"analytics":"true"}',
    '{"analytics":1}',
    '{"settings":{"analytics":true}}',
  ])("denies unexpected preference format %s", value => {
    expect(parseAnalyticsConsent(value)).toBe(false);
  });
});

describe("getStoredAnalyticsConsent", () => {
  it("reads the shared preference key from browser storage", () => {
    const storage = {
      getItem: (key: string) =>
        key === "cookie-consent-settings" ? '{"analytics":true}' : null,
    };

    expect(getStoredAnalyticsConsent(storage)).toBe(true);
  });

  it("defaults to denied when browser storage is unavailable", () => {
    const storage = {
      getItem: () => {
        throw new Error("storage unavailable");
      },
    };

    expect(getStoredAnalyticsConsent(storage)).toBe(false);
  });
});
