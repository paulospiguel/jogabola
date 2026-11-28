"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  id?: string;
  number: string;
  label: string;
  children: ReactNode;
  className?: string;
}

export const tacticalGridStyle = {
  backgroundImage:
    "linear-gradient(rgba(38,50,68,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(38,50,68,0.28) 1px, transparent 1px)",
  backgroundSize: "68px 68px",
  maskImage: "radial-gradient(circle at center, black 35%, transparent 85%)",
  WebkitMaskImage:
    "radial-gradient(circle at center, black 35%, transparent 85%)",
};

export const strokeTextStyle = (
  color = "rgba(245,247,250,0.88)",
  width = 1.4,
) => ({
  color: "transparent",
  WebkitTextStroke: `${width}px ${color}`,
});

export function SectionShell({
  id,
  number,
  label,
  children,
  className,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 overflow-hidden border-t border-arena-border bg-[#06090D] px-5 py-20 md:px-10 lg:px-16 lg:py-28",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-14 right-6 hidden select-none font-sora text-[200px] leading-none font-extrabold text-transparent opacity-55 lg:block"
        style={{
          WebkitTextStroke: "1px rgba(38,50,68,0.9)",
          letterSpacing: "-8px",
        }}
      >
        {number}
      </div>
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-arena-primary/35 bg-arena-primary/10 px-4 py-2">
          <span className="size-1.5 rounded-full bg-arena-primary" />
          <span className="text-[11px] font-extrabold tracking-[0.14em] text-arena-primary uppercase">
            {number} · {label}
          </span>
        </div>
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "max-w-4xl font-sora text-3xl leading-[1.02] font-extrabold tracking-tight text-arena-text sm:text-5xl lg:text-6xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}
