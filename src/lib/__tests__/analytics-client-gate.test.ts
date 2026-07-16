import { describe, expect, it, vi } from "vitest";
import {
  applyAnalyticsConsent,
  createConsentGatedLogger,
} from "@/lib/analytics-client-gate";

describe("analytics client fail-closed gate", () => {
  it("blocks a stale log callback immediately when consent is revoked", () => {
    const consentRef = { current: true };
    const client = { logEvent: vi.fn() };
    const clientRef = { current: client };
    const logEvent = createConsentGatedLogger(consentRef, clientRef);

    consentRef.current = false;
    logEvent("stale_event");

    expect(client.logEvent).not.toHaveBeenCalled();
  });

  it("updates the consent ref before scheduling React state", () => {
    const consentRef = { current: true };
    const commitState = vi.fn(() => {
      expect(consentRef.current).toBe(false);
    });

    applyAnalyticsConsent(consentRef, false, commitState);

    expect(commitState).toHaveBeenCalledWith(false);
  });

  it("blocks logging when the lifecycle failure handler revokes consent", () => {
    const consentRef = { current: true };
    const client = { logEvent: vi.fn() };
    const logEvent = createConsentGatedLogger(consentRef, { current: client });

    applyAnalyticsConsent(consentRef, false, vi.fn());
    logEvent("event_after_failure");

    expect(client.logEvent).not.toHaveBeenCalled();
  });
});
