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
type AnalyticsLogEvent = (
  eventName: string,
  value?: string | number,
  metadata?: Record<string, string>,
) => void;

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
  onClientChange,
  userID,
}: {
  onClientChange: (client: BrowserStatsigClient | null) => void;
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
    const applyState = (enabled: boolean) => {
      void lifecycle.transition({ enabled, userID }).catch(() => {
        console.error("[Statsig] Client lifecycle transition failed.");
      });
    };
    const stopAnalyticsWhenRevoked = () => {
      if (!getStoredAnalyticsConsent(localStorage)) applyState(false);
    };
    const stopAnalyticsFromAnotherTab = (event: StorageEvent) => {
      if (getAnalyticsConsentFromStorageChange(event) === false) {
        applyState(false);
      }
    };

    applyState(true);
    window.addEventListener(
      ANALYTICS_CONSENT_CHANGE_EVENT,
      stopAnalyticsWhenRevoked,
    );
    window.addEventListener("storage", stopAnalyticsFromAnotherTab);
    return () => {
      window.removeEventListener(
        ANALYTICS_CONSENT_CHANGE_EVENT,
        stopAnalyticsWhenRevoked,
      );
      window.removeEventListener("storage", stopAnalyticsFromAnotherTab);
    };
  }, [lifecycle, userID]);

  return null;
}

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const analyticsClientRef = useRef<BrowserStatsigClient | null>(null);
  const userID = session?.user?.id ?? "anonymous";
  const hasClientKey = Boolean(process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY);

  const handleClientChange = useCallback(
    (client: BrowserStatsigClient | null) => {
      analyticsClientRef.current = client;
    },
    [],
  );
  const logEvent = useCallback<AnalyticsLogEvent>(
    (eventName, value, metadata) => {
      analyticsClientRef.current?.logEvent(eventName, value, metadata);
    },
    [],
  );

  useEffect(() => {
    let stopExpiryTimer: () => void = () => undefined;

    const scheduleExpiry = () => {
      stopExpiryTimer();
      stopExpiryTimer = scheduleAnalyticsConsentExpiry(
        localStorage.getItem(CONSENT_SETTINGS_COOKIE),
        () => window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGE_EVENT)),
      );
    };
    const syncConsent = () => {
      setAnalyticsAllowed(getStoredAnalyticsConsent(localStorage));
      scheduleExpiry();
    };
    const syncConsentFromAnotherTab = (event: StorageEvent) => {
      const nextConsent = getAnalyticsConsentFromStorageChange(event);
      if (nextConsent !== null) {
        setAnalyticsAllowed(nextConsent);
        scheduleExpiry();
      }
    };
    const revalidateVisibleConsent = () => {
      if (!getStoredAnalyticsConsent(localStorage)) {
        window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGE_EVENT));
        return;
      }

      setAnalyticsAllowed(true);
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
  }, []);

  const contextValue = useMemo(
    () => ({ analyticsAllowed, logEvent }),
    [analyticsAllowed, logEvent],
  );

  return (
    <AnalyticsConsentContext.Provider value={contextValue}>
      {children}
      {analyticsAllowed && hasClientKey ? (
        <StatsigRuntime onClientChange={handleClientChange} userID={userID} />
      ) : null}
    </AnalyticsConsentContext.Provider>
  );
}
