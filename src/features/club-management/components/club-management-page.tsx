"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClubPageBuilderPage } from "@/features/club-page-builder";
import { ClubSettingsPage } from "@/features/club-settings";
import { Settings, Sliders, ArrowLeft, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ClubPageHub } from "./club-page-hub";
import { ClubPageFeatureSettings } from "./club-page-feature-settings";
import { DEFAULT_CONFIG, type ClubPageConfig } from "../../club-page-builder/_contracts/types";

export function ClubManagementPage() {
  const t = useTranslations("clubManagementPage");
  const [config, setConfig] = useState<ClubPageConfig>(DEFAULT_CONFIG);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const handlePatch = (patch: Partial<ClubPageConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  };

  const startConfiguring = () => setIsEditing(true);
  const stopConfiguring = () => {
    setIsEditing(false);
    setIsConfigured(true);
  };

  if (isEditing) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="px-4 md:px-8 mb-6">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("backToPanel")}
          </button>
        </div>
        <div className="px-4 md:px-8">
          <div className="bg-[#24ffe6]/5 border border-[#24ffe6]/10 rounded-[2.5rem] p-4 md:p-8">
            <ClubPageBuilderPage
              onComplete={stopConfiguring}
              initialConfig={config}
              onConfigChange={handlePatch}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="page" className="w-full">
        <div className="px-4 md:px-8 mb-8">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 h-[3.5rem] rounded-[1.25rem] w-full md:w-auto flex justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="page"
              className="rounded-[0.75rem] px-6 h-full data-[state=active]:bg-[#24ffe6] data-[state=active]:text-black text-white/50 font-bold flex items-center gap-2 whitespace-nowrap transition-all"
            >
              <Globe className="h-4 w-4" />
              {t("tabs.page")}
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="rounded-[0.75rem] px-6 h-full data-[state=active]:bg-[#24ffe6] data-[state=active]:text-black text-white/50 font-bold flex items-center gap-2 whitespace-nowrap transition-all"
            >
              <Sliders className="h-4 w-4" />
              {t("tabs.config")}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-[0.75rem] px-6 h-full data-[state=active]:bg-[#24ffe6] data-[state=active]:text-black text-white/50 font-bold flex items-center gap-2 whitespace-nowrap transition-all"
            >
              <Settings className="h-4 w-4" />
              {t("tabs.settings")}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="page" className="mt-0 outline-none px-4 md:px-8">
          <ClubPageHub
            config={config}
            onConfigChange={handlePatch}
            onEditClick={startConfiguring}
            isConfigured={isConfigured}
          />
        </TabsContent>
        <TabsContent value="config" className="mt-0 outline-none px-4 md:px-8">
          <ClubPageFeatureSettings config={config} onChange={handlePatch} />
        </TabsContent>
        <TabsContent value="settings" className="mt-0 outline-none px-4 md:px-8">
          <ClubSettingsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
