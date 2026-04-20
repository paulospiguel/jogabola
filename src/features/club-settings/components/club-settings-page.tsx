"use client";

import { motion } from "framer-motion";
import { Info, Settings2, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { GeneralSettingsForm } from "./general-settings-form";
import { DangerZone } from "./danger-zone";

type Tab = "general" | "danger";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export function ClubSettingsPage() {
  const t = useTranslations("clubSettingsPage");
  const [activeTab, setActiveTab] = useState<Tab>("general");

  return (
    <div className="w-full pb-12 text-white relative">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Settings2 className="h-6 w-6 text-[#6fffe9]" />
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl">
            {t("description")}
          </p>
        </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-white/10 pb-px mb-8">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all relative ${
            activeTab === "general" ? "text-[#6fffe9]" : "text-white/50 hover:text-white"
          }`}
        >
          <Info className="h-4 w-4" /> {t("tabs.general")}
          {activeTab === "general" && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6fffe9]"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("danger")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all relative ${
            activeTab === "danger" ? "text-rose-400" : "text-white/50 hover:text-white"
          }`}
        >
          <ShieldAlert className="h-4 w-4" /> {t("tabs.danger")}
          {activeTab === "danger" && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500"
            />
          )}
        </button>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl">
        {activeTab === "general" && (
          <motion.div key="general" {...fadeUp} transition={{ duration: 0.3 }}>
            <div className="rounded-3xl border border-white/8 bg-white/3 p-6 md:p-8 backdrop-blur shadow-[0_35px_80px_-45px_rgba(111,255,233,0.1)]">
              <h3 className="text-base font-bold text-white mb-6">{t("general.title")}</h3>
              <GeneralSettingsForm />
            </div>
          </motion.div>
        )}

        {activeTab === "danger" && (
          <motion.div key="danger" {...fadeUp} transition={{ duration: 0.3 }}>
            <DangerZone />
          </motion.div>
        )}
      </div>
    </div>
  );
}
