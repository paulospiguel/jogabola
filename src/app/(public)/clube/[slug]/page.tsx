"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { TEMPLATE_COMPONENTS } from "@/features/club-page-builder/components/live-preview";
import { DEFAULT_CONFIG } from "@/features/club-page-builder/_contracts/types";
import type { ClubPageConfig } from "@/features/club-page-builder/_contracts/types";

export default function ClubPublicPage() {
  const [config, setConfig] = useState<ClubPageConfig | null>(null);

  useEffect(() => {
    // Para fins de demonstração isolada, lemos a config guardada no publish
    const saved = localStorage.getItem("club_page_config");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        setConfig(DEFAULT_CONFIG);
      }
    } else {
      setConfig(DEFAULT_CONFIG);
    }
  }, []);

  if (!config) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050312] text-[#24ffe6]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const TemplateToRender = TEMPLATE_COMPONENTS[config.template] || TEMPLATE_COMPONENTS.classic;

  return (
    <main className="min-h-screen w-full bg-[#050312]">
      {/* 
        The Template Component expects to span the height context. 
        We give it a full h-screen minimum.
      */}
      <TemplateToRender config={config} />
    </main>
  );
}
