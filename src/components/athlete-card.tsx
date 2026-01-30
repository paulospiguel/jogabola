"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AthleteCardProps {
  name: string;
  position: string;
  age: string;
  bio: string;
  cta: string;
  className?: string;
}

export function AthleteCard({
  name,
  position,
  age,
  bio,
  cta,
  className,
}: AthleteCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_-10px_rgba(111,255,233,0.2)]",
        className,
      )}
    >
      {/* Avatar Section */}
      <div className="relative h-48 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(111,255,233,0.1)_0%,transparent_70%)]" />
        <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <User className="h-16 w-16 text-neon-primary" />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-6 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold tracking-wider text-neon-primary uppercase">
                {position}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">{age}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
          {bio}
        </p>

        {/* CTA Button */}
        <Button
          className="w-full rounded-xl bg-neon-primary/10 border border-neon-primary/30 text-neon-primary font-bold tracking-wider hover:bg-neon-primary/20 hover:border-neon-primary/50 transition-all duration-300"
          variant="outline"
        >
          {cta}
        </Button>
      </div>
    </div>
  );
}
