"use client";

import directorIcon from "@/assets/icons/director.png";
import footballIcon from "@/assets/icons/football.png";
import {
  AppleStore,
  LuArrowRight as ArrowRight,
  GooglePlay,
  LuPlay as Play,
} from "@/components/icons";
import PartnersSection from "@/components/partners-section";
import { AnimatedGallery } from "@/components/ui/animated-gallery";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RoleValues } from "@/schemas";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

// Componente de Background Animado com tons de verde
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradiente base com verde */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-teal-800/20 to-green-900/25" />

      {/* Orbs flutuantes com tons de verde */}
      <motion.div
        className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-r from-emerald-400/25 to-teal-500/20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-40 right-20 h-96 w-96 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-500/15 blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      <motion.div
        className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-gradient-to-r from-teal-400/25 to-green-400/20 blur-3xl"
        animate={{
          x: [0, 120, 0],
          y: [0, -40, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10,
        }}
      />

      {/* Partículas flutuantes verdes */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-emerald-400/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -100, -20],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Ondas de fundo verdes */}
      <motion.div
        className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-emerald-500/15 to-transparent"
        animate={{
          scaleX: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Efeito de mesh gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-green-900/10 via-transparent to-emerald-800/10" />
    </div>
  );
};

// Componente do Hero
const HeroSection = () => {
  const t = useTranslations();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
      <AnimatedBackground />

      {/* Overlay para melhor contraste */}
      <div className="absolute inset-0 bg-black/20" />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-6xl px-4 text-center"
      >
        {/* Badge de ação */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-white/10 px-1 py-1 pr-4 text-sm shadow-lg shadow-emerald-500/10 backdrop-blur-md transition-all duration-300 hover:bg-white/20"
        >
          <Link
            href={`/welcome?role=${RoleValues.PLAYER}`}
            className="group ml-2 flex items-center gap-2 rounded-full px-3 py-2 text-white transition-all duration-300 hover:bg-emerald-500/20"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              className="group-hover:animate-bounce"
              src={footballIcon}
              width={24}
              height={24}
              alt="Football icon"
            />
            <span className="rounded-full px-2 py-1.5 text-sm font-medium">
              {t("homePage.startMyJourney")}
            </span>
          </Link>

          <div className="mx-2 h-6 border-r border-emerald-300/40" />

          <Link
            href={`/welcome?role=${RoleValues.MANAGER}`}
            className="group flex items-center gap-2 rounded-full px-3 py-2 text-white transition-all duration-300 hover:bg-emerald-500/20"
          >
            <Image
              className="group-hover:animate-bounce"
              src={directorIcon}
              width={28}
              height={28}
              alt="Director icon"
            />
            <span className="px-2 text-sm font-medium">
              {t("homePage.createMyTeams")}
            </span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl"
        >
          <span className="bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent drop-shadow-2xl">
            {t("homePage.title")}
          </span>
        </motion.h1>

        {/* Descrição */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mb-12 max-w-4xl text-xl leading-relaxed font-light text-emerald-50/90 drop-shadow-lg md:text-2xl"
        >
          {t("homePage.description")}
        </motion.p>

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col items-center justify-center gap-6 sm:flex-row"
        >
          <Button
            size="lg"
            className="rounded-full border-0 bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-emerald-600 hover:to-teal-700 hover:shadow-emerald-500/30"
            asChild
          >
            <Link
              href="https://www.youtube.com/watch?v=joga-bola-project"
              target="_blank"
            >
              {t("common.knowMore")}
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-2 border-emerald-300/40 bg-white/10 px-8 py-4 text-lg font-semibold text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-emerald-300/60 hover:bg-emerald-500/20"
            asChild
          >
            <Link href="/video/B4UDYHG1Kag">
              <Play size={20} className="mr-2" />
              {t("homePage.watchVideo")}
            </Link>
          </Button>
        </motion.div>

        {/* Indicador de scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 transform"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex h-10 w-6 justify-center rounded-full border-2 border-emerald-300/60 backdrop-blur-sm"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-2 h-3 w-1 rounded-full bg-emerald-300/80"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// Componente para orbs flutuantes (reutilizar da partners-section)
const FloatingOrb = ({
  delay,
  size,
  position,
}: {
  delay: number;
  size: number;
  position: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      x: [0, Math.random() * 100 - 50],
      y: [0, Math.random() * 100 - 50],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 3,
    }}
    className={cn(
      "absolute rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-xl",
      position,
    )}
    style={{ width: size, height: size }}
  />
);

export default function Home() {
  const t = useTranslations();

  const mobileScreen = [
    {
      quote: t("store.screen1.quote"),
      name: t("store.screen1.name"),
      designation: t("store.screen1.designation"),
      src: "/assets/store/screen1.png",
    },
    {
      quote: t("store.screen2.quote"),
      name: t("store.screen2.name"),
      designation: t("store.screen2.designation"),
      src: "/assets/store/screen2.png",
    },
    {
      quote: t("store.screen3.quote"),
      name: t("store.screen3.name"),
      designation: t("store.screen3.designation"),
      src: "/assets/store/screen3.png",
    },
  ];

  return (
    <main className="relative">
      <HeroSection />

      {/* Seção Parceiros - Novo componente */}
      <PartnersSection />

      {/* Seção Demo App - Reformulada */}
      <section
        className={cn(
          "relative overflow-hidden py-24",
          "from-[#21005a] via-[#2b0071] to-[#21005a] dark:bg-gradient-to-br",
          "bg-white",
        )}
      >
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingOrb delay={0} size={180} position="top-20 right-10" />
          <FloatingOrb delay={1.5} size={120} position="top-40 left-20" />
          <FloatingOrb delay={3} size={100} position="bottom-20 right-1/4" />
          <FloatingOrb delay={4.5} size={140} position="bottom-40 left-1/3" />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4">
          {/* Header da seção */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-block text-sm font-semibold tracking-wider text-[#00cfb1] uppercase"
            >
              Demonstração
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
            >
              Experiência do Aplicativo
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto max-w-3xl text-lg leading-relaxed text-[#ba93ff]"
            >
              Descobre como o JogaBola vai transformar a tua experiência no
              futebol amador. Cada funcionalidade foi pensada para te ajudar a
              alcançar a glória.
            </motion.p>
          </motion.div>

          {/* Galeria de screenshots */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-[#00cfb1]/20 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-sm"
          >
            <AnimatedGallery view="mobile" gallerySources={mobileScreen} />
          </motion.div>
        </div>
      </section>

      {/* Seção Download App - Reformulada */}
      <section
        className={cn(
          "relative overflow-hidden py-24",
          "from-[#1a0b3d] via-[#2d1b69] to-[#1a0b3d] dark:bg-gradient-to-br",
          "bg-white",
        )}
      >
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingOrb delay={1} size={200} position="top-20 left-10" />
          <FloatingOrb delay={2.5} size={150} position="top-40 right-20" />
          <FloatingOrb delay={4} size={120} position="bottom-20 left-1/4" />
          <FloatingOrb delay={5.5} size={160} position="bottom-40 right-1/3" />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4">
          {/* Header da seção */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-block text-sm font-semibold tracking-wider text-[#00cfb1] uppercase"
            >
              Disponível Agora
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
            >
              {t("homePage.downloadAppTitle")}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto max-w-3xl text-lg leading-relaxed text-[#ba93ff]"
            >
              {t("homePage.downloadAppDescription")}
            </motion.p>
          </motion.div>

          {/* Botões de download */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center"
          >
            <motion.a
              href="https://apps.apple.com/app/id000000000"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("homePage.downloadOnAppStore")}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden rounded-2xl border border-[#00cfb1]/30 bg-gradient-to-r from-white/10 to-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#00cfb1]/60 hover:shadow-lg hover:shadow-[#00cfb1]/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00cfb1]/10 to-[#1effbf]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <AppleStore className="h-14 w-auto transition-transform duration-300 group-hover:scale-110" />
              </div>
            </motion.a>

            <motion.a
              href="https://play.google.com/store/apps/details?id=com.jogabola"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("homePage.downloadOnGooglePlay")}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden rounded-2xl border border-[#00cfb1]/30 bg-gradient-to-r from-white/10 to-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#00cfb1]/60 hover:shadow-lg hover:shadow-[#00cfb1]/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00cfb1]/10 to-[#1effbf]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <GooglePlay className="h-14 w-auto transition-transform duration-300 group-hover:scale-110" />
              </div>
            </motion.a>
          </motion.div>

          {/* Call to action adicional */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                href="/ecosystem"
                className="rounded-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] px-8 py-4 font-bold text-[#21005a] shadow-lg transition-all duration-300 hover:from-[#1effbf] hover:to-[#00cfb1] hover:shadow-xl hover:shadow-[#00cfb1]/25"
              >
                Explorar Ecossistema
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
