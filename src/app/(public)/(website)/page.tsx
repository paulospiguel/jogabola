"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Play,
  Share2,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import Modal, { ModalRef } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { webConfig } from "@/configs";
import { useJourneyRedirect } from "@/hooks/use-journey-redirect";
import { cn } from "@/lib/utils";

// Background Pattern Component - Gradiente do mockup
const FieldPattern = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Imagem de fundo do campo de futebol com overlay escuro */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-[0.3]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-slate-950/20 via-slate-900/60 to-slate-950" />
    </div>
  );
};

const DashboardCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">
              Painel do Treinador
            </h3>
            <p className="text-[10px] font-medium text-gray-400">
              PERFORMANCE GLOBAL
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-1 rounded-full bg-gray-500" />
          <div className="h-1 w-1 rounded-full bg-gray-500" />
          <div className="h-1 w-1 rounded-full bg-gray-500" />
        </div>
      </div>

      {/* Bar Chart Mockup */}
      <div className="mb-8 flex h-32 items-end justify-between gap-2 px-2">
        {[40, 65, 30, 95, 75, 45].map((height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
            className={cn(
              "w-full rounded-t-md",
              i === 3 ? "bg-blue-500" : "bg-blue-500/30",
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-[10px] font-bold tracking-tight text-gray-400 uppercase">
            STATUS DO ELENCO
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">22</span>
            <span className="text-xs text-gray-400">Prontos</span>
          </div>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-8 w-8 overflow-hidden rounded-full border-2 border-slate-900 bg-gray-700"
            >
              <div className="h-full w-full bg-linear-to-br from-blue-400 to-emerald-400" />
            </div>
          ))}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-[10px] font-bold text-white">
            +18
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VideoPreviewModal = ({
  children,
  videoId,
}: {
  children: React.ReactNode;
  videoId: string;
}) => {
  const modalRef = useRef<ModalRef>(null);
  return (
    <Modal
      ref={modalRef}
      size="large"
      triggerComponent={children}
      title="Jogabola - Demo"
      content={
        <iframe
          width="100%"
          height="auto"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      }
    />
  );
};

// Hero Section - Estilo Mockup Exato
const HeroSection = () => {
  const t = useTranslations("homePage.hero");
  const { redirectToJourney } = useJourneyRedirect();

  return (
    <section className="bg-background dark:bg-blue-850 relative flex min-h-screen items-center overflow-hidden pt-20">
      <FieldPattern />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content - Lado Esquerdo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge GESTÃO 2.0 ATIVADA */}
            <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5">
              <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-blue-400" />
              <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">
                {t("versionBadge")} ATIVADA
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl leading-tight font-extrabold text-white md:text-6xl lg:text-7xl">
              Transforme a<br />
              Gestão do seu
              <br />
              <span className="text-blue-500">Clube</span> com
              <br />
              Tecnologia de Elite
            </h1>

            {/* Subtitle */}
            <p className="max-w-lg text-lg leading-relaxed text-gray-400 md:text-xl">
              A plataforma completa para gerenciar times amadores, escolares e
              semiprofissionais. Do calendário de jogos à saúde dos atletas,
              tudo em um só lugar.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <Button
                onClick={redirectToJourney}
                className="rounded-full bg-blue-600 px-8 py-7 text-lg font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-105 hover:bg-blue-700"
              >
                {t("startJourney")}
              </Button>

              <VideoPreviewModal videoId="VIDEO_ID">
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 px-8 py-7 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <Play className="mr-3 h-6 w-6 fill-white" />
                  {t("watchDemo")}
                </Button>
              </VideoPreviewModal>
            </div>
          </motion.div>

          {/* Graphical Illustration - Dashboard Card */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-20 rounded-full bg-blue-500/10 blur-[100px]" />
            <DashboardCard />
          </div>
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const t = useTranslations("homePage");
  return (
    <section className="bg-background dark:bg-blue-850 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl border-t border-white/5 px-4 py-10 md:px-6">
        <h3 className="pb-5 text-center text-4xl font-bold text-white">
          {t("stats.title")}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {Object.values(webConfig.HOME_STATS).map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="group relative"
            >
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tighter text-white sm:text-4xl">
                    {stat.value}
                  </span>
                  {stat.isRating && (
                    <div className="flex items-center gap-1 pb-1">
                      <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
                      <span className="text-[10px] font-bold text-blue-400">
                        {t("stats.averageRating")}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase transition-colors group-hover:text-blue-500">
                  {t(`stats.${stat.label}`)}
                </span>
              </div>
              {/* Decorative line */}
              <div className="absolute -bottom-2 h-0.5 w-0 bg-blue-600 transition-all group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features/Ecosystem Section - Estilo Glassmorphism do Mockup
const EcosystemSection = () => {
  const t = useTranslations("homePage.ecosystem_section");

  const modules = [
    {
      icon: Wallet,
      title: t("modules.finance.title"),
      description: t("modules.finance.description"),
      color: "blue",
    },
    {
      icon: Share2,
      title: t("modules.tactical.title"),
      description: t("modules.tactical.description"),
      color: "blue",
    },
    {
      icon: Activity,
      title: t("modules.health.title"),
      description: t("modules.health.description"),
      color: "blue",
    },
    {
      icon: Users,
      title: t("modules.engagement.title"),
      description: t("modules.engagement.description"),
      color: "blue",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-32">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-emerald-600/5 blur-[120px]" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-sm font-bold tracking-widest text-blue-500 uppercase">
            RECURSOS DE ELITE
          </h2>
          <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-extrabold text-white md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Grid de módulos */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((module, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md transition-all hover:border-white/10 hover:bg-white/10"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 transition-transform group-hover:scale-110">
                <module.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-white">
                {module.title}
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-gray-400">
                {module.description}
              </p>
              <button className="flex items-center gap-2 text-xs font-bold tracking-widest text-blue-400 uppercase transition-colors hover:text-blue-300">
                {t("modules.explore")} <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <main className="relative bg-slate-950">
      <HeroSection />
      <StatsSection />
      <EcosystemSection />
    </main>
  );
}
