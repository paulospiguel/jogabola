export interface MutableRef<T> {
  current: T;
}

export interface AnalyticsEventClient {
  logEvent(
    eventName: string,
    value?: string | number,
    metadata?: Record<string, string>,
  ): unknown;
}

export type AnalyticsLogEvent = (
  eventName: string,
  value?: string | number,
  metadata?: Record<string, string>,
) => void;

export function applyAnalyticsConsent(
  consentRef: MutableRef<boolean>,
  nextConsent: boolean,
  commitState: (allowed: boolean) => void,
): void {
  consentRef.current = nextConsent;
  commitState(nextConsent);
}

export function createConsentGatedLogger(
  consentRef: MutableRef<boolean>,
  clientRef: MutableRef<AnalyticsEventClient | null>,
): AnalyticsLogEvent {
  return (eventName, value, metadata) => {
    if (!consentRef.current) return;
    clientRef.current?.logEvent(eventName, value, metadata);
  };
}
