import { cn } from "@repo/utils";

interface AnimatedTrailProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The duration of the animation.
   * @default "10s"
   */
  duration?: string;

  contentClassName?: string;

  trailColor?: string;
  trailSize?: "sm" | "md" | "lg" | "xl";
  roundedSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}

const sizes = {
  sm: 5,
  md: 10,
  lg: 20,
  xl: 30,
};

export default function AnimatedBorderTrail({
  children,
  className,
  duration = "10s",
  trailColor = "purple",
  trailSize = "md",
  roundedSize = "2xl",
  contentClassName,
  ...props
}: AnimatedTrailProps) {
  return (
    <div
      {...props}
      className={cn(
        `relative h-fit w-fit overflow-hidden bg-gray-200 p-px rounded-${roundedSize}`,
        className,
      )}
    >
      <div
        className="absolute inset-0 h-full w-full animate-trail"
        style={{
          "--duration": duration ?? "10s",
          "--angle": "0deg",
          background: `conic-gradient(from var(--angle) at 50% 50%, transparent ${100 - sizes[trailSize]}%, ${trailColor})`,
        }}
      />
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-[15px] bg-white",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
