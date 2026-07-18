import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "../../..");

function readSource(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

function readLocale(locale: string) {
  return JSON.parse(readSource(`src/locales/${locale}.json`)) as Record<
    string,
    unknown
  >;
}

function objectKeys(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.keys(value as Record<string, unknown>).sort();
}

describe("public website production contract", () => {
  const publicFiles = [
    "src/app/(public)/(website)/page.tsx",
    "src/app/(public)/(website)/contact/page.tsx",
    "src/app/(public)/(website)/pricing/page.tsx",
    "src/app/(public)/(website)/roadmap/page.tsx",
    "src/components/footer.tsx",
  ];

  it("does not expose placeholder or invalid home links", () => {
    const source = publicFiles.map(readSource).join("\n");
    const logo = readSource("src/components/logo.tsx");

    expect(source).not.toMatch(/href=["']#["']/);
    expect(source).not.toMatch(/href=["']home["']/);
    expect(logo).not.toContain('href === "home"');
    expect(logo).not.toContain("window.open(");
    expect(logo).toContain('cn("press relative flex"');
  });

  it("uses jogo as the PT-PT public vocabulary", () => {
    const source = [
      ...publicFiles.map(readSource),
      readSource("src/locales/pt.json"),
    ].join("\n");

    expect(source).not.toMatch(/pelada/i);
  });

  it("centralizes translated contact methods without an unconfigured Discord", () => {
    const source = readSource("src/app/(public)/(website)/contact/page.tsx");

    expect(source).toContain('useTranslations("contactPage")');
    expect(source).toContain("APP.SOCIAL.INSTAGRAM");
    expect(source).toContain("APP.SOCIAL.TWITTER");
    expect(source).not.toMatch(/instagram\.com|twitter\.com|x\.com/);
    expect(source).not.toMatch(/Discord|MessageSquare/);
  });

  it("keeps the new contact copy aligned across every locale", () => {
    const locales = ["pt", "en", "es", "fr"].map(readLocale);
    const expectedKeys = objectKeys(locales[0].contactPage);

    expect(expectedKeys).toEqual([
      "backHome",
      "description",
      "methods",
      "title",
    ]);
    for (const locale of locales.slice(1)) {
      expect(objectKeys(locale.contactPage)).toEqual(expectedKeys);
      expect(
        objectKeys((locale.contactPage as Record<string, unknown>).methods),
      ).toEqual(
        objectKeys((locales[0].contactPage as Record<string, unknown>).methods),
      );
    }
  });

  it("omits unverified urgency and testimonial claims", () => {
    const source = readSource("src/app/(public)/(website)/page.tsx");

    expect(source).not.toContain("TestimonialsSection");
    expect(source).not.toContain('t("tickerStrong")');
    expect(source).not.toContain('t("ticker")');
  });

  it("keeps the public hero compact and the contact grid balanced", () => {
    const landing = readSource("src/app/(public)/(website)/page.tsx");
    const contact = readSource("src/app/(public)/(website)/contact/page.tsx");

    expect(landing).toContain("lg:min-h-[680px]");
    expect(landing).toContain("lg:pt-20");
    expect(landing).toContain("lg:pb-8");
    expect(landing).toContain("lg:mt-6");
    expect(landing).toContain("scale={0.82}");
    expect(contact).toContain("max-w-6xl");
    expect(contact).toContain("lg:grid-cols-3");
    expect(contact).toContain("lg:flex-col");
    expect(contact).toContain("min-w-0");
    expect(contact).toContain("break-words");
    expect(contact).not.toContain("md:grid-cols-2");
  });

  it("tracks only the missing consent-gated public funnel events", () => {
    const landing = readSource("src/app/(public)/(website)/page.tsx");
    const auth = readSource("src/app/(mobile)/auth/page.tsx");

    expect(landing).toContain('logEvent("landing_cta_clicked"');
    expect(auth).toContain('logEvent("auth_started"');
    expect(landing).not.toContain('logEvent("team_created"');
    expect(landing).not.toContain('logEvent("event_created"');
  });
});
