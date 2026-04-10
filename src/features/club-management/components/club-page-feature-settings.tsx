"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Newspaper, 
  Image as ImageIcon, 
  BarChart3,
  Info 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ClubPageConfig } from "../../club-page-builder/_contracts/types";

interface ClubPageFeatureSettingsProps {
  config: ClubPageConfig;
  onChange: (patch: Partial<ClubPageConfig>) => void;
}

export function ClubPageFeatureSettings({ config, onChange }: ClubPageFeatureSettingsProps) {
  const toggleFeature = (feature: keyof ClubPageConfig["features"]) => {
    onChange({
      features: {
        ...config.features,
        [feature]: !config.features[feature],
      },
    });
  };

  const features = [
    {
      id: "convocations",
      label: "Convocatórias",
      description: "Exibir lista de atletas convocados para os próximos jogos.",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      id: "calendar",
      label: "Calendário",
      description: "Mostrar a agenda completa de jogos e treinos do clube.",
      icon: Calendar,
      color: "text-[#24ffe6]",
      bg: "bg-[#24ffe6]/10"
    },
    {
      id: "news",
      label: "Notícias",
      description: "Publicar boletins informativos e atualizações do clube.",
      icon: Newspaper,
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    },
    {
      id: "gallery",
      label: "Galeria",
      description: "Exposição de fotos de jogos, eventos e instalações.",
      icon: ImageIcon,
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      id: "stats",
      label: "Estatísticas",
      description: "Gráficos de performance e recordes históricos da equipe.",
      icon: BarChart3,
      color: "text-rose-400",
      bg: "bg-rose-400/10"
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-white">Configurações da Página</h2>
          <p className="text-sm text-white/50 mt-1">
            Escolhe as secções que queres manter visíveis na tua página pública.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
          <Info className="h-3 w-3" />
          Alterações guardadas automaticamente
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "group p-5 rounded-2xl border transition-all duration-300 backdrop-blur flex items-center justify-between",
              config.features[feature.id as keyof typeof config.features]
                ? "bg-white/5 border-white/10 shadow-[0_15px_30px_-15px_rgba(0,0,0,0.5)]"
                : "bg-black/20 border-white/5 opacity-60"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300",
                feature.bg,
                feature.color,
                config.features[feature.id as keyof typeof config.features] ? "scale-100" : "scale-90 opacity-50 gray-scale"
              )}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-white">{feature.label}</h4>
                <p className="text-xs text-white/40 mt-0.5 max-w-[200px] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>

            <Switch
              checked={config.features[feature.id as keyof typeof config.features]}
              onCheckedChange={() => toggleFeature(feature.id as keyof typeof config.features)}
              className="data-[state=checked]:bg-[#24ffe6]"
            />
          </motion.div>
        ))}
      </div>

      {/* ── Tips Footer ─────────────────────────────────────────────────── */}
      <div className="mt-12 p-6 rounded-3xl bg-gradient-to-br from-[#24ffe6]/5 to-transparent border border-[#24ffe6]/10">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
          <Rocket className="h-4 w-4 text-[#24ffe6]" />
          Dica de Pro
        </h4>
        <p className="text-xs text-white/50 leading-relaxed">
          Manter secções atualizadas como **Notícias** e **Calendário** aumenta o engajamento dos adeptos e a transparência do teu clube. Secções sem conteúdo são automaticamente ocultadas para manter um visual limpo.
        </p>
      </div>
    </div>
  );
}

function Rocket(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.5-1 1-4c2 1 3 2 4 4Z" />
      <path d="M15 15v5c-1 0-4-.5-4-4 2-1 3-2 4-4Z" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}
