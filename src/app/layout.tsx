import "@/styles/globals.css";
import { fonts } from "../styles/fonts";

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { cn } from "@/utils";
import { getUserLocale } from "@/services/locale";
import { Providers } from "@/providers";
import { COMPANY, TRANSLATION_KEYS } from "@/constants/app";


export const preferredRegion = ["fra1", "sfo1", "iad1"];
export const maxDuration = 60;

// Solução para metadados estáticos multilíngues
// Em uma implementação completa, seria necessário usar o middleware
// ou route handlers para definir os metadados dinamicamente por idioma
export const metadata: Metadata = {
  title: COMPANY.NAME,
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
    <html lang={locale}>
      <body className={cn("antialiased", fonts)} suppressHydrationWarning>
        <NextIntlClientProvider messages={dictionary}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
