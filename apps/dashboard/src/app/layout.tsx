import "@jogabola/ui/globals.css";
import "@/styles/globals.css";

import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

import Cookies from "@/components/cookies";
import { ProfileProvider } from "@/context/profile-context";
import QueryClientProvider from "@/providers/query-client-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { fonts } from "@/styles/fonts";
import { cn } from "@/utils";
import { auth } from "@auth";
import { Toaster } from "@jogabola/ui/toaster";

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
		<html lang="pt">
			<body className={cn("antialiased", fonts)} suppressHydrationWarning>
				<QueryClientProvider>
					<SessionProvider session={session}>
						<ProfileProvider>
							<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
