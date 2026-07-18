import {
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";

/**
 * Pure, framework-free scheduling logic for the create-event flow. No
 * DB/React imports here — keep this deterministic and unit-testable.
 */

export const MAX_RECURRING_OCCURRENCES = 104;
export const MAX_RANGE_DAYS = 90;

export type RecurrenceFrequency = "weekly" | "monthly";

export interface GenerateOccurrencesInput {
  start: Date;
  frequency: RecurrenceFrequency;
  /** Series boundary — only its calendar date is used, its time is ignored. */
  endDate: Date;
}

export type GenerateOccurrencesResult =
  | { success: true; occurrences: Date[] }
  | { success: false; error: "END_BEFORE_START" | "TOO_MANY_OCCURRENCES" };

export function generateRecurringOccurrences({
  start,
  frequency,
  endDate,
}: GenerateOccurrencesInput): GenerateOccurrencesResult {
  const boundary = startOfDay(endDate);

  if (startOfDay(start).getTime() > boundary.getTime()) {
    return { success: false, error: "END_BEFORE_START" };
  }

  const step = frequency === "weekly" ? addWeeks : addMonths;
  const occurrences: Date[] = [];

  for (let n = 0; n <= MAX_RECURRING_OCCURRENCES; n++) {
    const occurrence = step(start, n);
    if (startOfDay(occurrence).getTime() > boundary.getTime()) break;
    occurrences.push(occurrence);
  }

  if (occurrences.length > MAX_RECURRING_OCCURRENCES) {
    return { success: false, error: "TOO_MANY_OCCURRENCES" };
  }

  return { success: true, occurrences };
}

export type ValidateRangeResult =
  | { success: true }
  | { success: false; error: "END_BEFORE_START" | "RANGE_TOO_LONG" };

export function validateEventRange(
  start: Date,
  end: Date,
): ValidateRangeResult {
  if (end.getTime() < start.getTime()) {
    return { success: false, error: "END_BEFORE_START" };
  }

  if (differenceInCalendarDays(end, start) > MAX_RANGE_DAYS) {
    return { success: false, error: "RANGE_TOO_LONG" };
  }

  return { success: true };
}
