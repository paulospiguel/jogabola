"use client";

import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Newspaper,
  Image as ImageIcon,
  BarChart3,
  Info,
  Rocket,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ClubPageConfig } from "../../club-page-builder/_contracts/types";

// ─── Feature config (non-translated parts) ───────────────────────────────────

type FeatureId = keyof ClubPageConfig["features"];

const FEATURE_ICONS: Record<FeatureId, React.ElementType> = {
  convocations: Users,
  calendar: Calendar,
  news: Newspaper,
  gallery: ImageIcon,
  stats: BarChart3,
};

const FEATURE_COLORS: Record<FeatureId, { color: string; bg: string }> = {
  convocations: { color: "text-blue-400",    bg: "bg-blue-400/10" },
  calendar:     { color: "text-[#24ffe6]",   bg: "bg-[#24ffe6]/10" },
  news:         { color: "text-amber-400",   bg: "bg-amber-400/10" },
  gallery:      { color: "text-purple-400",  bg: "bg-purple-400/10" },
  stats:        { color: "text-rose-400",    bg: "bg-rose-400/10" },
};

const FEATURE_IDS: FeatureId[] = ["convocations", "calendar", "news", "gallery", "stats"];

// ─── Component ────────────────────────────────────────────────────────────────

interface ClubPageFeatureSettingsProps {
  config: ClubPageConfig;
  onChange: (patch: Partial<ClubPageConfig>) => void;
}

export function ClubPageFeatureSettings({ config, onChange }: ClubPageFeatureSettingsProps) {
  const t = useTranslations("clubPageFeatureSettings");

  const toggleFeature = (feature: FeatureId) => {
    onChange({
      features: {
        ...config.features,
        [feature]: !config.features[feature],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-white">{t("title")}</h2>
          <p className="text-sm text-white/50 mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
          <Info className="h-3 w-3" />
          {t("autoSaved")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURE_IDS.map((id, i) => {
          const Icon = FEATURE_ICONS[id];
          const { color, bg } = FEATURE_COLORS[id];
          const isEnabled = config.features[id];

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "group p-5 rounded-2xl border transition-all duration-300 backdrop-blur flex items-center justify-between",
                isEnabled
                  ? "bg-white/5 border-white/10 shadow-[0_15px_30px_-15px_rgba(0,0,0,0.5)]"
                  : "bg-black/20 border-white/5 opacity-60"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  bg,
                  color,
                  isEnabled ? "scale-100" : "scale-90 opacity-50 grayscale"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{t(`features.${id}.label`)}</h4>
                  <p className="text-xs text-white/40 mt-0.5 max-w-[200px] leading-relaxed">
                    {t(`features.${id}.description`)}
                  </p>
                </div>
              </div>

              <Switch
                checked={isEnabled}
                onCheckedChange={() => toggleFeature(id)}
                className="data-[state=checked]:bg-[#24ffe6]"
              />
            </motion.div>
          );
        })}
      </div>

      {/* ── Tips Footer ─────────────────────────────────────────────────── */}
      <div className="mt-12 p-6 rounded-3xl bg-gradient-to-br from-[#24ffe6]/5 to-transparent border border-[#24ffe6]/10">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
          <Rocket className="h-4 w-4 text-[#24ffe6]" />
          {t("proTip")}
        </h4>
        <p className="text-xs text-white/50 leading-relaxed">
          {t.rich("proTipText", {
            bold: (chunks) => <strong className="text-white/70">{chunks}</strong>,
          })}
        </p>
      </div>
    </div>
  );
}
