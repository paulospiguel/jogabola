"use client";

import { Bell, Check, Languages, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateUserSettings } from "@/actions/settings.actions";
import { locales } from "@/i18n/configs";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const LANGUAGES = {
  en: {
    icon: "🇬🇧",
    name: "locales.en",
    code: "EN",
  },
  pt: {
    icon: "🇵🇹",
    name: "locales.pt",
    code: "PT",
  },
  es: {
    icon: "🇪🇸",
    name: "locales.es",
    code: "ES",
  },
  fr: {
    icon: "🇫🇷",
    name: "locales.fr",
    code: "FR",
  },
} as const;

interface SettingsFormProps {
  initialSettings: {
    locale: string;
    notificationsEnabled: boolean;
  };
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const t = useTranslations("settingsPage");
  const tLoc = useTranslations("locales");
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdate = async (newSettings: Partial<typeof settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    startTransition(async () => {
      const result = await updateUserSettings(newSettings);
      if (result.success) {
        setMessage({ type: "success", text: t("messages.success") });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: t("messages.error") });
        setSettings(settings); // Rollback
      }
    });
  };

  return (
    <div className="jb-stack space-y-6">
      {/* Language Section */}
      <section className="jb-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-arena-border bg-arena-surface-el/30 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arena-primary/10 text-arena-primary">
            <Languages size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-arena-text">
              {t("sections.language.title")}
            </h2>
            <p className="text-xs text-arena-text-muted">
              {t("sections.language.description")}
            </p>
          </div>
        </div>

        <div className="p-4">
          <Select
            value={settings.locale}
            onValueChange={(val) => handleUpdate({ locale: val })}
            disabled={isPending}
          >
            <SelectTrigger className="h-12 w-full rounded-full border-arena-border bg-arena-surface-el/50 px-4 text-arena-text hover:border-arena-border/80 hover:bg-arena-surface-el">
              <SelectValue>
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {LANGUAGES[settings.locale as keyof typeof LANGUAGES]?.icon}
                  </span>
                  <span className="font-medium">
                    {tLoc(settings.locale as any)}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-arena-border bg-arena-surface">
              {locales.map((loc) => (
                <SelectItem
                  key={loc}
                  value={loc}
                  className="cursor-pointer text-arena-text-sec focus:bg-arena-surface-el focus:text-arena-text"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {LANGUAGES[loc as keyof typeof LANGUAGES].icon}
                    </span>
                    <span>
                      {tLoc(loc as any)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="jb-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-arena-border bg-arena-surface-el/30 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arena-info/10 text-arena-info">
            <Bell size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-arena-text">
              {t("sections.notifications.title")}
            </h2>
            <p className="text-xs text-arena-text-muted">
              {t("sections.notifications.description")}
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="group flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-arena-text transition-colors group-hover:text-arena-primary">
                {t("fields.pushNotifications")}
              </span>
              <p className="text-xs text-arena-text-muted">
                {t("fields.pushNotificationsHelp")}
              </p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={checked =>
                handleUpdate({ notificationsEnabled: checked })
              }
              disabled={isPending}
              aria-label={t("fields.pushNotifications")}
              className="data-[state=checked]:bg-arena-primary data-[state=unchecked]:bg-arena-border border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Status Message */}
      {message && (
        <div
          className={cn(
            "fixed bottom-24 left-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl border p-4 shadow-2xl md:left-auto md:w-80",
            message.type === "success"
              ? "border-arena-success/50 bg-arena-surface text-arena-success"
              : "border-arena-danger/50 bg-arena-surface text-arena-danger",
          )}
        >
          <div className="flex items-center gap-3">
            {isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Check size={18} />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
