import * as React from "react";

import { cn } from "@repo/ui/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	isError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, isError, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={cn(
				"flex h-10 w-full rounded-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
				{
					"border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-background": isError,
				},
			)}
			ref={ref}
			{...props}
		/>
	);
});
Input.displayName = "Input";

export { Input };
