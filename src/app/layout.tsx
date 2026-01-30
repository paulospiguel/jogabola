import "@/styles/globals.css";
import { fonts } from "../styles/fonts";

import { COMPANY } from "@/constants/app";
import { Providers } from "@/providers";
import { cn, getUserLocale } from "@/lib/utils";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const preferredRegion = ["fra1", "sfo1", "iad1"];
export const maxDuration = 60;

export const metadata: Metadata = {
  title: COMPANY.NAME || "JogaBola",
  description: COMPANY.SLOGAN,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dictionary = await getMessages();
  const locale = await getUserLocale();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen antialiased",
          fonts,
        )}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={dictionary}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
