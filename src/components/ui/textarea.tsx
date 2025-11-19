import * as React from "react";

import { cn } from "@/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "hover:border-neon-primary/50 focus-visible:ring-neon-primary/40 flex min-h-[80px] w-full resize-none rounded-2xl border border-white/8 bg-white/5 px-3 py-3 text-sm text-white backdrop-blur-sm transition-all duration-300 placeholder:text-white/60 hover:bg-white/10 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
