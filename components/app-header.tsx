import { Logo } from "./logo";

export function AppHeader() {
	return (
		<header className="flex px-4 py-2 w-full justify-center lg:justify-between shadow-sm">
			<Logo size="small" />
		</header>
	);
}
