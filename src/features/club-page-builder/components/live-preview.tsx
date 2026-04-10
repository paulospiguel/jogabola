"use client";

import { cn } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Star,
  Trophy,
  Users,
  ChevronRight,
  Globe,
  Swords,
} from "lucide-react";
import type { ClubPageConfig } from "../_contracts/types";

// ─── Shared helper ────────────────────────────────────────────────────────────

function ClubLogo({
  config,
  size = "md",
}: {
  config: ClubPageConfig;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: "h-12 w-12 text-lg",
    md: "h-20 w-20 text-2xl",
    lg: "h-28 w-28 text-4xl",
  };

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-2xl font-black", sizeMap[size])}
      style={{
        background: config.logoUrl
          ? undefined
          : `linear-gradient(135deg, ${config.colors.primary}33, ${config.colors.secondary}44)`,
        border: `2px solid ${config.colors.primary}55`,
        boxShadow: `0 0 24px ${config.colors.primary}44`,
      }}
    >
      {config.logoUrl ? (
        // biome-ignore lint/performance/noImgElement: controlled blob URL
        <img src={config.logoUrl} alt={config.clubName} className="h-full w-full object-cover rounded-[14px]" />
      ) : (
        <span style={{ color: config.colors.primary }}>
          {config.clubName.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

// ─── Template: Classic ────────────────────────────────────────────────────────

function ClassicTemplate({ config }: { config: ClubPageConfig }) {
  return (
    <div className="min-h-full bg-neutral-950 text-white">
      {/* Hero banner */}
      <div
        className="relative overflow-hidden px-8 py-12"
        style={{
          background: `linear-gradient(135deg, ${config.colors.primary}22 0%, ${config.colors.secondary}33 100%)`,
          borderBottom: `2px solid ${config.colors.primary}33`,
        }}
      >
        {/* Background texture lines */}
        <div className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, ${config.colors.primary} 0px, ${config.colors.primary} 1px, transparent 1px, transparent 24px)`,
          }}
        />
        <div className="relative flex items-center gap-6">
          <ClubLogo config={config} size="lg" />
          <div className="flex-1">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: config.colors.primary }}>
              Clube Oficial · {config.category}
            </p>
            <h1 className="text-3xl font-black text-white leading-tight">{config.clubName}</h1>
            <p className="mt-1 text-base italic text-white/60">&quot;{config.clubSlogan}&quot;</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {config.city && (
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <MapPin className="h-3.5 w-3.5" /> {config.city}
                </span>
              )}
              {config.founded && (
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <Calendar className="h-3.5 w-3.5" /> Fundado em {config.founded}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-2xl px-6 py-3 text-sm font-black transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: config.colors.primary,
              color: config.colors.text,
              boxShadow: `0 12px 30px -10px ${config.colors.primary}88`,
            }}
          >
            Juntar-me ao Clube
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="grid grid-cols-3 divide-x"
        style={{ borderBottom: `1px solid ${config.colors.primary}22`, divideColor: `${config.colors.primary}22` } as any}
      >
        {[
          { icon: Users, label: "Jogadores", value: "142" },
          { icon: Trophy, label: "Títulos", value: "12" },
          { icon: Star, label: "Rating", value: "98%" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center py-5 gap-1">
            <Icon className="h-5 w-5 mb-1" style={{ color: config.colors.primary }} />
            <p className="text-xl font-black text-white">{value}</p>
            <p className="text-xs text-white/40">{label}</p>
          </div>
        ))}
      </div>

      {/* Content section */}
      <div className="px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* About */}
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: `${config.colors.primary}22`, background: `${config.colors.primary}08` }}
          >
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.2em]" style={{ color: config.colors.primary }}>
              Sobre o Clube
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">{config.clubDescription}</p>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            {[
              { label: "Ver Equipa", icon: Users },
              { label: "Próximos Eventos", icon: Calendar },
              { label: "Conquistas", icon: Trophy },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className="group flex w-full items-center justify-between rounded-2xl border px-5 py-3 text-sm font-semibold text-white transition-all duration-200"
                style={{ borderColor: `${config.colors.primary}22`, background: `${config.colors.primary}08` }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" style={{ color: config.colors.primary }} />
                  {label}
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template: Modern ─────────────────────────────────────────────────────────

function ModernTemplate({ config }: { config: ClubPageConfig }) {
  return (
    <div
      className="min-h-full text-white"
      style={{
        background: `radial-gradient(ellipse 120% 60% at 50% -20%, ${config.colors.primary}28 0%, #050312 60%)`,
      }}
    >
      {/* Floating hero */}
      <div className="relative flex flex-col items-center pt-12 pb-8 px-6 text-center">
        {/* Neon glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-30"
          style={{ background: config.colors.primary }}
        />

        {/* Club badge with ring */}
        <div className="relative mb-6">
          <div
            className="absolute inset-0 rounded-[28px] blur-2xl opacity-40"
            style={{ background: config.colors.primary }}
          />
          <ClubLogo config={config} size="lg" />
        </div>

        {/* Club name */}
        <h1 className="text-4xl font-black tracking-tight text-white leading-none">{config.clubName}</h1>
        <p className="mt-2 text-sm" style={{ color: config.colors.primary }}>{config.clubSlogan}</p>

        {/* Meta info */}
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {config.city && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 backdrop-blur">
              <MapPin className="h-3 w-3" /> {config.city}
            </span>
          )}
          {config.founded && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 backdrop-blur">
              <Calendar className="h-3 w-3" /> est. {config.founded}
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 backdrop-blur">
            <Globe className="h-3 w-3" /> {config.category}
          </span>
        </div>

        {/* CTA */}
        <button
          type="button"
          className="mt-6 rounded-2xl px-8 py-3 text-sm font-black transition-all duration-300 hover:-translate-y-1"
          style={{
            background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
            color: config.colors.text,
            boxShadow: `0 16px 40px -12px ${config.colors.primary}88`,
          }}
        >
          Juntar-me ao Clube
        </button>
      </div>

      {/* Stats strip */}
      <div className="mx-6 mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Jogadores", value: "142", icon: Users },
          { label: "Vitórias", value: "89", icon: Trophy },
          { label: "Esta Época", value: "94%", icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border p-4 text-center backdrop-blur"
            style={{
              borderColor: `${config.colors.primary}25`,
              background: `${config.colors.primary}0a`,
            }}
          >
            <Icon className="mx-auto mb-1 h-4 w-4" style={{ color: config.colors.primary }} />
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-[10px] text-white/40">{label}</p>
          </div>
        ))}
      </div>

      {/* Description card */}
      <div className="mx-6 mb-6 rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: config.colors.primary }}>
          Sobre o Clube
        </p>
        <p className="text-sm text-white/70 leading-relaxed">{config.clubDescription}</p>
      </div>

      {/* Action cards */}
      <div className="mx-6 mb-8 grid grid-cols-2 gap-3">
        {[
          { label: "Equipa", icon: Users },
          { label: "Próximos Jogos", icon: Swords },
          { label: "Agenda", icon: Calendar },
          { label: "Conquistas", icon: Trophy },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 backdrop-blur transition-all duration-200 hover:border-white/20 hover:bg-white/8"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: `${config.colors.primary}15` }}
            >
              <Icon className="h-4 w-4" style={{ color: config.colors.primary }} />
            </div>
            <span className="text-sm font-semibold text-white/80 group-hover:text-white">{label}</span>
            <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/20 transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Template: Ultra ─────────────────────────────────────────────────────────

function UltraTemplate({ config }: { config: ClubPageConfig }) {
  return (
    <div
      className="relative min-h-full overflow-hidden text-white"
      style={{ background: "#050312" }}
    >
      {/* Animated neon rings (CSS) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-10"
          style={{ borderColor: config.colors.primary }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-5"
          style={{ borderColor: config.colors.secondary }}
        />
        <div
          className="absolute left-0 right-0 top-0 h-1"
          style={{ background: `linear-gradient(90deg, transparent, ${config.colors.primary}, transparent)` }}
        />
        <div
          className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl opacity-30"
          style={{ background: config.colors.primary }}
        />
      </div>

      {/* Hero area */}
      <div className="relative flex flex-col items-center px-6 pt-10 pb-6 text-center">
        {/* Badge: category */}
        <div
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1"
          style={{ borderColor: `${config.colors.primary}44`, background: `${config.colors.primary}11` }}
        >
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: config.colors.primary }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: config.colors.primary }}>
            {config.category} · Ao Vivo
          </span>
        </div>

        {/* Logo with ring glow */}
        <div className="relative mb-5">
          <div
            className="absolute inset-0 animate-pulse rounded-full blur-2xl opacity-50"
            style={{ background: config.colors.primary, margin: "-8px" }}
          />
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full font-black text-4xl ring-4"
            style={{
              ringColor: `${config.colors.primary}66`,
              background: `linear-gradient(135deg, ${config.colors.primary}33, ${config.colors.secondary}44)`,
              boxShadow: `0 0 60px ${config.colors.primary}66, 0 0 120px ${config.colors.primary}22`,
              border: `2px solid ${config.colors.primary}66`,
            } as any}
          >
            {config.logoUrl ? (
              // biome-ignore lint/performance/noImgElement: controlled blob URL
              <img src={config.logoUrl} alt={config.clubName} className="h-full w-full object-cover rounded-full" />
            ) : (
              <span style={{ color: config.colors.primary }}>
                {config.clubName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Club name — ultra style */}
        <h1
          className="text-5xl font-black uppercase tracking-tight leading-none"
          style={{
            background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {config.clubName}
        </h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.4em] text-white/40">
          {config.clubSlogan}
        </p>

        {/* Location + founded */}
        <div className="mt-4 flex gap-4">
          {config.city && (
            <span className="text-xs text-white/40 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {config.city}
            </span>
          )}
          {config.founded && (
            <span className="text-xs text-white/40 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {config.founded}
            </span>
          )}
        </div>
      </div>

      {/* Neon divider */}
      <div className="mx-6 h-px" style={{ background: `linear-gradient(90deg, transparent, ${config.colors.primary}66, transparent)` }} />

      {/* Stats grid */}
      <div className="mx-6 my-6 grid grid-cols-3 gap-3">
        {[
          { label: "Jogadores", value: "142", suffix: "" },
          { label: "Win Rate", value: "89", suffix: "%" },
          { label: "Rating", value: "9.8", suffix: "" },
        ].map(({ label, value, suffix }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl border p-4 text-center"
            style={{ borderColor: `${config.colors.primary}22`, background: `${config.colors.primary}08` }}
          >
            <div
              className="pointer-events-none absolute -top-4 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full blur-xl opacity-50"
              style={{ background: config.colors.primary }}
            />
            <p
              className="relative text-3xl font-black leading-none tabular-nums"
              style={{ color: config.colors.primary }}
            >
              {value}<span className="text-lg">{suffix}</span>
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div
        className="mx-6 mb-6 rounded-3xl border p-6"
        style={{ borderColor: `${config.colors.primary}22`, background: `${config.colors.primary}08` }}
      >
        <p className="text-sm text-white/70 leading-relaxed">{config.clubDescription}</p>
      </div>

      {/* CTA row */}
      <div className="mx-6 mb-8 flex gap-3">
        <button
          type="button"
          className="flex-1 rounded-2xl py-3.5 text-sm font-black uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
            color: config.colors.text,
            boxShadow: `0 16px 40px -12px ${config.colors.primary}99`,
          }}
        >
          Juntar-me
        </button>
        <button
          type="button"
          className="rounded-2xl border px-5 text-sm font-bold text-white/70 transition-all duration-200 hover:text-white"
          style={{ borderColor: `${config.colors.primary}33`, background: `${config.colors.primary}0a` }}
        >
          Ver Mais
        </button>
      </div>
    </div>
  );
}

// ─── Preview Wrapper ──────────────────────────────────────────────────────────

interface LivePreviewProps {
  config: ClubPageConfig;
}

export const TEMPLATE_COMPONENTS = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  ultra: UltraTemplate,
};

export function LivePreview({ config }: LivePreviewProps) {
  const TemplateComponent = TEMPLATE_COMPONENTS[config.template];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-white/3 shadow-[0_35px_80px_-45px_rgba(36,255,230,0.15)]">
      {/* Browser-like top bar */}
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/3 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </div>
        <div className="flex-1 mx-4 rounded-lg bg-white/5 px-3 py-1 text-[10px] text-white/30 font-mono">
          jogabola.com/clube/{config.clubName.toLowerCase().replace(/\s+/g, "-")}
        </div>
      </div>
      {/* Preview content */}
      <div className="overflow-y-auto" style={{ maxHeight: "620px" }}>
        <TemplateComponent config={config} />
      </div>
    </div>
  );
}
