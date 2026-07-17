"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { format, type Locale, startOfDay } from "date-fns";
import { enUS, es, fr, pt } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const LOCALE_MAP: Record<string, Locale> = {
  pt: pt,
  en: enUS,
  es,
  fr,
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

const ITEM_H = 36; // px height of each drum item

function DrumPicker({
  items,
  value,
  onChange,
  label,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = React.useRef(false);
  const isMounted = React.useRef(false);
  const scrollTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const debounceTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [localValue, setLocalValue] = React.useState(value);

  // Sincroniza localValue quando a prop value mudar externamente
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const selectedIdx = items.indexOf(value);
    const targetTop = selectedIdx * ITEM_H;

    // No primeiro render, posiciona instantaneamente sem animação
    if (!isMounted.current) {
      el.scrollTop = targetTop;
      isMounted.current = true;
      return;
    }

    // Apenas faz scroll suave se a diferença for relevante
    if (Math.abs(el.scrollTop - targetTop) > 4) {
      isProgrammaticScroll.current = true;
      el.scrollTo({ top: targetTop, behavior: "smooth" });

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 350);
    }
  }, [value, items]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScroll.current) return;

    const el = e.currentTarget;
    const idx = Math.round(el.scrollTop / ITEM_H);

    if (idx >= 0 && idx < items.length) {
      const newValue = items[idx];

      // Atualiza o destaque visual de imediato para uma resposta tátil excelente
      if (newValue !== localValue) {
        setLocalValue(newValue);
      }

      // Debounce do onChange externo para não bloquear a inércia e o scroll livre
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        if (newValue !== value) {
          onChange(newValue);
        }
      }, 120);
    }
  };

  // Limpeza ao desmontar
  React.useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <p className="text-[9px] font-bold text-arena-text-muted uppercase tracking-widest pb-0.5">
        {label}
      </p>

      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ height: ITEM_H * 3 }}
      >
        {/* Highlight strip */}
        <div
          className="pointer-events-none absolute left-0 right-0 z-10 rounded-lg border border-arena-primary/30 bg-arena-primary/8"
          style={{ top: ITEM_H, height: ITEM_H }}
        />
        {/* Fade masks */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 z-20 bg-gradient-to-b from-arena-bg-sec to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 z-20 bg-gradient-to-t from-arena-bg-sec to-transparent" />

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto scrollbar-none snap-y snap-mandatory"
        >
          <div style={{ height: ITEM_H }} />
          {items.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              style={{ height: ITEM_H }}
              className={cn(
                "snap-center w-full flex items-center justify-center text-[15px] font-bold tabular-nums transition-all",
                item === localValue
                  ? "text-arena-primary scale-110"
                  : "text-arena-text-muted hover:text-arena-text",
              )}
            >
              {item}
            </button>
          ))}
          <div style={{ height: ITEM_H }} />
        </div>
      </div>
    </div>
  );
}

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
  const tCommon = useTranslations("common");
  const dateFnsLocale = LOCALE_MAP[locale] ?? pt;
  const [open, setOpen] = React.useState(false);
  const [tempValue, setTempValue] = React.useState<Date | null>(value ?? null);

  React.useEffect(() => {
    if (open) {
      setTempValue(value ?? null);
    }
  }, [open, value]);

  const selectedHour = tempValue
    ? String(tempValue.getHours()).padStart(2, "0")
    : "08";
  const selectedMinute = tempValue
    ? MINUTES.includes(String(tempValue.getMinutes()).padStart(2, "0"))
      ? String(tempValue.getMinutes()).padStart(2, "0")
      : "00"
    : "00";

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) {
      setTempValue(null);
      return;
    }
    const merged = new Date(day);
    merged.setHours(Number(selectedHour), Number(selectedMinute), 0, 0);
    setTempValue(merged);
  };

  const handleHourChange = (h: string) => {
    const base = tempValue ? new Date(tempValue) : new Date();
    base.setHours(Number(h), Number(selectedMinute), 0, 0);
    setTempValue(base);
  };

  const handleMinuteChange = (m: string) => {
    const base = tempValue ? new Date(tempValue) : new Date();
    base.setHours(Number(selectedHour), Number(m), 0, 0);
    setTempValue(base);
  };

  const displayLabel = value
    ? format(value, "dd/MM/yyyy · HH:mm", { locale: dateFnsLocale })
    : null;

  const handleConfirm = () => {
    onChange?.(tempValue);
    setOpen(false);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Trigger button */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-11 w-full items-center gap-2.5 rounded-xl border border-arena-border bg-arena-surface px-3.5 text-sm transition-colors",
          "hover:border-arena-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arena-primary/40",
          displayLabel ? "text-arena-text" : "text-arena-text-muted/70",
        )}
      >
        <CalendarIcon className="size-4 shrink-0 text-arena-text-muted" />
        <span>{displayLabel ?? placeholder}</span>
      </button>

      {/* Modal centrado no ecrã via Dialog do Radix */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          {/* Overlay escuro */}
          <DialogPrimitive.Overlay className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

          {/* Painel centrado — independente do sheet pai */}
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className={cn(
              "fixed left-1/2 top-1/2 z-[9999] w-[340px] md:w-[380px] -translate-x-1/2 -translate-y-1/2",
              "overflow-hidden rounded-2xl border border-arena-border bg-arena-bg-sec shadow-[0_24px_64px_rgba(0,0,0,.9)]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
              "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
              "duration-200",
            )}
          >
            <DialogPrimitive.Title className="sr-only">
              Selecionar data e hora
            </DialogPrimitive.Title>

            {/* Calendário */}
            <Calendar
              mode="single"
              captionLayout="label"
              selected={tempValue ?? undefined}
              onSelect={handleDaySelect}
              fromDate={startOfDay(new Date())}
              locale={dateFnsLocale}
              className="bg-transparent p-3 pb-2 w-full"
              classNames={{
                root: "text-arena-text w-full",
                months: "w-full",
                month: "w-full",
                caption: "flex items-center justify-between px-1 pb-2",
                caption_label: "text-sm font-bold text-arena-text capitalize",
                nav: "flex gap-1",
                nav_button:
                  "h-7 w-7 flex items-center justify-center rounded-lg border border-arena-border/50 text-arena-text-muted hover:text-arena-text hover:border-arena-primary/40 transition-all",
                nav_button_previous: "",
                nav_button_next: "",
                table: "w-full border-collapse",
                weekdays: "flex w-full",
                weekday:
                  "flex-1 text-center text-[10px] font-bold text-arena-text-muted uppercase py-1",
                week: "flex w-full mt-0.5",
                day: "flex-1 flex items-center justify-center",
                day_button:
                  "w-full aspect-square flex items-center justify-center text-xs font-semibold rounded-lg transition-all hover:bg-arena-primary/10 hover:text-arena-primary",
                today:
                  "border border-arena-primary/40 text-arena-primary rounded-lg",
                selected:
                  "[&_button]:!bg-arena-primary [&_button]:!text-arena-bg [&_button]:font-black [&_button]:shadow-[0_0_10px_rgba(124,255,79,0.3)]",
                disabled: "opacity-25 cursor-not-allowed",
                outside: "opacity-20",
              }}
            />

            {/* Seletor de hora — dois drums */}
            <div className="border-t border-arena-border/20 px-4 pt-3 pb-2">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[9px] font-bold text-arena-text-muted uppercase tracking-widest">
                  Hora
                </p>
                <span className="text-[13px] font-black text-arena-primary tabular-nums">
                  {selectedHour}:{selectedMinute}
                </span>
              </div>

              <div className="flex items-stretch gap-3">
                <DrumPicker
                  items={HOURS}
                  value={selectedHour}
                  onChange={handleHourChange}
                  label="Horas"
                />
                <div className="flex items-center pb-1">
                  <span className="text-xl font-black text-arena-text-muted select-none">
                    :
                  </span>
                </div>
                <DrumPicker
                  items={MINUTES}
                  value={selectedMinute}
                  onChange={handleMinuteChange}
                  label="Min"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 px-4 pb-4 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="press flex-1 h-9 rounded-xl border border-arena-border/60 bg-transparent text-[12px] font-bold text-arena-text-sec hover:bg-arena-surface/60 transition-all"
              >
                {tCommon("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="press flex-[2] h-9 rounded-xl bg-arena-primary text-[12px] font-black text-arena-bg hover:bg-arena-primary/90 shadow-[0_0_16px_rgba(124,255,79,0.2)] transition-all"
              >
                {tCommon("confirmAction")}
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
