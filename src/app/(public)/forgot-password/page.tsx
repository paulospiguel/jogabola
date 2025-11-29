"use client";

import { forgotPassword } from "@/actions/auth";
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
import { ArrowLeft, Loader2, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório")
    .email("Email inválido"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setLoading(true);
    try {
      const result = await forgotPassword(values.email);

      if (!result.success) {
        throw new Error(result.error || "Erro ao enviar email de recuperação");
      }

      setEmailSent(true);
      toast.success(
        "Email enviado!",
        "Verifica a tua caixa de entrada para recuperares a palavra-passe."
      );
    } catch (err: unknown) {
      console.error("Forgot password error:", err);
      const errorMessage = err instanceof Error ? err.message : "Não foi possível enviar o email de recuperação. Tenta novamente.";
      toast.error(
        "Erro ao enviar email",
        errorMessage
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

              {!emailSent ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#00cfb1]/20 to-[#1effbf]/20">
                    <Shield className="h-8 w-8 text-[#00cfb1]" />
                  </div>
                  <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
                    Recuperar Palavra-passe
                  </h2>
                  <p className="text-sm text-[#ba93ff]">
                    Insere o teu email e enviaremos um link para recuperares a
                    tua palavra-passe
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#00cfb1]/20 to-[#1effbf]/20">
                    <Mail className="h-8 w-8 text-[#00cfb1]" />
                  </div>
                  <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
                    Email Enviado!
                  </h2>
                  <p className="text-sm text-[#ba93ff]">
                    Enviamos um link de recuperação para{" "}
                    <span className="font-semibold text-white">
                      {form.getValues("email")}
                    </span>
                    . Verifica a tua caixa de entrada e segue as instruções.
                  </p>
                  <p className="text-xs text-white/60">
                    Se não receberes o email em alguns minutos, verifica a pasta
                    de spam ou tenta novamente.
                  </p>
                </>
              )}
            </div>

            {!emailSent ? (
              <Form {...form}>
                <form
                  className="space-y-6"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
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
                          A enviar...
                        </>
                      ) : (
                        "Enviar Link de Recuperação"
                      )}
                    </Button>

                    <Link href="/auth">
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
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    form.reset();
                  }}
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  Enviar para outro email
                </Button>

                <Link href="/auth">
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
