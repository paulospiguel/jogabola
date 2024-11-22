import { cn } from "@repo/ui/lib/cn";
import { Logo } from "./logo";
import { Navbar } from "./navbar";
import Notifications from "./notifications";
import LanguageSelector from "./language-selector";

type HeaderProps = {
	className?: string;
};

export function AppHeader({ className }: HeaderProps) {
	return (
		<header className={cn("sticky px-6 flex items-center justify-center w-full  h-[5rem]", className)}>
			<div className="bg-white dark:bg-slate-800 shadow-md flex px-4 h-[60px] w-full rounded-2xl justify-between items-center">
				<Logo size="mini" />
				<div className="flex gap-2">
					<LanguageSelector />
					<Notifications />
					<Navbar />
				</div>
			</div>
		</header>
	);
}
