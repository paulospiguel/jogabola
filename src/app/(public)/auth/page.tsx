"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Wallet, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { saveProfileData } from "@/actions/profile";
import { AppleIcon, Google, GoogleIcon } from "@/components/icons";
import { useProfileSync } from "@/hooks/use-profile-sync";
import { useToast } from "@/hooks/use-toast-custom";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import { loginSchema, registerSchema } from "@/schemas/auth";

function SolanaIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
      <Wallet className="h-5 w-5 text-white" />
    </div>
  );
}

function SocialLoginIcon() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
      <div className="absolute p-1 -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
        <Mail className="h-3 w-3 p-0.5" />
      </div>
      <Google />
    </div>
  );
}

// --- Login methods config ---

type LoginMethod = {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
};

const loginMethods: LoginMethod[] = [
  {
    id: "social",
    label: "Social Login",
    icon: <SocialLoginIcon />,
  },
  {
    id: "solana",
    label: "Conectar carteira Solana",
    icon: <SolanaIcon />,
    comingSoon: true,
  },
];

// --- Email step schemas ---

const emailSchema = z.object({ email: z.string().email() });
type EmailInput = z.infer<typeof emailSchema>;

type AuthStep = "email" | "password" | "register";

// --- Main page ---

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useSession();
  const { toast } = useToast();
  const t = useTranslations("signIn.page");

  const [selectedMethod, setSelectedMethod] = useState("social");
  const [step, setStep] = useState<AuthStep>("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // email collected in step 1
  const [collectedEmail, setCollectedEmail] = useState(
    searchParams.get("email") || "",
  );
  const [collectedName, _setCollectedName] = useState(
    searchParams.get("name") || "",
  );

  // Sync profile when user logs in
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useProfileSync(data?.user?.id, (uid, d) => saveProfileData(uid, d as any));

  useEffect(() => {
    if (data?.user?.id) {
      router.push("/arena");
    }
  }, [data?.user?.id, router]);

  // Email form (step 1)
  const emailForm = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: collectedEmail },
  });

  // Login form (step 2 — existing user)
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: collectedEmail, password: "" },
  });

  // Register form (step 2 — new user)
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

  function handleMethodSelect(method: LoginMethod) {
    if (method.comingSoon) {
      toast.info?.("Em breve", `${method.label} estará disponível em breve.`);
      return;
    }
    setSelectedMethod(method.id);
    setStep("email");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0d1a]">
      {/* Bokeh background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-48 w-48 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      {/* Modal container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative flex w-full max-w-2xl flex-col md:flex-row overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/90 shadow-2xl backdrop-blur-md"
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
          <div className="flex w-full md:w-56 shrink-0 flex-col gap-1 border-b md:border-b-0 md:border-r border-white/10 p-4">
            <h2 className="mb-3 px-2 text-lg font-semibold text-white">
              Sign in
            </h2>
            {loginMethods.map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() => handleMethodSelect(method)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  selectedMethod === method.id && !method.comingSoon
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                } ${method.comingSoon ? "opacity-70" : ""}`}
              >
                <div className="shrink-0">{method.icon}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {method.label}
                  </div>
                  {method.sublabel && (
                    <div className="text-xs text-white/50">
                      {method.sublabel}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Right panel — auth form */}
          <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
            <div className="flex flex-1 flex-col justify-center">
              <AnimatePresence mode="wait">
                {selectedMethod === "social" && (
                  <motion.div
                    key="social"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Google button */}
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

                    {/* Apple button */}
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

                    {/* Email step */}
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
                          {/* Email display */}
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
                              className="text-white/70 hover:text-white underline underline-offset-2"
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
                              className="text-white/70 hover:text-white underline underline-offset-2"
                            >
                              Entrar
                            </button>
                          </p>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-white/30">
              By connecting, you agree to the{" "}
              <Link
                href="/terms"
                className="text-white/50 hover:text-white/80 underline underline-offset-2"
              >
                Terms of Service
              </Link>{" "}
              &{" "}
              <Link
                href="/privacy"
                className="text-white/50 hover:text-white/80 underline underline-offset-2"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
