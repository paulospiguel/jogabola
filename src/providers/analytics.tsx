"use client";

import { useClientAsyncInit } from "@statsig/react-bindings";
import { StatsigSessionReplayPlugin } from "@statsig/session-replay";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type AnalyticsEventClient,
  type AnalyticsLogEvent,
  applyAnalyticsConsent,
  createConsentGatedLogger,
} from "@/lib/analytics-client-gate";
import { AnalyticsLifecycleController } from "@/lib/analytics-lifecycle";
import { useSession } from "@/lib/auth-client";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  CONSENT_SETTINGS_COOKIE,
  getAnalyticsConsentFromStorageChange,
  getStoredAnalyticsConsent,
  scheduleAnalyticsConsentExpiry,
} from "@/lib/consent";

type BrowserStatsigClient = ReturnType<typeof useClientAsyncInit>["client"];
interface AnalyticsContextValue {
  analyticsAllowed: boolean;
  logEvent: AnalyticsLogEvent;
}

const AnalyticsConsentContext = createContext<AnalyticsContextValue>({
  analyticsAllowed: false,
  logEvent: () => undefined,
});

export function useAnalytics() {
  return useContext(AnalyticsConsentContext);
}

export function useAnalyticsConsent() {
  return useAnalytics().analyticsAllowed;
}

function StatsigRuntime({
  enabled,
  onClientChange,
  onLifecycleFailure,
  userID,
}: {
  enabled: boolean;
  onClientChange: (client: BrowserStatsigClient | null) => void;
  onLifecycleFailure: () => void;
  userID: string;
}) {
  const { client } = useClientAsyncInit(
    process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY || "",
    { userID },
    {
      plugins: [
        new StatsigAutoCapturePlugin(),
        new StatsigSessionReplayPlugin(),
      ],
    },
  );
  const lifecycleRef = useRef<{
    client: typeof client;
    controller: AnalyticsLifecycleController;
  } | null>(null);
  if (!lifecycleRef.current || lifecycleRef.current.client !== client) {
    lifecycleRef.current = {
      client,
      controller: new AnalyticsLifecycleController(client),
    };
  }
  const lifecycle = lifecycleRef.current.controller;

  useEffect(() => {
    onClientChange(client);
    return () => onClientChange(null);
  }, [client, onClientChange]);

  useEffect(() => {
    void lifecycle.transition({ enabled, userID }).catch(() => {
      console.error("[Statsig] Client lifecycle transition failed.");
      onLifecycleFailure();
    });
  }, [enabled, lifecycle, onLifecycleFailure, userID]);

  return null;
}

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [hasActivatedAnalytics, setHasActivatedAnalytics] = useState(false);
  const consentRef = useRef(false);
  const analyticsClientRef = useRef<AnalyticsEventClient | null>(null);
  const userID = session?.user?.id ?? "anonymous";
  const hasClientKey = Boolean(process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY);

  const handleClientChange = useCallback(
    (client: BrowserStatsigClient | null) => {
      analyticsClientRef.current = client;
    },
    [],
  );
  const commitConsent = useCallback((allowed: boolean) => {
    applyAnalyticsConsent(consentRef, allowed, setAnalyticsAllowed);
    if (allowed) setHasActivatedAnalytics(true);
  }, []);
  const handleLifecycleFailure = useCallback(() => {
    commitConsent(false);
  }, [commitConsent]);
  const logEvent = useMemo<AnalyticsLogEvent>(
    () => createConsentGatedLogger(consentRef, analyticsClientRef),
    [],
  );

  useEffect(() => {
    let stopExpiryTimer: () => void = () => undefined;

    const scheduleExpiry = () => {
      stopExpiryTimer();
      stopExpiryTimer = scheduleAnalyticsConsentExpiry(
        localStorage.getItem(CONSENT_SETTINGS_COOKIE),
        () => commitConsent(false),
      );
    };
    const syncConsent = () => {
      commitConsent(getStoredAnalyticsConsent(localStorage));
      scheduleExpiry();
    };
    const syncConsentFromAnotherTab = (event: StorageEvent) => {
      const nextConsent = getAnalyticsConsentFromStorageChange(event);
      if (nextConsent !== null) {
        commitConsent(nextConsent);
        scheduleExpiry();
      }
    };
    const revalidateVisibleConsent = () => {
      commitConsent(getStoredAnalyticsConsent(localStorage));
      scheduleExpiry();
    };
    const revalidateWhenVisible = () => {
      if (document.visibilityState === "visible") revalidateVisibleConsent();
    };

    syncConsent();
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, syncConsent);
    window.addEventListener("storage", syncConsentFromAnotherTab);
    window.addEventListener("focus", revalidateVisibleConsent);
    document.addEventListener("visibilitychange", revalidateWhenVisible);
    return () => {
      stopExpiryTimer();
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, syncConsent);
      window.removeEventListener("storage", syncConsentFromAnotherTab);
      window.removeEventListener("focus", revalidateVisibleConsent);
      document.removeEventListener("visibilitychange", revalidateWhenVisible);
    };
  }, [commitConsent]);

  const contextValue = useMemo(
    () => ({ analyticsAllowed, logEvent }),
    [analyticsAllowed, logEvent],
  );

  return (
    <AnalyticsConsentContext.Provider value={contextValue}>
      {children}
      {hasActivatedAnalytics && hasClientKey ? (
        <StatsigRuntime
          enabled={analyticsAllowed}
          onClientChange={handleClientChange}
          onLifecycleFailure={handleLifecycleFailure}
          userID={userID}
        />
      ) : null}
    </AnalyticsConsentContext.Provider>
  );
}
