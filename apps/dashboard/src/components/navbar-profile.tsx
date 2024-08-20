"use client";

import { cn } from "@/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
	{ href: "/profile/auth", label: "Geral" },
	{ href: "/profile/settings", label: "Advanced" },
	{ href: "/support", label: "Support" },
];

export default function NavbarProfile() {
	const pathname = usePathname();
	return (
		<nav className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0">
			{links.map(({ href, label }) => (
				<Link key={href} href={href} className={cn(pathname === href && "text-primary font-semibold")}>
					{label}
				</Link>
			))}
		</nav>
	);
}
