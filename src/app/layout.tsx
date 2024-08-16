import "./globals.css";
import Cookies from "@/components/cookies";
import { Toaster } from "@/components/ui/toaster";
import { ProfileProvider } from "@/context/profile-context";
import { cn } from "@/lib/utils";
import QueryClientProvider from "@/providers/query-client-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

import { auth } from "../../auth";
import { fonts } from "./fonts";

export const metadata: Metadata = {
  title: "JogaBola",
  description: "O melhor lugar para encontrar sua malta e jogar uma pelada.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="pt-BR">
      <body className={cn("antialiased", fonts)} suppressHydrationWarning>
        <QueryClientProvider>
          <SessionProvider session={session}>
            <ProfileProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Cookies />
                <Toaster />
              </ThemeProvider>
            </ProfileProvider>
          </SessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
