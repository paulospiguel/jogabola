import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "../../..");

function readSource(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

// Matches any pictographic emoji (any variation-selector suffix included),
// e.g. ⚽ 🏆 🎯 🏋️ 🗣️ 🤝 📌 — but not plain punctuation/arrows like "→".
const FUNCTIONAL_EMOJI_PATTERN = /\p{Extended_Pictographic}/u;

// Task 9 scope: exactly the files the plan names — not a repo-wide sweep.
// Emails, user-shared content, the 🏆-champion exception (historical-client.tsx)
// and flags live outside this list, so no exclusion logic is needed here.
const FILES_IN_SCOPE = [
  "src/components/shared/events/create-event-dialog.utils.ts",
  "src/components/arena/create-event-step-type.tsx",
  "src/components/timer/setup-drawer.tsx",
  "src/components/timer/hub-view.tsx",
  "src/components/timer/result-view.tsx",
  "src/components/timer/summary-modal.tsx",
] as const;

describe("arena iconography contract", () => {
  it.each(FILES_IN_SCOPE)("keeps %s free of functional emoji", relativePath => {
    const source = readSource(relativePath);
    const match = source.match(FUNCTIONAL_EMOJI_PATTERN);

    expect(
      match,
      match
        ? `Found functional emoji "${match[0]}" in ${relativePath} — replace it with a Lucide icon or a branding image (kind: "icon" | "brand").`
        : undefined,
    ).toBeNull();
  });

  it("replaces the event type emoji field with a typed visual union", () => {
    const source = readSource(
      "src/components/shared/events/create-event-dialog.utils.ts",
    );

    expect(source).not.toMatch(/emoji\s*:/);
    expect(source).toContain("EventTypeVisual");
    expect(source).toContain('kind: "brand"');
  });
});
