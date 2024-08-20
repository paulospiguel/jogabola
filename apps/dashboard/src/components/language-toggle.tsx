"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languagesEnumnguagesEnumschemasecreate-teamschemasocreate-teamschemas/create-team";
import { cnutilsutilsutilsutils
import type { z } from "zod";

type LanguageTypes = z.infer<typeof languagesEnum>;
const LANGUAGES = languagesEnum.options;

const ICONS_LAGS: Record<LanguageTypes, string> = {
  pt: "🇵🇹",
  en: "🇺🇸",
  es: "🇪🇸",
};

type LanguageToggleProps = {
  onChangeValue?: (value: LanguageTypes) => void;
  value?: LanguageTypes;
};

export function LanguageToggle({ onChangeValue, value }: LanguageToggleProps) {
  const setLanguage = (lang: LanguageTypes) => {
    document.documentElement.lang = lang;
    localStorage.setItem("language", lang);
    onChangeValue?.(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full"
        >
          {value ? (
            ICONS_LAGS[value as LanguageTypes]
          ) : (
            <Languages className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          )}
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            className={cn({ "bg-gray-200": value === lang })}
            key={lang}
            onClick={() => setLanguage(lang)}
          >
            {ICONS_LAGS[lang as LanguageTypes]} {lang}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
