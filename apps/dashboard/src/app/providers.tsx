"use client";

import type { ReactNode } from "react";
import Cookies from "@/components/cookies";
import { ProfileProvider } from "@/context/profile-context";
import QueryClientProvider from "@/providers/query-client.provider";
import { ThemeProvider } from "@/providers/theme.provider";
import { Toaster } from "@repo/ui/components/toaster";

type ProviderProps = {
  children: ReactNode;
};

export function Providers({ children }: ProviderProps) {
  return (
    <QueryClientProvider>
      <ProfileProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Cookies />
          <Toaster />
        </ThemeProvider>
      </ProfileProvider>
    </QueryClientProvider>
  );
}
