"use client";

import { I18nProviderClient } from "@/locales/client";
import type { ReactNode } from "react";

import Cookies from "@/components/cookies";
import { ProfileProvider } from "@/context/profile-context";
import QueryClientProvider from "@/providers/query-client.provider";
import { ThemeProvider } from "@/providers/theme.provider";
import { Toaster } from "@repo/ui/components/toaster";

type ProviderProps = {
	locale: string;
	children: ReactNode;
};

export function Providers({ locale, children }: ProviderProps) {
	return (
		<I18nProviderClient locale={locale}>
			<QueryClientProvider>
				<ProfileProvider>
					<ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
						{children}
						<Cookies />
						<Toaster />
					</ThemeProvider>
				</ProfileProvider>
			</QueryClientProvider>
		</I18nProviderClient>
	);
}
