"use client";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import type { DayPickerSingleProps } from "react-day-picker";

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
  extends Omit<DayPickerSingleProps, "modifiers" | "mode"> {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  showTotal?: boolean;
  className?: string;
  classNames?: Record<string, string>;
}

const eventColors: Record<EventType, string> = {
  jogo: "bg-red-500",
  treino: "bg-black",
  amistoso: "bg-purple-500",
  reuniao: "bg-yellow-500",
  outro: "bg-gray-500",
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
  const DayButtonComponent = (buttonProps: any) => {
    const { day, modifiers, className, ...rest } = buttonProps;
    const date: Date = day.date;
    const dateKey = date.toDateString();
    const dayEvents = eventsByDate[dateKey] || [];
    const hasEvents = dayEvents.length > 0;
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      if (modifiers.focused) {
        buttonRef.current?.focus();
      }
    }, [modifiers.focused]);

    const renderEventIcons = () => {
      if (!hasEvents) {
        return <div className="min-h-[20px]" />;
      }

      const displayedEvents = dayEvents.slice(0, 3);

      return (
        <div className="flex min-h-[20px] items-center justify-center gap-1.5">
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
                  className={cn(
                    "flex h-5 w-5 cursor-pointer items-center justify-center rounded-[10px] bg-white text-[11px] shadow-sm transition-colors hover:bg-neutral-50",
                    event.iconBg
                  )}
                  onClick={handleClick}
                >
                  <span
                    className={cn(
                      "text-[11px] leading-none text-gray-700",
                      event.iconClassName
                    )}
                  >
                    {event.icon}
                  </span>
                </span>
              );
            }

            return (
              <span
                key={key}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-[10px] bg-white shadow-sm transition-colors hover:bg-neutral-50"
                onClick={handleClick}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    eventColors[event.type]
                  )}
                />
              </span>
            );
          })}
          {dayEvents.length > 3 && (
            <span className="flex h-5 min-w-[20px] cursor-pointer items-center justify-center rounded-[10px] bg-gray-100 px-1 text-[10px] font-semibold text-gray-500">
              +{dayEvents.length - 3}
            </span>
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
          "group relative mx-auto flex h-[72px] w-full flex-col items-center justify-between rounded-[22px] border border-transparent bg-[#F6F6F6] px-0 py-2.5 text-sm font-medium text-gray-500 transition-all hover:border-gray-200 hover:bg-[#f2f2f2] focus-visible:outline-none",
          hasEvents ? "text-gray-800" : "text-gray-500",
          modifiers.selected &&
            "border border-[#FF6B4A] bg-white text-[#FF6B4A] shadow-[0_12px_32px_-20px_rgba(255,107,74,0.6)]",
          modifiers.outside && "bg-white text-gray-300"
        )}
      >
        {renderEventIcons()}
        <span
          className={cn(
            "text-[15px] font-medium",
            modifiers.selected && "font-semibold",
            modifiers.outside && "text-gray-300"
          )}
        >
          {date.getDate()}
        </span>
        {hasEvents ? (
          <span
            className={cn(
              "block h-1.5 w-1.5 rounded-full bg-gray-700",
              modifiers.selected && "bg-[#FF6B4A]"
            )}
          />
        ) : (
          <span className="h-1.5 w-1.5" />
        )}
      </button>
    );
  };

  const selectedWeekday = selected?.getDay();
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
    // Não chamamos onSelect aqui pois é apenas para mudança de mês, não seleção de data
  };

  return (
    <div className="w-full rounded-[32px] border border-gray-100 bg-white p-8 shadow-[0_32px_60px_-45px_rgba(15,23,42,0.45)]">
      {/* Header com botões Week/Month */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-1.5 rounded-full border border-gray-200 bg-gray-100 p-1.5">
          <button
            onClick={() => setViewMode("week")}
            className={cn(
              "min-w-[90px] rounded-full px-5 py-2 text-sm font-medium transition-all",
              viewMode === "week"
                ? "bg-white text-gray-900 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.45)]"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={cn(
              "min-w-[90px] rounded-full px-5 py-2 text-sm font-medium transition-all",
              viewMode === "month"
                ? "bg-white text-gray-900 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.45)]"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            Month
          </button>
        </div>
      </div>

      {/* Navegação do mês e total */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleMonthChange("prev")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {monthName}{" "}
            <span className="font-normal text-gray-500">{year}</span>
          </h2>
          <button
            onClick={() => handleMonthChange("next")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {showTotal && (
          <div className="text-base font-medium text-gray-500">
            Monthly total:{" "}
            <span className="font-semibold text-gray-900">
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
          months: "flex flex-col space-y-6",
          month: "space-y-4 w-full",
          caption: "hidden", // Escondemos porque criamos nosso próprio header
          nav: "hidden", // Escondemos porque criamos nossos próprios botões
          table: "w-full table-fixed border-separate border-spacing-x-4 border-spacing-y-5",
          head_row: "grid grid-cols-7 mb-3",
          head_cell:
            "text-center text-xs font-medium uppercase tracking-[0.08em] text-gray-400",
          row: "grid grid-cols-7",
          cell: "flex items-center justify-center p-0 align-top text-sm",
          day: cn(
            "rdp-day h-auto w-full border-0 bg-transparent p-0 font-normal",
            "hover:bg-transparent focus-visible:outline-none focus-visible:ring-0"
          ),
          day_selected: "",
          day_today: "",
          day_outside: "text-gray-300",
          day_disabled: "text-gray-300 opacity-50",
          day_range_middle: "",
          day_hidden: "invisible",
          ...classNames,
        }}
        formatters={{
          formatWeekdayName: date => {
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
