"use client";

import { format, type Locale, startOfDay } from "date-fns";
import { enUS, es, fr, ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useLocale } from "next-intl";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const LOCALE_MAP: Record<string, Locale> = {
  pt: ptBR,
  en: enUS,
  es,
  fr,
};

const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30",
];

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
  const [open, setOpen] = React.useState(false);

  const selectedTimeStr = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : null;

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) {
      onChange?.(null);
      return;
    }
    const [h, m] = selectedTimeStr ? selectedTimeStr.split(":").map(Number) : [0, 0];
    const merged = new Date(day);
    merged.setHours(h, m, 0, 0);
    onChange?.(merged);
  };

  const handleTimeSelect = (slot: string) => {
    const [h, m] = slot.split(":").map(Number);
    const base = value ? new Date(value) : new Date();
    base.setHours(h, m, 0, 0);
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

        <PopoverContent
          align="center"
          className="w-auto rounded-2xl border border-arena-border bg-arena-bg-sec p-0 shadow-[0_16px_48px_rgba(0,0,0,.7)] z-[10000]"
        >
          <div className="flex max-sm:flex-col">
            <Calendar
              mode="single"
              captionLayout="label"
              selected={value ?? undefined}
              onSelect={handleDaySelect}
              fromDate={startOfDay(new Date())}
              locale={dateFnsLocale}
              className="bg-transparent"
              classNames={{
                root: "text-arena-text",
                today: "border border-arena-primary/40 text-arena-primary rounded-md",
                selected:
                  "[&_button]:!bg-arena-primary [&_button]:!text-arena-bg [&_button]:font-semibold",
                disabled: "opacity-30 cursor-not-allowed",
              }}
            />

            <div className="relative w-full max-sm:h-52 sm:w-36">
              <div className="absolute inset-0 py-3 max-sm:border-t border-arena-border">
                <ScrollArea className="h-full sm:border-s border-arena-border">
                  <div className="space-y-2.5">
                    <div className="flex h-5 shrink-0 items-center px-4">
                      <p className="text-[11px] font-semibold text-arena-text-muted uppercase tracking-wide">
                        {value ? format(value, "EEE, d", { locale: dateFnsLocale }) : "Hora"}
                      </p>
                    </div>
                    <div className="grid gap-1 px-3">
                      {TIME_SLOTS.map(slot => (
                        <Button
                          key={slot}
                          type="button"
                          size="sm"
                          variant={selectedTimeStr === slot ? "default" : "outline"}
                          onClick={() => handleTimeSelect(slot)}
                          className={cn(
                            "w-full h-8 text-[12px] font-semibold rounded-lg border transition-colors",
                            selectedTimeStr === slot
                              ? "bg-arena-primary text-arena-bg border-arena-primary hover:bg-arena-primary/90"
                              : "border-arena-border bg-transparent text-arena-text-sec hover:border-arena-primary/40 hover:text-arena-text hover:bg-arena-primary/5",
                          )}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
