import { describe, expect, it } from "vitest";
import {
  buildTransferCandidates,
  looksLikeEmail,
  teamNameMatches,
  transferErrorKey,
} from "./transfer-ui";

describe("transferErrorKey", () => {
  it.each([
    "FORBIDDEN",
    "TEAM_NAME_MISMATCH",
    "TRANSFER_ALREADY_PENDING",
    "TRANSFER_NOT_FOUND",
    "TRANSFER_EXPIRED",
    "TRANSFER_NOT_FOR_YOU",
    "EMAIL_NOT_VERIFIED",
    "TEAM_LIMIT_REACHED",
    "CANNOT_TRANSFER_TO_SELF",
    "RECIPIENT_NOT_MEMBER",
  ])("maps %s to its own key", code => {
    expect(transferErrorKey(code)).toBe(`errors.${code}`);
  });

  it("falls back to UNKNOWN", () => {
    expect(transferErrorKey(undefined)).toBe("errors.UNKNOWN");
    expect(transferErrorKey("SOMETHING_ELSE")).toBe("errors.UNKNOWN");
  });
});

describe("teamNameMatches", () => {
  it("requires an exact, case-sensitive match after trimming", () => {
    expect(teamNameMatches("Os Leões", "Os Leões")).toBe(true);
    expect(teamNameMatches("  Os Leões  ", "Os Leões")).toBe(true);
    expect(teamNameMatches("os leões", "Os Leões")).toBe(false);
    expect(teamNameMatches("Os Leoes", "Os Leões")).toBe(false);
    expect(teamNameMatches("", "Os Leões")).toBe(false);
  });

  it("never matches an empty team name", () => {
    expect(teamNameMatches("", "")).toBe(false);
  });
});

describe("buildTransferCandidates", () => {
  const a = { userId: "a", name: "Ana", image: null };
  const b = { userId: "b", name: "Bruno", image: null };
  const owner = { userId: "o", name: "Owner", image: null };

  it("merges roster and staff, dedupes and excludes self", () => {
    const result = buildTransferCandidates([b, owner, a], [a, owner], "o");
    expect(result.map(c => c.userId)).toEqual(["a", "b"]);
  });

  it("returns an empty list when only the owner is there", () => {
    expect(buildTransferCandidates([owner], [], "o")).toEqual([]);
  });
});

describe("looksLikeEmail", () => {
  it("accepts plausible emails and rejects others", () => {
    expect(looksLikeEmail("novo@dono.pt")).toBe(true);
    expect(looksLikeEmail(" novo@dono.pt ")).toBe(true);
    expect(looksLikeEmail("novo@dono")).toBe(false);
    expect(looksLikeEmail("novo dono@x.pt")).toBe(false);
  });
});
