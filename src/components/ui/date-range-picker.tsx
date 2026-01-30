"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
  placeholder = "Selecione as datas",
}: DateRangePickerProps) {
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
                {format(date.from, "dd MMM", { locale: ptBR })} -{" "}
                {format(date.to, "dd MMM yyyy", { locale: ptBR })}
              </>
            ) : (
              format(date.from, "dd MMM yyyy", { locale: ptBR })
            )
          ) : (
            <span>{placeholder}</span>
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
          locale={ptBR}
          className="rounded-md"
          classNames={{
            root: "text-white [&_*]:text-white",
            // months:
            //   "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-3",
            // month: "space-y-4",
            // caption:
            //   "flex justify-center pt-1 relative items-center text-white",
            // caption_label: "text-sm font-medium text-white",
            // nav: "space-x-1 flex items-center",
            // button_previous: cn(
            //   "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-white hover:bg-white/10 rounded-md transition-all",
            // ),
            // button_next: cn(
            //   "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-white hover:bg-white/10 rounded-md transition-all",
            // ),
            // table: "w-full border-collapse space-y-1",
            // weekdays: "flex",
            // weekday: "text-white/60 rounded-md w-9 font-normal text-[0.8rem]",
            // week: "flex w-full mt-2",
            // day: cn(
            //   "h-9 w-9 text-center text-sm p-0 relative text-white/80 hover:bg-white/10 rounded-md transition-all",
            //   "focus-within:relative focus-within:z-20",
            // ),
            range_start:
              "[&_button]:bg-[#00cfb1] [&_button]:text-white [&_button]:hover:bg-[#00cfb1] [&_button]:hover:text-white [&_button]:focus:bg-[#00cfb1] [&_button]:focus:text-white rounded-l-md font-semibold",
            //   "bg-neon-secondary text-slate-900 hover:bg-neon-secondary hover:text-slate-900 rounded-l-md font-semibold",
            range_end:
              "[&_button]:bg-[#00cfb1] [&_button]:text-white [&_button]:hover:bg-[#00cfb1] [&_button]:hover:text-white [&_button]:focus:bg-[#00cfb1] [&_button]:focus:text-white rounded-r-md font-semibold",
            //   "[&_button]:bg-[#00cfb1] [&_button]:text-white [&_button]:hover:bg-[#00cfb1] [&_button]:hover:text-white [&_button]:focus:bg-[#00cfb1] [&_button]:focus:text-white rounded-r-md font-semibold",
            // selected:
            //   "[&_button]:bg-[#00cfb1] [&_button]:text-white [&_button]:hover:bg-[#00cfb1] [&_button]:hover:text-white [&_button]:focus:bg-[#00cfb1] [&_button]:focus:text-white",
            today:
              "[&_button]:bg-white/10 [&_button]:text-white [&_button]:font-semibold",
            // outside: "text-white/20 opacity-50",
            // disabled: "text-white/20 opacity-30",
            range_middle:
              "[&_button]:bg-[#00cfb1]/50 [&_button]:text-white [&_button]:hover:bg-[#00cfb1] [&_button]:hover:text-white [&_button]:focus:bg-[#00cfb1] [&_button]:focus:text-white rounded-none",
            hidden: "invisible",
          }}
          components={{
            DayButton: ({ className, children, ...props }: React.ComponentProps<typeof Button>) => {
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
            Confirmar
          </Button>
          <Button
            onClick={() => onDateChange?.(undefined)}
            variant="outline"
            className="min-h-[44px] w-fit justify-start rounded-full border-2 border-white/20 bg-white/10 px-4 py-2.5 text-left font-normal text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
          >
            <X className="text-neon-secondary mr-2 h-5 w-5" />
            Limpar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
