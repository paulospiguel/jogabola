"use client";

import { cn } from "@/lib/utils";
import { Building2, Save, Mail, Globe, MapPin, Hash, Check } from "lucide-react";
import { useState } from "react";

export function GeneralSettingsForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    // simulate save
    await new Promise((r) => setTimeout(r, 1200));
    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const inputClass = cn(
    "w-full rounded-2xl border border-white/12 bg-white/5",
    "px-4 py-3 text-white placeholder-white/30 backdrop-blur",
    "focus-visible:ring-[3px] focus-visible:ring-[#6fffe9]/40",
    "focus:border-[#24ffe6]/60 outline-none transition-all",
  );

  const labelClass = "text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2 block";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div>
          <label className={labelClass} htmlFor="club-name">
            <span className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-[#6fffe9]" /> Nome Oficial
            </span>
          </label>
          <input
            id="club-name"
            defaultValue="Sporting FC"
            className={inputClass}
            required
            maxLength={60}
          />
        </div>

        {/* CNPJ / ID */}
        <div>
          <label className={labelClass} htmlFor="club-id">
            <span className="flex items-center gap-2">
              <Hash className="h-3.5 w-3.5 text-[#6fffe9]" /> NIF / Registro
            </span>
          </label>
          <input
            id="club-id"
            defaultValue="123456789"
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelClass} htmlFor="club-email">
            <span className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[#6fffe9]" /> Email do Clube
            </span>
          </label>
          <input
            id="club-email"
            type="email"
            defaultValue="contato@sportingfc.pt"
            className={inputClass}
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className={labelClass} htmlFor="club-location">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#6fffe9]" /> Localidade Sede
            </span>
          </label>
          <input
            id="club-location"
            defaultValue="Lisboa, PT"
            className={inputClass}
          />
        </div>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/3 p-5 backdrop-blur">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-white">
            <Globe className="h-4 w-4 text-[#6fffe9]" /> Listagem Pública
          </h4>
          <p className="mt-1 text-xs text-white/50 leading-relaxed md:max-w-[75%]">
            Permite que o clube apareça nos resultados de pesquisa globais. 
            Jogadores poderão visualizar a página e pedir para ingressar no plantel.
          </p>
        </div>
        
        {/* CSS Only Toggle Switch Match JogaBola Style */}
        <label className="relative inline-flex cursor-pointer items-center shrink-0">
          <input type="checkbox" className="peer sr-only" defaultChecked />
          <div className="peer h-6 w-11 rounded-full bg-white/10 border border-white/20 transition-all after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white/30 after:bg-white/80 after:transition-all after:content-[''] peer-checked:bg-[#24ffe6]/20 peer-checked:border-[#24ffe6]/50 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:after:bg-[#24ffe6] peer-focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[#6fffe9]/40" />
        </label>
      </div>

      {/* Submit Button Area */}
      <div className="pt-4 flex items-center gap-4 border-t border-white/8">
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "group flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-[#24ffe6] px-6 py-3 font-semibold text-slate-900 transition-all duration-300",
            isSaving ? "opacity-80 cursor-not-allowed" : "hover:-translate-y-0.5 hover:bg-[#24ffe6]/90 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)]"
          )}
        >
          {isSaving ? (
            <span className="animate-pulse">Guardando...</span>
          ) : success ? (
            <>
              <Check className="h-4 w-4" /> Guardado
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Guardar Alterações
            </>
          )}
        </button>
      </div>
    </form>
  );
}
