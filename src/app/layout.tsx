import "@/styles/globals.css";
import { fonts } from "../styles/fonts";

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import { auth } from "@auth";
import { cn } from "@/utils";
import { getUserLocale } from "@/services/locale";
import { Providers } from "./providers";

export const preferredRegion = ["fra1", "sfo1", "iad1"];
export const maxDuration = 60;

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
  const dictionary = await getMessages();
  const locale = await getUserLocale();

  return (
    <html lang={locale}>
      <body className={cn("antialiased", fonts)} suppressHydrationWarning>
        <NextIntlClientProvider messages={dictionary}>
          <SessionProvider session={session}>
            <Providers>{children}</Providers>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
