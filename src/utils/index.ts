import cn from "@/components/ui/lib/cn";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export const formatDate = (date: Date, locale?: string) => {
  return format(date, "dd/MM/yyyy", { locale: locale ? pt : undefined });
};

export enum FileType {
  Pdf = "application/pdf",
  Heic = "image/heic",
}

export function stripSpecialCharacters(inputString: string) {
  // Use a regular expression to replace all non-alphanumeric characters except hyphen, space, dot,and parentheses with an empty string
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
  // Implement your logic to get the user's locale here.
  if (typeof window !== "undefined") {
    return navigator.language || "en";
  }
  return "en";
};

export { cn, getUserLocale };
