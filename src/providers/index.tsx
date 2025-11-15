"use client";

import type { ReactNode } from "react";
import Cookies from "@/components/cookies";
import QueryClientProvider from "@/providers/query-client.provider";
import { ThemeProvider } from "@/providers/theme.provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react"


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
        <Cookies />
        <Toaster />
        <Analytics />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
