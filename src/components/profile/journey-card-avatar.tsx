"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Flame, Globe } from "lucide-react";

interface JourneyCardAvatarProps {
  image?: string;
  name: string;
  role: string;
  level?: number;
  className?: string;
  countryCode?: string; // ISO code for flag, e.g., "br", "pt", "us"
}

export function JourneyCardAvatar({
  image,
  name,
  role,
  level = 1,
  className,
  countryCode,
}: JourneyCardAvatarProps) {
  // Define colors based on role
  const getRoleColors = (role: string) => {
    const normalizedRole = role.toUpperCase();
    switch (normalizedRole) {
      case "PLAYER":
        return {
          gradient: "from-[#0f172a] via-[#1e293b] to-[#0f172a]",
          border: "#24ffe6",
          text: "text-[#24ffe6]",
          glow: "shadow-[0_0_20px_rgba(36,255,230,0.4)]",
          flame: "text-orange-500",
        };
      case "MANAGER":
        return {
          gradient: "from-[#1a1033] via-[#2d1b69] to-[#1a1033]",
          border: "#a855f7",
          text: "text-purple-400",
          glow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
          flame: "text-purple-500",
        };
      case "ORGANIZER":
        return {
          gradient: "from-[#331010] via-[#691b1b] to-[#331010]",
          border: "#ef4444",
          text: "text-red-400",
          glow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]",
          flame: "text-red-500",
        };
      case "FAN":
        return {
          gradient: "from-[#332b10] via-[#69551b] to-[#332b10]",
          border: "#eab308",
          text: "text-yellow-400",
          glow: "shadow-[0_0_20px_rgba(234,179,8,0.4)]",
          flame: "text-yellow-500",
        };
      default:
        return {
          gradient: "from-slate-900 via-slate-800 to-slate-900",
          border: "#64748b",
          text: "text-slate-400",
          glow: "shadow-[0_0_20px_rgba(148,163,184,0.4)]",
          flame: "text-slate-500",
        };
    }
  };

  const colors = getRoleColors(role);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-between transition-transform hover:scale-105",
        className,
      )}
      style={{
        width: "150px",
        height: "200px",
      }}
    >
      {/* Border Container (Simulated with larger background) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: colors.border,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)",
          padding: "2px", // Thickness of border
        }}
      >
        {/* Main Card Background */}
        <div
          className={cn("h-full w-full bg-linear-to-b", colors.gradient)}
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)",
          }}
        >
          {/* Background Pattern (Subtle) */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
        </div>
      </div>

      {/* Inner Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center p-3">
        {/* Flag Badge */}
        <div className="absolute top-3 right-3 z-20 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/40 shadow-md">
          {countryCode ? (
            <img
              src={`https://flagcdn.com/${countryCode?.toLowerCase()}.svg`}
              alt="Flag"
              className="h-full w-full object-cover"
            />
          ) : (
            <Globe className="h-3 w-3 text-white/70" />
          )}
        </div>

        {/* Avatar Image */}
        <div className="mt-3 h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 shadow-inner">
          <Avatar className="h-full w-full bg-transparent">
            <AvatarImage src={image} alt={name} className="object-cover" />
            <AvatarFallback className="bg-white/5 text-2xl font-bold text-white/50">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Role Label */}
        <div className="mt-auto mb-6 text-center">
          <span
            className={cn(
              "text-lg font-bold tracking-wider uppercase drop-shadow-md",
              colors.text,
            )}
          >
            {role}
          </span>
        </div>
      </div>

      {/* Level Indicator */}
      <div className="absolute -bottom-3 z-30 flex flex-col items-center justify-center">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <Flame
            className={cn(
              "h-10 w-10 fill-current drop-shadow-lg",
              colors.flame,
            )}
          />
          <span className="absolute pt-1.5 text-xs font-bold text-white shadow-black drop-shadow-md">
            {level}
          </span>
        </div>
      </div>
    </div>
  );
}
