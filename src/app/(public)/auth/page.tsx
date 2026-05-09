"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { requestAuthSignInOTP } from "@/actions/auth-otp.actions";
import { DotGrid } from "@/components/arena/dot-grid";
import { GoogleIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { APP } from "@/constants/app";
import { useToast } from "@/hooks/use-toast-custom";
import { signIn, useSession } from "@/lib/auth-client";

type AuthStep = "email" | "code";

const EMAIL_ERROR_CODES = new Set([
  "RESEND_API_KEY_MISSING",
  "RESEND_API_KEY_INVALID",
  "RESEND_FROM_INVALID",
  "RESEND_DOMAIN_NOT_VERIFIED",
  "RESEND_DEV_DOMAIN_RESTRICTED",
  "EMAIL_SEND_FAILED",
]);

function defaultNameFromEmail(email: string) {
  const name = email
    .split("@")[0]
    ?.replace(/[._-]+/g, " ")
    .trim();
  return name || "Jogador";
}

function getSafeCallbackURL(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/arena";
  }
  return value;
}

function getAuthOtpErrorMessage(
  t: ReturnType<typeof useTranslations>,
  result: { error?: string; errorCode?: string },
  fallback: string,
) {
  if (result.errorCode && EMAIL_ERROR_CODES.has(result.errorCode)) {
    return t(`messages.email.${result.errorCode}`);
  }

  return result.error || fallback;
}

export default function LoginPage() {
  const t = useTranslations("authPage");
  const translation = useTranslations();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useSession();
  const { toast } = useToast();
  const callbackURL = getSafeCallbackURL(searchParams.get("callbackURL"));
  const isRegisterMode = searchParams.get("mode") === "register";

  const [step, setStep] = useState<AuthStep>("email");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | null>(null);
  const [collectedEmail, setCollectedEmail] = useState(
    searchParams.get("email") || "",
  );

  const emailSchema = z.object({
    email: z.string().email(t("validation.invalidEmail")),
  });
  const codeSchema = z.object({
    code: z
      .string()
      .min(6, t("validation.incompleteCode"))
      .max(8)
      .regex(/^\d+$/, t("validation.numbersOnly")),
  });

  type EmailInput = z.infer<typeof emailSchema>;
  type CodeInput = z.infer<typeof codeSchema>;

  const codeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!data?.user?.id) return;
    router.push(callbackURL);
  }, [callbackURL, data?.user?.id, router]);

  const emailForm = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: collectedEmail },
  });

  const codeForm = useForm<CodeInput>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  async function requestCode(values: EmailInput) {
    setLoading(true);
    try {
      const email = values.email.trim().toLowerCase();
      const result = await requestAuthSignInOTP(email);

      if (!result.success) {
        throw new Error(
          getAuthOtpErrorMessage(
            t,
            result,
            t("messages.loginErrorDescription"),
          ),
        );
      }

      setCollectedEmail(email);
      codeForm.reset({ code: "" });
      setStep("code");
      setTimeout(() => codeInputRef.current?.focus(), 100);
      toast.success(
        t("messages.codeSentTitle"),
        t("messages.codeSentDescription", { email }),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("messages.loginErrorDescription");
      toast.error(t("messages.loginErrorTitle"), message);
    } finally {
      setLoading(false);
    }
  }

  async function validateCode(values: CodeInput) {
    setLoading(true);
    try {
      const result = await signIn.emailOtp({
        email: collectedEmail,
        otp: values.code,
        name: defaultNameFromEmail(collectedEmail),
        callbackURL,
      });

      if (result.error) {
        throw new Error(
          result.error.message || t("messages.invalidCodeDescription"),
        );
      }

      toast.success(
        t("messages.loginSuccessTitle"),
        t("messages.loginSuccessDescription", {
          destination: callbackURL === "/arena" ? t("arena") : t("event"),
        }),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("messages.invalidCodeDescription");
      toast.error(t("messages.invalidCodeTitle"), message);
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setSocialLoading("google");
    try {
      const result = await signIn.social({ provider: "google", callbackURL });
      if (result.error)
        throw new Error(result.error.message || t("messages.socialError"));
      if (result.data?.url) window.location.href = result.data.url;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("messages.socialError");
      toast.error(t("messages.loginErrorTitle"), message);
      setSocialLoading(null);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-arena-bg font-body selection:bg-arena-primary/30 selection:text-arena-primary">
      {/* Interactive Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <DotGrid
          baseColor="#263244"
          activeColor="#7CFF4F"
          proximity={180}
          dotSize={2}
          gap={32}
        />
      </div>

      {/* Radial Overlays for depth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-arena-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-arena-info/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <Logo
            href="/"
            isBeta
            className="mb-2 text-arena-primary"
            size="medium"
          />
          <p className="text-sm font-medium tracking-wide text-arena-text-sec/80">
            {translation(APP.COMPANY.SLOGAN)}
          </p>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-[440px] overflow-hidden rounded-[24px] border border-arena-border bg-arena-surface/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Link
            aria-label={t("back")}
            className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-arena-bg-sec/50 text-arena-text-sec transition-all hover:bg-arena-bg-sec hover:text-arena-text border border-arena-border"
            href="/"
          >
            <X className="h-4.5 w-4.5" />
          </Link>

          <div className="px-8 pt-10 pb-12">
            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                  exit={{ opacity: 0, x: -20 }}
                  initial={{ opacity: 0, x: 20 }}
                  key="email-step"
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-arena-text">
                      {isRegisterMode ? t("registerTitle") : t("title")}
                    </h2>
                    <p className="text-sm text-arena-text-muted">
                      {isRegisterMode
                        ? t("registerSubtitle")
                        : t("loginSubtitle")}
                    </p>
                  </div>

                  <div>
                    <button
                      className="group relative flex h-14 w-full items-center justify-center rounded-2xl border border-arena-border bg-arena-bg-sec/50 transition-all hover:border-arena-primary/30 hover:bg-arena-surface-el active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading || socialLoading !== null}
                      onClick={handleGoogleLogin}
                      type="button"
                    >
                      {socialLoading === "google" ? (
                        <Loader2 className="h-5 w-5 animate-spin text-arena-text-muted" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <GoogleIcon className="h-6 w-6" />
                          <p className="text-sm font-bold tracking-wider uppercase">{t("googleLogin")}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-2xl bg-arena-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </div>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-arena-border"></div>
                    <span className="mx-4 flex-shrink text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
                      {t("orEmail")}
                    </span>
                    <div className="flex-grow border-t border-arena-border"></div>
                  </div>

                  <form
                    className="space-y-4"
                    onSubmit={emailForm.handleSubmit(requestCode)}
                  >
                    <div className="space-y-2">
                      <label
                        className="text-xs font-bold uppercase tracking-widest text-arena-text-sec ml-1"
                        htmlFor="email"
                      >
                        {t("emailLabel")}
                      </label>
                      <div className="relative group">
                        <input
                          {...emailForm.register("email")}
                          autoComplete="email"
                          className="h-[52px] w-full rounded-2xl border border-arena-border bg-arena-bg-sec/50 px-5 text-sm tracking-wide text-arena-text placeholder:text-arena-text-muted transition-all focus:border-arena-primary focus:bg-arena-bg-sec focus:ring-4 focus:ring-arena-primary/10 outline-none"
                          id="email"
                          placeholder={t("emailPlaceholder")}
                          type="email"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center">
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-arena-primary text-arena-bg shadow-[0_0_15px_rgba(124,255,79,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                            disabled={loading}
                            type="submit"
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      {emailForm.formState.errors.email && (
                        <p className="ml-1 text-xs font-medium text-arena-danger animate-in fade-in slide-in-from-top-1">
                          {emailForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                  exit={{ opacity: 0, x: -20 }}
                  initial={{ opacity: 0, x: 20 }}
                  key="code-step"
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-2">
                    <button
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-arena-primary hover:text-arena-primary/80 transition-colors"
                      onClick={() => setStep("email")}
                      type="button"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      {t("changeEmail")}
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight text-arena-text">
                      {t("verifyEmail")}
                    </h2>
                    <p className="text-sm text-arena-text-muted">
                      {t("codeSentTo")}{" "}
                      <span className="text-arena-text-sec font-semibold">
                        {collectedEmail}
                      </span>
                    </p>
                  </div>

                  <form
                    className="space-y-6"
                    onSubmit={codeForm.handleSubmit(validateCode)}
                  >
                    <div className="space-y-3">
                      <div className="relative group">
                        <input
                          {...codeForm.register("code")}
                          autoComplete="one-time-code"
                          className="h-[64px] w-full rounded-2xl border border-arena-border bg-arena-bg-sec/50 px-5 text-center font-mono text-3xl tracking-[0.4em] text-arena-primary placeholder:text-arena-text-muted/30 transition-all focus:border-arena-primary focus:bg-arena-bg-sec focus:ring-4 focus:ring-arena-primary/10 outline-none"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="000000"
                          ref={el => {
                            codeForm.register("code").ref(el);
                            codeInputRef.current = el;
                          }}
                          type="text"
                        />
                      </div>
                      {codeForm.formState.errors.code ? (
                        <p className="text-center text-xs font-medium text-arena-danger animate-in fade-in slide-in-from-top-1">
                          {codeForm.formState.errors.code.message}
                        </p>
                      ) : (
                        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-arena-text-muted">
                          {t("validation.numbersOnly")}
                        </p>
                      )}
                    </div>

                    <button
                      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-arena-primary text-sm font-bold uppercase tracking-widest text-arena-bg shadow-[0_0_20px_rgba(124,255,79,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(124,255,79,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                      disabled={loading}
                      type="submit"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        t("validateCode")
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        className="text-xs font-bold uppercase tracking-widest text-arena-text-muted hover:text-arena-text transition-colors underline underline-offset-4"
                        disabled={loading}
                        onClick={() => requestCode({ email: collectedEmail })}
                        type="button"
                      >
                        {t("messages.codeSentTitle")}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-arena-bg-sec/30 border-t border-arena-border px-8 py-6 text-center">
            <p className="text-[10px] font-medium tracking-wider text-arena-text-muted uppercase leading-relaxed">
              {t.rich("termsAgreement", {
                terms: chunks => (
                  <Link
                    className="text-arena-text-sec hover:text-arena-primary transition-colors underline underline-offset-2"
                    href="/terms"
                  >
                    {chunks}
                  </Link>
                ),
                privacy: chunks => (
                  <Link
                    className="text-arena-text-sec hover:text-arena-primary transition-colors underline underline-offset-2"
                    href="/privacy"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
        </motion.div>

        <motion.p
          animate={{ opacity: 1 }}
          className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-arena-text-muted/40"
          initial={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          v{APP.VERSION} • {t("builtForChampions")}
        </motion.p>
      </div>
    </div>
  );
}
