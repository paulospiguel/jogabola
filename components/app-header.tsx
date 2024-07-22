import { Logo } from "./logo";
import { Navbar } from "./navbar";

export function AppHeader() {
	return (
		<header className="flex flex-col md:flex-row px-4 py-2 w-full justify-center items-center md:justify-between shadow-sm">
			<Logo size="small" />

			<Navbar />
		</header>
	);
}
