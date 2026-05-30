import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/lib/utils";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const locale = await getUserLocale();

  let messages: any;
  switch (locale) {
    case "pt":
      messages = (await import("../locales/pt.json")).default;
      break;
    case "en":
      messages = (await import("../locales/en.json")).default;
      break;
    case "es":
      messages = (await import("../locales/es.json")).default;
      break;
    case "fr":
      messages = (await import("../locales/fr.json")).default;
      break;
    default:
      messages = (await import("../locales/pt.json")).default;
  }

  return {
    locale,
    messages,
  };
});
