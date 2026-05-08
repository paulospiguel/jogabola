"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { markPaymentManually } from "@/actions/payments.actions";
import { JbBottomSheet } from "@/components/arena/jb-bottom-sheet";
import { cn } from "@/lib/utils";

const METHODS = [
  { value: "cash", label: "Dinheiro (presencial)" },
  { value: "mbway", label: "MBWay" },
  { value: "transfer", label: "Transferência bancária" },
  { value: "other", label: "Outro" },
] as const;

type ManualMethod = (typeof METHODS)[number]["value"];

interface ManualMarkPaidSheetProps {
  eventId: number;
  athleteId: string;
  athleteName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManualMarkPaidSheet({
  eventId,
  athleteId,
  athleteName,
  onClose,
  onSuccess,
}: ManualMarkPaidSheetProps) {
  const [method, setMethod] = useState<ManualMethod>("cash");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await markPaymentManually(eventId, athleteId, method, note.trim() || undefined);
    setSaving(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error ?? "Erro ao registar pagamento.");
    }
  }

  return (
    <JbBottomSheet title="Marcar como pago" onClose={onClose}>
      <div className="flex flex-col gap-5 p-5 pb-8">
        {/* Athlete name */}
        <div className="rounded-[10px] border border-arena-border bg-arena-surface px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-arena-text-muted">
            Atleta
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-arena-text">
            {athleteName}
          </p>
        </div>

        {error && (
          <div className="rounded-[10px] bg-arena-danger/10 p-3 text-[13px] text-arena-danger">
            {error}
          </div>
        )}

        {/* Method selector */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-arena-text-muted">
            Método de pagamento
          </p>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={cn(
                  "rounded-[10px] border px-3 py-2.5 text-left text-[13px] font-semibold transition-all",
                  method === m.value
                    ? "border-arena-primary bg-arena-primary/10 text-arena-primary"
                    : "border-arena-border bg-arena-surface text-arena-text-sec hover:border-arena-primary/30",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional note */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-arena-text-muted">
            Nota (opcional)
          </p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ex: pagou antes do jogo via Revolut"
            rows={2}
            maxLength={200}
            className="w-full resize-none rounded-[10px] border border-arena-border bg-arena-bg-sec/50 px-3.5 py-3 text-[13px] text-arena-text placeholder:text-arena-text-muted outline-none transition-all focus:border-arena-primary focus:ring-2 focus:ring-arena-primary/10"
          />
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-arena-success text-[14px] font-bold text-white transition-all hover:bg-arena-success/90 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Confirmar pagamento"
          )}
        </button>
      </div>
    </JbBottomSheet>
  );
}
