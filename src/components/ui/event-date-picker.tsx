"use client";

import { format, type Locale, startOfDay } from "date-fns";
import { enUS, es, fr, ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const LOCALE_MAP: Record<string, Locale> = {
  pt: ptBR,
  en: enUS,
  es,
  fr,
};

type EventDatePickerProps = {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  id?: string;
};

export function EventDatePicker({
  value,
  onChange,
  placeholder = "Selecionar data & hora",
  className,
  id,
}: EventDatePickerProps) {
  const locale = useLocale();
  const dateFnsLocale = LOCALE_MAP[locale] ?? ptBR;
  const t = useTranslations();

  const [open, setOpen] = React.useState(false);

  // Derive HH:mm from value
  const timeStr = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : "";

  /** Merge a newly selected calendar day with the existing time (or 00:00) */
  const handleDaySelect = (day: Date | undefined) => {
    if (!day) {
      onChange?.(null);
      return;
    }
    const [h, m] = timeStr ? timeStr.split(":").map(Number) : [0, 0];
    const merged = new Date(day);
    merged.setHours(h, m, 0, 0);
    onChange?.(merged);
  };

  /** Merge a new time string with the existing calendar date (or today) */
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    const base = value ? new Date(value) : new Date();
    base.setHours(h ?? 0, m ?? 0, 0, 0);
    onChange?.(base);
  };

  const displayLabel = value
    ? format(value, "dd/MM/yyyy · HH:mm", { locale: dateFnsLocale })
    : null;

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            className={cn(
              "flex h-11 w-full items-center gap-2.5 rounded-xl border border-arena-border bg-arena-surface px-3.5 text-sm transition-colors",
              "hover:border-arena-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arena-primary/40",
              displayLabel ? "text-arena-text" : "text-arena-text-muted/70",
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-arena-text-muted" />
            <span>{displayLabel ?? placeholder}</span>
          </button>
        </PopoverTrigger>

        {/* z-[10000] to appear above the bottom sheet (z-[9999]) */}
        <PopoverContent
          align="start"
          className="w-auto rounded-2xl border border-arena-border bg-arena-bg-sec p-0 shadow-[0_16px_48px_rgba(0,0,0,.7)] z-[10000]"
        >
          <Calendar
            mode="single"
            captionLayout="label"
            selected={value ?? undefined}
            onSelect={handleDaySelect}
            /* Allow today and all future dates */
            fromDate={startOfDay(new Date())}
            locale={dateFnsLocale}
            className="bg-transparent"
            classNames={{
              root: "text-arena-text",
              today:
                "border border-arena-primary/40 text-arena-primary rounded-md",
              selected:
                "[&_button]:!bg-arena-primary [&_button]:!text-arena-bg [&_button]:font-semibold",
              disabled: "opacity-30 cursor-not-allowed",
            }}
          />

          {/* Time input row */}
          <div className="flex items-center gap-2.5 border-t border-arena-border px-3 pb-3 pt-2.5">
            <Clock className="size-4 shrink-0 text-arena-text-muted" />
            <span className="text-xs font-semibold text-arena-text-sec">
              {t("common.hour")}
            </span>
            <input
              type="time"
              value={timeStr}
              onChange={handleTimeChange}
              className="ml-auto h-8 rounded-lg border border-arena-border bg-arena-surface px-2.5 text-sm text-arena-text outline-none focus:border-arena-primary/50"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
