import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "../../..");
const arenaSidebarSource = readFileSync(
  resolve(projectRoot, "src/components/arena/sidebar.tsx"),
  "utf8",
);

// Task 10 scope: only the namespaces touched across the Arena UI/UX plan.
// Other namespaces (e.g. `common`, `onboarding`) are intentionally out of
// scope for this contract — they are not audited here.
const IN_SCOPE_NAMESPACES = [
  "arenaDashboard",
  "arenaEvents",
  "arenaNav",
  "arenaNoTeamModal",
  "arenaEventDetail",
  "arenaSquad",
  "arenaPayments",
  "profilePage",
] as const;

const LOCALES = ["pt", "en", "es", "fr"] as const;
type Locale = (typeof LOCALES)[number];

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function readLocale(locale: Locale): Record<string, JsonValue> {
  const raw = readFileSync(
    resolve(projectRoot, `src/locales/${locale}.json`),
    "utf8",
  );
  return JSON.parse(raw) as Record<string, JsonValue>;
}

// Extracts `{argName}`-style ICU/next-intl interpolation argument names.
// This is brace-depth aware so it only reads the argument name that
// directly follows a top-level `{` (e.g. "count" in
// `{count, plural, =1 {# player} other {# players}}`) and does NOT treat
// literal text inside nested plural/select category blocks (`{# players}`,
// `{es}`, `{a única vaga}`, ...) as placeholders — a naive regex on every
// `{` would misidentify that literal text as extra/mismatched tokens.
function extractPlaceholders(value: string): string[] {
  const tokens: string[] = [];
  let depth = 0;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    if (char === "{") {
      if (depth === 0) {
        let j = i + 1;
        while (j < value.length && /[a-zA-Z0-9_]/.test(value[j])) j++;
        const identifier = value.slice(i + 1, j);
        if (identifier.length > 0) tokens.push(identifier);
      }
      depth++;
      continue;
    }

    if (char === "}") {
      depth = Math.max(0, depth - 1);
    }
  }

  return tokens.sort();
}

/**
 * Recursively walks a pt.json subtree and yields every leaf string's
 * dotted path plus its extracted placeholder tokens.
 */
function collectLeaves(
  node: JsonValue,
  path: string,
  out: Map<string, string[]>,
) {
  if (node === null || typeof node !== "object") {
    if (typeof node === "string") {
      out.set(path, extractPlaceholders(node));
    }
    return;
  }
  if (Array.isArray(node)) {
    // Arrays of strings (rare in these locale files) — treat each index
    // as its own leaf so placeholder parity is still checked.
    node.forEach((item, index) => {
      collectLeaves(item, `${path}[${index}]`, out);
    });
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    collectLeaves(value, path ? `${path}.${key}` : key, out);
  }
}

function getAtPath(root: JsonValue, path: string): JsonValue | undefined {
  const segments = path.split(/\.|\[|\]/).filter(segment => segment.length > 0);
  let current: JsonValue | undefined = root;
  for (const segment of segments) {
    if (current === null || typeof current !== "object") return undefined;
    if (Array.isArray(current)) {
      const index = Number(segment);
      current = Number.isNaN(index) ? undefined : current[index];
    } else {
      current = (current as Record<string, JsonValue>)[segment];
    }
  }
  return current;
}

describe("arena locale contract", () => {
  const locales = Object.fromEntries(
    LOCALES.map(locale => [locale, readLocale(locale)]),
  ) as Record<Locale, Record<string, JsonValue>>;

  it("resolves literal ArenaSidebar translation keys in every locale", () => {
    const literalKeys = Array.from(
      arenaSidebarSource.matchAll(/\bt\("([^"]+)"\)/g),
      match => match[1],
    );
    const missingKeys = LOCALES.flatMap(locale =>
      literalKeys
        .filter(
          key =>
            typeof getAtPath(locales[locale].arenaNav as JsonValue, key) !==
            "string",
        )
        .map(key => `${locale}.arenaNav.${key}`),
    );

    expect(missingKeys).toEqual([]);
  });

  it.each(
    IN_SCOPE_NAMESPACES,
  )("keeps %s structurally and semantically in sync across pt/en/es/fr", namespace => {
    const ptNamespace = locales.pt[namespace];
    expect(
      ptNamespace,
      `pt.json is missing the "${namespace}" namespace`,
    ).toBeDefined();

    const ptLeaves = new Map<string, string[]>();
    collectLeaves(ptNamespace as JsonValue, "", ptLeaves);

    const missingKeys: string[] = [];
    const placeholderMismatches: string[] = [];

    for (const otherLocale of LOCALES.filter(l => l !== "pt")) {
      const otherNamespace = locales[otherLocale][namespace];

      for (const [leafPath, ptTokens] of ptLeaves) {
        const otherValue = getAtPath(otherNamespace as JsonValue, leafPath);

        if (typeof otherValue !== "string") {
          missingKeys.push(
            `${otherLocale}.${namespace}${leafPath ? `.${leafPath}` : ""}`,
          );
          continue;
        }

        const otherTokens = extractPlaceholders(otherValue);
        const same =
          ptTokens.length === otherTokens.length &&
          ptTokens.every((token, index) => token === otherTokens[index]);

        if (!same) {
          placeholderMismatches.push(
            `${otherLocale}.${namespace}${leafPath ? `.${leafPath}` : ""}: pt=[${ptTokens.join(", ")}] ${otherLocale}=[${otherTokens.join(", ")}]`,
          );
        }
      }
    }

    expect(
      missingKeys,
      missingKeys.length
        ? `Missing keys (present in pt.json, absent elsewhere):\n${missingKeys.join("\n")}`
        : undefined,
    ).toEqual([]);

    expect(
      placeholderMismatches,
      placeholderMismatches.length
        ? `Placeholder mismatches:\n${placeholderMismatches.join("\n")}`
        : undefined,
    ).toEqual([]);
  });
});
