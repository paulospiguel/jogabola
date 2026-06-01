import "@/styles/globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { APP } from "@/constants/app";
import { cn, getUserLocale } from "@/lib/utils";
import { Providers } from "@/providers";
import { fonts } from "../styles/fonts";

export const preferredRegion = ["fra1", "sfo1", "iad1"];
export const maxDuration = 60;

export const metadata: Metadata = {
  title: APP.APP_NAME,
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
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
          "min-h-screen bg-arena-bg text-arena-text antialiased",
          fonts,
        )}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={dictionary}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`,
          }}
        />
      </body>
    </html>
  );
}
