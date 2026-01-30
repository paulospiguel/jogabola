import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { defaultLocale, locales } from "@/i18n/configs";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date with locale support
 */
export const formatDate = (date: Date, locale?: string) => {
  return format(date, "dd/MM/yyyy", { locale: locale ? pt : undefined });
};

/**
 * File type enumeration for preview detection
 */
export enum FileType {
  Pdf = "application/pdf",
  Heic = "image/heic",
}

/**
 * Strip special characters from string (keep alphanumeric, hyphen, space, dot, parentheses)
 */
export function stripSpecialCharacters(inputString: string) {
  return inputString?.replace(/[^a-zA-Z0-9\s.()-]/g, "");
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffle(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Check if file type supports preview
 */
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

/**
 * Generate OTP code with specified number of digits
 */
export function generateOTP(numberOfDigits: number) {
  const digits = "0123456789";
  let OTP = "";
  const len = digits.length;
  for (let i = 0; i < numberOfDigits; i++) {
    OTP += digits[Math.floor(Math.random() * len)];
  }

  return OTP;
}

/**
 * Get search params with type safety
 */
export const getSearchParams = <T = unknown>(
  search: Record<string, string>,
) => {
  const searchParams = new URLSearchParams(search);
  return {
    get: (key: string) => searchParams.get(key) as T,
  };
};

/**
 * Get user locale from cookie or browser
 */
const getUserLocale = async (): Promise<string> => {
  // Server-side: honor cookie set by server action
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
  } catch {
    // no-op: fallback below
  }

  // Client-side fallback: navigator.language narrowed to supported locales
  if (typeof window !== "undefined") {
    const nav = (navigator.language || defaultLocale).slice(0, 2);
    return locales.includes(nav as (typeof locales)[number])
      ? nav
      : defaultLocale;
  }

  return defaultLocale;
};

/**
 * Get base URL for the application (works in both client and server)
 */
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_URL ||
      window.location.origin
    );
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};

export { getBaseURL, getUserLocale };
