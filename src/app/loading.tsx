"use client";

import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import logoAnimated from "@/assets/logos/logo_animado.gif";
import { Logo } from "@/components/logo";

export default function LoadingPage() {
  const t = useTranslations("common");

  return (
    <div className="relative min-h-screen overflow-hidden bg-arena-bg text-arena-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(124,255,79,.12),transparent_34%),radial-gradient(circle_at_82%_74%,rgba(56,189,248,.08),transparent_38%),linear-gradient(180deg,rgba(11,15,20,.18),rgba(11,15,20,.92))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(38,50,68,.20)_1px,transparent_1px),linear-gradient(90deg,rgba(38,50,68,.20)_1px,transparent_1px)] bg-[size:64px_64px] opacity-45 [mask-image:radial-gradient(circle_at_center,black_20%,transparent_76%)]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-7"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute inset-x-10 top-1/2 h-10 -translate-y-1/2 rounded-full bg-arena-primary/12 blur-2xl" />
            <Logo isAnimate />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.22 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.26, duration: 0.2 }}
              className="font-sora text-[15px] font-bold tracking-[0.04em] text-arena-text"
            >
              {t("loading")}
            </motion.p>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {[0, 1, 2].map(index => (
                <motion.span
                  key={index}
                  animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1, 0.9] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: index * 0.14,
                    ease: "easeInOut",
                  }}
                  className="size-1.5 rounded-full bg-arena-primary"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
