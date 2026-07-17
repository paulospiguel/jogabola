import { describe, expect, it } from "vitest";
import { formatClock, formatMatchDate, formatMinute } from "./format";

describe("timer formatters", () => {
  const now = new Date(2026, 6, 15, 18, 0).getTime();

  it("formats a match created today with its time", () => {
    const createdAt = new Date(2026, 6, 15, 15, 30).getTime();

    expect(formatMatchDate(createdAt, now)).toBe("hoje · 15:30");
  });

  it("formats a match created yesterday with its time", () => {
    const createdAt = new Date(2026, 6, 14, 9, 5).getTime();

    expect(formatMatchDate(createdAt, now)).toBe("ontem · 09:05");
  });

  it("formats an older match with its day and abbreviated month", () => {
    const createdAt = new Date(2026, 5, 30, 12, 0).getTime();

    expect(formatMatchDate(createdAt, now)).toBe("30 jun");
  });

  it("formats clock values below and above one hour", () => {
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(3665)).toBe("1:01:05");
  });

  it("formats the match minute", () => {
    expect(formatMinute(119)).toBe("1'");
  });
});
