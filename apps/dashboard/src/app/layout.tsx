import "@repo/ui/globals.css";
import "@/styles/globals.css";

import { auth } from "@auth";
import { cn } from "@repo/ui/utils";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { fonts } from "../styles/fonts";
import { Providers } from "./providers";

export const preferredRegion = ["fra1", "sfo1", "iad1"];
export const maxDuration = 60;

export const metadata: Metadata = {
	title: "JogaBola",
	description: "O melhor lugar para encontrar sua malta e jogar uma pelada.",
};

export default async function RootLayout({
	children,
	params: { locale },
}: Readonly<{
	children: React.ReactNode;
	params: { locale: string };
}>) {
	const session = await auth();
	return (
		<html lang={locale}>
			<body className={cn("antialiased", fonts)} suppressHydrationWarning>
				<SessionProvider session={session}>
					<Providers locale={locale}>{children}</Providers>
				</SessionProvider>
			</body>
		</html>
	);
}
