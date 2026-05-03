import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { defaultLocale, locales } from "@/i18n/configs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date, locale?: string) => {
  return format(date, "dd/MM/yyyy", { locale: locale ? pt : undefined });
};

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

export { getBaseURL, getUserLocale };
