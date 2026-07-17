import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { enUS, es, fr, type Locale, pt } from "date-fns/locale";
import type { EventType } from "../_types/calendar-events";

export const DATE_LOCALES: Record<string, Locale> = { pt, en: enUS, es, fr };

export const TYPE_CONFIG: Record<
  EventType,
  { bg: string; border: string; text: string; dot: string }
> = {
  game: {
    bg: "color-mix(in srgb, var(--color-arena-primary) 7%, transparent)",
    border: "color-mix(in srgb, var(--color-arena-primary) 28%, transparent)",
    text: "var(--color-arena-primary)",
    dot: "var(--color-arena-primary)",
  },
  training: {
    bg: "color-mix(in srgb, var(--color-arena-info) 7%, transparent)",
    border: "color-mix(in srgb, var(--color-arena-info) 28%, transparent)",
    text: "var(--color-arena-info)",
    dot: "var(--color-arena-info)",
  },
  event: {
    bg: "color-mix(in srgb, var(--color-arena-warning) 7%, transparent)",
    border: "color-mix(in srgb, var(--color-arena-warning) 28%, transparent)",
    text: "var(--color-arena-warning)",
    dot: "var(--color-arena-warning)",
  },
};

export function inferType(title: string): EventType {
  const lower = title.toLowerCase();
  if (
    /treino|training|treinar|pré-época|pre-season|tático|preparação/.test(lower)
  ) {
    return "training";
  }
  if (
    /jogo|game|partida|match|vs\.?|contra|cup|liga|torneio|amigável/.test(lower)
  ) {
    return "game";
  }
  return "event";
}

export function toDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date;
}

export function formatDuration(
  start: Date | string,
  end: Date | string | null,
): string {
  if (!end) return format(toDate(start), "HH:mm");
  return `${format(toDate(start), "HH:mm")} – ${format(toDate(end), "HH:mm")}`;
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + index);
    return day;
  });
}

function getMondayOffset(date: Date): number {
  const day = getDay(date);
  return day === 0 ? 6 : day - 1;
}

export function getMonthGrid(monthStart: Date): Date[] {
  const start = startOfMonth(monthStart);
  const end = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start, end });
  const offset = getMondayOffset(days[0]);
  const prefix = Array.from({ length: offset }, (_, index) =>
    subDays(days[0], offset - index),
  );
  const total = prefix.length + days.length;
  const remainder = total % 7;
  const suffix =
    remainder > 0
      ? Array.from({ length: 7 - remainder }, (_, index) =>
          addDays(days[days.length - 1], index + 1),
        )
      : [];
  return [...prefix, ...days, ...suffix];
}
