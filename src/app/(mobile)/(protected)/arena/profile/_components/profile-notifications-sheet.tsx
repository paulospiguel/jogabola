"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ProfileNotificationsSheetProps {
  onClose: () => void;
}

const INITIAL_SETTINGS = {
  presence: { push: true, email: true },
  chat: { push: true, email: false },
  results: { push: false, email: true },
  payments: { push: true, email: true },
  notices: { push: true, email: false },
};

export function ProfileNotificationsSheet({ onClose }: ProfileNotificationsSheetProps) {
  const t = useTranslations("profilePage");
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  return (
    <BottomSheet title={t("notificationsSheet.title")} onClose={onClose} noPad>
      <div className="px-5 py-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
        <div className="flex justify-end gap-9 text-[9px] uppercase tracking-widest font-extrabold text-arena-text-muted px-1.5 pb-2 border-b border-arena-border/30">
          <span>{t("notificationsSheet.push")}</span>
          <span>{t("notificationsSheet.email")}</span>
        </div>

        {Object.entries(settings).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between py-2.5 border-b border-arena-border/20 last:border-b-0"
          >
            <div className="flex-1 pr-4">
              <span className="font-bold text-sm text-arena-text block leading-snug">
                {t(`notificationsSheet.${key}`)}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5 leading-normal">
                {t(`notificationsSheet.${key}Sub`)}
              </span>
            </div>

            <div className="flex items-center gap-5">
              <Switch
                checked={value.push}
                onCheckedChange={checked =>
                  setSettings(prev => ({
                    ...prev,
                    [key]: { ...prev[key as keyof typeof prev], push: checked },
                  }))
                }
                className={cn(
                  "data-[state=checked]:bg-arena-primary data-[state=checked]:border-arena-primary",
                  "h-6 w-11 shrink-0 rounded-full border-2 border-white/20 bg-white/10",
                )}
              />
              <Switch
                checked={value.email}
                onCheckedChange={checked =>
                  setSettings(prev => ({
                    ...prev,
                    [key]: { ...prev[key as keyof typeof prev], email: checked },
                  }))
                }
                className={cn(
                  "data-[state=checked]:bg-arena-primary data-[state=checked]:border-arena-primary",
                  "h-6 w-11 shrink-0 rounded-full border-2 border-white/20 bg-white/10",
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
