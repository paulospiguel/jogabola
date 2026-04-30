import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  /** If false/undefined, renders nothing */
  verified?: boolean;
  /** "default" = full chip with label, "icon" = icon-only tooltip variant */
  variant?: "default" | "icon";
  className?: string;
}

export function VerifiedBadge({
  verified,
  variant = "default",
  className,
}: VerifiedBadgeProps) {
  if (!verified) return null;

  if (variant === "icon") {
    return (
      <BadgeCheck
        size={16}
        className={cn("shrink-0", className)}
        style={{ color: "#7cff4f" }}
        aria-label="Verificado"
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide",
        className,
      )}
      style={{
        backgroundColor: "rgba(124,255,79,0.10)",
        border: "1px solid rgba(124,255,79,0.28)",
        color: "#7cff4f",
      }}
    >
      <BadgeCheck size={12} strokeWidth={2.5} />
      Verificado
    </span>
  );
}
