import { Logo } from "./logo";
import { Navbar } from "./navbar";
import Notifications from "./notifications";

export function AppHeader() {
	return (
		<header className="sticky px-6 w-full">
			<div className="bg-gray-800 shadow-md flex min-h-[40px] px-4 w-full my-4 rounded-full justify-between items-center">
				<Logo size="small" />
				<div className="flex gap-2">
					<Notifications />
					<Navbar />
				</div>
			</div>
		</header>
	);
}
