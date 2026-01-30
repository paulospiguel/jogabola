"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";

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

type DatePickerProps = {
  placeholder?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  className?: string;
  id?: string;
};

export function DatePicker({
  placeholder = "Select date",
  value,
  onChange,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        return;
      }
    }
    onChange?.(date || null);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "mt-2 flex h-10 w-full items-center justify-between rounded-full border border-white/8 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-white/60 transition-all duration-300 hover:border-neon-primary/50 hover:bg-white/10 focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-neon-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
              !value && "text-white/60",
            )}
          >
            {(() => {
              if (!value) {
                return <span>{placeholder}</span>;
              }
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const birthDate = new Date(value);
              birthDate.setHours(0, 0, 0, 0);
              return birthDate <= today ? (
                format(value, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>{placeholder}</span>
              );
            })()}
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border border-white/8 bg-[#050312]/95 p-3 shadow-[0_35px_80px_-45px_rgba(36,255,230,0.8)] backdrop-blur-xl rounded-2xl"
          align="start"
        >
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={(() => {
              if (!value) return undefined;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const birthDate = new Date(value);
              birthDate.setHours(0, 0, 0, 0);
              return birthDate <= today ? value : undefined;
            })()}
            onSelect={date => {
              if (date) {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                // Validar que a data não é no futuro
                if (date > today) {
                  return; // Não permitir selecionar
                }
              }
              handleDateChange(date ?? null);
            }}
            disabled={date => {
              const today = new Date();
              today.setHours(23, 59, 59, 999); // Fim do dia de hoje
              return date > today || date < new Date("1900-01-01");
            }}
            fromDate={new Date("1900-01-01")}
            toDate={new Date()}
            fromYear={1900}
            toYear={new Date().getFullYear()}
            initialFocus
            locale={ptBR}
            className="bg-transparent p-0"
            classNames={{
              root: "text-white [&_*]:text-white",
              // months: "flex flex-col space-y-4",
              // month: "space-y-4",
              // months_dropdown: "bg-red-500",
              // month_caption:
              //   "flex justify-center pt-1 relative items-center mb-4 ",
              // caption_label: "text-sm font-medium text-white",
              // nav: "space-x-1 flex items-center",
              // button_previous: cn(
              //   "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors absolute left-1 [&>svg]:text-white",
              // ),
              // button_next: cn(
              //   "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors absolute right-1 [&>svg]:text-white",
              // ),
              // table: "w-full border-collapse",
              // weekdays: "flex mb-2",
              // weekday:
              //   "text-white/60 w-9 font-normal text-[0.8rem] text-center",
              // week: "flex w-full mt-1",
              // day: cn(
              //   "h-9 w-9 p-0 font-normal rounded-full [&_button]:text-white [&_button]:hover:bg-white/10 [&_button]:transition-colors",
              // ),
              // range_end: "day-range-end",
              selected:
                "[&_button]:bg-neon-primary [&_button]:text-slate-900 [&_button]:font-semibold [&_button]:hover:bg-neon-primary/90 [&_button]:focus:bg-neon-primary",
              today:
                "[&_button]:bg-white/10 [&_button]:text-white [&_button]:font-semibold",
              // outside: "[&_button]:text-white/30 [&_button]:opacity-50",
              // disabled:
              //   "[&_button]:text-white/20 [&_button]:opacity-50 [&_button]:cursor-not-allowed",
              // range_middle: "[&_button]:bg-white/10 [&_button]:text-white",
              hidden: "invisible",
            }}
            components={{
              DayButton: ({ className, children, ...props }: React.ComponentProps<typeof Button>) => {
                return (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-full font-normal text-white! transition-colors hover:bg-white/10 data-[selected-single=true]:bg-neon-primary! data-[selected-single=true]:text-slate-900! data-[selected-single=true]:font-semibold!",
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
