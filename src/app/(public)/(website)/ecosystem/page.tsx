"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Eye,
  PlusSquare,
  Send,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";

// Grid Background Pattern
const GridBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-slate-950" />
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: "40px 40px",
      }}
    />
    <div className="absolute inset-0 bg-linear-to-b from-slate-950/0 via-slate-950/20 to-slate-950" />
    {/* Radial Glows */}
    <div className="absolute top-0 left-1/4 h-[500px] w-[500px] bg-blue-600/10 blur-[120px]" />
    <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] bg-blue-600/5 blur-[120px]" />
  </div>
);

interface ModuleCardProps {
  id: string;
  icon: any;
  title: string;
  description: string;
  progress: number;
  status: "beta" | "development";
  isNew?: boolean;
}

const ModuleCard = ({
  icon: Icon,
  title,
  description,
  progress,
  status,
}: ModuleCardProps) => {
  const t = useTranslations("ecosystemPage");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-white/10 hover:bg-white/10"
    >
      {/* Badge / Status */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
          <Icon size={24} />
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase",
            status === "beta"
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border border-blue-500/20 bg-blue-500/10 text-blue-400",
          )}
        >
          {t(`status.${status}`)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
        <p className="mb-8 text-sm leading-relaxed text-gray-400">
          {description}
        </p>
      </div>

      {/* Footer / Progress */}
      <div className="space-y-6">
        {status === "beta" ? (
          <div className="flex items-center justify-between gap-4">
            <button className="flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-white">
              {t("status.learnMore")}
              <ChevronRight size={14} />
            </button>
            <Button className="h-10 rounded-full bg-blue-600 px-6 font-bold text-white hover:bg-blue-700">
              {t("status.joinBeta")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-gray-500 uppercase">
              <span>{t("labels.progress")}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              />
            </div>
            <button className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-white">
              {t("status.learnMore")}
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function EcosystemPage() {
  const t = useTranslations("ecosystemPage");

  const modules: ModuleCardProps[] = [
    {
      id: "scout",
      icon: Eye,
      title: t("modules.scout.title"),
      description: t("modules.scout.description"),
      progress: 0,
      status: "beta",
    },
    {
      id: "finance",
      icon: Wallet,
      title: t("modules.finance.title"),
      description: t("modules.finance.description"),
      progress: 75,
      status: "development",
    },
    {
      id: "marketplace",
      icon: ShoppingBag,
      title: t("modules.marketplace.title"),
      description: t("modules.marketplace.description"),
      progress: 40,
      status: "development",
    },
    {
      id: "health",
      icon: PlusSquare,
      title: t("modules.health.title"),
      description: t("modules.health.description"),
      progress: 15,
      status: "development",
    },
  ];

  return (
    <main className="relative min-h-screen pt-40 pb-32">
      <GridBackground />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 md:px-6">
        {/* Hero Section */}
        <div className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5"
          >
            <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
              {t("badge")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 text-5xl font-black tracking-tighter text-white md:text-7xl"
          >
            {t.rich("title", {
              blue: chunks => (
                <span className="text-blue-600 drop-shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                  {chunks}
                </span>
              ),
            })}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Modules Grid */}
        <div className="mb-40 grid gap-6 md:grid-cols-2">
          {modules.map(module => (
            <ModuleCard key={module.id} {...module} />
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[40px] border border-white/5 bg-white/5 p-8 backdrop-blur-xl md:p-16"
        >
          {/* Decorative gradients */}
          <div className="absolute -top-24 -right-24 h-64 w-64 bg-blue-600/20 blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-blue-600/10 blur-[80px]" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-black tracking-tight text-white md:text-5xl">
              {t("newsletter.title")}
            </h2>
            <p className="mb-12 text-lg text-gray-400">
              {t("newsletter.subtitle")}
            </p>

            <form className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-6 py-4 text-white outline-hidden transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <Button className="h-14 gap-2 rounded-2xl bg-blue-600 px-10 font-bold text-white hover:bg-blue-700">
                {t("newsletter.button")}
                <Send size={18} />
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
