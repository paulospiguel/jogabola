/**
 * Time zone helpers for the club calendar. Fixtures are stored as UTC
 * instants; the UI reads and writes wall-clock times in the calendar's
 * time zone. Clubs have no time zone column yet, so the pilot uses Lisbon.
 */
export const CLUB_CALENDAR_TIME_ZONE = "Europe/Lisbon";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

function wallClockAt(instant: number, timeZone: string): WallClock {
  const parts = formatterFor(timeZone).formatToParts(new Date(instant));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(part => part.type === type)?.value ?? 0);
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
  };
}

function wallClockAsUtc(clock: WallClock) {
  return Date.UTC(
    clock.year,
    clock.month - 1,
    clock.day,
    clock.hour,
    clock.minute,
  );
}

/** Offset (ms) of `timeZone` from UTC at `instant`, minute precision. */
function offsetAt(instant: number, timeZone: string) {
  const truncated = Math.floor(instant / 60_000) * 60_000;
  return wallClockAsUtc(wallClockAt(truncated, timeZone)) - truncated;
}

/**
 * Converts a wall-clock date (`YYYY-MM-DD`) and time (`HH:mm`) in
 * `timeZone` to a UTC instant. Returns `null` for malformed input and for
 * times skipped by a daylight-saving jump.
 */
export function zonedWallTimeToUtc(
  date: string,
  time: string,
  timeZone: string = CLUB_CALENDAR_TIME_ZONE,
): Date | null {
  const dateMatch = DATE_PATTERN.exec(date);
  const timeMatch = TIME_PATTERN.exec(time);
  if (!dateMatch || !timeMatch) return null;

  const wanted: WallClock = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  };
  const guess = wallClockAsUtc(wanted);
  const roundTrip = new Date(guess);
  if (
    roundTrip.getUTCFullYear() !== wanted.year ||
    roundTrip.getUTCMonth() + 1 !== wanted.month ||
    roundTrip.getUTCDate() !== wanted.day
  ) {
    return null;
  }

  let instant = guess - offsetAt(guess, timeZone);
  const corrected = guess - offsetAt(instant, timeZone);
  if (corrected !== instant) instant = corrected;

  const check = wallClockAt(instant, timeZone);
  if (wallClockAsUtc(check) !== guess) return null;
  return new Date(instant);
}

export type WallTimeProblem =
  | "dateMissing"
  | "dateInvalid"
  | "timeMissing"
  | "timeInvalid"
  | "nonexistent";

/**
 * Like `zonedWallTimeToUtc`, but says which part is wrong so the form can
 * point at the date or the time field, and tell a daylight-saving gap apart
 * from a malformed value.
 */
export function parseWallTime(
  date: string,
  time: string,
  timeZone: string = CLUB_CALENDAR_TIME_ZONE,
): { instant: Date } | { problem: WallTimeProblem } {
  if (!date) return { problem: "dateMissing" };
  // Noon never falls in a DST gap, so it validates the calendar day alone.
  if (!zonedWallTimeToUtc(date, "12:00", timeZone)) {
    return { problem: "dateInvalid" };
  }
  if (!time) return { problem: "timeMissing" };
  if (!TIME_PATTERN.test(time)) return { problem: "timeInvalid" };
  const instant = zonedWallTimeToUtc(date, time, timeZone);
  return instant ? { instant } : { problem: "nonexistent" };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Calendar day (`YYYY-MM-DD`) of an instant in `timeZone`. */
export function zonedDateKey(
  instant: string | Date,
  timeZone: string = CLUB_CALENDAR_TIME_ZONE,
) {
  const clock = wallClockAt(new Date(instant).getTime(), timeZone);
  return `${clock.year}-${pad(clock.month)}-${pad(clock.day)}`;
}

/** Date and time input values (`YYYY-MM-DD`, `HH:mm`) in `timeZone`. */
export function zonedInputValues(
  instant: string | Date,
  timeZone: string = CLUB_CALENDAR_TIME_ZONE,
) {
  const clock = wallClockAt(new Date(instant).getTime(), timeZone);
  return {
    date: `${clock.year}-${pad(clock.month)}-${pad(clock.day)}`,
    time: `${pad(clock.hour)}:${pad(clock.minute)}`,
  };
}

/** Noon UTC of a `YYYY-MM-DD` key: a safe instant for formatting the day. */
export function dateKeyToNoonUtc(dateKey: string) {
  return new Date(`${dateKey}T12:00:00Z`);
}
