"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    Globe,
    Heart,
    Shield,
    Smartphone,
    Star,
    Target,
    Trophy,
    Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import Image from "next/image";

import ballMarketing from "@/assets//images/ball-marketing.svg";

// Componente da bola de futebol animada
const AnimatedFootball = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Bola de futebol principal */}
      <motion.div
        animate={{
          rotateY: 360,
          rotateX: [0, 15, -15, 0],
        }}
        transition={{
          rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
          rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative h-32 w-32 md:h-40 md:w-40 lg:h-52 lg:w-64"
      >
        {/* Base da bola */}
        <div className="relative h-full w-full overflow-hidden rounded-full bg-transparent">
          {/* Padrão hexagonal da bola */}
          <div className="absolute inset-0">
            <Image src={ballMarketing} alt="alt" fill />
            {/* Hexágonos pretos */}
            {/* <div className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rotate-45 transform rounded-sm bg-black" />
            <div className="absolute top-1/4 left-1/3 h-6 w-6 rotate-12 rounded-sm bg-black" />
            <div className="absolute top-3/4 right-1/3 h-6 w-6 -rotate-12 rounded-sm bg-black" />
            <div className="absolute bottom-1/4 left-1/4 h-5 w-5 rotate-45 rounded-sm bg-black" />
            <div className="absolute top-1/3 right-1/4 h-5 w-5 -rotate-45 rounded-sm bg-black" /> */}

            {/* Linhas curvas */}
            {/* <div className="absolute inset-0">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <path
                  d="M20,30 Q50,10 80,30"
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M20,70 Q50,90 80,70"
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M30,20 Q10,50 30,80"
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M70,20 Q90,50 70,80"
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </div> */}
          </div>

          {/* Brilho da bola */}
          <div className="absolute top-4 left-4 h-8 w-8 rounded-full bg-white/60 blur-sm" />
        </div>
      </motion.div>

      {/* Sombra da bola */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-8 h-6 w-24 rounded-full bg-black/20 blur-md md:h-8 md:w-32"
      />

      {/* Partículas ao redor */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, Math.cos((i * Math.PI) / 4) * 60, 0],
            y: [0, Math.sin((i * Math.PI) / 4) * 60, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute h-2 w-2 rounded-full bg-emerald-500"
        />
      ))}
    </div>
  );
};

// Componente de feature card
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="rounded-2xl border border-emerald-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-emerald-700/30 dark:bg-slate-800/80"
    >
      <div className="mb-4 flex items-center gap-4">
        <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-white">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-foreground text-xl font-bold">{title}</h3>
      </div>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
};

// Componente de estatística
const StatCard = ({
  number,
  label,
  delay,
}: {
  number: string;
  label: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center dark:border-emerald-700/30 dark:from-emerald-900/20 dark:to-teal-900/20"
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.8, delay: delay + 0.2, type: "spring" }}
        className="mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
      >
        {number}
      </motion.div>
      <div className="text-muted-foreground font-medium">{label}</div>
    </motion.div>
  );
};

export default function HowItWorksPage() {
  const t = useTranslations();

  const features = [
    {
      icon: Users,
      title: "Conectar Comunidades",
      description:
        "Unimos jogadores, treinadores, clubes e fãs numa plataforma única que fortalece o ecossistema do futebol amador.",
    },
    {
      icon: Smartphone,
      title: "Tecnologia Inteligente",
      description:
        "Ferramentas avançadas de gestão, análise de performance e organização de competições ao alcance de todos.",
    },
    {
      icon: Target,
      title: "Desenvolvimento de Talentos",
      description:
        "Identificamos e desenvolvemos talentos através de um sistema de scouting e formação personalizada.",
    },
    {
      icon: Globe,
      title: "Alcance Global",
      description:
        "Expandimos oportunidades além das fronteiras locais, conectando talentos a clubes e competições internacionais.",
    },
    {
      icon: BarChart3,
      title: "Análise de Performance",
      description:
        "Dados detalhados e insights que ajudam jogadores e equipas a melhorar continuamente o seu desempenho.",
    },
    {
      icon: Shield,
      title: "Ambiente Seguro",
      description:
        "Plataforma segura e confiável que protege dados e promove fair play em todas as interações.",
    },
  ];

  const stats = [
    { number: "+", label: "Jogadores Ativos" },
    { number: "+", label: "Clubes Parceiros" },
    { number: "+", label: "Países" },
    { number: "+", label: "Jogos Organizados" },
  ];

  return (
    <main className="bg-background relative">
      {/* Hero Section */}
      <section className="from-background dark:from-background relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br via-emerald-50/30 to-teal-50/20 px-4 py-20 dark:via-emerald-900/10 dark:to-teal-900/10">
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-200/15 blur-2xl" />
          <div className="absolute right-20 bottom-20 h-40 w-40 rounded-full bg-gradient-to-r from-teal-300/15 to-emerald-300/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 h-24 w-24 rounded-full bg-gradient-to-r from-emerald-400/10 to-teal-400/10 blur-xl" />
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Conteúdo textual */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4 inline-block text-sm font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400"
              >
                {t("menu.howItWorks")}
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-4xl leading-tight font-bold text-transparent md:text-6xl lg:text-7xl"
              >
                Democratizando o Futebol
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-8 text-xl leading-relaxed"
              >
                Transformamos o futebol de base, amador e de bairro numa
                poderosa cadeia de talentos, bem-estar e saúde através de
                ferramentas inteligentes e acessíveis.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
                >
                  Começar Agora
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border-2 border-emerald-600 px-8 py-4 font-semibold text-emerald-600 transition-all duration-300 hover:bg-emerald-600 hover:text-white"
                >
                  Saber Mais
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Animação da bola */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex justify-center lg:justify-end"
            >
              <AnimatedFootball />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Seção Missão */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-20 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-8 text-4xl font-bold md:text-5xl">
              Nossa Missão
            </h2>
            <p className="mx-auto max-w-4xl text-xl leading-relaxed opacity-90 md:text-2xl">
              Profissionalizar e democratizar o futebol amador, oferecendo
              ferramentas poderosas que transformam paixão em oportunidade,
              talento em carreira, e comunidades em ecossistemas prósperos de
              desenvolvimento desportivo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Seção Como Funciona */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Como Transformamos o Futebol
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
              Através de tecnologia avançada e uma abordagem centrada na
              comunidade, criamos um ecossistema completo para o desenvolvimento
              do futebol.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Seção Estatísticas */}
      {/* <section className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 px-4 py-20 dark:from-emerald-900/10 dark:to-teal-900/10">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Impacto Global
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
              Números que demonstram como estamos a revolucionar o futebol
              amador em todo o mundo.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                number={stat.number}
                label={stat.label}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section> */}

      {/* Seção Objetivos */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                Nossos Objetivos
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">Democratização</h3>
                    <p className="text-muted-foreground">
                      Tornar ferramentas profissionais acessíveis a todos os
                      níveis do futebol amador.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-lg bg-teal-100 p-2 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">
                      Profissionalização
                    </h3>
                    <p className="text-muted-foreground">
                      Elevar os padrões de organização e gestão no futebol de
                      base e amador.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">Bem-estar</h3>
                    <p className="text-muted-foreground">
                      Promover saúde física e mental através do desporto e da
                      comunidade.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-3xl border border-emerald-200/50 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8 dark:border-emerald-700/30">
                <div className="text-center">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <Star className="h-10 w-10" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold">Visão 2030</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Ser a plataforma líder mundial na gestão e desenvolvimento
                    do futebol amador, conectando milhões de jogadores e criando
                    oportunidades em todos os continentes.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-20 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Junta-te à Revolução
            </h2>
            <p className="mb-8 text-xl leading-relaxed opacity-90">
              Faz parte da transformação do futebol amador. Juntos, vamos criar
              um futuro onde cada talento tem a oportunidade de brilhar.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button className="rounded-full bg-white px-10 py-4 font-bold text-emerald-600 shadow-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-xl">
                Começar Agora
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
