"use client";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { DayButton, DayPicker } from "react-day-picker";

type DayPickerProps = React.ComponentProps<typeof DayPicker>;

export type EventType = "jogo" | "treino" | "amistoso" | "reuniao" | "outro";

export interface CalendarEvent {
  date: Date;
  type: EventType;
  title?: string;
  value?: number;
  icon?: React.ReactNode;
  iconBg?: string;
  iconClassName?: string;
}

interface EventCalendarProps
  extends Omit<DayPickerProps, "modifiers" | "mode"> {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  showTotal?: boolean;
  className?: string;
  classNames?: Record<string, string>;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

const eventColors: Record<EventType, string> = {
  jogo: "bg-[#24ffe6]",
  treino: "bg-[#6fffe9]",
  amistoso: "bg-[#02a7ff]",
  reuniao: "bg-[#ba93ff]",
  outro: "bg-white/40",
};

export function EventCalendar({
  events = [],
  onEventClick,
  className,
  classNames,
  selected,
  onSelect,
  showTotal = true,
  ...props
}: EventCalendarProps) {
  const initialMonth = selected ?? new Date();
  const [viewMode, setViewMode] = useState<"week" | "month">("month");
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  useEffect(() => {
    if (!selected) {
      return;
    }

    const sameMonth =
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear();

    if (!sameMonth) {
      setCurrentMonth(selected);
    }
  }, [selected, currentMonth]);

  // Agrupar eventos por data
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const dateKey = event.date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Calcular total do mês
  const monthlyTotal = useMemo(() => {
    const monthEvents = events.filter(event => {
      return (
        event.date.getMonth() === currentMonth.getMonth() &&
        event.date.getFullYear() === currentMonth.getFullYear()
      );
    });
    return monthEvents.reduce((total, event) => total + (event.value || 0), 0);
  }, [events, currentMonth]);

  const monthlyTotalLabel = useMemo(() => `$${monthlyTotal}`, [monthlyTotal]);

  // Componente customizado para renderizar os botões dos dias com eventos
  const DayButtonComponent = (
    buttonProps: React.ComponentProps<typeof DayButton>
  ) => {
    const { day, modifiers, className, ...rest } = buttonProps;
    const date: Date = day.date;
    const dateKey = date.toDateString();
    const dayEvents = eventsByDate[dateKey] || [];
    const hasEvents = dayEvents.length > 0;
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const isToday = new Date().toDateString() === dateKey;

    React.useEffect(() => {
      if (modifiers.focused) {
        buttonRef.current?.focus();
      }
    }, [modifiers.focused]);

    const renderEventIcons = () => {
      if (!hasEvents) {
        return null;
      }

      const displayedEvents = dayEvents.slice(0, 2);

      return (
        <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center justify-center gap-1">
          {displayedEvents.map((event, index) => {
            const key = `${dateKey}-icon-${index}`;
            const handleClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              onEventClick?.(event);
            };

            if (event.icon) {
              return (
                <span
                  key={key}
                  className="flex h-4 w-4 cursor-pointer items-center justify-center text-[10px] transition-transform hover:scale-110"
                  onClick={handleClick}
                >
                  {event.icon}
                </span>
              );
            }

            return (
              <span
                key={key}
                className={cn(
                  "h-1.5 w-1.5 cursor-pointer rounded-full transition-all hover:scale-125",
                  eventColors[event.type]
                )}
                onClick={handleClick}
              />
            );
          })}
          {dayEvents.length > 2 && (
            <span className="h-1 w-1 rounded-full bg-white/60" />
          )}
        </div>
      );
    };

    return (
      <button
        {...rest}
        ref={buttonRef}
        type="button"
        className={cn(
          className,
          "group relative flex h-20 w-full items-center justify-center rounded-xl border border-white/8 bg-white/5 text-sm font-medium text-white/70 backdrop-blur transition-all duration-300 hover:border-[#24ffe6]/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6fffe9]/40",
          isToday && "border-[#6fffe9]/50 bg-[#6fffe9]/10 text-[#6fffe9]",
          modifiers.selected &&
            "border-[#24ffe6] bg-[#24ffe6]/20 text-white shadow-[0_8px_24px_-12px_rgba(36,255,230,0.6)]",
          modifiers.outside && "text-white/30 hover:border-white/5 hover:bg-white/5"
        )}
      >
        <span
          className={cn(
            "relative z-10 text-lg font-bold",
            modifiers.selected && "text-[#24ffe6]",
            isToday && !modifiers.selected && "text-[#6fffe9]"
          )}
        >
          {date.getDate()}
        </span>
        {renderEventIcons()}
      </button>
    );
  };


  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  const handleMonthChange = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(
      currentMonth.getMonth() + (direction === "next" ? 1 : -1),
    );
    setCurrentMonth(newMonth);
  };

  return (
    <div className="w-full rounded-3xl border border-white/8 bg-white/5 p-8 backdrop-blur-xl">
      {/* Header com botões Week/Month */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
          <button
            onClick={() => setViewMode("week")}
            className={cn(
              "min-w-[90px] rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
              viewMode === "week"
                ? "bg-[#24ffe6] text-slate-900 shadow-[0_8px_18px_-12px_rgba(36,255,230,0.9)]"
                : "text-white/60 hover:text-white",
            )}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={cn(
              "min-w-[90px] rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
              viewMode === "month"
                ? "bg-[#24ffe6] text-slate-900 shadow-[0_8px_18px_-12px_rgba(36,255,230,0.9)]"
                : "text-white/60 hover:text-white",
            )}
          >
            Month
          </button>
        </div>
      </div>

      {/* Navegação do mês e total */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleMonthChange("prev")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 backdrop-blur transition-all duration-300 hover:border-[#24ffe6]/40 hover:bg-white/10 hover:text-[#24ffe6]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {monthName}{" "}
            <span className="font-normal text-white/60">{year}</span>
          </h2>
          <button
            onClick={() => handleMonthChange("next")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 backdrop-blur transition-all duration-300 hover:border-[#24ffe6]/40 hover:bg-white/10 hover:text-[#24ffe6]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {showTotal && (
          <div className="text-sm font-medium text-white/60">
            Monthly total:{" "}
            <span className="font-bold text-[#24ffe6]">
              {monthlyTotalLabel}
            </span>
          </div>
        )}
      </div>

      {/* Calendário */}
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className={cn("w-full border-0 p-0", className)}
        classNames={{
          root: "w-full",
          months: "flex flex-col space-y-6",
          caption: "hidden",
          nav: "hidden",
          table: "w-full table-fixed border-separate border-spacing-3",
          head_row: "grid grid-cols-7 mb-4",
          head_cell:
            "text-center text-sm font-semibold uppercase tracking-[0.15em] text-[#6fffe9]/80",
          row: "grid grid-cols-7 gap-3",
          cell: "flex items-center justify-center p-0 text-sm",
          day: cn(
            "rdp-day h-auto w-full border-0 bg-transparent p-0.5 font-normal",
            "hover:bg-transparent focus-visible:outline-none focus-visible:ring-0"
          ),
          day_selected: "",
          day_today: "",
          day_outside: "text-white/20",
          day_disabled: "text-white/20 opacity-50",
          day_range_middle: "",
          day_hidden: "invisible",
          ...classNames,
        }}
        formatters={{
          formatWeekdayName: (date: Date) => {
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const dayIndex = date.getDay();
            const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            return days[adjustedIndex];
          },
        }}
        weekStartsOn={1}
        components={{
          DayButton: DayButtonComponent,
        }}
        {...props}
      />
    </div>
  );
}
