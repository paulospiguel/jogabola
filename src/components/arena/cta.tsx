"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type CtaVariant = "primary" | "secondary" | "danger" | "ghost";
type CtaSize = "sm" | "md" | "lg";

interface CtaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CtaVariant;
  size?: CtaSize;
  fullWidth?: boolean;
}

const variantStyles: Record<CtaVariant, string> = {
  primary: "bg-arena-primary text-arena-bg hover:bg-arena-primary/90",
  secondary:
    "bg-arena-surface text-arena-text-sec border border-arena-border hover:bg-arena-surface-el",
  danger: "bg-arena-danger text-white hover:bg-arena-danger/90",
  ghost: "bg-transparent text-arena-text-muted hover:text-arena-text",
};

const sizeStyles: Record<CtaSize, string> = {
  sm: "h-9 px-4 text-xs rounded-[10px]",
  md: "h-11 px-5 text-sm rounded-[12px]",
  lg: "h-14 px-6 text-base rounded-[14px]",
};

export const Cta = forwardRef<HTMLButtonElement, CtaProps>(function Cta(
  {
    variant = "primary",
    size = "lg",
    fullWidth,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center font-bold transition-transform duration-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
