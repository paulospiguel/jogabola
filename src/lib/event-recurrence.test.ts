import { describe, expect, it } from "vitest";
import {
  generateRecurringOccurrences,
  MAX_RECURRING_OCCURRENCES,
  validateEventRange,
} from "./event-recurrence";

describe("generateRecurringOccurrences", () => {
  it("steps weekly, inclusive of the end date boundary", () => {
    const start = new Date(2026, 0, 5, 20, 0); // Mon Jan 5 2026, 20:00
    const endDate = new Date(2026, 0, 26); // Mon Jan 26 2026 (time ignored)

    const result = generateRecurringOccurrences({
      start,
      frequency: "weekly",
      endDate,
    });

    expect(result).toEqual({
      success: true,
      occurrences: [
        new Date(2026, 0, 5, 20, 0),
        new Date(2026, 0, 12, 20, 0),
        new Date(2026, 0, 19, 20, 0),
        new Date(2026, 0, 26, 20, 0),
      ],
    });
  });

  it("steps monthly, clamping to the last valid day of shorter months", () => {
    const start = new Date(2026, 0, 31, 20, 0); // Jan 31 2026, 20:00
    const endDate = new Date(2026, 3, 1); // Apr 1 2026

    const result = generateRecurringOccurrences({
      start,
      frequency: "monthly",
      endDate,
    });

    expect(result).toEqual({
      success: true,
      occurrences: [
        new Date(2026, 0, 31, 20, 0), // Jan 31
        new Date(2026, 1, 28, 20, 0), // Feb 28 (clamped, not Mar 3)
        new Date(2026, 2, 31, 20, 0), // Mar 31
        // Apr 30 excluded — its date is after the Apr 1 boundary
      ],
    });
  });

  it("rejects an end date before the start date", () => {
    const start = new Date(2026, 0, 26, 20, 0);
    const endDate = new Date(2026, 0, 5);

    const result = generateRecurringOccurrences({
      start,
      frequency: "weekly",
      endDate,
    });

    expect(result).toEqual({ success: false, error: "END_BEFORE_START" });
  });

  it("only requires the end date's calendar date, ignoring its time", () => {
    const start = new Date(2026, 0, 5, 20, 0);
    const endDate = new Date(2026, 0, 5, 0, 0); // same day, earlier time

    const result = generateRecurringOccurrences({
      start,
      frequency: "weekly",
      endDate,
    });

    expect(result).toEqual({
      success: true,
      occurrences: [new Date(2026, 0, 5, 20, 0)],
    });
  });

  it("rejects a range that would exceed the occurrence cap", () => {
    const start = new Date(2026, 0, 5, 20, 0);
    const endDate = new Date(2028, 0, 5); // ~104+ weeks away

    const result = generateRecurringOccurrences({
      start,
      frequency: "weekly",
      endDate,
    });

    expect(result).toEqual({
      success: false,
      error: "TOO_MANY_OCCURRENCES",
    });
  });

  it("accepts a range that lands exactly on the occurrence cap", () => {
    const start = new Date(2026, 0, 5, 20, 0);
    // MAX_RECURRING_OCCURRENCES weekly occurrences starting at n=0
    const endDate = new Date(2026, 0, 5 + (MAX_RECURRING_OCCURRENCES - 1) * 7);

    const result = generateRecurringOccurrences({
      start,
      frequency: "weekly",
      endDate,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.occurrences).toHaveLength(MAX_RECURRING_OCCURRENCES);
    }
  });
});

describe("validateEventRange", () => {
  it("accepts an end date after the start date within the cap", () => {
    const start = new Date(2026, 0, 5, 20, 0);
    const end = new Date(2026, 0, 7, 22, 0);

    expect(validateEventRange(start, end)).toEqual({ success: true });
  });

  it("rejects an end date before the start date", () => {
    const start = new Date(2026, 0, 7, 20, 0);
    const end = new Date(2026, 0, 5, 20, 0);

    expect(validateEventRange(start, end)).toEqual({
      success: false,
      error: "END_BEFORE_START",
    });
  });

  it("rejects a span longer than 90 days", () => {
    const start = new Date(2026, 0, 1, 20, 0);
    const end = new Date(2026, 3, 15, 20, 0); // ~104 days later

    expect(validateEventRange(start, end)).toEqual({
      success: false,
      error: "RANGE_TOO_LONG",
    });
  });
});
