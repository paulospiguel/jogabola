"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClubCardProps {
  name: string;
  initials: string;
  category: string;
  description: string;
  cta: string;
  urgency?: boolean;
  urgencyLabel?: string;
  className?: string;
}

export function ClubCard({
  name,
  initials,
  category,
  description,
  cta,
  urgency,
  urgencyLabel,
  className,
}: ClubCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_-10px_rgba(111,255,233,0.2)]",
        urgency && "border-amber-500/30",
        className,
      )}
    >
      {urgency && urgencyLabel && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-amber-500 text-zinc-900 font-bold text-[10px] tracking-wider px-2 py-1">
            {urgencyLabel}
          </Badge>
        </div>
      )}

      {/* Logo Section */}
      <div className="relative h-40 bg-gradient-to-br from-neon-primary/10 to-accent-blue/10 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(111,255,233,0.15)_0%,transparent_70%)]" />
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <span className="text-4xl font-black text-neon-primary tracking-tight">
            {initials}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-6 gap-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
          <p className="text-xs text-white/60 font-medium tracking-wide">
            {category}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* CTA Button */}
        <Button className="w-full rounded-xl bg-neon-secondary text-toast-bg font-bold tracking-wider hover:bg-neon-secondary/90 transition-all duration-300 shadow-[0_8px_20px_-8px_rgba(36,255,230,0.5)]">
          {cta}
        </Button>
      </div>
    </div>
  );
}
