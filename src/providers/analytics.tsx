"use client";

import { StatsigProvider, useClientAsyncInit } from "@statsig/react-bindings";
import { StatsigSessionReplayPlugin } from "@statsig/session-replay";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";
import type React from "react";

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { client } = useClientAsyncInit(
    "client-HJ4SSDBLbrGjcxYmcMoivZg1yVxutOkjQWuwi0pSK23",
    { userID: "a-user" },
    {
      plugins: [
        new StatsigAutoCapturePlugin(),
        new StatsigSessionReplayPlugin(),
      ],
    },
  );

  return (
    <StatsigProvider client={client} loadingComponent={<div>Loading...</div>}>
      {children}
    </StatsigProvider>
  );
}
