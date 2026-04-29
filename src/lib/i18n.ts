import { getTranslations } from "next-intl/server";
import { COMPANY, TRANSLATION_KEYS } from "@/constants/app";

export async function getCompanyTranslations() {
  const t = await getTranslations();

  return {
    name: COMPANY.NAME,
    slogan: t(TRANSLATION_KEYS.COMPANY.SLOGAN),
    legalName: t(TRANSLATION_KEYS.COMPANY.LEGAL_NAME),
    description: t(TRANSLATION_KEYS.COMPANY.DESCRIPTION),
    social: COMPANY.SOCIAL,
  };
}

export async function getMetaTranslations() {
  const t = await getTranslations();

  return {
    title: t(TRANSLATION_KEYS.META.TITLE),
    description: t(TRANSLATION_KEYS.META.DESCRIPTION),
  };
}

export function useCompanyName() {
  return COMPANY.NAME;
}
