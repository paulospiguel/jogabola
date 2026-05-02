"use client";

import { Check, Loader2, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createTeam } from "@/actions/teams.actions";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { JbBottomSheet } from "./jb-bottom-sheet";
import { useTeams } from "@/hooks/use-teams";

interface CreateTeamSheetProps {
  onClose: () => void;
}

interface FormState {
  name: string;
  slug: string;
}

const inputClass =
  "h-11 rounded-xl border-arena-border bg-arena-surface text-sm text-arena-text placeholder:text-arena-text-muted/70 focus-visible:ring-arena-primary/40 focus-visible:border-arena-primary/50";
const labelClass = "mb-1 text-xs font-semibold text-arena-text-sec";

export function CreateTeamSheet({ onClose }: CreateTeamSheetProps) {
  const t = useTranslations("arenaCreateTeam");
  const { refetch, setActiveTeamId } = useTeams();
  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormState, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setForm(f => ({
      ...f,
      name: newName,
      // Only auto-generate slug if it's untouched or matches the old auto-generated one
      slug: generateSlug(newName),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    setError(null);

    const result = await createTeam({
      name: form.name.trim(),
      slug: form.slug.trim(),
    });

    setSaving(false);

    if (!result.success) {
      const e = (result as any).error;
      setError(e?.message ?? e?.code ?? "Error creating team");
      return;
    }

    if (result.data) {
      setDone(true);
      await refetch();
      setActiveTeamId(result.data.id);
      setTimeout(onClose, 2000);
    }
  };

  /* ── Success state ─────────────────────────────────────────── */
  if (done) {
    return (
      <JbBottomSheet onClose={onClose}>
        <div className="flex flex-col items-center gap-3.5 overflow-auto px-5 pt-8 pb-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-arena-primary/10 text-arena-primary">
            <Shield size={32} />
          </div>
          <p className="text-lg font-bold text-arena-text">
            {t("success", { name: form.name })}
          </p>
          <p className="text-sm text-arena-text-sec">{t("successSubtitle")}</p>
        </div>
      </JbBottomSheet>
    );
  }

  const canSave = form.name.trim().length >= 2 && form.slug.trim().length >= 3;

  return (
    <JbBottomSheet onClose={onClose} noPad title={t("title")}>
      <div className="min-h-0 flex-1 overflow-auto px-5 pb-8 pt-4">
        {/* Team Name */}
        <div className="mb-4">
          <Label className={labelClass} htmlFor="team-name">
            {t("labels.name")}
          </Label>
          <Input
            className={inputClass}
            id="team-name"
            onChange={handleNameChange}
            placeholder={t("placeholders.name")}
            value={form.name}
          />
        </div>

        {/* Slug */}
        <div className="mb-4">
          <Label className={labelClass} htmlFor="team-slug">
            {t("labels.slug")}
          </Label>
          <Input
            className={inputClass}
            id="team-slug"
            onChange={e => set("slug", e.target.value)}
            placeholder={t("placeholders.slug")}
            value={form.slug}
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
          {t("actions.create")}
        </Button>
      </div>
    </JbBottomSheet>
  );
}
