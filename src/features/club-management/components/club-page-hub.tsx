"use client";

import { motion } from "framer-motion";
import { 
  Eye, 
  Settings as SettingsIcon, 
  ExternalLink,
  Plus,
  Rocket
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ClubPageConfig } from "../../club-page-builder/_contracts/types";

interface ClubPageHubProps {
  config: ClubPageConfig;
  onConfigChange: (patch: Partial<ClubPageConfig>) => void;
  onEditClick: () => void;
  isConfigured: boolean;
}

export function ClubPageHub({ config, onConfigChange, onEditClick, isConfigured }: ClubPageHubProps) {
  const toggleVisibility = () => {
    onConfigChange({ isVisible: !config.isVisible });
  };

  return (
    <div className="space-y-8">
      {/* ── Status Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl border border-white/8 bg-white/3 backdrop-blur shadow-[0_35px_80px_-45px_rgba(111,255,233,0.1)]">
        <div className="flex items-center gap-5">
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden",
            config.isVisible ? "bg-[#24ffe6]/10" : "bg-white/5"
          )}>
            {config.isVisible && (
              <div className="absolute inset-0 bg-[#24ffe6]/20 blur-xl animate-pulse" />
            )}
            <Eye className={cn(
              "h-7 w-7 transition-colors",
              config.isVisible ? "text-[#24ffe6]" : "text-white/20"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Status da Página</h2>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                config.isVisible ? "bg-[#24ffe6] text-black" : "bg-white/10 text-white/40"
              )}>
                {config.isVisible ? "Pública" : "Privada"}
              </span>
            </div>
            <p className="text-sm text-white/50 mt-1">
              {config.isVisible 
                ? "Teu clube está visível para toda a comunidade JogaBola." 
                : "A tua página do clube está atualmente oculta do público."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-white/10 md:pl-6">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Visibilidade</span>
            <Switch 
              checked={config.isVisible} 
              onCheckedChange={toggleVisibility}
              className="data-[state=checked]:bg-[#24ffe6]"
            />
          </div>
        </div>
      </div>

      {/* ── Main Dashboard ───────────────────────────────────────────────── */}
      {!isConfigured ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/2"
        >
          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
            <Rocket className="h-10 w-10 text-white/20" />
          </div>
          <h3 className="text-2xl font-black text-white">Ainda não configuraste a tua página</h3>
          <p className="text-white/40 mt-2 max-w-sm mx-auto">
            Cria uma página profissional para o teu clube em poucos minutos e começa a atrair novos atletas.
          </p>
          <button 
            type="button"
            onClick={onEditClick}
            className="mt-8 flex items-center gap-2 rounded-2xl bg-[#24ffe6] px-8 py-4 text-sm font-black text-black shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Configurar Minha Página
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Stats / Info Card */}
          <div className="p-6 rounded-3xl border border-white/8 bg-white/3 backdrop-blur flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#24ffe6]/10 flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-[#24ffe6]" />
                </div>
                <button 
                  onClick={onEditClick}
                  className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <SettingsIcon className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{config.clubName}</h3>
              <p className="text-sm text-white/50 line-clamp-2 italic mb-4">
                "{config.clubSlogan}"
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60">
                  {config.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60">
                  {config.city}
                </span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 uppercase">
                  Template {config.template}
                </span>
              </div>
            </div>

            <button 
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 py-4 text-sm font-black text-white hover:bg-[#24ffe6] hover:text-black hover:border-transparent transition-all duration-300"
            >
              Ver Página Pública
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          {/* Setup Completion Placeholder */}
          <div className="p-6 rounded-3xl border border-white/8 bg-white/3 backdrop-blur flex flex-col justify-center items-center text-center">
            <div className="h-16 w-16 rounded-full border-4 border-[#24ffe6]/20 border-t-[#24ffe6] flex items-center justify-center mb-6">
              <span className="text-xl font-black text-white">85%</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Quase lá!</h3>
            <p className="text-xs text-white/40 max-w-[200px] mb-6">
              Completa todos os campos para teres uma página de nível elite.
            </p>
            <button 
              onClick={onEditClick}
              className="text-sm font-black text-[#24ffe6] hover:underline transition-all"
            >
              Continuar Edição
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
