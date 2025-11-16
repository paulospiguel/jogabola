"use client";

import * as React from "react";

import { cn } from "@/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  icon?: React.ElementType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, isError, type, icon, ...props }, ref) => {
    const Icon = icon as React.ElementType | undefined;
    return (
      <div className="relative">
        {Icon && (
          <Icon className="absolute top-1/2 left-3 z-0 h-5 w-5 -translate-y-1/2 text-[#00cfb1]" />
        )}
        <input
          type={type}
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[44px] w-full rounded-full border-2 px-4 py-2.5 text-base transition-all file:border-0 file:bg-transparent file:text-base file:font-medium focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "[&:focus]:!rounded-full [&:focus-visible]:!rounded-full [&:focus-within]:!rounded-full",
            className,
            {
              "focus-visible:ring-offset-background border-red-500 focus-visible:ring-red-500":
                isError,
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
