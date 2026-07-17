"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  className,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold">
          {label && <span className="text-arena-primary">{label}</span>}
          {showPercent && (
            <span className="text-arena-primary">
              {Math.round(pct)}% concluído
            </span>
          )}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-arena-surface-el">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, #A855F7 0%, #38BDF8 50%, #7CFF4F 100%)",
          }}
        />
      </div>
    </div>
  );
}
