"use client";

import { cn } from "@/lib/utils";
import { Upload, X, RefreshCw, Palette } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { ClubColors, ClubPageConfig } from "../_contracts/types";

// ─── Preset Color Palettes ────────────────────────────────────────────────────

const COLOR_PRESETS: { label: string; colors: ClubColors }[] = [
  { label: "Neon Mint",   colors: { primary: "#24ffe6", secondary: "#0d59f2", text: "#ffffff" } },
  { label: "Fogo Vivo",   colors: { primary: "#ff4b2b", secondary: "#ff9800", text: "#ffffff" } },
  { label: "Royal Blue",  colors: { primary: "#0d59f2", secondary: "#6c63ff", text: "#ffffff" } },
  { label: "Ouro Clássico", colors: { primary: "#f5c518", secondary: "#e87722", text: "#000000" } },
  { label: "Verde Campo", colors: { primary: "#00c853", secondary: "#1b5e20", text: "#ffffff" } },
  { label: "Roxo Arena",  colors: { primary: "#ba93ff", secondary: "#6c1aff", text: "#ffffff" } },
  { label: "Branco Puro", colors: { primary: "#ffffff", secondary: "#e4e4e7", text: "#000000" } },
  { label: "Vermelho Bold", colors: { primary: "#f43f5e", secondary: "#9f1239", text: "#ffffff" } },
];

// ─── Color Swatch ──────────────────────────────────────────────────────────────

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Selecionar cor ${color}`}
      className={cn(
        "h-7 w-7 rounded-full border-2 transition-all duration-200 hover:scale-110",
        selected ? "border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.5)]" : "border-transparent",
      )}
      style={{ background: color }}
    />
  );
}

// ─── Color Picker Row ─────────────────────────────────────────────────────────

function ColorPickerRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold text-white/60 w-24 shrink-0">{label}</span>
      <div className="flex items-center gap-3 flex-1">
        {/* Color preview swatch */}
        <div
          className="h-8 w-8 rounded-xl border border-white/20 shrink-0 cursor-pointer"
          style={{ background: value }}
        />
        {/* Native color input */}
        <label className="relative flex-1">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={`Cor: ${label}`}
          />
          <div className="h-9 w-full rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-sm font-mono text-white/70 backdrop-blur cursor-pointer flex items-center">
            {value.toUpperCase()}
          </div>
        </label>
      </div>
    </div>
  );
}

// ─── Logo Upload Zone ─────────────────────────────────────────────────────────

function LogoUploadZone({
  logoUrl,
  clubName,
  primaryColor,
  onLogoChange,
}: {
  logoUrl: string | null;
  clubName: string;
  primaryColor: string;
  onLogoChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    onLogoChange(url);
  }, [onLogoChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/50">Logo do Clube</p>
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div
          className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 overflow-hidden"
          style={{ borderColor: `${primaryColor}44`, background: `${primaryColor}11` }}
        >
          {logoUrl ? (
            <>
              {/* biome-ignore lint/performance/noImgElement: local blob URL */}
              <img src={logoUrl} alt="Club logo" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onLogoChange(null)}
                aria-label="Remover logo"
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <span className="text-2xl font-black" style={{ color: primaryColor }}>
              {clubName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex-1 rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-[#24ffe6]/60 bg-[#24ffe6]/10"
              : "border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5",
          )}
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => e.key === "Enter" && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload logo do clube"
        >
          <Upload className="mx-auto mb-1 h-4 w-4 text-white/40" />
          <p className="text-xs font-semibold text-white/50">
            Arraste ou <span className="text-[#6fffe9]">clique para carregar</span>
          </p>
          <p className="mt-0.5 text-[10px] text-white/30">PNG, SVG, WEBP · Máx 2MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface CustomizerPanelProps {
  config: ClubPageConfig;
  onChange: (patch: Partial<ClubPageConfig>) => void;
}

export function CustomizerPanel({ config, onChange }: CustomizerPanelProps) {
  const updateColors = (patch: Partial<ClubColors>) =>
    onChange({ colors: { ...config.colors, ...patch } });

  const applyPreset = (colors: ClubColors) => onChange({ colors });

  return (
    <div className="space-y-8">
      {/* ── Logo ── */}
      <LogoUploadZone
        logoUrl={config.logoUrl}
        clubName={config.clubName}
        primaryColor={config.colors.primary}
        onLogoChange={url => onChange({ logoUrl: url })}
      />

      {/* ── Divider ── */}
      <div className="h-px bg-white/8" />

      {/* ── Cores ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#6fffe9]" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Cores do Clube</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ colors: { primary: "#24ffe6", secondary: "#0d59f2", text: "#ffffff" } })}
            aria-label="Restaurar cores padrão"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-white/40 hover:text-white/70 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </button>
        </div>

        {/* Preset palettes */}
        <div className="mb-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">
            Paletas Rápidas
          </p>
          <div className="flex flex-wrap gap-3">
            {COLOR_PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.colors)}
                aria-label={`Aplicar paleta ${preset.label}`}
                title={preset.label}
                className="group relative h-8 w-8 rounded-full border-2 border-transparent hover:border-white/40 transition-all duration-200 hover:scale-110 overflow-hidden"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.primary} 50%, ${preset.colors.secondary} 50%)`,
                  }}
                />
                <span className="sr-only">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom pickers */}
        <div className="space-y-3">
          <ColorPickerRow
            label="Cor Principal"
            value={config.colors.primary}
            onChange={val => updateColors({ primary: val })}
          />
          <ColorPickerRow
            label="Cor Secundária"
            value={config.colors.secondary}
            onChange={val => updateColors({ secondary: val })}
          />
          <ColorPickerRow
            label="Cor do Texto"
            value={config.colors.text}
            onChange={val => updateColors({ text: val })}
          />
        </div>
      </div>

      {/* ── Swatches row ── */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">
          Seleção Rápida — Cor Principal
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "#24ffe6", "#6fffe9", "#0d59f2", "#6c63ff",
            "#f43f5e", "#ff9800", "#00c853", "#f5c518",
            "#ffffff", "#ba93ff", "#ccff00", "#e87722",
          ].map(c => (
            <ColorSwatch
              key={c}
              color={c}
              selected={config.colors.primary === c}
              onClick={() => updateColors({ primary: c })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
