"use client";

import { resetPassword } from "@/actions/auth";
import { FloatingOrb } from "@/components/floating-orb";
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
import { useToast } from "@/hooks/use-toast-custom";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2, Lock, Shield } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "A palavra-passe é obrigatória")
      .min(8, "A palavra-passe deve ter no mínimo 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "A palavra-passe deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      ),
    confirmPassword: z
      .string()
      .min(1, "Confirma a tua palavra-passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As palavras-passe não coincidem",
    path: ["confirmPassword"],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Se não houver token, redirecionar
  if (!token) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#21005a] via-[#2b0071] to-[#21005a]">
        <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-xl shadow-2xl text-center"
          >
            <div className="mb-4 text-red-400">
              <Shield className="mx-auto h-12 w-12" />
            </div>
            <h2 className="mb-4 bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-2xl font-bold text-transparent">
              Link Inválido
            </h2>
            <p className="mb-6 text-sm text-[#ba93ff]">
              O link de recuperação é inválido ou expirou. Solicita um novo link.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] font-bold text-[#21005a] hover:from-[#1effbf] hover:to-[#00cfb1]">
                Solicitar Novo Link
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  async function onSubmit(values: ResetPasswordInput) {
    if (!token) {
      toast.error("Erro", "Token inválido");
      return;
    }
    
    setLoading(true);
    try {
      const result = await resetPassword(token, values.password);

      if (!result.success) {
        throw new Error(result.error || "Erro ao redefinir palavra-passe");
      }

      setSuccess(true);
      toast.success(
        "Sucesso!",
        "A tua palavra-passe foi redefinida com sucesso."
      );

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      toast.error(
        "Erro ao redefinir",
        err.message ||
          "Não foi possível redefinir a palavra-passe. Verifica o link ou solicita um novo."
      );
    } finally {
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

      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="mb-8 space-y-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto flex items-center justify-center"
              >
                <Logo size="medium" />
              </motion.div>

              {!success ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#00cfb1]/20 to-[#1effbf]/20">
                    <Shield className="h-8 w-8 text-[#00cfb1]" />
                  </div>
                  <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
                    Nova Palavra-passe
                  </h2>
                  <p className="text-sm text-[#ba93ff]">
                    Define uma nova palavra-passe segura para a tua conta
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#00cfb1]/20 to-[#1effbf]/20">
                    <CheckCircle className="h-8 w-8 text-[#00cfb1]" />
                  </div>
                  <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
                    Palavra-passe Redefinida!
                  </h2>
                  <p className="text-sm text-[#ba93ff]">
                    A tua palavra-passe foi alterada com sucesso. Serás
                    redirecionado para a página de login.
                  </p>
                </>
              )}
            </div>

            {!success ? (
              <Form {...form}>
                <form
                  className="space-y-6"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white">
                          Nova Palavra-passe
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
                        <p className="mt-1 text-xs text-white/60">
                          Mínimo 8 caracteres, com maiúscula, minúscula e número
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-white">
                          Confirmar Palavra-passe
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
                          A redefinir...
                        </>
                      ) : (
                        "Redefinir Palavra-passe"
                      )}
                    </Button>

                    <Link href="/sign-in">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar ao Login
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <Link href="/sign-in">
                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] font-bold text-[#21005a] hover:from-[#1effbf] hover:to-[#00cfb1] hover:shadow-lg hover:shadow-[#00cfb1]/50"
                  >
                    Ir para Login
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-white/40">
            © {new Date().getFullYear()} JogaBola — Vive o Futebol ⚡
          </p>
        </motion.div>
      </div>
    </div>
  );
}
