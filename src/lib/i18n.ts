/**
 * Utilitários para internacionalização (i18n)
 */
import { getTranslations } from "next-intl/server";
import { COMPANY, TRANSLATION_KEYS } from "@/constants/app";

/**
 * Obtém traduções da empresa
 */
export async function getCompanyTranslations() {
  const t = await getTranslations();

  return {
    name: COMPANY.NAME, // Nome não é traduzido
    slogan: t(TRANSLATION_KEYS.COMPANY.SLOGAN),
    legalName: t(TRANSLATION_KEYS.COMPANY.LEGAL_NAME),
    description: t(TRANSLATION_KEYS.COMPANY.DESCRIPTION),
    // Redes sociais não são traduzidas
    social: COMPANY.SOCIAL,
  };
}

/**
 * Obtém os metadados da página com traduções
 */
export async function getMetaTranslations() {
  const t = await getTranslations();

  return {
    title: t(TRANSLATION_KEYS.META.TITLE),
    description: t(TRANSLATION_KEYS.META.DESCRIPTION),
  };
}

/**
 * Para uso no lado do cliente (client components)
 */
export function useCompanyName() {
  return COMPANY.NAME;
}
