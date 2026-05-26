"use client";

import { CheckCircle2, Edit3, Loader2, Save, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateUserProfile } from "@/actions/profile.actions";
import { JbAvatar } from "@/components/arena/avatar";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileEditSheetProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phone?: string;
  };
  onClose: () => void;
}

export function ProfileEditSheet({ user, onClose }: ProfileEditSheetProps) {
  const t = useTranslations("profilePage");
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "+351 910 297 571",
  });
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateUserProfile({ name: form.name });
      if (result.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } else {
        setSaveStatus("error");
      }
    });
  };

  return (
    <BottomSheet title={t("editProfileSheet.title")} onClose={onClose} noPad>
      <div className="px-5 py-4 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="relative group cursor-pointer">
            <div className="w-[88px] h-[88px] rounded-full border-2 border-arena-border p-1 bg-arena-bg-sec/50">
              <JbAvatar id={user.id} name={form.name} image={user.image} size={76} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-arena-bg p-[3px] rounded-full">
              <div className="w-[20px] h-[20px] bg-arena-primary rounded-full flex items-center justify-center shadow-lg">
                <Edit3 className="w-3.5 h-3.5 text-[#0B0F14]" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-[10px] font-bold text-arena-text-muted uppercase tracking-wider">
              {t("editProfileSheet.fullName")}
            </Label>
            <Input
              className="border-arena-border bg-arena-surface-el/50 text-arena-text h-11 rounded-xl px-3.5"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <Label className="text-[10px] font-bold text-arena-text-muted uppercase tracking-wider">
              {t("editProfileSheet.email")}
            </Label>
            <div className="relative">
              <Input
                disabled
                className="border-arena-border bg-arena-surface-el/20 text-arena-text-sec/60 h-11 rounded-xl px-3.5 pr-24"
                value={form.email}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-arena-primary/10 border border-arena-primary/20 text-arena-primary px-2 py-1 rounded-lg text-[9px] uppercase tracking-wide font-extrabold">
                <CheckCircle2 className="w-3 h-3" />
                {t("editProfileSheet.verified")}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[10px] font-bold text-arena-text-muted uppercase tracking-wider">
              {t("editProfileSheet.phone")}
            </Label>
            <Input
              className="border-arena-border bg-arena-surface-el/50 text-arena-text h-11 rounded-xl px-3.5"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            />
          </div>
        </div>

        <div className="bg-arena-surface border border-arena-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-arena-primary/10 flex items-center justify-center shrink-0 border border-arena-primary/20">
            <ShieldCheck className="w-4 h-4 text-arena-primary" strokeWidth={2.2} />
          </div>
          <div>
            <span className="font-extrabold text-sm text-arena-text block">
              {t("editProfileSheet.verifiedAthlete")}
            </span>
            <span className="text-xs text-arena-text-muted block mt-0.5">
              {t("editProfileSheet.verifiedAthleteDesc")}
            </span>
          </div>
        </div>

        {saveStatus === "saved" && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-300">
            <CheckCircle2 size={16} />
            {t("feedback.updatedDescription")}
          </div>
        )}
        {saveStatus === "error" && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {t("feedback.saveError")}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="w-full bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/90 font-bold h-11 rounded-xl text-sm transition-all gap-1.5"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isPending ? t("actions.saving") : t("actions.save")}
        </Button>
      </div>
    </BottomSheet>
  );
}
