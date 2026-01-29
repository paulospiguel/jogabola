"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit, Database, MessageSquareText } from "lucide-react";
import { useTranslations } from "next-intl";

// Background Pattern Component (Reused or similar to field pattern)
const TeamBackground = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Imagem de fundo do campo de futebol com overlay escuro */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-[2px] brightness-[0.2]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-slate-950/40 via-slate-900/10 to-slate-950" />
      <div className="absolute top-0 left-1/2 h-[600px] w-full max-w-4xl -translate-x-1/2 bg-blue-600/10 blur-[120px]" />
    </div>
  );
};

export default function TeamPage() {
  const t = useTranslations("teamPage");

  const agents = [
    {
      id: "data",
      icon: Database,
      iconSmall: Database,
      title: t("agents.dataEngineering.title"),
      description: t("agents.dataEngineering.description"),
    },
    {
      id: "tactical",
      icon: BrainCircuit,
      iconSmall: BrainCircuit,
      title: t("agents.tacticalAnalysis.title"),
      description: t("agents.tacticalAnalysis.description"),
      highlight: true,
    },
    {
      id: "support",
      icon: MessageSquareText,
      iconSmall: MessageSquareText,
      title: t("agents.intelligentSupport.title"),
      description: t("agents.intelligentSupport.description"),
    },
  ];

  return (
    <main className="relative min-h-screen bg-slate-950 pt-40 pb-20">
      <TeamBackground />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 md:px-6">
        {/* Hero Section */}
        <div className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5"
          >
            <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
              {t("badge")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-5xl font-black tracking-tighter text-white md:text-7xl"
          >
            {t.rich("title", {
              blue: chunks => <span className="text-blue-500">{chunks}</span>,
            })}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* FounderSection (CEO Highlight) */}
        <div className="mb-32 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="group relative"
          >
            {/* Avatar Glow */}
            <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl transition-all group-hover:bg-blue-500/30" />

            {/* Avatar Container */}
            <div className="relative h-48 w-48 overflow-hidden rounded-full border-2 border-blue-500/50 bg-slate-900 shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-blue-900/40" />
              {/* Placeholder for CEO Image - in real app use <img> */}
              <div className="flex h-full w-full items-center justify-center bg-slate-800">
                <span className="text-4xl font-bold text-blue-400">CEO</span>
              </div>
            </div>

            {/* Title / Role */}
            <div className="mt-8 text-center">
              <p className="text-xs font-black tracking-[0.3em] text-blue-400 uppercase">
                {t("ceoName")}
              </p>
              <div className="mx-auto mt-2 h-0.5 w-12 bg-blue-600" />
            </div>
          </motion.div>

          {/* Connecting line */}
          <div className="mt-4 h-20 w-px bg-linear-to-b from-blue-600 to-transparent" />
        </div>

        {/* AI Agents Title */}
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-black tracking-[0.4em] text-gray-500 uppercase"
          >
            {t("aiAgentsTitle")}
          </motion.h2>
        </div>

        {/* AI Agents Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                "group relative rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md transition-all hover:scale-[1.02] hover:border-white/10 hover:bg-white/10",
                agent.highlight &&
                  "border-blue-500/20 bg-blue-500/5 md:-translate-y-4",
              )}
            >
              <div className="mb-8 flex flex-col items-center">
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 transition-transform group-hover:scale-110">
                    <agent.icon className="h-8 w-8" />
                  </div>
                  {/* Small secondary icon float */}
                  <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-950 text-blue-400 shadow-lg">
                    <agent.iconSmall className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="mb-4 text-center text-xl font-bold text-white">
                  {agent.title}
                </h3>
                <p className="text-center text-sm leading-relaxed text-gray-400">
                  {agent.description}
                </p>
              </div>

              {/* Decorative background pulse for highlight */}
              {agent.highlight && (
                <div className="absolute inset-0 -z-10 animate-pulse rounded-3xl bg-blue-500/5 blur-2xl" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
