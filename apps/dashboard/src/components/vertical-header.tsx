import Link from "next/link";
import { Logo } from "./logo";
import { Navbar } from "./navbar";
import Notifications from "./notifications";
import { CogIcon } from "./icons";

export default function VerticalHeader() {
	return (
		<header className="sticky top-0 z-10">
			<div className="flex flex-col h-screen min-w-[80px] justify-between py-2 shadow-md">
				<div className="border-b-2 p-2">
					<Logo size="mini" />
				</div>

				<div className="flex flex-col gap-2 items-center">
					<Navbar />
					<Notifications className="transition-all duration-300 hover:scale-110" />
					<Link href="/profile/settings" className="group">
						<CogIcon className="size-5 text-green-600 transition-all group-hover:rotate-90" />
					</Link>
				</div>
			</div>
		</header>
	);
}
