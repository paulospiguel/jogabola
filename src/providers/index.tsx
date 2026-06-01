"use client";

import type { ReactNode } from "react";
import { PostHogProvider } from "@/providers/posthog-provider";
import CookieConsent from "@/components/cookie-consent";
import { Toaster } from "@/components/ui/toaster";
import QueryClientProvider from "@/providers/query-client.provider";
import { ThemeProvider } from "@/providers/theme.provider";

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
        <PostHogProvider>
          {children}
          <CookieConsent />
          <Toaster />
        </PostHogProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
