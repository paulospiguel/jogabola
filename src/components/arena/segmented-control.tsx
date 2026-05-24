"use client";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  id: T;
  label: string;
  icon?: React.ElementType;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <fieldset
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-[14px] border border-arena-border bg-arena-surface-el/60 p-1",
        className,
      )}
    >
      {options.map(option => {
        const Icon = option.icon;
        const active = option.id === value;

        return (
          <button
            aria-pressed={active}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border px-3 text-xs font-bold transition duration-100 active:scale-[0.97]",
              active
                ? "border-arena-primary/60 bg-arena-primary/15 text-arena-primary"
                : "border-arena-border bg-arena-surface text-arena-text-sec hover:bg-arena-surface-el hover:text-arena-text",
            )}
            key={option.id}
            onClick={() => onChange(option.id)}
            type="button"
          >
            {Icon && <Icon size={14} strokeWidth={2.4} />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </fieldset>
  );
}
