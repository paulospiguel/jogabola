"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { addPlayerToRoster } from "@/actions/teams.actions";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { JbAvatar } from "./jb-avatar";
import { JbBottomSheet } from "./jb-bottom-sheet";

const POSITIONS = [
  "GK",
  "CB",
  "MID",
  "FW",
];

interface AddPlayerSheetProps {
  onClose: () => void;
  managerId?: string | null;
  teamId?: number | null;
}

interface FormState {
  name: string;
  position: string;
  email: string;
  phone: string;
  admin: boolean;
}

// Arena-flavoured overrides applied on top of the UI base components
const inputClass =
  "h-11 rounded-xl border border-arena-border bg-arena-surface text-sm text-arena-text placeholder:text-arena-text-muted/70 focus-visible:ring-arena-primary/40 focus-visible:border-arena-primary/50";
const labelClass = "mb-1 text-xs font-semibold text-arena-text-sec";

export function AddPlayerSheet({ onClose, managerId, teamId }: AddPlayerSheetProps) {
  const t = useTranslations("arenaAddPlayer");
  const commonTranslations = useTranslations("common");
  const [form, setForm] = useState<FormState>({
    name: "",
    position: "MID",
    email: "",
    phone: "",
    admin: false,
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    setError(null);

    const result = await addPlayerToRoster({
      name: form.name.trim(),
      email: form.email.trim(),
      position: form.position,
      experience: "beginner",
      managerId,
      teamId,
    });

    setSaving(false);

    if (result.success) {
      setDone(true);
      setTimeout(onClose, 2000);
    } else {
      setError(result.error.message ?? result.error.code);
    }
  };

  /* ── Success state ─────────────────────────────────────────── */
  if (done) {
    return (
      <JbBottomSheet onClose={onClose}>
        <div className="flex flex-col items-center gap-3.5 overflow-auto px-5 pt-8 pb-12 text-center">
          <JbAvatar id={form.name} name={form.name} size={64} />
          <p className="text-lg font-bold text-arena-text">
            {t("success", { name: form.name })}
          </p>
          <p className="text-sm text-arena-text-sec">{t("successSubtitle")}</p>
        </div>
      </JbBottomSheet>
    );
  }

  const canSave = !!form.name.trim() && !!form.email.trim();

  return (
    <JbBottomSheet onClose={onClose} noPad title={t("title")}>
      {/* ── Player preview ───────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-auto px-5 pb-8">
        <div className="mb-4 flex items-center gap-3.5 border-b border-arena-border py-4">
          <JbAvatar id={form.name || "0"} name={form.name || "?"} size={56} />
          <div>
            <p className="text-[15px] font-bold text-arena-text">
              {form.name || t("placeholderName")}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded-[5px] border border-arena-border bg-arena-surface-el px-[7px] py-0.5 text-[10px] font-bold text-arena-text-muted">
                {commonTranslations(`positions.${form.position}`)}
              </span>
              {form.email && (
                <span className="text-[11px] text-arena-text-muted">
                  {form.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Full name */}
        <div className="mb-3">
          <Label className={labelClass} htmlFor="player-name">
            {t("labels.fullName")}
          </Label>
          <Input
            className={inputClass}
            id="player-name"
            onChange={e => set("name", e.target.value)}
            placeholder={t("placeholders.name")}
            value={form.name}
          />
        </div>

        {/* Position — Select component */}
        <div className="mb-3">
          <Label className={labelClass} htmlFor="player-position">
            {t("labels.position")}
          </Label>
          <Select
            onValueChange={value => set("position", value)}
            value={form.position}
          >
            <SelectTrigger
              className="h-11 w-full rounded-xl border border-arena-border bg-arena-surface text-sm text-arena-text"
              id="player-position"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
              {POSITIONS.map(p => (
                <SelectItem key={p} value={p}>
                  <div className="flex items-center gap-2">
                    <span className="w-8 font-bold text-arena-primary">
                      {p}
                    </span>
                    <span className="text-arena-text">
                      {commonTranslations(`positions.${p}`)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Email */}
        <div className="mb-3">
          <Label className={labelClass} htmlFor="player-email">
            {t("labels.email")}
          </Label>
          <Input
            className={inputClass}
            id="player-email"
            onChange={e => set("email", e.target.value)}
            placeholder={t("placeholders.email")}
            type="email"
            value={form.email}
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <Label className={labelClass} htmlFor="player-phone">
            {t("labels.phone")}
          </Label>
          <Input
            className={inputClass}
            id="player-phone"
            onChange={e => set("phone", e.target.value)}
            placeholder={t("placeholders.phone")}
            type="tel"
            value={form.phone}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-3 rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3 py-2.5 text-[13px] text-arena-danger">
            {error}
          </div>
        )}
      </div>

      {/* ── Footer action ────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-5">
        <Button
          className={cn(
            "h-[50px] w-full rounded-[14px] text-[15px] font-bold",
            canSave
              ? "bg-arena-primary text-arena-bg hover:bg-arena-primary/90"
              : "cursor-not-allowed bg-arena-border text-arena-text-muted opacity-100",
          )}
          disabled={!canSave || saving}
          onClick={handleSave}
          type="button"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Check size={16} strokeWidth={2.5} />
          )}
          {t("actions.add")}
        </Button>
      </div>
    </JbBottomSheet>
  );
}
