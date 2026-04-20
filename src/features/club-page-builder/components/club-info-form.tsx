"use client";

import { cn } from "@/lib/utils";
import { Building2, FileText, MapPin, Calendar, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ClubPageConfig } from "../_contracts/types";

// ─── Field helper ─────────────────────────────────────────────────────────────

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
  const t = useTranslations("clubInfoForm");

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
          {t("step")}
        </p>
        <h2 className="text-xl font-black text-white">{t("title")}</h2>
        <p className="mt-1 text-sm text-white/50">{t("description")}</p>
      </div>

      <Field label={t("name")} icon={Building2}>
        <input
          type="text"
          value={config.clubName}
          onChange={e => onChange({ clubName: e.target.value })}
          placeholder={t("namePlaceholder")}
          className={inputClass}
          maxLength={50}
        />
      </Field>

      <Field label={t("slogan")} hint={t("optional")} icon={FileText}>
        <input
          type="text"
          value={config.clubSlogan}
          onChange={e => onChange({ clubSlogan: e.target.value })}
          placeholder={t("sloganPlaceholder")}
          className={inputClass}
          maxLength={80}
        />
      </Field>

      <Field label={t("descriptionLabel")} hint={t("descriptionMax")} icon={FileText}>
        <textarea
          value={config.clubDescription}
          onChange={e => onChange({ clubDescription: e.target.value })}
          placeholder={t("descriptionPlaceholder")}
          className={cn(inputClass, "min-h-[100px] resize-none leading-relaxed")}
          maxLength={300}
          rows={4}
        />
        <p className="text-right text-[10px] text-white/30">
          {config.clubDescription.length}/300
        </p>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("city")} hint={t("optional")} icon={MapPin}>
          <input
            type="text"
            value={config.city ?? ""}
            onChange={e => onChange({ city: e.target.value })}
            placeholder={t("cityPlaceholder")}
            className={inputClass}
          />
        </Field>

        <Field label={t("founded")} hint={t("optional")} icon={Calendar}>
          <input
            type="text"
            value={config.founded ?? ""}
            onChange={e => onChange({ founded: e.target.value })}
            placeholder={t("foundedPlaceholder")}
            className={inputClass}
            maxLength={4}
          />
        </Field>
      </div>

      <Field label={t("category")} icon={Tag}>
        <select
          value={config.category ?? ""}
          onChange={e => onChange({ category: e.target.value })}
          className={cn(inputClass, "cursor-pointer appearance-none")}
        >
          <option value="" className="bg-[#0a0b1e]">{t("categoryPlaceholder")}</option>
          <option value={t("categories.football11")} className="bg-[#0a0b1e]">{t("categories.football11")}</option>
          <option value={t("categories.football7")} className="bg-[#0a0b1e]">{t("categories.football7")}</option>
          <option value={t("categories.football5")} className="bg-[#0a0b1e]">{t("categories.football5")}</option>
          <option value={t("categories.futsal")} className="bg-[#0a0b1e]">{t("categories.futsal")}</option>
          <option value={t("categories.beachSoccer")} className="bg-[#0a0b1e]">{t("categories.beachSoccer")}</option>
          <option value={t("categories.womens")} className="bg-[#0a0b1e]">{t("categories.womens")}</option>
          <option value={t("categories.seniors")} className="bg-[#0a0b1e]">{t("categories.seniors")}</option>
          <option value={t("categories.youth")} className="bg-[#0a0b1e]">{t("categories.youth")}</option>
        </select>
      </Field>
    </div>
  );
}
