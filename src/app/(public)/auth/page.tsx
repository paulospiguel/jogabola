"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { saveProfileData } from "@/actions/profile";
import { linkWallet } from "@/actions/wallet";
import { AppleIcon, Google, GoogleIcon } from "@/components/icons";
import { useProfileSync } from "@/hooks/use-profile-sync";
import { useToast } from "@/hooks/use-toast-custom";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import { loginSchema, registerSchema } from "@/schemas/auth";

// ─── Ícone Solana (SVG inline) ────────────────────────────────────────────────

function SolanaLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M21.4 93.6a3.5 3.5 0 0 1 2.5-1h98.6a1.8 1.8 0 0 1 1.2 3l-20.7 20.7a3.5 3.5 0 0 1-2.5 1H4a1.8 1.8 0 0 1-1.2-3L21.4 93.6Z"
        fill="url(#auth-sol-a)"
      />
      <path
        d="M21.4 12.7a3.6 3.6 0 0 1 2.5-1h98.6a1.8 1.8 0 0 1 1.2 3L102.9 35.4a3.5 3.5 0 0 1-2.5 1H1.8a1.8 1.8 0 0 1-1.2-3L21.4 12.7Z"
        fill="url(#auth-sol-b)"
      />
      <path
        d="M102.9 52.8a3.5 3.5 0 0 0-2.5-1H1.8a1.8 1.8 0 0 0-1.2 3L21.4 75.5a3.5 3.5 0 0 0 2.5 1h98.6a1.8 1.8 0 0 0 1.2-3L102.9 52.8Z"
        fill="url(#auth-sol-c)"
      />
      <defs>
        <linearGradient
          id="auth-sol-a"
          x1="6"
          y1="117"
          x2="121"
          y2="117"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
        <linearGradient
          id="auth-sol-b"
          x1="6"
          y1="24"
          x2="121"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
        <linearGradient
          id="auth-sol-c"
          x1="6"
          y1="64"
          x2="121"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SolanaMethodIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9945FF]/20">
      <SolanaLogo className="h-5 w-5" />
    </div>
  );
}

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

// ─── Config dos métodos ────────────────────────────────────────────────────────

type LoginMethod = {
  id: string;
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
  {
    id: "solana",
    label: "Wallet Solana",
    sublabel: "Phantom, Solflare...",
    icon: <SolanaMethodIcon />,
  },
];

// ─── Schemas ───────────────────────────────────────────────────────────────────

const emailSchema = z.object({ email: z.string().email() });
type EmailInput = z.infer<typeof emailSchema>;
type AuthStep = "email" | "password" | "register";

function shortAddr(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useSession();
  const { toast } = useToast();
  const t = useTranslations("signIn.page");

  // Wallet adapter
  const {
    publicKey,
    connected,
    disconnect,
    wallet: adapterWallet,
  } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [selectedMethod, setSelectedMethod] = useState("social");
  const [step, setStep] = useState<AuthStep>("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Wallet pendente: armazena endereço + provider para ligar após auth
  // Usar ref para não ser dep do useEffect de autenticação
  const pendingWalletRef = useRef<{
    address: string;
    provider?: string;
  } | null>(null);

  const [collectedEmail, setCollectedEmail] = useState(
    searchParams.get("email") || "",
  );
  const [collectedName, _setCollectedName] = useState(
    searchParams.get("name") || "",
  );

  // Capturar endereço e provider quando a wallet conectar
  useEffect(() => {
    if (connected && publicKey) {
      pendingWalletRef.current = {
        address: publicKey.toBase58(),
        provider: adapterWallet?.adapter?.name ?? undefined,
      };
    } else {
      pendingWalletRef.current = null;
    }
  }, [connected, publicKey, adapterWallet?.adapter?.name]);

  // Sync profile when user logs in
  // biome-ignore lint/suspicious/noExplicitAny: saveProfileData accepts flexible partial data
  useProfileSync(data?.user?.id, (uid, d) => saveProfileData(uid, d as any));

  // Após autenticação: ligar wallet pendente (se existir) e redirecionar
  useEffect(() => {
    if (!data?.user?.id) return;

    const pending = pendingWalletRef.current;

    if (pending) {
      linkWallet(data.user.id, pending.address, pending.provider)
        .then(result => {
          if (result.success) {
            toast.success(
              "Wallet ligada!",
              `${shortAddr(pending.address)} foi associada à tua conta.`,
            );
          }
        })
        .finally(() => router.push("/arena"));
    } else {
      router.push("/arena");
    }
  }, [data?.user?.id, router, toast]);

  // ── Forms ───────────────────────────────────────────────────────────────────

  const emailForm = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: collectedEmail },
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: collectedEmail, password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: collectedName,
      email: collectedEmail,
      password: "",
      confirmPassword: "",
    },
  });

  const passwordRef = useRef<HTMLInputElement>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleEmailSubmit(values: EmailInput) {
    setCollectedEmail(values.email);
    loginForm.setValue("email", values.email);
    registerForm.setValue("email", values.email);
    setStep("password");
    setTimeout(() => passwordRef.current?.focus(), 100);
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/arena",
      });
      if (result.error)
        throw new Error(result.error.message || t("errors.googleAuthFailed"));
      if (result.data?.url) {
        window.location.href = result.data.url;
        return;
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t("errors.loginFailed");
      toast.error(t("errors.loginError"), errorMessage);
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
        throw new Error(result.error.message || t("errors.appleAuthFailed"));
      if (result.data?.url) {
        window.location.href = result.data.url;
        return;
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t("errors.loginFailed");
      toast.error(t("errors.loginError"), errorMessage);
      setLoading(false);
    }
  }

  async function handleLoginSubmit(values: {
    email: string;
    password: string;
  }) {
    setLoading(true);
    try {
      const result = await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/arena",
      });
      if (result.error)
        throw new Error(result.error.message || t("errors.invalidCredentials"));
      toast.success(t("success.login"), t("success.loginMessage"));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("errors.invalidCredentialsDetails");
      toast.error(t("errors.loginError"), errorMessage);
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    setLoading(true);
    try {
      const result = await signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: "/arena",
      });
      if (result.error)
        throw new Error(result.error.message || t("errors.registerFailed"));
      toast.success(t("success.register"), t("success.registerMessage"));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t("errors.registerFailedDetails");
      toast.error(t("errors.registerError"), errorMessage);
      setLoading(false);
    }
  }

  function handleCopyAddress(addr: string) {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function switchToSocial() {
    setSelectedMethod("social");
    setStep("email");
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const walletAddress = publicKey?.toBase58();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0d1a]">
      {/* Bokeh background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-48 w-48 rounded-full bg-pink-500/10 blur-3xl" />
        {/* Brilho Solana visível quando tab solana está ativo */}
        <AnimatePresence>
          {selectedMethod === "solana" && (
            <motion.div
              key="sol-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9945FF]/10 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#14F195]/8 blur-3xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/90 shadow-2xl backdrop-blur-md md:flex-row"
          style={{ minHeight: "460px" }}
        >
          {/* Close button */}
          <Link
            href="/"
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </Link>

          {/* Left panel — method list */}
          <div className="flex w-full shrink-0 flex-col gap-1 border-b border-white/10 p-4 md:w-56 md:border-b-0 md:border-r">
            <h2 className="mb-3 px-2 text-lg font-semibold text-white">
              Entrar
            </h2>
            {loginMethods.map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  setSelectedMethod(method.id);
                  if (method.id === "social") setStep("email");
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  selectedMethod === method.id
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <div className="shrink-0">{method.icon}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {method.label}
                  </div>
                  {method.sublabel && (
                    <div className="text-xs text-white/40">
                      {method.sublabel}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Right panel */}
          <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
            <div className="flex flex-1 flex-col justify-center">
              <AnimatePresence mode="wait">
                {/* ── Social / Email panel ────────────────────────────── */}
                {selectedMethod === "social" && (
                  <motion.div
                    key="social"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Google */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/20 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <GoogleIcon className="h-5 w-5" />
                      )}
                      Continue with Google
                    </button>

                    {/* Apple */}
                    <button
                      type="button"
                      onClick={handleAppleLogin}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/20 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <AppleIcon className="h-5 w-5" />
                      )}
                      Continue with Apple
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/15" />
                      <span className="text-xs text-white/40">or</span>
                      <div className="h-px flex-1 bg-white/15" />
                    </div>

                    {/* Email steps */}
                    <AnimatePresence mode="wait">
                      {step === "email" && (
                        <motion.form
                          key="email-step"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                        >
                          <div className="relative">
                            <input
                              {...emailForm.register("email")}
                              type="email"
                              placeholder="Email address"
                              autoComplete="email"
                              className="w-full rounded-xl border border-white/20 bg-white/8 px-4 py-3 pr-12 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-white/40 focus:bg-white/12"
                            />
                            <button
                              type="submit"
                              className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30"
                              aria-label="Continuar"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                          {emailForm.formState.errors.email && (
                            <p className="mt-1 text-xs text-red-400">
                              {emailForm.formState.errors.email.message}
                            </p>
                          )}
                        </motion.form>
                      )}

                      {step === "password" && (
                        <motion.form
                          key="password-step"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                          className="space-y-3"
                        >
                          <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70"
                          >
                            <span className="truncate">{collectedEmail}</span>
                            <span className="shrink-0 text-white/30">
                              · alterar
                            </span>
                          </button>
                          <div className="relative">
                            <input
                              {...loginForm.register("password")}
                              ref={el => {
                                loginForm.register("password").ref(el);
                                (
                                  passwordRef as React.MutableRefObject<HTMLInputElement | null>
                                ).current = el;
                              }}
                              type={showPassword ? "text" : "password"}
                              placeholder="Palavra-passe"
                              autoComplete="current-password"
                              className="w-full rounded-xl border border-white/20 bg-white/8 px-4 py-3 pr-12 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-white/40 focus:bg-white/12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {loginForm.formState.errors.password && (
                            <p className="text-xs text-red-400">
                              {String(
                                loginForm.formState.errors.password.message,
                              )}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <Link
                              href="/forgot-password"
                              className="text-xs text-white/40 hover:text-white/70"
                            >
                              {t("form.forgotPassword")}
                            </Link>
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 py-3 text-sm font-medium text-white transition-all hover:bg-white/25 disabled:opacity-50"
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            {loading
                              ? t("form.buttons.logging")
                              : t("form.buttons.login")}
                          </button>
                          <p className="text-center text-xs text-white/40">
                            Não tens conta?{" "}
                            <button
                              type="button"
                              onClick={() => setStep("register")}
                              className="text-white/70 underline underline-offset-2 hover:text-white"
                            >
                              Criar conta
                            </button>
                          </p>
                        </motion.form>
                      )}

                      {step === "register" && (
                        <motion.form
                          key="register-step"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={registerForm.handleSubmit(
                            handleRegisterSubmit,
                          )}
                          className="space-y-3"
                        >
                          <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70"
                          >
                            <span className="truncate">{collectedEmail}</span>
                            <span className="shrink-0 text-white/30">
                              · alterar
                            </span>
                          </button>
                          <input
                            {...registerForm.register("name")}
                            type="text"
                            placeholder="O teu nome"
                            autoComplete="name"
                            className="w-full rounded-xl border border-white/20 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-white/40 focus:bg-white/12"
                          />
                          {registerForm.formState.errors.name && (
                            <p className="text-xs text-red-400">
                              {String(
                                registerForm.formState.errors.name.message,
                              )}
                            </p>
                          )}
                          <div className="relative">
                            <input
                              {...registerForm.register("password")}
                              type={showPassword ? "text" : "password"}
                              placeholder="Palavra-passe"
                              autoComplete="new-password"
                              className="w-full rounded-xl border border-white/20 bg-white/8 px-4 py-3 pr-12 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-white/40 focus:bg-white/12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <input
                            {...registerForm.register("confirmPassword")}
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirmar palavra-passe"
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-white/20 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-white/40 focus:bg-white/12"
                          />
                          {registerForm.formState.errors.confirmPassword && (
                            <p className="text-xs text-red-400">
                              {String(
                                registerForm.formState.errors.confirmPassword
                                  .message,
                              )}
                            </p>
                          )}
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 py-3 text-sm font-medium text-white transition-all hover:bg-white/25 disabled:opacity-50"
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            {loading
                              ? t("form.buttons.registering")
                              : t("form.buttons.register")}
                          </button>
                          <p className="text-center text-xs text-white/40">
                            Já tens conta?{" "}
                            <button
                              type="button"
                              onClick={() => setStep("password")}
                              className="text-white/70 underline underline-offset-2 hover:text-white"
                            >
                              Entrar
                            </button>
                          </p>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* ── Painel Solana Wallet ─────────────────────────────── */}
                {selectedMethod === "solana" && (
                  <motion.div
                    key="solana"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9945FF]/20">
                        <SolanaLogo className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">
                          Wallet Solana
                        </p>
                        <p className="text-xs text-white/40">
                          Recurso ligado à tua conta — não substitui o login
                        </p>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {/* Estado: sem wallet conectada */}
                      {!connected && (
                        <motion.div
                          key="not-connected"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="space-y-4"
                        >
                          {/* Explicação */}
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm leading-relaxed text-white/60">
                              Liga a tua wallet Solana à conta.{" "}
                              <span className="text-white/80">
                                Após conectar, autentica-te com email ou social
                                e a wallet é associada automaticamente.
                              </span>
                            </p>
                          </div>

                          {/* Botão conectar */}
                          <button
                            type="button"
                            onClick={() => openWalletModal(true)}
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#9945FF]/40 bg-[#9945FF]/10 px-4 py-3.5 text-sm font-medium text-white transition-all hover:border-[#9945FF]/60 hover:bg-[#9945FF]/20"
                          >
                            <SolanaLogo className="h-5 w-5" />
                            Conectar wallet
                          </button>

                          {/* Ou ir para social */}
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-xs text-white/30">ou</span>
                            <div className="h-px flex-1 bg-white/10" />
                          </div>
                          <button
                            type="button"
                            onClick={switchToSocial}
                            className="w-full text-center text-xs text-white/40 transition-colors hover:text-white/70"
                          >
                            Entrar com email ou social →
                          </button>
                        </motion.div>
                      )}

                      {/* Estado: wallet conectada */}
                      {connected && walletAddress && (
                        <motion.div
                          key="connected"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="space-y-4"
                        >
                          {/* Endereço conectado */}
                          <div className="rounded-xl border border-[#14F195]/25 bg-[#14F195]/5 p-4">
                            <div className="mb-1 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-[#14F195] animate-pulse" />
                              <span className="text-xs font-medium text-[#14F195]">
                                Wallet conectada
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="flex-1 truncate font-mono text-sm text-white/80">
                                {walletAddress}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyAddress(walletAddress)}
                                className="shrink-0 rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
                                aria-label="Copiar endereço"
                              >
                                {copied ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[#14F195]" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => disconnect()}
                              className="mt-2 text-xs text-white/25 transition-colors hover:text-white/50"
                            >
                              Trocar wallet
                            </button>
                          </div>

                          {/* Instrução */}
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-xs leading-relaxed text-white/55">
                              Wallet pronta para ser associada. Autentica-te
                              abaixo e a ligação é feita automaticamente.
                            </p>
                          </div>

                          {/* CTA — ir para social/email */}
                          <button
                            type="button"
                            onClick={switchToSocial}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/20"
                          >
                            Continuar com email ou social
                            <ArrowRight className="h-4 w-4" />
                          </button>

                          {/* Indicador visual de wallet pendente no painel social */}
                          <p className="text-center text-xs text-white/30">
                            {adapterWallet?.adapter?.name && (
                              <span className="inline-flex items-center gap-1">
                                <SolanaLogo className="h-3 w-3" />
                                {adapterWallet.adapter.name} ·{" "}
                              </span>
                            )}
                            {shortAddr(walletAddress)}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-white/30">
              Ao entrar, aceitas os{" "}
              <Link
                href="/terms"
                className="text-white/50 underline underline-offset-2 hover:text-white/80"
              >
                Termos de Serviço
              </Link>{" "}
              &{" "}
              <Link
                href="/privacy"
                className="text-white/50 underline underline-offset-2 hover:text-white/80"
              >
                Política de Privacidade
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
