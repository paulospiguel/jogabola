"use client";

import { StatsigProvider, useClientAsyncInit } from "@statsig/react-bindings";
import { StatsigSessionReplayPlugin } from "@statsig/session-replay";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";
import type React from "react";
import { useSession } from "@/lib/auth-client";

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
  const userID = session?.user?.id ?? "anonymous";
  return (
    <StatsigClientProvider key={userID} userID={userID}>
      {children}
    </StatsigClientProvider>
  );
}
