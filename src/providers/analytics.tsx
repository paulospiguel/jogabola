"use client";

import { StatsigProvider, useClientAsyncInit } from "@statsig/react-bindings";
import { StatsigSessionReplayPlugin } from "@statsig/session-replay";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  type AnalyticsRuntimeState,
  transitionAnalyticsClient,
} from "@/lib/analytics-lifecycle";
import { useSession } from "@/lib/auth-client";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  getAnalyticsConsentFromStorageChange,
  getStoredAnalyticsConsent,
} from "@/lib/consent";

const AnalyticsConsentContext = createContext(false);

export function useAnalyticsConsent() {
  return useContext(AnalyticsConsentContext);
}

function StatsigClientProvider({
  children,
  userID,
}: {
  children: React.ReactNode;
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
  const runtimeState = useRef<AnalyticsRuntimeState>({
    enabled: false,
    userID,
  });

  useEffect(() => {
    const applyState = (next: AnalyticsRuntimeState) => {
      const previous = runtimeState.current;
      runtimeState.current = next;
      void transitionAnalyticsClient(client, previous, next).catch(() => {
        console.error("[Statsig] Client lifecycle transition failed.");
      });
    };
    const stopAnalyticsWhenRevoked = () => {
      if (!getStoredAnalyticsConsent(localStorage)) {
        applyState({ enabled: false, userID: runtimeState.current.userID });
      }
    };
    const stopAnalyticsFromAnotherTab = (event: StorageEvent) => {
      if (getAnalyticsConsentFromStorageChange(event) === false) {
        applyState({ enabled: false, userID: runtimeState.current.userID });
      }
    };

    applyState({ enabled: true, userID });

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
  }, [client, userID]);

  return (
    <StatsigProvider client={client} loadingComponent={children}>
      {children}
    </StatsigProvider>
  );
}

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const userID = session?.user?.id ?? "anonymous";
  const hasClientKey = Boolean(process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY);

  useEffect(() => {
    const syncConsent = () => {
      setAnalyticsAllowed(getStoredAnalyticsConsent(localStorage));
    };
    const syncConsentFromAnotherTab = (event: StorageEvent) => {
      const nextConsent = getAnalyticsConsentFromStorageChange(event);
      if (nextConsent !== null) setAnalyticsAllowed(nextConsent);
    };

    syncConsent();
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, syncConsent);
    window.addEventListener("storage", syncConsentFromAnotherTab);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, syncConsent);
      window.removeEventListener("storage", syncConsentFromAnotherTab);
    };
  }, []);

  return (
    <AnalyticsConsentContext.Provider value={analyticsAllowed}>
      {analyticsAllowed && hasClientKey ? (
        <StatsigClientProvider userID={userID}>
          {children}
        </StatsigClientProvider>
      ) : (
        children
      )}
    </AnalyticsConsentContext.Provider>
  );
}
