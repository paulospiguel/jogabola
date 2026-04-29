"use client";

import { Analytics } from "@vercel/analytics/react";
import type { ReactNode } from "react";
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
        {children}
        <CookieConsent />
        <Toaster />
        <Analytics />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
