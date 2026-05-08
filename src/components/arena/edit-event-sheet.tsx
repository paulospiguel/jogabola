"use client";

import { ChevronDown, ChevronUp, CreditCard, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { updateEvent } from "@/actions/match-sessions.actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EventDatePicker } from "@/components/ui/event-date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JbBottomSheet } from "./jb-bottom-sheet";

interface EditEventSheetProps {
  event: {
    id: number;
    startDate: Date | string;
    status: string;
    recurrence: string;
    priceCents?: number;
    paymentRequired?: boolean;
    paymentDeadlineHours?: number | null;
  };
  onClose: () => void;
}

const labelClass = "mb-1 text-xs font-semibold text-arena-text-sec";
const inputClass =
  "h-11 rounded-xl border-arena-border bg-arena-bg text-sm text-arena-text placeholder:text-arena-text-muted/70 focus-visible:ring-arena-primary/40 focus-visible:border-arena-primary/50";

export function EditEventSheet({ event, onClose }: EditEventSheetProps) {
  const t = useTranslations("arenaCreateEvent");
  const tEvents = useTranslations("arenaEvents");
  const tCommon = useTranslations("common");

  const [form, setForm] = useState({
    startDate: new Date(event.startDate),
    status: event.status || "scheduled",
    recurrence: event.recurrence || "once",
    priceCents: event.priceCents ?? 0,
    paymentRequired: event.paymentRequired ?? false,
    paymentDeadlineHours: event.paymentDeadlineHours?.toString() ?? "",
  });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await updateEvent(event.id, {
      startDate: form.startDate,
      status: form.status,
      recurrence: form.recurrence,
      priceCents: form.priceCents,
      paymentRequired: form.paymentRequired,
      paymentDeadlineHours: form.paymentRequired && form.paymentDeadlineHours
        ? Number.parseInt(form.paymentDeadlineHours, 10)
        : null,
    });
    setSaving(false);
    if (res.success) {
      onClose();
    } else {
      setError("Erro ao atualizar evento. Tente novamente.");
    }
  };

  return (
    <JbBottomSheet onClose={onClose}>
      <div className="flex flex-col gap-4 px-5 pb-8 pt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-arena-text">
            Editar Informações
          </h2>
        </div>

        <div>
          <Label className={labelClass}>Data e Hora</Label>
          <EventDatePicker
            id="edit-date"
            value={form.startDate}
            onChange={date => date && set("startDate", date)}
            placeholder="Data e Hora"
          />
        </div>

        <div>
          <Label className={labelClass}>Modalidade</Label>
          <Select
            value={form.recurrence}
            onValueChange={v => set("recurrence", v)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-arena-border bg-arena-surface text-sm text-arena-text">
              <SelectValue placeholder="Modalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">
                {t("recurrence.once") || "Único"}
              </SelectItem>
              <SelectItem value="weekly">
                {t("recurrence.weekly") || "Semanal"}
              </SelectItem>
              <SelectItem value="monthly">
                {t("recurrence.monthly") || "Mensal"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className={labelClass}>Status do Evento</Label>
          <Select value={form.status} onValueChange={v => set("status", v)}>
            <SelectTrigger className="h-11 w-full rounded-xl border-arena-border bg-arena-surface text-sm text-arena-text">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">
                {tEvents("status.scheduled")}
              </SelectItem>
              <SelectItem value="completed">
                {tEvents("status.confirmed")}
              </SelectItem>
              <SelectItem value="canceled">
                {tEvents("status.cancelled")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment section */}
        <div className="rounded-xl border border-arena-border bg-arena-surface overflow-hidden">
          <button
            type="button"
            onClick={() => setPaymentOpen(o => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2 text-[13px] font-semibold text-arena-text">
              <CreditCard size={15} className="text-arena-primary" />
              {t("payment.section") || "Pagamento"}
            </span>
            {paymentOpen ? (
              <ChevronUp size={15} className="text-arena-text-muted" />
            ) : (
              <ChevronDown size={15} className="text-arena-text-muted" />
            )}
          </button>

          {paymentOpen && (
            <div className="flex flex-col gap-3 border-t border-arena-border px-4 pb-4 pt-3">
              <div>
                <Label className={labelClass} htmlFor="edit-price">
                  {t("payment.price") || "Valor (€)"}
                </Label>
                <input
                  className={inputClass}
                  id="edit-price"
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="0.00"
                  value={form.priceCents > 0 ? (form.priceCents / 100).toFixed(2) : ""}
                  onChange={e => {
                    const val = Number.parseFloat(e.target.value) || 0;
                    set("priceCents", Math.round(val * 100));
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => set("paymentRequired", !form.paymentRequired)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                  form.paymentRequired
                    ? "border-arena-primary/40 bg-arena-primary/5"
                    : "border-arena-border bg-arena-bg",
                )}
              >
                <div>
                  <p className="text-[13px] font-semibold text-arena-text">
                    {t("payment.required") || "Pagamento obrigatório"}
                  </p>
                  <p className="text-[11px] text-arena-text-muted">
                    {t("payment.requiredHint") || "Atletas devem pagar antes de confirmar"}
                  </p>
                </div>
                <div className={cn(
                  "h-5 w-9 rounded-full transition-colors",
                  form.paymentRequired ? "bg-arena-primary" : "bg-arena-border",
                )}>
                  <div className={cn(
                    "mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    form.paymentRequired ? "translate-x-4 ml-0.5" : "translate-x-0.5",
                  )} />
                </div>
              </button>

              {form.paymentRequired && (
                <div>
                  <Label className={labelClass} htmlFor="edit-deadline">
                    {t("payment.deadlineHours") || "Prazo de pagamento"}
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      className={cn(inputClass, "flex-1")}
                      id="edit-deadline"
                      type="number"
                      min={1}
                      max={168}
                      placeholder="24"
                      value={form.paymentDeadlineHours}
                      onChange={e => set("paymentDeadlineHours", e.target.value)}
                    />
                    <span className="shrink-0 text-[12px] text-arena-text-muted">
                      {t("payment.deadlineHoursUnit") || "h antes do jogo"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3 py-2.5 text-[13px] text-arena-danger">
            {error}
          </div>
        )}

        <div className="mt-4 flex gap-2.5">
          <Button
            className="h-[50px] flex-1 rounded-[14px] border-arena-border text-[15px] font-semibold text-arena-text-sec"
            onClick={onClose}
            type="button"
            variant="outline"
            disabled={saving}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            className="h-[50px] flex-[2] rounded-[14px] bg-arena-primary text-[15px] font-bold text-arena-bg hover:bg-arena-primary/90"
            onClick={handleSave}
            type="button"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              tCommon("save")
            )}
          </Button>
        </div>
      </div>
    </JbBottomSheet>
  );
}
