"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { updateEvent } from "@/actions/match-sessions.actions";
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
  };
  onClose: () => void;
}

const labelClass = "mb-1 text-xs font-semibold text-arena-text-sec";

export function EditEventSheet({ event, onClose }: EditEventSheetProps) {
  const t = useTranslations("arenaCreateEvent"); // Reusing for labels/recurrence translations
  
  const [form, setForm] = useState({
    startDate: new Date(event.startDate),
    status: event.status || "scheduled",
    recurrence: event.recurrence || "once",
  });
  
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
          <h2 className="text-lg font-bold text-arena-text">Editar Informações</h2>
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
              <SelectItem value="once">{t("recurrence.once") || "Único"}</SelectItem>
              <SelectItem value="weekly">{t("recurrence.weekly") || "Semanal"}</SelectItem>
              <SelectItem value="monthly">{t("recurrence.monthly") || "Mensal"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className={labelClass}>Status do Evento</Label>
          <Select
            value={form.status}
            onValueChange={v => set("status", v)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-arena-border bg-arena-surface text-sm text-arena-text">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
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
            Cancelar
          </Button>
          <Button
            className="h-[50px] flex-[2] rounded-[14px] bg-arena-primary text-[15px] font-bold text-arena-bg hover:bg-arena-primary/90"
            onClick={handleSave}
            type="button"
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : "Guardar"}
          </Button>
        </div>
      </div>
    </JbBottomSheet>
  );
}
