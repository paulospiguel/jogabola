import { Logo } from "@/components/logo";
import Link from "next/link";
import LanguageSelector from "../language-selector";
import { ThemeToggle } from "../theme-toggle";
import { InputSearch } from "../input-search";
import { Disc, Instagram } from "@repo/ui/icons";
import { DiscordIcon, XTwitter } from "../icons";
import { useTranslations } from "next-intl";

export default function HeaderHome() {
	const t = useTranslations();
	return (
		<header className="w-full flex flex-col gap-4 md:flex-row items-center justify-center space-y-2">
			<div className="flex items-center gap-2 text-lg font-semibold md:text-base">
				<Logo isAnimate size="small" />
			</div>
			<nav className="hidden flex-col gap-6 text-lg w-full font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
				<Link href="#" className="text-foreground transition-colors hover:text-foreground">
					Home
				</Link>
				<Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
					Preços
				</Link>
				<Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
					Como funciona
				</Link>
				<Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
					Buscar um time
				</Link>
				<Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
					Competições
				</Link>
			</nav>
			<div className="flex flex-col md:flex-row w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
				{/* <InputSearch /> */}

				<div className="flex gap-2 ml-auto items-end">
					<Instagram className="w-6 h-6" />
					<DiscordIcon className="w-6 h-6" />
					<XTwitter className="w-6 h-6" />
				</div>
				<div className="flex gap-2">
					{/* <LoginBadge user={session?.user} /> */}
					<ThemeToggle />
					<LanguageSelector />
					<Link
						className="bg-primary shadow-md hover:brightness-110 whitespace-nowrap text-white rounded-full px-4 py-2"
						href="/welcome"
					>
						{t("homePage.getStarted")}
					</Link>
				</div>
			</div>
		</header>
	);
}
