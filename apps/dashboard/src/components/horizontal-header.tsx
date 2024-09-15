import { Logo } from "./logo";
import { Navbar } from "./navbar";
import Notifications from "./notifications";

export function AppHeader() {
	return (
		<header className="sticky px-6 flex items-center justify-center w-full bg-transparent h-[10rem]">
			<div className="bg-white dark:bg-slate-800 shadow-md flex px-4 h-[60px] w-full rounded-full justify-between items-center">
				<Logo size="mini" />
				<div className="flex gap-2">
					<Notifications />
					<Navbar />
				</div>
			</div>
		</header>
	);
}
