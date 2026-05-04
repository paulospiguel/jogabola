"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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

          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-6">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl mb-6">
            Política de Privacidade
          </h1>
          <p className="text-lg text-gray-400">
            A tua privacidade é a nossa prioridade.
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
              1. Informações que Recolhemos
            </h2>
            <p>
              Recolhemos informações para fornecer melhores serviços a todos os
              nossos utilizadores. Isto inclui o teu nome, endereço de email e
              dados de participação em eventos.
            </p>
          </section>

          <section className="p-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Como Utilizamos as Informações
            </h2>
            <p>
              Utilizamos as informações recolhidas para fornecer, manter,
              proteger e melhorar os nossos serviços, bem como para desenvolver
              novos serviços.
            </p>
          </section>

          <section className="p-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Partilha de Informações
            </h2>
            <p>
              Não partilhamos informações pessoais com empresas, organizações ou
              indivíduos externos ao JogaBola, exceto se tivermos o teu
              consentimento ou por motivos legais.
            </p>
          </section>

          <section className="p-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Segurança dos Dados
            </h2>
            <p>
              Trabalhamos arduamente para proteger o JogaBola e os nossos
              utilizadores contra o acesso não autorizado, alteração, divulgação
              ou destruição de informações que detemos.
            </p>
          </section>
        </motion.div>
      </div>
    </main>
  );
}
