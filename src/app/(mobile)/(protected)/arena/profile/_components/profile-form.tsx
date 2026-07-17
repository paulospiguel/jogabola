"use client";

import {
  AlertCircle,
  CheckCircle2,
  Fingerprint,
  Loader2,
  Save,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateUserProfile } from "@/actions/profile.actions";
import { JbAvatar } from "@/components/arena/avatar";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passkey } from "@/lib/auth-client";
import type { UserProfile } from "@/types/profile";

type ProfileFormProps = {
  profile: UserProfile;
};

type FormState = {
  name: string;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslations("profilePage");
  const [form, setForm] = useState<FormState>({
    name: profile.name,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [passkeyStatus, setPasskeyStatus] = useState<
    "idle" | "adding" | "added" | "error"
  >("idle");
  const [passkeyErrorMsg, setPasskeyErrorMsg] = useState<string | null>(null);

  async function handleAddPasskey() {
    setPasskeyStatus("adding");
    setPasskeyErrorMsg(null);
    try {
      const result = await passkey.addPasskey();
      if (result?.error) throw new Error(result.error.message);
      setPasskeyStatus("added");
    } catch (err: unknown) {
      console.error("Passkey error:", err);
      setPasskeyErrorMsg(
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Erro desconhecido",
      );
      setPasskeyStatus("error");
    }
  }

  function updateField(field: keyof FormState, value: string) {
    setForm(current => ({ ...current, [field]: value }));
    setFieldErrors(current => ({ ...current, [field]: [] }));
    setStatus("idle");
    setErrorCode(null);
  }

  function submit() {
    startTransition(async () => {
      const result = await updateUserProfile(form);

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
      });
    });
  }

  return (
    <div className="space-y-6">
      <section className="jb-card overflow-hidden">
        <div className="border-arena-border border-b px-4 py-4">
          <div className="flex items-center gap-3">
            <JbAvatar
              id={profile.id}
              name={form.name || profile.email}
              image={profile.image}
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

          <div className="rounded-lg border border-arena-border bg-arena-surface/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-arena-text-muted">
                {t("fields.email")}
              </div>
              <VerifiedBadge verified={profile.emailVerified} />
            </div>
            <div className="mt-1 text-sm font-semibold text-arena-text">
              {profile.email}
            </div>
            <div className="mt-1 text-xs text-arena-text-muted">
              {t("fields.emailReadOnly")}
            </div>
          </div>

          {status === "saved" && (
            <div className="flex items-center gap-2 rounded-lg border border-arena-success/40 bg-arena-success/20 px-3 py-2 text-sm text-arena-success">
              <CheckCircle2 size={16} />
              {t("feedback.updatedDescription")}
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 rounded-lg border border-arena-danger/40 bg-arena-danger/20 px-3 py-2 text-sm text-arena-danger">
              <AlertCircle className="shrink-0" size={16} />
              {errorCode ? t(`errors.${errorCode}`) : t("feedback.saveError")}
            </div>
          )}

          <Button
            className="press w-full rounded-xl bg-arena-primary font-bold text-[#0B0F14] hover:bg-arena-primary/90"
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

      <section className="jb-card overflow-hidden">
        <div className="border-arena-border border-b px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-arena-primary/10 text-arena-primary">
              <Fingerprint className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-arena-text">
                {t("security.title")}
              </h2>
              <p className="text-sm text-arena-text-sec">
                {t("security.passkeysDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-4">
          {passkeyStatus === "added" && (
            <div className="flex items-center gap-2 rounded-lg border border-arena-success/40 bg-arena-success/20 px-3 py-2 text-sm text-arena-success">
              <CheckCircle2 size={16} />
              {t("actions.passkeyAdded")}
            </div>
          )}

          {passkeyStatus === "error" && (
            <div className="flex flex-col gap-1 rounded-lg border border-arena-danger/40 bg-arena-danger/20 px-3 py-2 text-sm text-arena-danger">
              <div className="flex items-center gap-2">
                <AlertCircle className="shrink-0" size={16} />
                <span>{t("actions.passkeyError")}</span>
              </div>
              {passkeyErrorMsg && (
                <div className="ml-6 text-xs text-arena-danger/80 break-words font-mono">
                  {passkeyErrorMsg}
                </div>
              )}
            </div>
          )}

          <Button
            className="press w-full rounded-xl border-arena-border bg-arena-surface font-bold text-arena-text-sec hover:bg-arena-surface-el hover:text-arena-text"
            disabled={passkeyStatus === "adding"}
            onClick={handleAddPasskey}
            type="button"
            variant="outline"
          >
            {passkeyStatus === "adding" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Fingerprint className="mr-2 size-4" />
            )}
            {t("actions.addPasskey")}
          </Button>
        </div>
      </section>
    </div>
  );
}
