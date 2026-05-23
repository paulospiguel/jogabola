"use client";

import { Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { upsertTeamPaymentSettings } from "@/actions/team-payment-settings.actions";
import { BottomSheet } from "@/components/arena/bottom-sheet";
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
    transferEnabled?: boolean;
    transferIban?: string;
    transferName?: string;
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
  const t = useTranslations("arenaPayments.settings");
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
  const [transferEnabled, setTransferEnabled] = useState(
    initial?.transferEnabled ?? false,
  );
  const [transferIban, setTransferIban] = useState(initial?.transferIban ?? "");
  const [transferName, setTransferName] = useState(initial?.transferName ?? "");

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
      transferEnabled: boolean;
      transferIban: string;
      transferName: string;
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
      transferEnabled: overrides?.transferEnabled ?? transferEnabled,
      transferIban:
        (overrides?.transferIban ?? transferIban).trim() || undefined,
      transferName:
        (overrides?.transferName ?? transferName).trim() || undefined,
    });
    setSaving(false);
    if (!res.success) {
      setError(t("error"));
    }
    return res.success;
  }

  async function handleToggle(type: PaymentMethodType, enabled: boolean) {
    if (type === "stripe") setStripeEnabled(enabled);
    if (type === "mbway") setMbwayEnabled(enabled);
    if (type === "cash") setCashEnabled(enabled);
    if (type === "transfer") setTransferEnabled(enabled);

    await persist({
      stripeEnabled: type === "stripe" ? enabled : stripeEnabled,
      mbwayEnabled: type === "mbway" ? enabled : mbwayEnabled,
      cashEnabled: type === "cash" ? enabled : cashEnabled,
      transferEnabled: type === "transfer" ? enabled : transferEnabled,
    });
    onSaved?.();
  }

  async function handleDetailSave(data: {
    mbwayPhone?: string;
    mbwayName?: string;
    cashInstructions?: string;
    transferIban?: string;
    transferName?: string;
  }) {
    if (data.mbwayPhone !== undefined) setMbwayPhone(data.mbwayPhone);
    if (data.mbwayName !== undefined) setMbwayName(data.mbwayName);
    if (data.cashInstructions !== undefined)
      setCashInstructions(data.cashInstructions);
    if (data.transferIban !== undefined) setTransferIban(data.transferIban);
    if (data.transferName !== undefined) setTransferName(data.transferName);

    const ok = await persist({
      mbwayPhone: data.mbwayPhone ?? mbwayPhone,
      mbwayName: data.mbwayName ?? mbwayName,
      cashInstructions: data.cashInstructions ?? cashInstructions,
      transferIban: data.transferIban ?? transferIban,
      transferName: data.transferName ?? transferName,
    });
    if (ok) onSaved?.();
  }

  const formatIbanForSummary = (iban: string) => {
    const clean = iban.replace(/\s+/g, "").toUpperCase();
    return `IBAN: ${clean.replace(/(.{4})/g, "$1 ").trim()}`;
  };

  const methods: PaymentMethodConfig[] = [
    {
      type: "stripe",
      enabled: stripeEnabled,
      summary: stripeEnabled ? t("stripe.title") : undefined,
    },
    {
      type: "mbway",
      enabled: mbwayEnabled,
      summary: mbwayEnabled && mbwayPhone ? mbwayPhone : undefined,
    },
    {
      type: "transfer",
      enabled: transferEnabled,
      summary:
        transferEnabled && transferIban
          ? formatIbanForSummary(transferIban)
          : undefined,
    },
    {
      type: "cash",
      enabled: cashEnabled,
      summary: cashEnabled && cashInstructions ? cashInstructions : undefined,
    },
  ];

  return (
    <>
      <BottomSheet title={t("title")} onClose={onClose}>
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
            {saving ? t("saving") : t("help")}
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
            {t("done")}
          </button>
        </div>
      </BottomSheet>

      {activeDetail && (
        <PaymentMethodDetailSheet
          type={activeDetail}
          initial={{
            mbwayPhone,
            mbwayName,
            cashInstructions,
            transferIban,
            transferName,
          }}
          onSave={handleDetailSave}
          onClose={() => setActiveDetail(null)}
        />
      )}
    </>
  );
}
