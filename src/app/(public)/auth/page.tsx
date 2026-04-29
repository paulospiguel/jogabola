"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Mail, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppleIcon, Google, GoogleIcon } from "@/components/icons";
import { useToast } from "@/hooks/use-toast-custom";
import { emailOtp, signIn, useSession } from "@/lib/auth-client";

function SocialLoginIcon() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
      <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 p-1 ring-1 ring-white/20">
        <Mail className="h-3 w-3 p-0.5" />
      </div>
      <Google />
    </div>
  );
}

type LoginMethod = {
  id: "social";
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
};

const loginMethods: LoginMethod[] = [
  {
    id: "social",
    label: "Social Login",
    icon: <SocialLoginIcon />,
  },
] as const;

const emailSchema = z.object({ email: z.string().email("Email inválido") });
const codeSchema = z.object({
  code: z
    .string()
    .min(6, "Código incompleto")
    .max(8)
    .regex(/^\d+$/, "Usa apenas números"),
});

type EmailInput = z.infer<typeof emailSchema>;
type CodeInput = z.infer<typeof codeSchema>;
type AuthStep = "email" | "code";

function defaultNameFromEmail(email: string) {
  const name = email
    .split("@")[0]
    ?.replace(/[._-]+/g, " ")
    .trim();
  return name || "Jogador";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useSession();
  const { toast } = useToast();

  const [selectedMethod, setSelectedMethod] = useState<"social">("social");
  const [step, setStep] = useState<AuthStep>("email");
  const [loading, setLoading] = useState(false);
  const [collectedEmail, setCollectedEmail] = useState(
    searchParams.get("email") || "",
  );

  const codeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!data?.user?.id) return;
    router.push("/arena");
  }, [data?.user?.id, router]);

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
      const result = await emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (result.error) {
        throw new Error(result.error.message || "Erro ao enviar código.");
      }

      setCollectedEmail(email);
      codeForm.reset({ code: "" });
      setStep("code");
      setTimeout(() => codeInputRef.current?.focus(), 100);
      toast.success("Código enviado", `Enviámos um código para ${email}.`);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível enviar o código.";
      toast.error("Erro no login", message);
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
        callbackURL: "/arena",
      });

      if (result.error) {
        throw new Error(result.error.message || "Código inválido.");
      }

      toast.success("Login validado", "A entrar na Arena.");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Confirma o código e tenta outra vez.";
      toast.error("Código inválido", message);
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/arena",
      });
      if (result.error)
        throw new Error(result.error.message || "Erro ao entrar com Google.");
      if (result.data?.url) window.location.href = result.data.url;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível entrar.";
      toast.error("Erro no login", message);
      setLoading(false);
    }
  }

  async function handleAppleLogin() {
    setLoading(true);
    try {
      const result = await signIn.social({
        provider: "apple",
        callbackURL: "/arena",
      });
      if (result.error)
        throw new Error(result.error.message || "Erro ao entrar com Apple.");
      if (result.data?.url) window.location.href = result.data.url;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível entrar.";
      toast.error("Erro no login", message);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A16]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[24%] left-[9%] h-72 w-72 rounded-full bg-[#5D17A9]/25 blur-[86px]" />
        <div className="absolute right-[6%] bottom-[10%] h-96 w-96 rounded-full bg-[#0B3B78]/18 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex w-full max-w-[672px] flex-col overflow-hidden rounded-2xl border border-[#263244] bg-[#101724]/95 shadow-2xl md:min-h-[460px] md:flex-row"
          initial={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.22 }}
        >
          <Link
            aria-label="Fechar"
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
            href="/"
          >
            <X className="h-4 w-4" />
          </Link>

          <aside className="flex w-full shrink-0 flex-col gap-1 border-[#263244] border-b p-4 md:w-56 md:border-r md:border-b-0">
            <h1 className="mb-3 px-2 text-xl font-semibold tracking-[0.01em] text-white">
              Entrar
            </h1>
            {loginMethods.map(method => (
              <button
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  selectedMethod === method.id
                    ? "bg-white/18 text-white"
                    : "text-white/60 hover:bg-white/8 hover:text-white"
                }`}
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id);
                  if (method.id === "social") setStep("email");
                }}
                type="button"
              >
                <span className="shrink-0">{method.icon}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium tracking-[0.06em]">
                    {method.label}
                  </span>
                  {method.sublabel ? (
                    <span className="block text-xs leading-tight tracking-[0.06em] text-white/35">
                      {method.sublabel}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </aside>

          <main className="flex flex-1 flex-col justify-between px-6 py-8 md:px-8">
            <div className="flex flex-1 flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="mx-auto w-full max-w-[382px] space-y-4"
                  exit={{ opacity: 0, x: -16 }}
                  initial={{ opacity: 0, x: 16 }}
                  key="social"
                  transition={{ duration: 0.18 }}
                >
                  <button
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium tracking-[0.08em] text-white transition-all hover:bg-white/18 disabled:opacity-50"
                    disabled={loading}
                    onClick={handleGoogleLogin}
                    type="button"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon className="h-5 w-5" />
                    )}
                    Continue with Google
                  </button>

                  <button
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium tracking-[0.08em] text-white transition-all hover:bg-white/18 disabled:opacity-50"
                    disabled={loading}
                    onClick={handleAppleLogin}
                    type="button"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <AppleIcon className="h-5 w-5" />
                    )}
                    Continue with Apple
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/15" />
                    <span className="text-xs tracking-[0.08em] text-white/35">
                      or
                    </span>
                    <div className="h-px flex-1 bg-white/15" />
                  </div>

                  <AnimatePresence mode="wait">
                    {step === "email" ? (
                      <motion.form
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        initial={{ opacity: 0, y: 8 }}
                        key="email-step"
                        onSubmit={emailForm.handleSubmit(requestCode)}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="relative">
                          <input
                            {...emailForm.register("email")}
                            autoComplete="email"
                            className="h-[47px] w-full rounded-xl border border-white/20 bg-white/10 px-4 pr-12 text-sm tracking-[0.04em] text-white placeholder-white/40 outline-none transition-all focus:border-white/40 focus:bg-white/13"
                            placeholder="pp@pp.com"
                            type="email"
                          />
                          <button
                            aria-label="Enviar código"
                            className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30"
                            disabled={loading}
                            type="submit"
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {emailForm.formState.errors.email ? (
                          <p className="mt-1 text-xs text-red-400">
                            {emailForm.formState.errors.email.message}
                          </p>
                        ) : null}
                      </motion.form>
                    ) : (
                      <motion.form
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                        exit={{ opacity: 0, y: -8 }}
                        initial={{ opacity: 0, y: 8 }}
                        key="code-step"
                        onSubmit={codeForm.handleSubmit(validateCode)}
                        transition={{ duration: 0.18 }}
                      >
                        <button
                          className="flex items-center gap-2 text-xs tracking-[0.06em] text-white/45 hover:text-white/70"
                          onClick={() => setStep("email")}
                          type="button"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          {collectedEmail}
                        </button>
                        <div className="relative">
                          <input
                            {...codeForm.register("code")}
                            autoComplete="one-time-code"
                            className="h-[47px] w-full rounded-xl border border-white/20 bg-white/10 px-4 pr-12 text-center font-mono text-xl tracking-[0.5em] text-white outline-none transition-all placeholder:text-white/25 focus:border-white/40 focus:bg-white/13"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            ref={el => {
                              codeForm.register("code").ref(el);
                              codeInputRef.current = el;
                            }}
                            type="text"
                          />
                          <button
                            aria-label="Validar código"
                            className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30"
                            disabled={loading}
                            type="submit"
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {codeForm.formState.errors.code ? (
                          <p className="text-xs text-red-400">
                            {codeForm.formState.errors.code.message}
                          </p>
                        ) : (
                          <p className="text-center text-xs tracking-[0.05em] text-white/35">
                            Código enviado. Expira em 5 minutos.
                          </p>
                        )}
                        <button
                          className="mx-auto block text-xs text-white/45 underline underline-offset-4 hover:text-white/70"
                          disabled={loading}
                          onClick={() => requestCode({ email: collectedEmail })}
                          type="button"
                        >
                          Reenviar código
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="mt-6 text-center text-xs tracking-[0.08em] text-white/30">
              Ao entrar, aceitas os{" "}
              <Link
                className="text-white/50 underline underline-offset-2 hover:text-white/80"
                href="#"
                aria-disabled="true"
              >
                Termos de Serviço
              </Link>{" "}
              &{" "}
              <Link
                className="text-white/50 underline underline-offset-2 hover:text-white/80"
                href="#"
                aria-disabled="true"
              >
                Política de Privacidade
              </Link>
            </p>
          </main>
        </motion.div>
      </div>
    </div>
  );
}
