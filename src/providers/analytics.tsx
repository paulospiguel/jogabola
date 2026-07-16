"use client";

import { StatsigProvider, useClientAsyncInit } from "@statsig/react-bindings";
import { StatsigSessionReplayPlugin } from "@statsig/session-replay";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
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

  useEffect(() => {
    const stopAnalyticsWhenRevoked = () => {
      if (!getStoredAnalyticsConsent(localStorage)) {
        void client.shutdown();
      }
    };

    window.addEventListener(
      ANALYTICS_CONSENT_CHANGE_EVENT,
      stopAnalyticsWhenRevoked,
    );
    return () =>
      window.removeEventListener(
        ANALYTICS_CONSENT_CHANGE_EVENT,
        stopAnalyticsWhenRevoked,
      );
  }, [client]);

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

    syncConsent();
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, syncConsent);
    return () =>
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, syncConsent);
  }, []);

  return (
    <AnalyticsConsentContext.Provider value={analyticsAllowed}>
      {analyticsAllowed && hasClientKey ? (
        <StatsigClientProvider key={userID} userID={userID}>
          {children}
        </StatsigClientProvider>
      ) : (
        children
      )}
    </AnalyticsConsentContext.Provider>
  );
}
