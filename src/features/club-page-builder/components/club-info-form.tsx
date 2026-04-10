"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, FileText, MapPin, Calendar, Tag } from "lucide-react";
import type { ClubPageConfig } from "../_contracts/types";

// ─── Field helpers ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  hint?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function Field({ label, hint, icon: Icon, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#6fffe9]" />
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
          {label}
        </label>
        {hint && <span className="ml-auto text-[10px] text-white/30">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Club Info Form ────────────────────────────────────────────────────────────

interface ClubInfoFormProps {
  config: ClubPageConfig;
  onChange: (patch: Partial<ClubPageConfig>) => void;
}

export function ClubInfoForm({ config, onChange }: ClubInfoFormProps) {
  const inputClass = cn(
    "w-full rounded-2xl border border-white/12 bg-white/5",
    "px-4 py-3 text-white placeholder-white/30 backdrop-blur",
    "focus-visible:ring-[3px] focus-visible:ring-[#6fffe9]/40",
    "focus:border-[#24ffe6]/60 outline-none transition-all",
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6fffe9]">
          Passo 2 de 3
        </p>
        <h2 className="text-xl font-black text-white">Informações do Clube</h2>
        <p className="mt-1 text-sm text-white/50">
          Preencha os dados do seu clube. Estes serão exibidos na sua página pública.
        </p>
      </div>

      <Field label="Nome do Clube" icon={Building2}>
        <input
          type="text"
          value={config.clubName}
          onChange={e => onChange({ clubName: e.target.value })}
          placeholder="Ex: Sporting FC, Eagles United..."
          className={inputClass}
          maxLength={50}
        />
      </Field>

      <Field label="Slogan" hint="Opcional" icon={FileText}>
        <input
          type="text"
          value={config.clubSlogan}
          onChange={e => onChange({ clubSlogan: e.target.value })}
          placeholder="Ex: Juntos somos mais fortes"
          className={inputClass}
          maxLength={80}
        />
      </Field>

      <Field label="Descrição" hint="Máx. 300 caracteres" icon={FileText}>
        <textarea
          value={config.clubDescription}
          onChange={e => onChange({ clubDescription: e.target.value })}
          placeholder="Apresenta o teu clube. Fala sobre a história, valores e o que torna a vossa comunidade especial..."
          className={cn(inputClass, "min-h-[100px] resize-none leading-relaxed")}
          maxLength={300}
          rows={4}
        />
        <p className="text-right text-[10px] text-white/30">
          {config.clubDescription.length}/300
        </p>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Cidade" hint="Opcional" icon={MapPin}>
          <input
            type="text"
            value={config.city ?? ""}
            onChange={e => onChange({ city: e.target.value })}
            placeholder="Ex: Lisboa"
            className={inputClass}
          />
        </Field>

        <Field label="Fundado em" hint="Opcional" icon={Calendar}>
          <input
            type="text"
            value={config.founded ?? ""}
            onChange={e => onChange({ founded: e.target.value })}
            placeholder="Ex: 2015"
            className={inputClass}
            maxLength={4}
          />
        </Field>
      </div>

      <Field label="Modalidade / Categoria" icon={Tag}>
        <select
          value={config.category ?? ""}
          onChange={e => onChange({ category: e.target.value })}
          className={cn(inputClass, "cursor-pointer appearance-none")}
        >
          <option value="" className="bg-[#0a0b1e]">Selecionar modalidade...</option>
          <option value="Futebol 11" className="bg-[#0a0b1e]">Futebol 11</option>
          <option value="Futebol 7" className="bg-[#0a0b1e]">Futebol 7</option>
          <option value="Futebol 5" className="bg-[#0a0b1e]">Futebol 5</option>
          <option value="Futsal" className="bg-[#0a0b1e]">Futsal</option>
          <option value="Beach Soccer" className="bg-[#0a0b1e]">Beach Soccer</option>
          <option value="Futebol Feminino" className="bg-[#0a0b1e]">Futebol Feminino</option>
          <option value="Futebol Sénior" className="bg-[#0a0b1e]">Futebol Sénior</option>
          <option value="Futebol Juvenil" className="bg-[#0a0b1e]">Futebol Juvenil</option>
        </select>
      </Field>
    </div>
  );
}
