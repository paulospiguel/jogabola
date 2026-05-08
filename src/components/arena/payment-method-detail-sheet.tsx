"use client";

import { Banknote, CreditCard, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { JbBottomSheet } from "@/components/arena/jb-bottom-sheet";
import { cn } from "@/lib/utils";
import type { PaymentMethodType } from "./payment-method-list";

interface PaymentMethodDetailSheetProps {
  type: PaymentMethodType;
  initial: {
    mbwayPhone?: string;
    mbwayName?: string;
    cashInstructions?: string;
  };
  onSave: (data: {
    mbwayPhone?: string;
    mbwayName?: string;
    cashInstructions?: string;
  }) => Promise<void>;
  onClose: () => void;
}

const inputCls =
  "h-[46px] w-full rounded-[10px] border border-arena-border bg-arena-bg-sec/50 px-3.5 text-[13px] text-arena-text placeholder:text-arena-text-muted outline-none transition-all focus:border-arena-primary focus:ring-2 focus:ring-arena-primary/10";

const TITLES: Record<PaymentMethodType, string> = {
  stripe: "Configurar Stripe",
  mbway: "Configurar MBWay",
  cash: "Configurar Dinheiro",
};

const ICONS: Record<PaymentMethodType, React.ElementType> = {
  stripe: CreditCard,
  mbway: Smartphone,
  cash: Banknote,
};

const COLORS: Record<PaymentMethodType, string> = {
  stripe: "#6366f1",
  mbway: "#ef4444",
  cash: "#22c55e",
};

function FieldRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-arena-text-muted">
        {label}
        {required && <span className="ml-1 text-arena-danger">*</span>}
      </p>
      {children}
    </div>
  );
}

export function PaymentMethodDetailSheet({
  type,
  initial,
  onSave,
  onClose,
}: PaymentMethodDetailSheetProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mbwayPhone, setMbwayPhone] = useState(initial.mbwayPhone ?? "");
  const [mbwayName, setMbwayName] = useState(initial.mbwayName ?? "");
  const [cashInstructions, setCashInstructions] = useState(
    initial.cashInstructions ?? "",
  );

  const Icon = ICONS[type];
  const color = COLORS[type];

  async function handleSave() {
    if (type === "mbway" && !mbwayPhone.trim()) {
      setError("Insere o número de telemóvel para MBWay.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        mbwayPhone: mbwayPhone.trim() || undefined,
        mbwayName: mbwayName.trim() || undefined,
        cashInstructions: cashInstructions.trim() || undefined,
      });
      onClose();
    } catch {
      setError("Erro ao guardar. Tenta de novo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <JbBottomSheet title={TITLES[type]} onClose={onClose}>
      <div className="flex flex-col gap-5 p-5 pb-8">
        {/* Method header */}
        <div className="flex items-center gap-3 rounded-[12px] border p-3.5"
          style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
        >
          <div
            className="flex size-10 items-center justify-center rounded-[10px] border"
            style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, color }}
          >
            <Icon size={20} />
          </div>
          <div>
            <p className="text-[14px] font-bold text-arena-text">{TITLES[type].replace("Configurar ", "")}</p>
            <p className="text-[11px] text-arena-text-muted">
              {type === "stripe" && "Pagamento automático por cartão"}
              {type === "mbway" && "Transferência manual por telemóvel"}
              {type === "cash" && "Pagamento presencial no jogo"}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-[10px] bg-arena-danger/10 p-3 text-[13px] text-arena-danger">
            {error}
          </div>
        )}

        {/* Stripe */}
        {type === "stripe" && (
          <div className="rounded-[12px] border border-arena-border bg-arena-surface p-4 text-[13px] text-arena-text-muted">
            A integração com Stripe será configurada através do painel de equipa. Contacta o suporte para mais informações.
          </div>
        )}

        {/* MBWay */}
        {type === "mbway" && (
          <div className="flex flex-col gap-3">
            <FieldRow label="Número de telemóvel" required>
              <input
                type="tel"
                value={mbwayPhone}
                onChange={e => setMbwayPhone(e.target.value)}
                placeholder="+351 912 345 678"
                className={inputCls}
              />
            </FieldRow>
            <FieldRow label="Nome do destinatário (opcional)">
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

        {/* Cash */}
        {type === "cash" && (
          <FieldRow label="Instruções para pagamento em dinheiro">
            <textarea
              value={cashInstructions}
              onChange={e => setCashInstructions(e.target.value)}
              placeholder="Paga ao capitão no início do jogo."
              rows={3}
              maxLength={300}
              className={cn(
                "w-full resize-none rounded-[10px] border border-arena-border bg-arena-bg-sec/50 px-3.5 py-3 text-[13px] text-arena-text placeholder:text-arena-text-muted outline-none transition-all focus:border-arena-primary focus:ring-2 focus:ring-arena-primary/10",
              )}
            />
            <p className="text-right text-[10px] text-arena-text-muted">
              {cashInstructions.length}/300
            </p>
          </FieldRow>
        )}

        {type !== "stripe" && (
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-arena-primary text-[14px] font-bold text-arena-bg shadow-[0_0_20px_rgba(124,255,79,0.2)] transition-all hover:bg-arena-primary/90 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Guardar"
            )}
          </button>
        )}
      </div>
    </JbBottomSheet>
  );
}
