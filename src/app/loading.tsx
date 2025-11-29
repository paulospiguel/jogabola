"use client";

import { FloatingOrb } from "@/components/floating-orb";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end">
      {/* Background decorativo com floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb delay={0} size={200} position="top-20 left-10" />
        <FloatingOrb delay={1} size={150} position="top-40 right-20" />
        <FloatingOrb delay={2} size={100} position="bottom-20 left-1/4" />
        <FloatingOrb delay={3} size={120} position="bottom-40 right-1/3" />
      </div>

      {/* Conteúdo centralizado */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          {/* Logo animado */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <Logo size="large" isAnimate color="white" />
          </motion.div>

          {/* Spinner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-brand-green to-[#1effbf] bg-clip-text text-xl font-semibold text-transparent"
            >
              A carregar...
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
