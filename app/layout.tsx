import { auth } from "@/auth";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Concert_One, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const consertOne = Concert_One({ subsets: ["latin"], weight: ["400"], variable: "--font-concert-one" });
const fonts = [consertOne, inter].map((font) => font.variable).join(" ");

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
			<body className={cn(fonts)} suppressHydrationWarning>
				<SessionProvider session={session}>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						{children}
					</ThemeProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
