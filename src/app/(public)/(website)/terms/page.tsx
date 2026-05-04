"use client";

import { motion } from "framer-motion";
import { FileText, Shield, Info, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const t = useTranslations("legal.terms");

  return (
    <main className="min-h-screen bg-slate-950 pt-32 pb-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Button variant="ghost" asChild className="mb-8 text-gray-400 hover:text-white">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
          
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 mb-6">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl mb-6">
            Termos e Condições
          </h1>
          <p className="text-lg text-gray-400">
            Última atualização: 4 de Maio de 2026
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-invert max-w-none space-y-8 text-gray-300"
        >
          <section className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao aceder e utilizar o JogaBola, você concorda em cumprir e estar vinculado aos seguintes termos e condições. Se você não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.
            </p>
          </section>

          <section className="p-4">
            <h2 className="text-2xl font-bold text-white mb-4">2. Uso do Serviço</h2>
            <p>
              O JogaBola é uma plataforma para organização e gestão de eventos desportivos. O utilizador é responsável por manter a confidencialidade da sua conta e por todas as atividades que ocorram sob a mesma.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>O uso comercial não autorizado é proibido.</li>
              <li>É proibido o envio de spam ou conteúdo ofensivo.</li>
              <li>A precisão das informações fornecidas é de responsabilidade do utilizador.</li>
            </ul>
          </section>

          <section className="p-4">
            <h2 className="text-2xl font-bold text-white mb-4">3. Pagamentos e Taxas</h2>
            <p>
              Alguns serviços podem exigir o pagamento de taxas. Todos os pagamentos são finais, a menos que especificado de outra forma pela organização do evento específico.
            </p>
          </section>

          <section className="p-4">
            <h2 className="text-2xl font-bold text-white mb-4">4. Limitação de Responsabilidade</h2>
            <p>
              O JogaBola não se responsabiliza por quaisquer danos resultantes da participação em eventos organizados através da plataforma ou de falhas técnicas fora do nosso controlo.
            </p>
          </section>
        </motion.div>
      </div>
    </main>
  );
}
