import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/utils";

type DividerOrientation = "horizontal" | "vertical";

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  text?: string;
}

const dividerVariants = cva(
  "py-1 flex items-center text-sm text-gray-800 before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6 dark:text-white dark:before:border-neutral-600 dark:after:border-neutral-600",
  {
    variants: {
      orientation: {
        horizontal: "w-full my-1",
        vertical: "h-full mx-4 border-l",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
);

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(dividerVariants({ orientation }), className)}
      {...props}
    >
      {props.text}
    </div>
  )
);

Divider.displayName = "Divider";

export { Divider };
