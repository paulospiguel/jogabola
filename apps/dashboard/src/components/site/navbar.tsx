import LoginBadge from "@/components/auth/login-badge";
import { Logo } from "@/components/logo";
import { auth } from "@auth";
import { Input } from "@repo/ui/components/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { LanguageToggle } from "../language-toggle";
import { ThemeToggle } from "../theme-toggle";

export default async function Navbar() {
	const session = await auth();

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
				<form className="flex-1 mx-auto w-full sm:flex-initial max-w-screen px-4">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Pesquisa..."
							className="pl-8 sm:w-[300px] md:w-[200px] lg:w-full rounded-full"
						/>
					</div>
				</form>
				<div className="flex gap-2">
					{/* <LoginBadge user={session?.user} /> */}
					<ThemeToggle />
					<LanguageToggle />
				</div>
			</div>
		</header>
	);
}
