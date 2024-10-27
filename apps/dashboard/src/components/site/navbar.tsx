import { Logo } from "@/components/logo";
import Link from "next/link";
import LanguageSelector from "../language-selector";
import { ThemeToggle } from "../theme-toggle";
import { InputSearch } from "../input-search";

export default function Navbar() {
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
			<div className="flex flex-col md:flex-row w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
				<InputSearch />
				<div className="flex gap-2">
					{/* <LoginBadge user={session?.user} /> */}
					<ThemeToggle />
					<LanguageSelector />
				</div>
			</div>
		</header>
	);
}
