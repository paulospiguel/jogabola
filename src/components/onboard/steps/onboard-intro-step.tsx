"use client";

import { Logo } from "@/components/logo";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function OnboardIntroStep() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-center sm:space-y-8"
    >
      <div className="space-y-3 sm:space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto flex items-center justify-center p-3 sm:p-4"
        >
          <Logo />
        </motion.div>
        <h1 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
          Bem-vindo ao JogaBola!
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#ba93ff] sm:text-lg md:text-xl">
          Estás prestes a embarcar numa jornada épica no mundo do futebol
          amador. Vamos configurar a tua experiência perfeita em apenas alguns
          passos.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
      >
        <div className="flex items-center gap-2 text-sm text-[#00cfb1] sm:text-base">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Escolha da jornada</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#00cfb1] sm:text-base">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Configuração personalizada</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#00cfb1] sm:text-base">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Acesso antecipado</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

