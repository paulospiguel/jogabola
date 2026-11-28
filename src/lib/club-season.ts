/**
 * Football seasons run from July to June. A new club starts with the season
 * that contains "today" in the club calendar's time zone (Lisbon in the
 * pilot), so the captain can mark the first fixture right away.
 */
export const DEFAULT_SEASON_TIME_ZONE = "Europe/Lisbon";

/** First month of the football season (1-based: 7 = July). */
const SEASON_START_MONTH = 7;

export interface FootballSeason {
  /** Display name, e.g. "2026/27". */
  name: string;
  /** YYYY-MM-DD, first day of July. */
  startsOn: string;
  /** YYYY-MM-DD, last day of June of the following year. */
  endsOn: string;
}

function localYearMonth(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);
  const value = (type: "year" | "month") =>
    Number(parts.find(part => part.type === type)?.value);
  return { year: value("year"), month: value("month") };
}

export function currentFootballSeason(
  now: Date = new Date(),
  timeZone: string = DEFAULT_SEASON_TIME_ZONE,
): FootballSeason {
  const { year, month } = localYearMonth(now, timeZone);
  const startYear = month >= SEASON_START_MONTH ? year : year - 1;
  const endYear = startYear + 1;
  return {
    name: `${startYear}/${String(endYear % 100).padStart(2, "0")}`,
    startsOn: `${startYear}-07-01`,
    endsOn: `${endYear}-06-30`,
  };
}
