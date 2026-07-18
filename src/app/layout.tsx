import "@/styles/globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { MAIN_DOMAIN } from "@/configs";
import { cn, getUserLocale } from "@/lib/utils";
import { Providers } from "@/providers";
import { fonts } from "../styles/fonts";

export const preferredRegion = ["fra1", "sfo1", "iad1"];
export const maxDuration = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("company");
  const title = t("name");
  const description = t("slogan");
  const siteUrl = `https://${MAIN_DOMAIN}`;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    icons: {
      icon: "/favicon.png",
      apple: "/favicon.png",
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: title,
      locale: "pt_PT",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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
        <Script id="sw-registration" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`}
        </Script>
      </body>
    </html>
  );
}
