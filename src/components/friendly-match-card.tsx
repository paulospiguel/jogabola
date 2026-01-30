"use client";

import { Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FriendlyMatchCardProps {
  team: string;
  initials: string;
  players: string;
  matchType: string;
  time: string;
  date: string;
  availability: string;
  cta: string;
  playersLabel: string;
  matchTypeLabel: string;
  timeLabel: string;
  className?: string;
}

export function FriendlyMatchCard({
  team,
  initials,
  players,
  matchType,
  time,
  date,
  availability,
  cta,
  playersLabel,
  matchTypeLabel,
  timeLabel,
  className,
}: FriendlyMatchCardProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-6 overflow-hidden rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_-10px_rgba(111,255,233,0.2)]",
        className,
      )}
    >
      {/* Team Logo */}
      <div className="flex-shrink-0">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neon-primary/10 backdrop-blur-sm border border-neon-primary/30">
          <span className="text-2xl font-black text-neon-primary tracking-tight">
            {initials}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Team Name */}
        <h3 className="text-lg font-bold text-white mb-2 truncate">{team}</h3>

        {/* Metadata Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-neon-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">
                {playersLabel}
              </p>
              <p className="text-xs font-bold text-white truncate">{players}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-neon-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">
                {matchTypeLabel}
              </p>
              <p className="text-xs font-bold text-white truncate">
                {matchType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-neon-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">
                {timeLabel}
              </p>
              <p className="text-xs font-bold text-white truncate">{time}</p>
            </div>
          </div>
        </div>

        {/* Date & Availability */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neon-primary font-bold">{date}</span>
          <span className="text-white/40">•</span>
          <span className="text-white/60 italic">{availability}</span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex-shrink-0">
        <Button className="rounded-xl bg-neon-secondary text-toast-bg font-bold tracking-wider hover:bg-neon-secondary/90 transition-all duration-300 shadow-[0_8px_20px_-8px_rgba(36,255,230,0.5)] whitespace-nowrap">
          {cta}
        </Button>
      </div>
    </div>
  );
}
