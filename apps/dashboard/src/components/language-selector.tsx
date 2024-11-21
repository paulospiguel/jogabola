"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { useTranslation } from "react-i18next";
import { Globe } from "@repo/ui/icons";

const languages = [
	{ code: "en", name: "English", icon: "🇺🇸" },
	{ code: "es", name: "Español", icon: "🇪🇸" },
	{ code: "pt", name: "Português", icon: "🇵🇹" },
	// { code: "fr", name: "Français" },
	// { code: "de", name: "Deutsch" },
	// { code: "it", name: "Italiano" },
	// { code: "ja", name: "日本語" },
];

export default function LanguageSelector({
	currentLang = "en",
	onLanguageChange = (lang: string) => console.log(`Language changed to ${lang}`),
}: {
	currentLang?: string;
	onLanguageChange?: (lang: string) => void;
}) {
	const { t } = useTranslation();

	return (
		<Select defaultValue={currentLang} onValueChange={onLanguageChange}>
			<SelectTrigger className="w-[180px]">
				<Globe className="mr-2 h-4 w-4" />
				<SelectValue placeholder={t("languages.selectPlaceholder")} />
			</SelectTrigger>
			<SelectContent>
				{languages.map((lang) => (
					<SelectItem key={lang.code} value={lang.code} className="space-x-2">
						<span>{lang.icon}</span>
						<span>{t(lang.name)}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
