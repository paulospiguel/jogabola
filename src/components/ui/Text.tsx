import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const variantsText = cva("max-w-prose text-slate-700 dark:text-slate-300", {
  variants: {
    variant: {
      p: "text-base leading-7 [&:not(:first-child)]:mt-6",
      label: "text-sm font-medium leading-none",
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl font-heading border-b border-b-slate-200",
      h2: "scroll-m-20 font-heading pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-800 dark:text-slate-300 sm:text-4xl",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      lead: "text-xl text-slate-600 dark:text-slate-400 sm:text-center sm:text-2xl",
      muted: "text-sm text-slate-500 dark:text-slate-400",
      small: "text-xs text-slate-500 dark:text-slate-400",
    },
  },
  defaultVariants: {
    variant: "h4",
  },
});

const fontSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
};

const colors = {
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-error",
  black: "text-black",
  white: "text-white",
  green: "text-green-600",
  red: "text-red-600",
  blue: "text-blue-600",
  yellow: "text-yellow-600",
  gradient:
    "bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-lime-600",
};

type TextVariants = VariantProps<typeof variantsText>;

type TextProps = {
  children: React.ReactNode;
  variant?: TextVariants;
  fontSize?: keyof typeof fontSizes;
  className?: string;
  fontWeight?: "normal" | "bold";
  color?: keyof typeof colors;
};

export const Text = ({
  children,
  variant = "p",
  className,
  fontSize = "md",
  fontWeight = "normal",
  color,
}: TextProps & TextVariants) => {
  className = cn(colors[color || "black"], className);
  return (
    <p
      className={cn(
        variantsText({ variant, className }),
        fontSizes[fontSize],
        fontWeight,
      )}
    >
      {children}
    </p>
  );
};
