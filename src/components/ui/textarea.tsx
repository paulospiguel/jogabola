import * as React from "react";

import { cn } from "@/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				"flex min-h-[80px] w-full rounded-2xl border-2 border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:border-neon-secondary focus-visible:ring-2 focus-visible:ring-neon-secondary/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
Textarea.displayName = "Textarea";

export { Textarea };
