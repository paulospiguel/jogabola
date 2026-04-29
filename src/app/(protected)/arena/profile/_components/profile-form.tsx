"use client";

import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateUserProfileAction } from "@/actions/profile.actions";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/types/profile";

type ProfileFormProps = {
  profile: UserProfile;
};

type FormState = {
  name: string;
  image: string;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslations("profilePage");
  const [form, setForm] = useState<FormState>({
    name: profile.name,
    image: profile.image ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof FormState, value: string) {
    setForm(current => ({ ...current, [field]: value }));
    setFieldErrors(current => ({ ...current, [field]: [] }));
    setStatus("idle");
    setErrorCode(null);
  }

  function submit() {
    startTransition(async () => {
      const result = await updateUserProfileAction(form);

      if (!result.success) {
        setStatus("error");
        setErrorCode(result.error.code);
        setFieldErrors(result.error.fieldErrors ?? {});
        return;
      }

      setStatus("saved");
      setFieldErrors({});
      setErrorCode(null);
      setForm({
        name: result.data.name,
        image: result.data.image ?? "",
      });
    });
  }

  return (
    <section className="jb-card overflow-hidden">
      <div className="border-arena-border border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <JbAvatar
            id={profile.id}
            name={form.name || profile.email}
            size={48}
          />
          <div>
            <h2 className="text-base font-bold text-arena-text">
              {t("form.title")}
            </h2>
            <p className="text-sm text-arena-text-sec">
              {t("form.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4">
        <div className="space-y-2">
          <Label className="text-arena-text-sec" htmlFor="profile-name">
            {t("fields.name")}
          </Label>
          <Input
            className="border-arena-border bg-arena-surface text-arena-text"
            id="profile-name"
            onChange={event => updateField("name", event.target.value)}
            value={form.name}
          />
          {fieldErrors.name?.map(error => (
            <p className="text-xs text-red-400" key={error}>
              {t(`errors.${error}`)}
            </p>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="text-arena-text-sec" htmlFor="profile-image">
            {t("fields.image")}
          </Label>
          <Input
            className="border-arena-border bg-arena-surface text-arena-text"
            id="profile-image"
            onChange={event => updateField("image", event.target.value)}
            placeholder="https://"
            value={form.image}
          />
          {fieldErrors.image?.map(error => (
            <p className="text-xs text-red-400" key={error}>
              {t(`errors.${error}`)}
            </p>
          ))}
        </div>

        <div className="rounded-lg border border-arena-border bg-arena-surface/70 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-arena-text-muted">
            {t("fields.email")}
          </div>
          <div className="mt-1 text-sm font-semibold text-arena-text">
            {profile.email}
          </div>
          <div className="mt-1 text-xs text-arena-text-muted">
            {t("fields.emailReadOnly")}
          </div>
        </div>

        {status === "saved" && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-300">
            <CheckCircle2 size={16} />
            {t("feedback.updatedDescription")}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {errorCode ? t(`errors.${errorCode}`) : t("feedback.saveError")}
          </div>
        )}

        <Button
          className="w-full bg-arena-primary font-bold text-[#0B0F14] hover:bg-arena-primary/90"
          disabled={isPending}
          onClick={submit}
          type="button"
        >
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {isPending ? t("actions.saving") : t("actions.save")}
        </Button>
      </div>
    </section>
  );
}
