"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Globe } from "@repo/ui/icons";

export default function LanguageSelector({
	currentLang = "en",
	onLanguageChange = (lang: string) => console.log(`Language changed to ${lang}`),
}: {
	currentLang?: string;
	onLanguageChange?: (lang: string) => void;
}) {
	const languages = [
		{ code: "en", name: "English" },
		{ code: "es", name: "Español" },
		{ code: "fr", name: "Français" },
		{ code: "de", name: "Deutsch" },
		{ code: "it", name: "Italiano" },
		{ code: "ja", name: "日本語" },
	];

	return (
		<Select defaultValue={currentLang} onValueChange={onLanguageChange}>
			<SelectTrigger className="w-[180px]">
				<Globe className="mr-2 h-4 w-4" />
				<SelectValue placeholder="Select Language" />
			</SelectTrigger>
			<SelectContent>
				{languages.map((lang) => (
					<SelectItem key={lang.code} value={lang.code}>
						{lang.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

// import { Languages } from "@repo/ui/icons";
// import { useState } from "react";
// import type { z } from "zod";

// import { languagesEnum } from "@/schemas";
// import { Button } from "@repo/ui/components/button";
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuTrigger,
// } from "@repo/ui/components/dropdown-menu";
// import { cn } from "@repo/ui/utils";

// type LanguageTypes = z.infer<typeof languagesEnum>;
// const LANGUAGES = languagesEnum.options;

// const ICONS_LAGS: Record<LanguageTypes, string> = {
// 	pt: "🇵🇹",
// 	en: "🇺🇸",
// 	es: "🇪🇸",
// };

// type LanguageToggleProps = {
// 	onChangeValue?: (value: LanguageTypes) => void;
// 	value?: LanguageTypes;
// };

// export function LanguageToggle({ onChangeValue, value }: LanguageToggleProps) {
// 	const [languageFlag, setLanguageFlag] = useState(() => {
// 		const lang =
// 			typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem("jogabola:language") : null;
// 		if (lang) {
// 			return lang;
// 		}
// 		return languagesEnum.Enum.en;
// 	});

// 	const setLanguage = (lang: LanguageTypes) => {
// 		document.documentElement.lang = lang;
// 		localStorage?.setItem("jogabola:language", lang);
// 		setLanguageFlag(lang);
// 		onChangeValue?.(lang);
// 	};

// 	return (
// 		<DropdownMenu>
// 			<DropdownMenuTrigger asChild>
// 				<Button type="button" variant="outline" size="icon" className="rounded-full">
// 					{languageFlag ? (
// 						ICONS_LAGS[languageFlag as LanguageTypes]
// 					) : (
// 						<Languages className="h-[1.2rem] w-[1.2rem] transition-all" />
// 					)}
// 					<span className="sr-only">Toggle language</span>
// 				</Button>
// 			</DropdownMenuTrigger>
// 			<DropdownMenuContent align="end">
// 				{LANGUAGES.map((lang) => (
// 					<DropdownMenuItem
// 						className={cn({ "bg-gray-200": value === lang })}
// 						key={lang}
// 						onClick={() => setLanguage(lang)}
// 					>
// 						{ICONS_LAGS[lang as LanguageTypes]} {lang}
// 					</DropdownMenuItem>
// 				))}
// 			</DropdownMenuContent>
// 		</DropdownMenu>
// 	);
// }
