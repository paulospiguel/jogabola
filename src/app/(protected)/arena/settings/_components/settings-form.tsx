"use client";

import { Bell, Check, Languages, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateUserSettings } from "@/actions/settings.actions";
import { locales } from "@/i18n/configs";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  initialSettings: {
    locale: string;
    notificationsEnabled: boolean;
  };
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const t = useTranslations("settingsPage");
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
        <div className="border-b border-arena-border bg-arena-surface-el/30 p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-arena-primary/10 flex items-center justify-center text-arena-primary">
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

        <div className="p-4 grid gap-3 sm:grid-cols-3">
          {locales.map(loc => (
            <button
              key={loc}
              onClick={() => handleUpdate({ locale: loc })}
              disabled={isPending}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200",
                settings.locale === loc
                  ? "bg-arena-primary/10 border-arena-primary/30 text-arena-primary"
                  : "bg-arena-surface-el/50 border-arena-border text-arena-text-sec hover:bg-arena-surface-el hover:border-arena-border/80",
              )}
            >
              <span className="font-medium uppercase">{loc}</span>
              {settings.locale === loc && <Check size={16} />}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications Section */}
      <section className="jb-card overflow-hidden">
        <div className="border-b border-arena-border bg-arena-surface-el/30 p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-arena-info/10 flex items-center justify-center text-arena-info">
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
          <div className="flex items-center justify-between group">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-arena-text group-hover:text-arena-primary transition-colors">
                {t("fields.pushNotifications")}
              </span>
              <p className="text-xs text-arena-text-muted">
                {t("fields.pushNotificationsHelp")}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.notificationsEnabled}
              onClick={() =>
                handleUpdate({
                  notificationsEnabled: !settings.notificationsEnabled,
                })
              }
              className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-primary focus-visible:ring-offset-2 focus-visible:ring-offset-arena-bg rounded-full"
            >
              <div
                className={cn(
                  "w-12 h-6 rounded-full transition-colors duration-200",
                  settings.notificationsEnabled
                    ? "bg-arena-primary"
                    : "bg-arena-border",
                )}
              />
              <div
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200",
                  settings.notificationsEnabled
                    ? "translate-x-6"
                    : "translate-x-0",
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Status Message */}
      {message && (
        <div
          className={cn(
            "fixed bottom-24 right-6 left-6 md:left-auto md:w-80 p-4 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-50",
            message.type === "success"
              ? "bg-arena-surface border-arena-success/50 text-arena-success"
              : "bg-arena-surface border-arena-danger/50 text-arena-danger",
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
