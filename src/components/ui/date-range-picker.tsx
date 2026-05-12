"use client";

import { format } from "date-fns";
import { enUS, es, fr, pt } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

const LOCALE_MAP = {
  pt: pt,
  en: enUS,
  es: es,
  fr: fr,
};

export function DateRangePicker({
  date,
  onDateChange,
  className,
  placeholder,
}: DateRangePickerProps) {
  const t = useTranslations("common");
  const locale = useLocale() as keyof typeof LOCALE_MAP;
  const dfLocale = LOCALE_MAP[locale] || pt;
  const currentPlaceholder = placeholder || t("selectDates");
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "min-h-[44px] w-full justify-start rounded-full border-2 border-white/20 bg-white/10 px-4 py-2.5 text-left font-normal text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white",
            "[&:focus]:!rounded-full [&:focus-visible]:!rounded-full [&:focus-within]:!rounded-full",
            !date && "text-white/60",
            className,
          )}
          style={{ borderRadius: "9999px" }}
        >
          <CalendarIcon className="text-neon-secondary mr-2 h-5 w-5" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "dd MMM", { locale: dfLocale })} -{" "}
                {format(date.to, "dd MMM yyyy", { locale: dfLocale })}
              </>
            ) : (
              format(date.from, "dd MMM yyyy", { locale: dfLocale })
            )
          ) : (
            <span>{currentPlaceholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-white/10 bg-[#0b1933]/98 p-0 shadow-2xl backdrop-blur-xl"
        align="start"
      >
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={onDateChange}
          numberOfMonths={2}
          locale={dfLocale}
          className="rounded-md"
          classNames={{
            root: "text-white [&_*]:text-white",
            range_start:
              "[&_button]:bg-[#00cfb1] [&_button]:text-white [&_button]:hover:bg-[#00cfb1] [&_button]:hover:text-white [&_button]:focus:bg-[#00cfb1] [&_button]:focus:text-white rounded-l-md font-semibold",
            range_end:
              "[&_button]:bg-[#00cfb1] [&_button]:text-white [&_button]:hover:bg-[#00cfb1] [&_button]:hover:text-white [&_button]:focus:bg-[#00cfb1] [&_button]:focus:text-white rounded-r-md font-semibold",
            today:
              "[&_button]:bg-white/10 [&_button]:text-white [&_button]:font-semibold",
            range_middle:
              "[&_button]:bg-[#00cfb1]/50 [&_button]:text-white [&_button]:hover:bg-[#00cfb1] [&_button]:hover:text-white [&_button]:focus:bg-[#00cfb1] [&_button]:focus:text-white rounded-none",
            hidden: "invisible",
          }}
          components={{
            DayButton: ({
              className,
              children,
              ...props
            }: React.ComponentProps<typeof Button>) => {
              return (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-full font-normal !text-white transition-colors hover:bg-white/10 data-[selected-single=true]:!bg-[#00cfb1] data-[selected-single=true]:!text-white",
                    className,
                  )}
                  style={{ color: "white" }}
                  {...props}
                >
                  <span style={{ color: "white" }} className="text-sm">
                    {children}
                  </span>
                </Button>
              );
            },
          }}
        />
        <div className="flex justify-end gap-2 px-2 pb-2">
          <Button
            onClick={() => setOpen(false)}
            variant="outline"
            className="min-h-[44px] w-fit justify-start rounded-full border-2 border-white/20 bg-white/10 px-4 py-2.5 text-left font-normal text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
          >
            <Check className="text-neon-secondary mr-2 h-5 w-5" />
            {t("confirm")}
          </Button>
          <Button
            onClick={() => onDateChange?.(undefined)}
            variant="outline"
            className="min-h-[44px] w-fit justify-start rounded-full border-2 border-white/20 bg-white/10 px-4 py-2.5 text-left font-normal text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
          >
            <X className="text-neon-secondary mr-2 h-5 w-5" />
            {t("clear")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
