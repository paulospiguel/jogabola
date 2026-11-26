import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CLUB_CALENDAR_ERROR } from "@/lib/club-calendar-errors";

const projectRoot = resolve(__dirname, "../../..");
const LOCALES = ["pt", "en", "es", "fr"] as const;

const schemaSource = readFileSync(
  resolve(projectRoot, "src/schemas/club-calendar.schema.ts"),
  "utf8",
);
const VALIDATION_CODES = Array.from(
  new Set(schemaSource.match(/VALIDATION_[A-Z_]+/g) ?? []),
);
const ACTION_ERROR_CODES = [
  "UNAUTHORIZED",
  "VALIDATION_ERROR",
  ...Object.values(CLUB_CALENDAR_ERROR),
];

function readLocale(locale: string) {
  return JSON.parse(
    readFileSync(resolve(projectRoot, `src/locales/${locale}.json`), "utf8"),
  ) as {
    validation: Record<string, string>;
    arenaClubCalendar: {
      errors: Record<string, string>;
      roles: Record<string, string>;
    };
  };
}

describe("club calendar locale contract", () => {
  it.each(LOCALES)("%s has every error, role and validation key", locale => {
    const messages = readLocale(locale);
    expect(Object.keys(messages.arenaClubCalendar.errors).sort()).toEqual(
      [...ACTION_ERROR_CODES].sort(),
    );
    expect(Object.keys(messages.arenaClubCalendar.roles).sort()).toEqual([
      "admin",
      "member",
    ]);
    for (const code of VALIDATION_CODES) {
      expect(messages.validation[code], `${locale}.validation.${code}`).toEqual(
        expect.any(String),
      );
    }
  });

  it("keeps PT-PT wording", () => {
    const pt = JSON.stringify(readLocale("pt").arenaClubCalendar);
    expect(pt).not.toMatch(/\b(você|gerenci\w*|time)\b/i);
  });
});
