import {
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { useLocale } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { DateRange } from "react-day-picker";
import { getCalendarEvents } from "@/actions/match-sessions.actions";
import { useTeams } from "@/hooks/use-teams";
import type { SessionRow, ViewMode } from "../_types/calendar-events";
import {
  DATE_LOCALES,
  getWeekDays,
  toDate,
} from "../_utils/calendar-event-utils";

interface UseCalendarEventsStateParams {
  initialEvents: SessionRow[];
  initialWeekStart: string;
}

export function useCalendarEventsState({
  initialEvents,
  initialWeekStart,
}: UseCalendarEventsStateParams) {
  const locale = useLocale();
  const { activeTeamId } = useTeams();
  const dfLocale = DATE_LOCALES[locale] ?? DATE_LOCALES.pt;
  const [isPending, startTransition] = useTransition();
  const fetchRequestId = useRef(0);

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [weekStart, setWeekStart] = useState<Date>(
    () => new Date(initialWeekStart),
  );
  const [monthStart, setMonthStart] = useState<Date>(() =>
    startOfMonth(new Date()),
  );
  const [yearStart, setYearStart] = useState<Date>(() =>
    startOfYear(new Date()),
  );
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    undefined,
  );
  const [rangeOpen, setRangeOpen] = useState(false);
  const [events, setEvents] = useState<SessionRow[]>(initialEvents);

  const { from, to, navLabel } = useMemo(() => {
    switch (viewMode) {
      case "week": {
        const fromDate = weekStart;
        const toDateValue = endOfWeek(weekStart, { weekStartsOn: 1 });
        return {
          from: fromDate,
          to: toDateValue,
          navLabel: `${format(fromDate, "d MMM", { locale: dfLocale })} – ${format(toDateValue, "d MMM yyyy", { locale: dfLocale })}`,
        };
      }
      case "month": {
        const fromDate = startOfMonth(monthStart);
        const toDateValue = endOfMonth(monthStart);
        return {
          from: fromDate,
          to: toDateValue,
          navLabel: format(monthStart, "MMMM yyyy", { locale: dfLocale }),
        };
      }
      case "year": {
        const fromDate = startOfYear(yearStart);
        const toDateValue = endOfYear(yearStart);
        return {
          from: fromDate,
          to: toDateValue,
          navLabel: format(yearStart, "yyyy"),
        };
      }
      case "range": {
        if (customRange?.from && customRange?.to) {
          return {
            from: customRange.from,
            to: endOfDay(customRange.to),
            navLabel: `${format(customRange.from, "d MMM", { locale: dfLocale })} – ${format(customRange.to, "d MMM yyyy", { locale: dfLocale })}`,
          };
        }
        return { from: new Date(), to: new Date(), navLabel: "" };
      }
    }
  }, [viewMode, weekStart, monthStart, yearStart, customRange, dfLocale]);

  const fetchPeriod = useCallback(
    (fromDate: Date, toDateValue: Date) => {
      fetchRequestId.current += 1;
      const requestId = fetchRequestId.current;

      startTransition(async () => {
        const result = await getCalendarEvents(
          fromDate,
          toDateValue,
          activeTeamId ?? undefined,
        );
        if (requestId === fetchRequestId.current && result.success) {
          setEvents(result.data as SessionRow[]);
        }
      });
    },
    [activeTeamId],
  );

  useEffect(() => {
    if (!activeTeamId) {
      fetchRequestId.current += 1;
      setEvents([]);
      return;
    }

    fetchPeriod(from, to);
  }, [activeTeamId, fetchPeriod, from, to]);

  function navigate(dir: "prev" | "next") {
    switch (viewMode) {
      case "week": {
        const next =
          dir === "prev" ? subWeeks(weekStart, 1) : addWeeks(weekStart, 1);
        setWeekStart(startOfWeek(next, { weekStartsOn: 1 }));
        break;
      }
      case "month": {
        const next =
          dir === "prev" ? subMonths(monthStart, 1) : addMonths(monthStart, 1);
        setMonthStart(startOfMonth(next));
        break;
      }
      case "year": {
        const next =
          dir === "prev" ? subYears(yearStart, 1) : addYears(yearStart, 1);
        setYearStart(startOfYear(next));
        break;
      }
    }
  }

  function switchMode(mode: ViewMode) {
    setViewMode(mode);
  }

  const eventsByDate = useMemo(() => {
    const map: Record<string, SessionRow[]> = {};
    for (const event of events) {
      const key = format(toDate(event.startsAt), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(event);
    }
    return map;
  }, [events]);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  return {
    customRange,
    dfLocale,
    events,
    eventsByDate,
    isPending,
    monthStart,
    navigate,
    navLabel,
    rangeOpen,
    setCustomRange,
    setMonthStart,
    setRangeOpen,
    setViewMode,
    switchMode,
    totalEvents: events.length,
    viewMode,
    weekDays,
    yearStart,
  };
}
