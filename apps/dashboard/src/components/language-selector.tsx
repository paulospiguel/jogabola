"use client";

import { type Locale, locales } from "@/i18n/configs";
import { setUserLocale } from "@/services/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Globe } from "@repo/ui/icons";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

const LANGUAGES = {
	en: {
		icon: "🇬🇧",
		name: "locales.en",
	},
	pt: {
		icon: "🇧🇷",
		name: "locales.pt",
	},
	es: {
		icon: "🇪🇸",
		name: "locales.es",
	},
} as const;

export default function LanguageSelector({ onlyIcon = false }: { onlyIcon?: boolean }) {
	const t = useTranslations();
	const locale = useLocale();
	const [isPending, startTransition] = useTransition();

	async function onLanguageChange(lang: Locale) {
		const locale = lang as Locale;
		startTransition(() => {
			setUserLocale(locale);
		});
	}

	return (
		<Select disabled={isPending} defaultValue={locale} onValueChange={onLanguageChange}>
			<SelectTrigger className="w-[180px]">
				{isPending ? <Globe className="animate-spin size-6" /> : <Globe className="size-5" />}
				<SelectValue placeholder={t("locales.placeholder")} />
			</SelectTrigger>
			<SelectContent>
				{locales.map((lang) => (
					<SelectItem key={lang} value={lang} className="space-x-2">
						<span className="mr-1">{LANGUAGES[lang].icon}</span>
						{!onlyIcon && <span>{t(LANGUAGES[lang].name)}</span>}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
