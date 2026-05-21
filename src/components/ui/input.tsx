"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  icon?: React.ElementType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, isError, type, icon, ...props }, ref) => {
    const Icon = icon as React.ElementType | undefined;
    return (
      <div className="relative w-full">
        {Icon && (
          <Icon className="absolute top-1/2 left-3 z-0 h-5 w-5 -translate-y-1/2 text-brand-green" />
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-full border border-white/8 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-white/60 transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-neon-primary/50 hover:bg-white/10 focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-neon-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
            "focus:rounded-full! focus-visible:rounded-full! focus-within:rounded-full!",
            className,
            {
              "border-red-500 focus-visible:ring-red-500": isError,
            },
          )}
          style={{ borderRadius: "9999px" }}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
