"use client";

import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  verified?: boolean;
  variant?: "default" | "icon";
  className?: string;
}

export function VerifiedBadge({
  verified,
  variant = "default",
  className,
}: VerifiedBadgeProps) {
  const t = useTranslations();

  if (!verified) return null;

  if (variant === "icon") {
    return (
      <BadgeCheck
        size={16}
        className={cn("shrink-0", className)}
        style={{ color: "#7cff4f" }}
        aria-label={t("common.verified")}
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
      {t("common.verified")}
    </span>
  );
}
