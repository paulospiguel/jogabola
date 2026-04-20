"use client";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Building2, Save, Mail, Globe, MapPin, Hash, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function GeneralSettingsForm() {
  const t = useTranslations("generalSettingsForm");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    const data = new FormData(e.currentTarget);
    // TODO: Replace with real API call — data.get("club-name"), etc.
    void data;
    await new Promise<void>((r) => setTimeout(r, 1200));
    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const inputClass = cn(
    "w-full rounded-2xl border border-white/12 bg-white/5",
    "px-4 py-3 text-white placeholder-white/30 backdrop-blur",
    "focus-visible:ring-[3px] focus-visible:ring-[#6fffe9]/40",
    "focus:border-[#24ffe6]/60 outline-none transition-all",
  );

  const labelClass = "text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2 block";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div>
          <label className={labelClass} htmlFor="club-name">
            <span className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-[#6fffe9]" /> {t("officialName")}
            </span>
          </label>
          <input
            id="club-name"
            name="club-name"
            className={inputClass}
            required
            maxLength={60}
          />
        </div>

        {/* NIF */}
        <div>
          <label className={labelClass} htmlFor="club-id">
            <span className="flex items-center gap-2">
              <Hash className="h-3.5 w-3.5 text-[#6fffe9]" /> {t("nif")}
            </span>
          </label>
          <input
            id="club-id"
            name="club-id"
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelClass} htmlFor="club-email">
            <span className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[#6fffe9]" /> {t("email")}
            </span>
          </label>
          <input
            id="club-email"
            name="club-email"
            type="email"
            className={inputClass}
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className={labelClass} htmlFor="club-location">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#6fffe9]" /> {t("location")}
            </span>
          </label>
          <input
            id="club-location"
            name="club-location"
            className={inputClass}
          />
        </div>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/3 p-5 backdrop-blur">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-white">
            <Globe className="h-4 w-4 text-[#6fffe9]" /> {t("publicListing")}
          </h4>
          <p className="mt-1 text-xs text-white/50 leading-relaxed md:max-w-[75%]">
            {t("publicListingDescription")}
          </p>
        </div>
        <Switch
          checked={isPublic}
          onCheckedChange={setIsPublic}
          className="shrink-0 data-[state=checked]:bg-[#24ffe6]"
        />
      </div>

      {/* Submit */}
      <div className="pt-4 flex items-center gap-4 border-t border-white/8">
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "group flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-[#24ffe6] px-6 py-3 font-semibold text-slate-900 transition-all duration-300",
            isSaving ? "opacity-80 cursor-not-allowed" : "hover:-translate-y-0.5 hover:bg-[#24ffe6]/90 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)]"
          )}
        >
          {isSaving ? (
            <span className="animate-pulse">{t("saving")}</span>
          ) : success ? (
            <>
              <Check className="h-4 w-4" /> {t("saved")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> {t("save")}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
