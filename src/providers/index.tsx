"use client";

import type { ReactNode } from "react";
import CookieConsent from "@/components/cookie-consent";
import { Toaster } from "@/components/ui/toaster";
import QueryClientProvider from "@/providers/query-client.provider";
import { ThemeProvider } from "@/providers/theme.provider";
import AnalyticsProvider from "./analytics";

type ProviderProps = {
  children: ReactNode;
};

export function Providers({ children }: ProviderProps) {
  return (
    <QueryClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
        <CookieConsent />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
