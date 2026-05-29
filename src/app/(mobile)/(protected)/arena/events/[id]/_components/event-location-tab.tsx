"use client";

import { Bus, Car, Train } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocationMap } from "@/components/arena/location-map";

interface EventLocationTabProps {
  location: string;
  eventId: number;
  canEdit?: boolean;
  t: ReturnType<typeof useTranslations<"arenaEventDetail">>;
}

export function EventLocationTab({
  location,
  eventId,
  canEdit,
  t,
}: EventLocationTabProps) {
  return (
    <div className="flex flex-col gap-5 animate-[fadeIn_.2s_ease-out]">
      {/* Real map (same as public event) */}
      <LocationMap location={location} eventId={eventId} canEdit={canEdit} />

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
