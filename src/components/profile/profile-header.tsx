"use client";

import { JourneyCardAvatar } from "@/components/profile/journey-card-avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Camera, Edit2, Shield } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  role: string;
  image?: string;
  level?: number;
  nationality?: string;
  onEditImage: () => void;
}

export function ProfileHeader({
  name,
  role,
  image,
  level = 1,
  nationality,
  onEditImage,
}: ProfileHeaderProps) {
  return (
    <div className="relative mb-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="bg-neon-primary/10 absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-accent-blue/10 absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        {/* Avatar Section - Journey Card Style */}
        <div className="group relative mt-4 sm:mt-0">
          <JourneyCardAvatar
            name={name}
            role={role}
            image={image}
            level={level}
            countryCode={nationality}
            className="transform transition-transform hover:scale-105"
          />

          {/* Edit Button Overlay - Positioned relative to the card */}
          <button
            onClick={onEditImage}
            className="bg-neon-primary text-background-surface absolute -right-2 bottom-10 z-40 flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 hover:bg-white"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Info Section */}
        <div className="flex flex-1 flex-col items-center pt-4 text-center sm:items-start sm:pt-8 sm:text-left">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-heading text-4xl tracking-wide text-white sm:text-5xl">
              {name}
            </h1>
            <div className="hidden sm:block">
              {/* Status Indicator (Online/Offline - Mockup) */}
              <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <div className="text-neon-primary border-neon-primary/20 flex items-center gap-1.5 rounded-lg border bg-white/5 px-3 py-1 text-sm font-medium">
              <Shield className="h-4 w-4" />
              {role}
            </div>
            <div className="text-text-secondary flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1 text-sm font-medium">
              <span className="bg-accent-blue h-1.5 w-1.5 rounded-full" />
              Member since 2024
            </div>
          </div>

          {/* Stats / Gamification Bar */}
          <div className="w-full max-w-md space-y-2">
            <div className="text-text-muted flex items-center justify-between text-xs font-medium tracking-wider uppercase">
              <span>Reputation</span>
              <span>1,250 / 2,000 XP</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "62.5%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="from-neon-primary to-accent-blue h-full rounded-full bg-linear-to-r shadow-[0_0_15px_rgba(111,255,233,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="hover:text-neon-primary border-white/10 bg-white/5 text-white backdrop-blur hover:bg-white/10"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
