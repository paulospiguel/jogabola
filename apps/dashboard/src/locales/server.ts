import { createI18nServer } from "next-international/server";

export const { getI18n, getScopedI18n, getStaticParams } = createI18nServer({
	en: () => import("./i18n/en"),
	// pt: () => import("./i18n/pt"),
	// es: () => import("./i18n/es"),
});
