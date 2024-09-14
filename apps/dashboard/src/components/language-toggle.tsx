"use client";

import { Languages } from "@repo/ui/icons";
import { useState } from "react";
import type { z } from "zod";

import { languagesEnum } from "@/schemas";
import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { cn } from "@repo/ui/utils";

type LanguageTypes = z.infer<typeof languagesEnum>;
const LANGUAGES = languagesEnum.options;

const ICONS_LAGS: Record<LanguageTypes, string> = {
	pt: "🇵🇹",
	en: "🇺🇸",
	es: "🇪🇸",
};

type LanguageToggleProps = {
	onChangeValue?: (value: LanguageTypes) => void;
	value?: LanguageTypes;
};

export function LanguageToggle({ onChangeValue, value }: LanguageToggleProps) {
	const [languageFlag, setLanguageFlag] = useState(() => {
		const lang =
			typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem("jogabola:language") : null;
		if (lang) {
			return lang;
		}
		return languagesEnum.Enum.en;
	});

	const setLanguage = (lang: LanguageTypes) => {
		document.documentElement.lang = lang;
		localStorage?.setItem("jogabola:language", lang);
		setLanguageFlag(lang);
		onChangeValue?.(lang);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant="outline" size="icon" className="rounded-full">
					{languageFlag ? (
						ICONS_LAGS[languageFlag as LanguageTypes]
					) : (
						<Languages className="h-[1.2rem] w-[1.2rem] transition-all" />
					)}
					<span className="sr-only">Toggle language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{LANGUAGES.map((lang) => (
					<DropdownMenuItem
						className={cn({ "bg-gray-200": value === lang })}
						key={lang}
						onClick={() => setLanguage(lang)}
					>
						{ICONS_LAGS[lang as LanguageTypes]} {lang}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
