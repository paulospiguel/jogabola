import { getTranslations } from "next-intl/server";
import { APP } from "@/constants/app";

export async function getCompanyTranslations() {
  const t = await getTranslations();

  return {
    name: t(APP.COMPANY.NAME),
    slogan: t(APP.COMPANY.SLOGAN),
    legalName: t(APP.COMPANY.LEGAL_NAME),
    description: t(APP.COMPANY.DESCRIPTION),
    social: APP.SOCIAL,
  };
}

export async function getMetaTranslations() {
  const t = await getTranslations();

  return {
    title: t(APP.META.TITLE),
    description: t(APP.META.DESCRIPTION),
  };
}

export function useCompanyName() {
  return APP.COMPANY.NAME;
}
