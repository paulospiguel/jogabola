"use client";

import { saveProfileData } from "@/actions/profile";
import { FloatingOrb } from "@/components/floating-orb";
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
import { ArrowLeft, Loader2, Lock, Mail, Trophy, User } from "lucide-react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const { data } = useSession();
  const { toast } = useToast();

  // Sync profile data when user logs in
  useProfileSync(data?.user?.id, saveProfileData);

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  if (data?.user) {
    redirect("/arena");
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/onboard",
      });

      // O login social pode retornar um redirect URL ou um erro
      if (result.error) {
        throw new Error(result.error.message || "Falha ao autenticar com Google");
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
        "Erro ao entrar",
        err.message || "Não foi possível entrar com Google. Verifica as configurações e tenta novamente."
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
        throw new Error(result.error.message || "Email ou palavra-passe incorretos");
      }
      
      toast.success("Bem-vindo!", "Login realizado com sucesso");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(
        "Erro ao entrar",
        err.message || "Email ou palavra-passe incorretos. Verifica os teus dados e tenta novamente."
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
        callbackURL: "/onboard",
      });

      if (result.error) {
        throw new Error(result.error.message || "Não foi possível criar a conta");
      }

      toast.success(
        "Conta criada!",
        "A tua conta foi criada com sucesso. Vamos configurar o teu perfil."
      );
    } catch (err: any) {
      console.error("Register error:", err);
      toast.error(
        "Erro ao criar conta",
        err.message || "Não foi possível criar a conta. Tenta novamente ou usa outro email."
      );
      setLoading(false);
    }
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#21005a] via-[#2b0071] to-[#21005a]">
      {/* Background decorativo com floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb delay={0} size={200} position="top-20 left-10" />
        <FloatingOrb delay={1} size={150} position="top-40 right-20" />
        <FloatingOrb delay={2} size={100} position="bottom-20 left-1/4" />
        <FloatingOrb delay={3} size={120} position="bottom-40 right-1/3" />
      </div>

      {/* Botão de voltar à home */}
      <Button
        onClick={() => router.push("/")}
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 h-10 w-10 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-all hover:bg-white/20 hover:text-[#00cfb1]"
        aria-label="Voltar à home"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="relative z-10 flex min-h-screen">
        {/* Lado esquerdo - Hero Section */}
        <div className="relative hidden w-1/2 flex-col justify-center p-16 lg:flex">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#00cfb1]/10 px-4 py-2 backdrop-blur-sm">
              <Trophy className="h-5 w-5 text-[#00cfb1]" />
              <span className="text-sm font-medium text-[#00cfb1]">
                Plataforma #1 de Futebol Amador
              </span>
            </div>

            <h1 className="max-w-xl bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-6xl font-bold leading-tight text-transparent">
              Entre na Arena
            </h1>

            <p className="max-w-lg text-xl leading-relaxed text-[#ba93ff]">
              Conecta-te com jogadores, organiza partidas e vive o futebol como
              nunca antes. A tua jornada começa aqui.
            </p>

            <div className="flex flex-col gap-4 pt-6">
              {[
                "🎯 Encontra equipas e jogadores",
                "📊 Acompanha as tuas estatísticas",
                "🏆 Participa em torneios",
                "⚡ Comunidade ativa",
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00cfb1]" />
                  {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Lado direito - Form */}
        <div className="flex flex-1 items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="mb-8 space-y-2 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto flex items-center justify-center"
                >
                  <Logo size="medium" />
                </motion.div>
                <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
                  {tab === "login" ? "Bem-vindo de volta!" : "Cria a tua conta"}
                </h2>
                <p className="text-sm text-[#ba93ff]">
                  {tab === "login"
                    ? "Entre e continua a tua jornada"
                    : "Começa a tua aventura no futebol"}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-6 flex gap-2 rounded-xl bg-white/5 p-1">
                <button
                  onClick={() => {
                    setTab("login");
                    registerForm.reset();
                  }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    tab === "login"
                      ? "bg-gradient-to-r from-[#00cfb1] to-[#1effbf] text-[#21005a] shadow-lg"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setTab("register");
                    loginForm.reset();
                  }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    tab === "register"
                      ? "bg-gradient-to-r from-[#00cfb1] to-[#1effbf] text-[#21005a] shadow-lg"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Registo
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
                          <FormLabel className="text-sm font-medium text-white">
                            Email
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00cfb1]" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="teu@email.com"
                                disabled={loading}
                                className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus:border-[#00cfb1] focus:ring-[#00cfb1]"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-white">
                            Palavra-passe
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00cfb1]" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                disabled={loading}
                                className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus:border-[#00cfb1] focus:ring-[#00cfb1]"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-xs text-[#00cfb1] hover:text-[#1effbf] transition-colors"
                      >
                        Esqueceste a palavra-passe?
                      </Link>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3 pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] font-bold text-[#21005a] hover:from-[#1effbf] hover:to-[#00cfb1] hover:shadow-lg hover:shadow-[#00cfb1]/50 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            A entrar...
                          </>
                        ) : (
                          "Entrar"
                        )}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-gradient-to-br from-white/10 to-white/5 px-3 py-1 text-white/60">
                            ou continua com
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        variant="outline"
                        className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            A entrar...
                          </>
                        ) : (
                          <>
                            <GoogleIcon className="mr-2 h-5 w-5" />
                            Google
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
                          <FormLabel className="text-sm font-medium text-white">
                            Nome
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00cfb1]" />
                              <Input
                                {...field}
                                type="text"
                                placeholder="O teu nome"
                                disabled={loading}
                                className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus:border-[#00cfb1] focus:ring-[#00cfb1]"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-white">
                            Email
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00cfb1]" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="teu@email.com"
                                disabled={loading}
                                className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus:border-[#00cfb1] focus:ring-[#00cfb1]"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-white">
                            Palavra-passe
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00cfb1]" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                disabled={loading}
                                className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus:border-[#00cfb1] focus:ring-[#00cfb1]"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-white">
                            Confirmar palavra-passe
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00cfb1]" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                disabled={loading}
                                className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus:border-[#00cfb1] focus:ring-[#00cfb1]"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Buttons */}
                    <div className="space-y-3 pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] font-bold text-[#21005a] hover:from-[#1effbf] hover:to-[#00cfb1] hover:shadow-lg hover:shadow-[#00cfb1]/50 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            A criar conta...
                          </>
                        ) : (
                          "Criar Conta"
                        )}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-gradient-to-br from-white/10 to-white/5 px-3 py-1 text-white/60">
                            ou continua com
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        variant="outline"
                        className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            A entrar...
                          </>
                        ) : (
                          <>
                            <GoogleIcon className="mr-2 h-5 w-5" />
                            Google
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-white/40">
              © {new Date().getFullYear()} JogaBola — Vive o Futebol
              ⚡
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
