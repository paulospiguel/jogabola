"use client";

import {
  Banknote,
  CreditCard,
  Loader2,
  Settings2,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { upsertTeamPaymentSettings } from "@/actions/team-payment-settings.actions";
import { JbBottomSheet } from "@/components/arena/jb-bottom-sheet";
import { cn } from "@/lib/utils";

interface PaymentSettingsSheetProps {
  teamId: number;
  initial?: {
    stripeEnabled?: boolean;
    mbwayEnabled?: boolean;
    mbwayPhone?: string;
    mbwayName?: string;
    cashEnabled?: boolean;
    cashInstructions?: string;
  };
  onClose: () => void;
  onSaved?: () => void;
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  icon: Icon,
  accentColor,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center gap-3 rounded-[12px] border p-3.5 text-left transition-all",
        checked
          ? "border-opacity-40 bg-opacity-10"
          : "border-arena-border bg-arena-surface hover:bg-arena-surface-el",
      )}
      style={
        checked
          ? {
              borderColor: `${accentColor}50`,
              backgroundColor: `${accentColor}10`,
            }
          : {}
      }
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border"
        style={{
          backgroundColor: `${accentColor}15`,
          borderColor: `${accentColor}30`,
          color: accentColor,
        }}
      >
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-arena-text">{label}</p>
        <p className="text-[11px] text-arena-text-muted">{description}</p>
      </div>
      {/* Toggle pill */}
      <div
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-arena-primary" : "bg-arena-border",
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </div>
    </button>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-arena-text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

const inputCls =
  "h-[46px] w-full rounded-[10px] border border-arena-border bg-arena-bg-sec/50 px-3.5 text-[13px] text-arena-text placeholder:text-arena-text-muted outline-none transition-all focus:border-arena-primary focus:ring-2 focus:ring-arena-primary/10";

export function PaymentSettingsSheet({
  teamId,
  initial,
  onClose,
  onSaved,
}: PaymentSettingsSheetProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [stripeEnabled, setStripeEnabled] = useState(
    initial?.stripeEnabled ?? false,
  );
  const [mbwayEnabled, setMbwayEnabled] = useState(
    initial?.mbwayEnabled ?? false,
  );
  const [mbwayPhone, setMbwayPhone] = useState(initial?.mbwayPhone ?? "");
  const [mbwayName, setMbwayName] = useState(initial?.mbwayName ?? "");
  const [cashEnabled, setCashEnabled] = useState(initial?.cashEnabled ?? true);
  const [cashInstructions, setCashInstructions] = useState(
    initial?.cashInstructions ?? "",
  );

  async function handleSave() {
    if (mbwayEnabled && !mbwayPhone.trim()) {
      setError("Insere o número de telemóvel para MBWay.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await upsertTeamPaymentSettings({
      teamId,
      stripeEnabled,
      mbwayEnabled,
      mbwayPhone: mbwayPhone.trim() || undefined,
      mbwayName: mbwayName.trim() || undefined,
      cashEnabled,
      cashInstructions: cashInstructions.trim() || undefined,
    });

    setSaving(false);
    if (res.success) {
      onSaved?.();
      onClose();
    } else {
      setError("Erro ao guardar. Tenta de novo.");
    }
  }

  return (
    <JbBottomSheet title="Métodos de Pagamento" onClose={onClose}>
      <div className="flex flex-col gap-5 p-5 pb-8">
        {error && (
          <div className="rounded-[10px] bg-arena-danger/10 p-3 text-[13px] text-arena-danger">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-arena-text-muted">
            Métodos aceites
          </p>

          <Toggle
            checked={stripeEnabled}
            onChange={setStripeEnabled}
            label="Stripe — Cartão"
            description="Pagamento automático por cartão"
            icon={CreditCard}
            accentColor="#6366f1"
          />

          <Toggle
            checked={mbwayEnabled}
            onChange={setMbwayEnabled}
            label="MBWay"
            description="Transferência manual por telemóvel"
            icon={Smartphone}
            accentColor="#ef4444"
          />

          <Toggle
            checked={cashEnabled}
            onChange={setCashEnabled}
            label="Dinheiro"
            description="Pagamento presencial no jogo"
            icon={Banknote}
            accentColor="#22c55e"
          />
        </div>

        {/* MBWay config */}
        {mbwayEnabled && (
          <div className="flex flex-col gap-3 rounded-[12px] border border-arena-border bg-arena-surface p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-arena-text-muted">
              Configuração MBWay
            </p>
            <FieldRow label="Número de telemóvel *">
              <input
                type="tel"
                value={mbwayPhone}
                onChange={e => setMbwayPhone(e.target.value)}
                placeholder="+351 912 345 678"
                className={inputCls}
                required
              />
            </FieldRow>
            <FieldRow label="Nome (opcional)">
              <input
                type="text"
                value={mbwayName}
                onChange={e => setMbwayName(e.target.value)}
                placeholder="Ex: João Silva"
                className={inputCls}
              />
            </FieldRow>
          </div>
        )}

        {/* Cash config */}
        {cashEnabled && (
          <div className="flex flex-col gap-3 rounded-[12px] border border-arena-border bg-arena-surface p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-arena-text-muted">
              Instruções para dinheiro
            </p>
            <textarea
              value={cashInstructions}
              onChange={e => setCashInstructions(e.target.value)}
              placeholder="Paga ao capitão no início do jogo."
              rows={2}
              className="w-full resize-none rounded-[10px] border border-arena-border bg-arena-bg-sec/50 px-3.5 py-3 text-[13px] text-arena-text placeholder:text-arena-text-muted outline-none transition-all focus:border-arena-primary focus:ring-2 focus:ring-arena-primary/10"
              maxLength={300}
            />
          </div>
        )}

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-arena-primary text-[14px] font-bold text-arena-bg shadow-[0_0_20px_rgba(124,255,79,0.2)] transition-all hover:bg-arena-primary/90 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Settings2 size={16} />
              Guardar configuração
            </>
          )}
        </button>
      </div>
    </JbBottomSheet>
  );
}
