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
					<Notifications />
					<Link href="/profile/settings">
						<CogIcon className="size-8 text-green-600" />
					</Link>
				</div>
			</div>
		</header>
	);
}
