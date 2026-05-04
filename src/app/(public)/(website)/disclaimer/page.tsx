"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-32 pb-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Button
            variant="ghost"
            asChild
            className="mb-8 text-gray-400 hover:text-white"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>

          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-6">
            <Info className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl mb-6">
            Aviso Legal
          </h1>
          <p className="text-lg text-gray-400">
            Isenção de responsabilidade e avisos importantes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-invert max-w-none space-y-8 text-gray-300"
        >
          <section className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Informações Gerais
            </h2>
            <p>
              As informações contidas neste serviço são apenas para fins
              informativos gerais. O JogaBola não assume qualquer
              responsabilidade por erros ou omissões no conteúdo do serviço.
            </p>
          </section>

          <section className="p-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Riscos da Atividade Física
            </h2>
            <p>
              A prática de desporto envolve riscos inerentes de lesões físicas.
              Os utilizadores participam em eventos organizados através do
              JogaBola por sua conta e risco. Recomendamos vivamente a consulta
              de um profissional de saúde antes de iniciar qualquer atividade
              física intensa.
            </p>
          </section>

          <section className="p-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Links Externos
            </h2>
            <p>
              O nosso serviço pode conter links para sites externos que não são
              fornecidos ou mantidos pelo JogaBola. Não garantimos a precisão,
              relevância ou integridade de qualquer informação nestes sites
              externos.
            </p>
          </section>
        </motion.div>
      </div>
    </main>
  );
}
