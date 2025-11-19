"use client";

import { saveProfileData } from "@/actions/profile";
import { GoogleIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProfileSync } from "@/hooks/use-profile-sync";
import { useToast } from "@/hooks/use-toast-custom";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { data } = useSession();
  const { toast } = useToast();
  const t = useTranslations("signIn.page");

  // Sync profile data when user logs in
  useProfileSync(data?.user?.id, saveProfileData);

  // Preencher formulários com dados do query params (vindo do onboarding)
  const emailParam = searchParams.get("email");
  const nameParam = searchParams.get("name");

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam || "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: nameParam || "",
      email: emailParam || "",
      password: "",
      confirmPassword: "",
    },
  });

  // Atualizar formulários quando os params mudarem
  useEffect(() => {
    if (emailParam) {
      loginForm.setValue("email", emailParam);
      registerForm.setValue("email", emailParam);
    }
    if (nameParam) {
      registerForm.setValue("name", nameParam);
    }
  }, [emailParam, nameParam, loginForm, registerForm]);

  // Verificar se usuário está logado - permitir login direto
  useEffect(() => {
    if (data?.user?.id) {
      // Usuário está logado - redirecionar para arena (onboarding é opcional)
      router.push("/arena");
    }
  }, [data?.user?.id, router]);

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      // Redirecionar para arena após login (onboarding é opcional)
      const callbackURL = "/arena";

      const result = await signIn.social({
        provider: "google",
        callbackURL,
      });

      // O login social pode retornar um redirect URL ou um erro
      if (result.error) {
        throw new Error(result.error.message || t("errors.googleAuthFailed"));
      }

      // Se houver redirect URL, o navegador será redirecionado automaticamente
      if (result.data?.url) {
        // O Better Auth redireciona automaticamente, mas podemos garantir
        window.location.href = result.data.url;
        return;
      }

      // Se não houver erro nem URL, pode ser que a autenticação esteja em progresso
      // Não definir loading como false aqui, pois o redirecionamento pode estar ocorrendo
    } catch (err: any) {
      console.error("Google login error:", err);
      toast.error(
        t("errors.loginError"),
        err.message || t("errors.loginFailed"),
      );
      setLoading(false);
    }
  }

  async function onLoginSubmit(values: LoginInput) {
    setLoading(true);
    try {
      const result = await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/arena",
      });

      if (result.error) {
        throw new Error(result.error.message || t("errors.invalidCredentials"));
      }

      toast.success(t("success.login"), t("success.loginMessage"));

      // A migração será feita pelo hook useProfileSync que monitora a sessão
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(
        t("errors.loginError"),
        err.message || t("errors.invalidCredentialsDetails"),
      );
      setLoading(false);
    }
  }

  async function onRegisterSubmit(values: RegisterInput) {
    setLoading(true);
    try {
      const result = await signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: "/arena",
      });

      if (result.error) {
        throw new Error(result.error.message || t("errors.registerFailed"));
      }

      toast.success(t("success.register"), t("success.registerMessage"));

      // A migração será feita pelo hook useProfileSync que monitora a sessão
    } catch (err: any) {
      console.error("Register error:", err);
      toast.error(
        t("errors.registerError"),
        err.message || t("errors.registerFailedDetails"),
      );
      setLoading(false);
    }
  }

  // Background Pattern Component - Gradiente do mockup (Igual da Home)
  const FieldPattern = () => {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Gradiente base: azul claro top-left para verde claro bottom-right */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-100 via-cyan-50 to-emerald-100 dark:from-slate-900/80 dark:via-emerald-900/40 dark:to-slate-950/80" />
      </div>
    );
  };

  return (
    <div className="bg-background relative min-h-screen overflow-hidden dark:bg-(--color-blue-850)">
      <FieldPattern />

      {/* Back to Home Button */}
      <Link
        href="/"
        aria-label="Voltar ao início"
        className="absolute top-4 left-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-3 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600 sm:px-4 sm:py-2 lg:top-8 lg:left-8 dark:text-white/80 dark:hover:text-emerald-400"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Voltar ao início</span>
      </Link>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="overflow-hidden rounded-3xl bg-linear-to-br from-blue-50/80 via-cyan-50/80 to-emerald-50/80 p-6 shadow-xl backdrop-blur-sm sm:p-8 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-emerald-900/40">
            {/* Header */}
            <div className="mb-6 space-y-2 text-center lg:mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto flex items-center justify-center"
              >
                <Logo size="medium" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                {tab === "login"
                  ? t("form.title.login")
                  : t("form.title.register")}
              </h2>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                {tab === "login"
                  ? t("form.subtitle.login")
                  : t("form.subtitle.register")}
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 rounded-xl bg-white/50 p-1 dark:bg-slate-800/50">
              <button
                onClick={() => {
                  setTab("login");
                  registerForm.reset();
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all sm:py-2.5 sm:text-sm ${
                  tab === "login"
                    ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {t("form.tabs.login")}
              </button>
              <button
                onClick={() => {
                  setTab("register");
                  loginForm.reset();
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all sm:py-2.5 sm:text-sm ${
                  tab === "register"
                    ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {t("form.tabs.register")}
              </button>
            </div>

            {/* Login Form */}
            {tab === "login" && (
              <Form {...loginForm}>
                <form
                  className="space-y-4"
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("form.fields.email")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              icon={Mail}
                              {...field}
                              type="email"
                              placeholder={t("form.fields.emailPlaceholder")}
                              disabled={loading}
                              className="relative z-10 border-gray-200 bg-white/50 !pl-10 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-gray-500"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("form.fields.password")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              icon={Lock}
                              {...field}
                              type={showLoginPassword ? "text" : "password"}
                              placeholder={t(
                                "form.fields.passwordPlaceholder",
                              )}
                              disabled={loading}
                              className="relative z-10 border-gray-200 bg-white/50 pr-10 !pl-10 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-gray-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowLoginPassword(!showLoginPassword)
                              }
                              className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-gray-400 transition-colors hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400"
                              aria-label={
                                showLoginPassword
                                  ? "Ocultar senha"
                                  : "Mostrar senha"
                              }
                            >
                              {showLoginPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      {t("form.forgotPassword")}
                    </Link>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3 pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-emerald-500 py-6 text-base font-medium text-white shadow-md hover:bg-emerald-600 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("form.buttons.logging")}
                        </>
                      ) : (
                        t("form.buttons.login")
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-slate-700" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white/50 px-3 py-1 text-gray-500 backdrop-blur-sm dark:bg-slate-800/50 dark:text-gray-400">
                          {t("form.continueWith")}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      variant="outline"
                      className="w-full border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />A
                          entrar...
                        </>
                      ) : (
                        <>
                          <GoogleIcon className="mr-2 h-5 w-5" />
                          {t("form.buttons.google")}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Register Form */}
            {tab === "register" && (
              <Form {...registerForm}>
                <form
                  className="space-y-4"
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                >
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("form.fields.name")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              icon={User}
                              {...field}
                              type="text"
                              placeholder={t("form.fields.namePlaceholder")}
                              disabled={loading}
                              className="border-gray-200 bg-white/50 !pl-10 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-gray-500"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("form.fields.email")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              icon={Mail}
                              {...field}
                              type="email"
                              placeholder={t("form.fields.emailPlaceholder")}
                              disabled={loading}
                              className="border-gray-200 bg-white/50 !pl-10 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-gray-500"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("form.fields.password")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              icon={Lock}
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder={t(
                                "form.fields.passwordPlaceholder",
                              )}
                              disabled={loading}
                              className="border-gray-200 bg-white/50 pr-10 !pl-10 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-gray-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400"
                              aria-label={
                                showPassword
                                  ? "Ocultar senha"
                                  : "Mostrar senha"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => {
                      const passwordValue =
                        registerForm.watch("password") || "";
                      const confirmPasswordValue = field.value || "";
                      const passwordsMatch =
                        passwordValue &&
                        confirmPasswordValue &&
                        passwordValue === confirmPasswordValue;
                      const passwordsDontMatch =
                        passwordValue &&
                        confirmPasswordValue &&
                        passwordValue !== confirmPasswordValue;

                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("form.fields.confirmPassword")}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                              <Input
                                {...field}
                                type={
                                  showConfirmPassword ? "text" : "password"
                                }
                                placeholder={t(
                                  "form.fields.passwordPlaceholder",
                                )}
                                disabled={loading}
                                className={`border-gray-200 bg-white/50 pr-10 !pl-10 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-gray-500 ${
                                  passwordsDontMatch
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    : passwordsMatch
                                      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                                      : ""
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400"
                                aria-label={
                                  showConfirmPassword
                                    ? "Ocultar senha"
                                    : "Mostrar senha"
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          {passwordsDontMatch && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                              As palavras-passe não coincidem
                            </p>
                          )}
                          {passwordsMatch && confirmPasswordValue && (
                            <p className="mt-1 text-sm text-green-500 dark:text-green-400">
                              As palavras-passe coincidem
                            </p>
                          )}
                          <FormMessage className="text-red-500 dark:text-red-400" />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Buttons */}
                  <div className="space-y-3 pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-emerald-500 py-6 text-base font-medium text-white shadow-md hover:bg-emerald-600 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("form.buttons.registering")}
                        </>
                      ) : (
                        t("form.buttons.register")
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-slate-700" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white/50 px-3 py-1 text-gray-500 backdrop-blur-sm dark:bg-slate-800/50 dark:text-gray-400">
                          {t("form.continueWith")}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      variant="outline"
                      className="w-full border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />A
                          entrar...
                        </>
                      ) : (
                        <>
                          <GoogleIcon className="mr-2 h-5 w-5" />
                          {t("form.buttons.google")}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>

          {/* Footer */}
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            {t("footer", { year: new Date().getFullYear() })}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
