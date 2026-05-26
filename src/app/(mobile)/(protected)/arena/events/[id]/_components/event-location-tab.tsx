"use client";

import { MapPin, Bus, Car, Train } from "lucide-react";
import { Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface EventLocationTabProps {
  location: string;
  onShare: () => void;
  t: ReturnType<typeof useTranslations<"arenaEventDetail">>;
}

export function EventLocationTab({
  location,
  onShare,
  t,
}: EventLocationTabProps) {
  return (
    <div className="flex flex-col gap-5 animate-[fadeIn_.2s_ease-out]">
      {/* Stylized dark map */}
      <div className="relative w-full h-[180px] bg-arena-surface border border-arena-border rounded-[16px] overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-arena-text) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-x-8 inset-y-6 border border-arena-border/30 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="absolute inset-y-0 left-0 w-1/4 border-r border-arena-border/25" />
          <div className="absolute inset-y-0 right-0 w-1/4 border-l border-arena-border/25" />
          <div className="w-12 h-12 rounded-full border border-arena-border/25 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-arena-border/40" />
          </div>
        </div>

        <div className="relative flex items-center justify-center z-10">
          <motion.div
            className="absolute w-[60px] h-[60px] bg-arena-primary/10 rounded-full border border-arena-primary/20"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-[36px] h-[36px] bg-arena-primary/15 rounded-full"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.4,
            }}
          />
          <div className="w-5 h-5 bg-arena-primary rounded-full border-2 border-arena-bg shadow-[0_0_15px_rgba(124,255,79,0.7)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#0B0F14] rounded-full" />
          </div>
        </div>

        <div className="absolute bottom-3 left-3 bg-arena-bg-sec/90 border border-arena-border/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-arena-primary" />
          <span className="text-[10px] font-bold text-arena-text">
            {location}
          </span>
        </div>
      </div>

      {/* Address + navigation CTAs */}
      <div className="bg-arena-surface border border-arena-border rounded-[16px] p-4 flex flex-col gap-4">
        <div>
          <span className="font-extrabold text-sm text-arena-text block">
            {location}
          </span>
          <span className="text-xs text-arena-text-muted block mt-1">
            Travessa da Boa Hora, 12 · Lisboa
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-arena-bg-sec border border-arena-border text-arena-text hover:bg-arena-surface-el font-bold text-xs h-10 rounded-xl gap-1.5 transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-arena-primary" />
            Google Maps
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-arena-bg-sec border border-arena-border text-arena-text hover:bg-arena-surface-el font-bold text-xs h-10 rounded-xl gap-1.5 transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-arena-primary" />
            Apple Maps
          </Button>
          <Button
            onClick={onShare}
            variant="outline"
            className="press w-10 h-10 bg-arena-bg-sec border border-arena-border hover:bg-arena-surface-el flex items-center justify-center shrink-0 rounded-xl"
          >
            <Share2 className="w-4 h-4 text-arena-text-sec" />
          </Button>
        </div>
      </div>

      {/* Directions */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted px-1">
          {t("interactive.howToGet")}
        </span>

        <div className="bg-arena-surface border border-arena-border rounded-[16px] p-3.5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-arena-bg-sec flex items-center justify-center shrink-0 border border-arena-border/60">
              <Train className="w-4.5 h-4.5 text-arena-text-sec" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-arena-text block">
                {t("interactive.metro")}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5 leading-relaxed">
                {t("interactive.metroDesc")}
              </span>
            </div>
          </div>

          <div className="flex gap-3 border-t border-arena-border/30 pt-3.5">
            <div className="w-8 h-8 rounded-lg bg-arena-bg-sec flex items-center justify-center shrink-0 border border-arena-border/60">
              <Bus className="w-4.5 h-4.5 text-arena-text-sec" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-arena-text block">
                {t("interactive.bus")}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5 leading-relaxed">
                {t("interactive.busDesc")}
              </span>
            </div>
          </div>

          <div className="flex gap-3 border-t border-arena-border/30 pt-3.5">
            <div className="w-8 h-8 rounded-lg bg-arena-bg-sec flex items-center justify-center shrink-0 border border-arena-border/60">
              <Car className="w-4.5 h-4.5 text-[#EF4444]" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-arena-text block">
                {t("interactive.car")}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5 leading-relaxed">
                {t("interactive.carDesc")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
