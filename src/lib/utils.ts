import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNowStrict } from "date-fns";
import { enUS, es, fr, type Locale, pt } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { defaultLocale, locales } from "@/i18n/configs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DATE_FNS_LOCALES: Record<string, Locale> = {
  pt,
  en: enUS,
  es,
  fr,
};

export const formatDate = (date: Date | string, locale?: string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy", { locale: locale ? pt : undefined });
};

export const formatRelativeTime = (date: Date | string, locale = "pt") => {
  const d = typeof date === "string" ? new Date(date) : date;
  const fnsLocale = DATE_FNS_LOCALES[locale] ?? pt;
  return formatDistanceToNowStrict(d, { locale: fnsLocale, addSuffix: false });
};

export function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, "HH:mm");
}

export enum FileType {
  Pdf = "application/pdf",
  Heic = "image/heic",
}

export function stripSpecialCharacters(inputString: string) {
  return inputString?.replace(/[^a-zA-Z0-9\s.()-]/g, "");
}

export function shuffle(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const isSupportedFilePreview = (type: FileType) => {
  if (!type) {
    return false;
  }

  if (type === FileType.Heic) {
    return false;
  }

  if (type?.startsWith("image")) {
    return true;
  }

  switch (type) {
    case FileType.Pdf:
      return true;
    default:
      return false;
  }
};

export function generateOTP(numberOfDigits: number) {
  const digits = "0123456789";
  let OTP = "";
  const len = digits.length;
  for (let i = 0; i < numberOfDigits; i++) {
    OTP += digits[Math.floor(Math.random() * len)];
  }

  return OTP;
}

export const getSearchParams = <T = unknown>(
  search: Record<string, string>,
) => {
  const searchParams = new URLSearchParams(search);
  return {
    get: (key: string) => searchParams.get(key) as T,
  };
};

const getUserLocale = async (): Promise<string> => {
  try {
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const fromCookie = cookieStore.get("NEXT_LOCALE")?.value;
      if (
        fromCookie &&
        locales.includes(fromCookie as (typeof locales)[number])
      ) {
        return fromCookie;
      }
    }
  } catch {}

  if (typeof window !== "undefined") {
    const nav = (navigator.language || defaultLocale).slice(0, 2);
    return locales.includes(nav as (typeof locales)[number])
      ? nav
      : defaultLocale;
  }

  return defaultLocale;
};

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "development"
  ) {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  }

  return (
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
};

export function slugify(str: string) {
  return String(str)
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
}

export { getBaseURL, getUserLocale };
