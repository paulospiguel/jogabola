"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
            id={id}
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
                if (date > today) {
                  return;
                }
              }
              handleDateChange(date ?? null);
            }}
            disabled={date => {
              const today = new Date();
              today.setHours(23, 59, 59, 999);
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
              selected:
                "[&_button]:bg-neon-primary [&_button]:text-slate-900 [&_button]:font-semibold [&_button]:hover:bg-neon-primary/90 [&_button]:focus:bg-neon-primary",
              today:
                "[&_button]:bg-white/10 [&_button]:text-white [&_button]:font-semibold",
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
