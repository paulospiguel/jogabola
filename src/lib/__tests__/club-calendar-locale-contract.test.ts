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
    } & Record<string, unknown>;
    arenaNav: Record<string, unknown>;
    arenaDashboard: { sections: Record<string, unknown> };
  };
}

/** Dotted paths of every string leaf, for cross-locale parity checks. */
function leafPaths(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  if (!value || typeof value !== "object") return [`${prefix}:<invalid>`];
  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function placeholders(text: string) {
  return Array.from(text.matchAll(/\{(\w+)\}/g), match => match[1]).sort();
}

function leafAt(value: unknown, path: string): string {
  return path
    .split(".")
    .reduce<unknown>(
      (node, key) => (node as Record<string, unknown>)[key],
      value,
    ) as string;
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

  it.each(
    LOCALES.filter(locale => locale !== "pt"),
  )("%s has the same club calendar UI keys and placeholders as pt", locale => {
    const pt = readLocale("pt");
    const other = readLocale(locale);
    const ptPaths = leafPaths(pt.arenaClubCalendar).sort();
    expect(leafPaths(other.arenaClubCalendar).sort()).toEqual(ptPaths);
    for (const path of ptPaths) {
      expect(
        placeholders(leafAt(other.arenaClubCalendar, path)),
        `${locale}.arenaClubCalendar.${path}`,
      ).toEqual(placeholders(leafAt(pt.arenaClubCalendar, path)));
    }
    expect(other.arenaNav.club).toEqual(expect.any(String));
    expect(other.arenaDashboard.sections.club).toEqual(expect.any(String));
    expect(other.arenaDashboard.sections.clubSub).toEqual(expect.any(String));
  });

  it("keeps PT-PT wording", () => {
    const messages = readLocale("pt");
    // Values only: keys such as `time` are code identifiers, not copy.
    const pt = [
      ...leafPaths(messages.arenaClubCalendar).map(path =>
        leafAt(messages.arenaClubCalendar, path),
      ),
      messages.arenaNav.club,
      messages.arenaDashboard.sections.club,
      messages.arenaDashboard.sections.clubSub,
    ].join("\n");
    expect(pt).not.toMatch(/\b(você|gerenci\w*|time|aplicativo)\b/i);
  });
});
