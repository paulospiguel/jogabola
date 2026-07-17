"use client";
import { Loader2, X } from "lucide-react";
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
import { JbAvatar } from "./avatar";
import { BottomSheet } from "./bottom-sheet";

const POSITIONS = ["GK", "CB", "MID", "FW"];

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
  "h-11 rounded-xl border border-arena-border bg-[#151C26] text-sm text-arena-text placeholder:text-arena-text-muted/65 focus-visible:ring-arena-primary/30 focus-visible:border-arena-primary/50 focus-visible:ring-1 focus-visible:ring-offset-0";
const labelClass = "mb-1.5 block text-xs font-semibold text-arena-text-sec";

export function AddPlayerSheet({
  onClose,
  managerId,
  teamId,
}: AddPlayerSheetProps) {
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
      admin: form.admin,
      phone: form.phone.trim(),
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
      <BottomSheet onClose={onClose}>
        <div className="flex flex-col items-center gap-3.5 overflow-auto px-5 pt-8 pb-12 text-center text-arena-text">
          <JbAvatar id={form.name} name={form.name} size={64} />
          <p className="text-lg font-bold text-arena-text">
            {t("success", { name: form.name })}
          </p>
          <p className="text-sm text-arena-text-sec">{t("successSubtitle")}</p>
        </div>
      </BottomSheet>
    );
  }

  const canSave = !!form.name.trim() && !!form.email.trim();

  return (
    <BottomSheet onClose={onClose} noPad>
      {/* ── Custom Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <span className="font-sora text-lg font-extrabold text-arena-text">
          {t("title")}
        </span>
        <button
          className="press flex size-[30px] items-center justify-center rounded-full border border-arena-border bg-[#151C26] text-arena-text-sec transition-colors hover:bg-arena-surface-el"
          onClick={onClose}
          type="button"
          aria-label={commonTranslations("close")}
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Player dynamic preview ─────────────────────────────── */}
      <div className="mb-6 flex items-center gap-4 border-b border-arena-border px-5 pb-6">
        <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full border border-indigo-500/20 bg-gradient-to-br from-[#1E1B4B]/80 to-[#311E63]/80 shadow-[inset_0_2px_8px_rgba(124,58,237,0.2)]">
          <span className="font-sora text-[22px] font-extrabold text-[#C084FC] drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]">
            ?
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <p className="font-sora text-[15px] font-bold text-arena-text truncate">
            {form.name || t("placeholderName")}
          </p>
          <div className="mt-1 flex">
            <span className="rounded-[4px] border border-arena-border bg-arena-surface px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-arena-text-muted uppercase">
              {commonTranslations(`positions.${form.position}`)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Form Inputs ───────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-auto px-5 pb-8">
        {/* Full name */}
        <div className="mb-4">
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
        <div className="mb-4">
          <Label className={labelClass} htmlFor="player-position">
            {t("labels.position")}
          </Label>
          <Select
            onValueChange={value => set("position", value)}
            value={form.position}
          >
            <SelectTrigger
              className="h-11 w-full rounded-xl border border-arena-border bg-[#151C26] px-3 text-sm text-arena-text focus-visible:ring-arena-primary/30 focus-visible:border-arena-primary/50 focus-visible:ring-1 focus-visible:ring-offset-0"
              id="player-position"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[10000] border-arena-border bg-arena-bg-sec text-arena-text">
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
        <div className="mb-4">
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

        {/* Administrator Toggle Switch */}
        <div className="mb-6 flex items-center gap-3.5 rounded-xl border border-arena-border bg-[#151C26]/40 p-3.5">
          <button
            type="button"
            role="switch"
            aria-checked={form.admin}
            onClick={() => set("admin", !form.admin)}
            className={cn(
              "relative h-[22px] w-10 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arena-primary/30",
              form.admin
                ? "bg-arena-primary"
                : "bg-[#1E293B] border border-arena-border",
            )}
          >
            <span
              className={cn(
                "block size-[14px] rounded-full transition-transform duration-200 shadow-sm",
                form.admin
                  ? "translate-x-[22px] bg-arena-bg"
                  : "translate-x-[3px] bg-arena-text-muted",
              )}
            />
          </button>
          <span className="text-sm font-semibold text-arena-text-sec select-none">
            {t("labels.admin")}
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3 py-2.5 text-[13px] text-arena-danger">
            {error}
          </div>
        )}
      </div>

      {/* ── Footer Action ────────────────────────────────────── */}
      <div className="border-t border-arena-border bg-arena-bg-sec/40 px-5 pt-4 pb-6">
        <Button
          className={cn(
            "h-[50px] w-full rounded-[14px] text-[15px] font-bold transition-all",
            canSave
              ? "bg-arena-primary text-arena-bg hover:bg-arena-primary/95 press"
              : "cursor-not-allowed border border-[#2F3947]/30 bg-[#232B36] text-[#5A6372] shadow-none opacity-100",
          )}
          disabled={!canSave || saving}
          onClick={handleSave}
          type="button"
        >
          {saving ? (
            <Loader2 className="animate-spin size-[18px]" />
          ) : (
            <span className="text-[15px]">{t("actions.add")}</span>
          )}
        </Button>
      </div>
    </BottomSheet>
  );
}
