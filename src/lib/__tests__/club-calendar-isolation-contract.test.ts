import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// ADR 0005: match-session queries, guest pages and their response objects
// must not include competitive calendar data.
const projectRoot = resolve(__dirname, "../../..");
const RECREATIONAL_SOURCES = [
  "src/actions/match-sessions.actions.ts",
  "src/actions/guest-rsvp.actions.ts",
  "src/actions/attendance.actions.ts",
  "src/db/queries/events.ts",
];
const COMPETITIVE_IDENTIFIERS =
  /\b(fixtures|fixtureMatchSessions|seasons|opponents|clubMembers|club-calendar)\b/;

describe("recreational flows stay free of competitive data", () => {
  it.each(RECREATIONAL_SOURCES)("%s", file => {
    const source = readFileSync(resolve(projectRoot, file), "utf8");
    expect(source).not.toMatch(COMPETITIVE_IDENTIFIERS);
  });
});
