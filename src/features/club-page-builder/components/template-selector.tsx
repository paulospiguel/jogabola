"use client";

import { cn } from "@/lib/utils";
import {
  Check,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { TEMPLATE_OPTION_IDS, TEMPLATE_LABELS } from "../_contracts/types";
import type { ClubPageConfig, ClubTemplate } from "../_contracts/types";

// ─── Template Preview Thumbnails ──────────────────────────────────────────────

function ClassicPreview({ config }: { config: ClubPageConfig }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-neutral-900">
      {/* Header banner */}
      <div
        className="flex h-[38%] items-end px-4 pb-3"
        style={{ background: `linear-gradient(135deg, ${config.colors.primary}33, ${config.colors.secondary}55)` }}
      >
        <div className="flex items-end gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black"
            style={{ background: config.colors.primary, color: "#000" }}
          >
            {config.clubName.slice(0, 2).toUpperCase() || "JB"}
          </div>
          <div>
            <p className="text-[8px] font-black leading-tight text-white">{config.clubName || "Clube"}</p>
            <p className="text-[6px] text-white/60">{config.city} · {config.founded}</p>
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <p className="text-[6px] font-bold uppercase tracking-widest" style={{ color: config.colors.primary }}>
          {/* Static preview label — intentional non-translated UI mock */}
          Sobre o clube
        </p>
        <div className="space-y-1">
          {[70, 55, 85, 45].map((w, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static preview
            <div key={i} className="h-1 rounded-full bg-white/10" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex gap-1.5 pt-1">
          {["Equipa", "Eventos", "Stats"].map(tab => (
            <span
              key={tab}
              className="rounded-full px-2 py-0.5 text-[5px] font-bold"
              style={{ background: `${config.colors.primary}22`, color: config.colors.primary }}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModernPreview({ config }: { config: ClubPageConfig }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#050312]">
      <div
        className="pointer-events-none absolute -top-6 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full blur-2xl opacity-40"
        style={{ background: config.colors.primary }}
      />
      <div className="relative flex flex-col items-center pt-4 pb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl font-black text-xs ring-2"
          style={{ background: `${config.colors.primary}22`, color: config.colors.primary } as React.CSSProperties}
        >
          {config.clubName.slice(0, 2).toUpperCase() || "JB"}
        </div>
        <p className="mt-1.5 text-[8px] font-black text-white">{config.clubName || "Clube"}</p>
        <p className="text-[6px] text-white/40">{config.clubSlogan}</p>
      </div>
      <div className="mx-3 grid grid-cols-3 gap-1">
        {[["142", "Jogadores"], ["23", "Vitórias"], ["98%", "Rating"]].map(([val, lbl]) => (
          <div key={lbl} className="rounded-xl border border-white/8 bg-white/5 py-2 text-center">
            <p className="text-[8px] font-black" style={{ color: config.colors.primary }}>{val}</p>
            <p className="text-[5px] text-white/40">{lbl}</p>
          </div>
        ))}
      </div>
      <div className="mx-3 mt-2 h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${config.colors.primary}, ${config.colors.secondary})` }} />
    </div>
  );
}

function UltraPreview({ config }: { config: ClubPageConfig }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${config.colors.primary}44 0%, #050312 70%)` }}
    >
      {[...Array(6)].map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: decorative static
        <div
          key={i}
          className="absolute rounded-full opacity-30"
          style={{
            width: `${4 + i * 2}px`,
            height: `${4 + i * 2}px`,
            background: config.colors.primary,
            top: `${10 + i * 12}%`,
            left: `${5 + i * 15}%`,
            filter: "blur(1px)",
          }}
        />
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-full font-black text-xs"
          style={{
            background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
            boxShadow: `0 0 24px ${config.colors.primary}88`,
            color: "#000",
          }}
        >
          {config.clubName.slice(0, 2).toUpperCase() || "JB"}
        </div>
        <p className="mt-2 text-[8px] font-black text-white">{config.clubName || "Clube"}</p>
        <p
          className="mt-0.5 text-[5px] font-bold uppercase tracking-[0.3em]"
          style={{ color: config.colors.primary }}
        >
          {config.category}
        </p>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-around px-4"
        style={{ background: `${config.colors.primary}15`, borderTop: `1px solid ${config.colors.primary}22` }}
      >
        {["⚽", "🏆", "📊"].map(icon => (
          <span key={icon} className="text-[10px]">{icon}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Template Card ─────────────────────────────────────────────────────────────

const TEMPLATE_ICONS: Record<ClubTemplate, React.ElementType> = {
  classic: Shield,
  modern: Zap,
  ultra: Sparkles,
};

const TEMPLATE_COLORS: Record<ClubTemplate, string> = {
  classic: "#6fffe9",
  modern: "#24ffe6",
  ultra: "#ccff00",
};

const PREVIEW_COMPONENTS: Record<ClubTemplate, React.ComponentType<{ config: ClubPageConfig }>> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  ultra: UltraPreview,
};

interface TemplateCardProps {
  id: ClubTemplate;
  label: string;
  description: string;
  badge?: string;
  isSelected: boolean;
  onSelect: () => void;
  config: ClubPageConfig;
}

function TemplateCard({ id, label, description, badge, isSelected, onSelect, config }: TemplateCardProps) {
  const Icon = TEMPLATE_ICONS[id];
  const accentColor = TEMPLATE_COLORS[id];
  const PreviewComponent = PREVIEW_COMPONENTS[id];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border text-left transition-all duration-300",
        isSelected
          ? "border-[#24ffe6]/60 shadow-[0_0_40px_-10px_rgba(36,255,230,0.5)]"
          : "border-white/8 hover:border-white/20 hover:shadow-[0_0_20px_-10px_rgba(111,255,233,0.2)]",
      )}
    >
      {badge && (
        <div className="absolute top-3 right-3 z-20">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
            style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44` }}
          >
            {badge}
          </span>
        </div>
      )}

      {isSelected && (
        <div className="absolute top-3 left-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#24ffe6]">
          <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} />
        </div>
      )}

      <div className="relative h-44 bg-[#0a0b1e] overflow-hidden">
        <PreviewComponent config={config} />
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isSelected ? "opacity-0" : "opacity-0 group-hover:opacity-100",
          "bg-[#24ffe6]/5",
        )} />
      </div>

      <div className="bg-white/3 p-5 border-t border-white/8">
        <div className="mb-1 flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: accentColor }} strokeWidth={2} />
          <h3 className="text-sm font-black text-white">{label}</h3>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface TemplateSelectorProps {
  config: ClubPageConfig;
  onTemplateChange: (template: ClubTemplate) => void;
}

export function TemplateSelector({ config, onTemplateChange }: TemplateSelectorProps) {
  const t = useTranslations("templateSelector");

  return (
    <div>
      <div className="mb-6">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6fffe9]">
          {t("step")}
        </p>
        <h2 className="text-xl font-black text-white">{t("title")}</h2>
        <p className="mt-1 text-sm text-white/50">{t("description")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {TEMPLATE_OPTION_IDS.map((id) => (
          <TemplateCard
            key={id}
            id={id}
            label={TEMPLATE_LABELS[id]}
            description={t(`templates.${id}.description`)}
            badge={id !== "classic" ? t(`templates.${id}.badge`) : undefined}
            isSelected={config.template === id}
            onSelect={() => onTemplateChange(id)}
            config={config}
          />
        ))}
      </div>
    </div>
  );
}
