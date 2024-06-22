"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const LANGUAGES = ["pt", "en", "es"];

const ICONS_LAGS = {
	pt: "🇵🇹",
	en: "🇺🇸",
	es: "🇪🇸",
} as const;

export function LanguageToggle() {

	const setLanguage = (lang: string) => {
		document.documentElement.lang = lang;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="rounded-full">
					<Languages className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Languages className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{LANGUAGES.map((lang) => (
					<DropdownMenuItem key={lang} onClick={() => setLanguage(lang)}>
						{ICONS_LAGS[lang as keyof typeof ICONS_LAGS]} {lang}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
