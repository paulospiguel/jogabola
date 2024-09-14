"use client";

import { I18nProviderClient } from "@/locales/client";
import type { ReactNode } from "react";
// import { isDesktopApp } from "@todesktop/client-core/platform/todesktop";
// import { TriggerProvider } from "@trigger.dev/react";

import Cookies from "@/components/cookies";
import { ProfileProvider } from "@/context/profile-context";
import QueryClientProvider from "@/providers/query-client-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@repo/ui/components/toaster";

// We need to import it here because this is the first
// client component
// if (isDesktopApp()) {
// 	require("@/desktop/main");
// }

type ProviderProps = {
	locale: string;
	children: ReactNode;
};

export function Providers({ locale, children }: ProviderProps) {
	return (
		<QueryClientProvider>
			<ProfileProvider>
				<ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
					{children}
					<Cookies />
					<Toaster />
				</ThemeProvider>
			</ProfileProvider>
		</QueryClientProvider>
	);
}

// {/* <I18nProviderClient locale={locale}> */}
// 	{/*<TriggerProvider
//     publicApiKey={process.env.NEXT_PUBLIC_TRIGGER_API_KEY!}
//     apiUrl={process.env.NEXT_PUBLIC_TRIGGER_API_URL}
//   > */}

// {/*</TriggerProvider> */}
// {/* </I18nProviderClient> */}
