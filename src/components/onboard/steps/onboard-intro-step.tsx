"use client";

import { Logo } from "@/components/logo";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function OnboardIntroStep() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-center"
    >
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto flex items-center justify-center p-4"
        >
          <Logo />
        </motion.div>
        <h1 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Bem-vindo ao JogaBola!
        </h1>
        <p className="mx-auto max-w-2xl text-xl leading-relaxed text-[#ba93ff]">
          Estás prestes a embarcar numa jornada épica no mundo do futebol
          amador. Vamos configurar a tua experiência perfeita em apenas alguns
          passos.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <div className="flex items-center gap-2 text-[#00cfb1]">
          <CheckCircle className="h-5 w-5" />
          <span>Escolha da jornada</span>
        </div>
        <div className="flex items-center gap-2 text-[#00cfb1]">
          <CheckCircle className="h-5 w-5" />
          <span>Configuração personalizada</span>
        </div>
        <div className="flex items-center gap-2 text-[#00cfb1]">
          <CheckCircle className="h-5 w-5" />
          <span>Acesso antecipado</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

