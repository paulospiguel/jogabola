"use client";

import { Settings2 } from "lucide-react";
import { useState } from "react";
import { upsertTeamPaymentSettings } from "@/actions/team-payment-settings.actions";
import { JbBottomSheet } from "@/components/arena/jb-bottom-sheet";
import { PaymentMethodDetailSheet } from "./payment-method-detail-sheet";
import {
  type PaymentMethodConfig,
  PaymentMethodList,
  type PaymentMethodType,
} from "./payment-method-list";

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

export function PaymentSettingsSheet({
  teamId,
  initial,
  onClose,
  onSaved,
}: PaymentSettingsSheetProps) {
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

  const [activeDetail, setActiveDetail] = useState<PaymentMethodType | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function persist(
    overrides?: Partial<{
      stripeEnabled: boolean;
      mbwayEnabled: boolean;
      mbwayPhone: string;
      mbwayName: string;
      cashEnabled: boolean;
      cashInstructions: string;
    }>,
  ) {
    setSaving(true);
    setError("");
    const res = await upsertTeamPaymentSettings({
      teamId,
      stripeEnabled: overrides?.stripeEnabled ?? stripeEnabled,
      mbwayEnabled: overrides?.mbwayEnabled ?? mbwayEnabled,
      mbwayPhone: (overrides?.mbwayPhone ?? mbwayPhone).trim() || undefined,
      mbwayName: (overrides?.mbwayName ?? mbwayName).trim() || undefined,
      cashEnabled: overrides?.cashEnabled ?? cashEnabled,
      cashInstructions:
        (overrides?.cashInstructions ?? cashInstructions).trim() || undefined,
    });
    setSaving(false);
    if (!res.success) {
      setError("Erro ao guardar. Tenta de novo.");
    }
    return res.success;
  }

  async function handleToggle(type: PaymentMethodType, enabled: boolean) {
    if (type === "stripe") setStripeEnabled(enabled);
    if (type === "mbway") setMbwayEnabled(enabled);
    if (type === "cash") setCashEnabled(enabled);

    await persist({
      stripeEnabled: type === "stripe" ? enabled : stripeEnabled,
      mbwayEnabled: type === "mbway" ? enabled : mbwayEnabled,
      cashEnabled: type === "cash" ? enabled : cashEnabled,
    });
    onSaved?.();
  }

  async function handleDetailSave(data: {
    mbwayPhone?: string;
    mbwayName?: string;
    cashInstructions?: string;
  }) {
    if (data.mbwayPhone !== undefined) setMbwayPhone(data.mbwayPhone);
    if (data.mbwayName !== undefined) setMbwayName(data.mbwayName);
    if (data.cashInstructions !== undefined)
      setCashInstructions(data.cashInstructions);

    const ok = await persist({
      mbwayPhone: data.mbwayPhone ?? mbwayPhone,
      mbwayName: data.mbwayName ?? mbwayName,
      cashInstructions: data.cashInstructions ?? cashInstructions,
    });
    if (ok) onSaved?.();
  }

  const methods: PaymentMethodConfig[] = [
    {
      type: "stripe",
      enabled: stripeEnabled,
      summary: stripeEnabled ? "Cartão ativo" : undefined,
    },
    {
      type: "mbway",
      enabled: mbwayEnabled,
      summary: mbwayEnabled && mbwayPhone ? mbwayPhone : undefined,
    },
    {
      type: "cash",
      enabled: cashEnabled,
      summary: cashEnabled && cashInstructions ? cashInstructions : undefined,
    },
  ];

  return (
    <>
      <JbBottomSheet title="Métodos de Pagamento" onClose={onClose}>
        <div className="flex flex-col gap-5 p-5 pb-8">
          {error && (
            <div className="rounded-[10px] bg-arena-danger/10 p-3 text-[13px] text-arena-danger">
              {error}
            </div>
          )}

          <PaymentMethodList
            methods={methods}
            onMethodClick={type => setActiveDetail(type)}
            onToggle={handleToggle}
          />

          <p className="text-[11px] text-arena-text-muted">
            {saving
              ? "A guardar..."
              : "Clica num método para configurar os detalhes."}
          </p>

          <button
            type="button"
            onClick={() => {
              onSaved?.();
              onClose();
            }}
            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-arena-primary text-[14px] font-bold text-arena-bg shadow-[0_0_20px_rgba(124,255,79,0.2)] transition-all hover:bg-arena-primary/90"
          >
            <Settings2 size={16} />
            Concluir
          </button>
        </div>
      </JbBottomSheet>

      {activeDetail && (
        <PaymentMethodDetailSheet
          type={activeDetail}
          initial={{ mbwayPhone, mbwayName, cashInstructions }}
          onSave={handleDetailSave}
          onClose={() => setActiveDetail(null)}
        />
      )}
    </>
  );
}
