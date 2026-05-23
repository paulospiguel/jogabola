"use client";

import { cn } from "@/lib/utils";

type IconActionTone = "neutral" | "primary" | "danger" | "info";

type IconActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  tone?: IconActionTone;
};

const toneStyles: Record<IconActionTone, string> = {
  neutral:
    "border-arena-border bg-arena-surface text-arena-text-sec hover:bg-arena-surface-el hover:text-arena-text",
  primary:
    "border-arena-primary/30 bg-arena-primary/10 text-arena-primary hover:bg-arena-primary/15",
  danger:
    "border-arena-danger/25 bg-arena-danger/10 text-arena-danger hover:bg-arena-danger/15",
  info: "border-arena-info/25 bg-arena-info/10 text-arena-info hover:bg-arena-info/15",
};

export function IconAction({
  icon: Icon,
  label,
  active,
  tone = "neutral",
  className,
  type = "button",
  ...props
}: IconActionProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border transition duration-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-arena-primary/60 bg-arena-primary/15 text-arena-primary"
          : toneStyles[tone],
        className,
      )}
      type={type}
      {...props}
    >
      <Icon size={17} strokeWidth={2.4} />
    </button>
  );
}
