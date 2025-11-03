"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Calendar,
  MessageSquare,
  Play,
  Shield,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

// Background Pattern Component - Gradiente do mockup
const FieldPattern = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradiente base: azul claro top-left para verde claro bottom-right */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-cyan-50 to-emerald-100" />
    </div>
  );
};

// Hero Section - Estilo Mockup Exato
const HeroSection = () => {
  const t = useTranslations();

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
      <FieldPattern />

      {/* Container principal arredondado como no mockup */}
      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-blue-50/80 via-cyan-50/80 to-emerald-50/80 p-8 backdrop-blur-sm md:p-12 lg:p-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Content - Lado Esquerdo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Badge Versão 2.0 - Verde claro como no mockup */}
              <div className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5">
                <span className="text-sm font-medium text-emerald-700">
                  Versão 2.0
                </span>
              </div>

              {/* Title - Texto escuro, sem gradiente */}
              <h1 className="text-4xl leading-tight font-bold text-gray-900 md:text-5xl lg:text-6xl">
                Pronto para gerenciar seu{" "}
                <span className="text-gray-900">time dos sonhos?</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-gray-700 md:text-xl">
                Monte sua equipe profissional, defina táticas e domine o campo
                digital.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Button className="rounded-lg bg-emerald-500 px-6 py-5 text-base font-medium text-white shadow-md hover:bg-emerald-600 md:px-8 md:py-6 md:text-lg">
                  Iniciar Minha Jornada
                </Button>
                <Button
                  variant="outline"
                  className="group rounded-lg border-2 border-blue-300 bg-white px-6 py-5 text-base font-medium text-blue-500 hover:bg-blue-50 md:px-8 md:py-6 md:text-lg"
                >
                  <Play className="mr-2 h-5 w-5 fill-blue-500 transition-transform group-hover:scale-110" />
                  Ver Demonstração
                </Button>
              </div>

              {/* Trust indicators - Linha única */}
              <div className="flex items-center space-x-4 pt-2 text-sm text-gray-600">
                <span>Grátis para começar</span>
                <span className="text-gray-400">|</span>
                <span>Sem cartão</span>
              </div>
            </motion.div>

            {/* Illustration - Lado Direito - Tablet 3D */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Tablet Principal */}
              <div className="relative mx-auto max-w-md">
                {/* Tablet Frame */}
                <div className="relative rounded-2xl bg-white p-3 shadow-2xl">
                  {/* Screen */}
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                    {/* Header do app */}
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">
                        JogaBola
                      </h3>
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                      </div>
                    </div>

                    {/* Grid de cards/icons */}
                    <div className="grid grid-cols-3 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-lg bg-white shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Elementos flutuantes conectados */}
                {/* Profile Card 1 */}
                <motion.div
                  className="absolute top-8 -left-8 rounded-xl bg-white p-3 shadow-lg"
                  animate={{
                    y: [0, -8, 0],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400" />
                    <div className="h-2 w-12 rounded bg-gray-200" />
                  </div>
                </motion.div>

                {/* Profile Card 2 */}
                <motion.div
                  className="absolute top-16 -right-6 rounded-xl bg-white p-3 shadow-lg"
                  animate={{
                    y: [0, 8, 0],
                    rotate: [2, -2, 2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-400" />
                    <div className="h-2 w-12 rounded bg-gray-200" />
                  </div>
                </motion.div>

                {/* Document Icon */}
                <motion.div
                  className="absolute bottom-12 -left-4 rounded-lg bg-white p-2 shadow-lg"
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  <div className="h-6 w-6 rounded bg-blue-100" />
                </motion.div>

                {/* Chart Icon */}
                <motion.div
                  className="absolute -right-4 bottom-8 rounded-lg bg-white p-2 shadow-lg"
                  animate={{
                    y: [0, 6, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5,
                  }}
                >
                  <div className="h-6 w-6 rounded bg-emerald-100" />
                </motion.div>

                {/* Linhas conectando elementos (glow effect) */}
                <svg
                  className="pointer-events-none absolute inset-0"
                  viewBox="0 0 400 300"
                >
                  <line
                    x1="50"
                    y1="80"
                    x2="120"
                    y2="100"
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="320"
                    y1="120"
                    x2="280"
                    y2="100"
                    stroke="rgba(16, 185, 129, 0.3)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="85"
                    cy="85"
                    r="3"
                    fill="rgba(59, 130, 246, 0.5)"
                    className="animate-pulse"
                  />
                  <circle
                    cx="300"
                    cy="110"
                    r="3"
                    fill="rgba(16, 185, 129, 0.5)"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator - Bottom Center */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-gray-400"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Demo Section
const DemoSection = () => {
  const t = useTranslations();

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Demonstração do App
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Veja como é fácil gerenciar seu time e alcançar a vitória
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center">
              <Users className="mr-2 h-8 w-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">10.000+</span>
            </div>
            <p className="text-gray-600">Jogadores ativos</p>
          </div>
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center">
              <Trophy className="mr-2 h-8 w-8 text-yellow-500" />
              <span className="text-3xl font-bold text-gray-900">500+</span>
            </div>
            <p className="text-gray-600">Campeonatos</p>
          </div>
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center">
              <Star className="mr-2 h-8 w-8 text-emerald-500" />
              <span className="text-3xl font-bold text-gray-900">4.9</span>
            </div>
            <p className="text-gray-600">Avaliação média</p>
          </div>
        </div>

        {/* Device mockups */}
        <div className="relative">
          {/* Desktop */}
          <div className="relative mx-auto max-w-4xl">
            <div className="rounded-t-2xl bg-gray-900 px-4 py-2">
              <div className="flex space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="rounded-b-2xl border-x-4 border-b-4 border-gray-900 bg-white p-8">
              <div className="flex h-96 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                <Play className="h-16 w-16 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Mobile mockups */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-0 -left-8 w-48"
          >
            <div className="rounded-3xl bg-gray-900 p-2">
              <div className="h-80 rounded-2xl bg-white p-4">
                <div className="h-full rounded-xl bg-gradient-to-br from-gray-50 to-gray-100" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute -right-8 bottom-0 w-48"
          >
            <div className="rounded-3xl bg-gray-900 p-2">
              <div className="h-80 rounded-2xl bg-white p-4">
                <div className="h-full rounded-xl bg-gradient-to-br from-gray-50 to-gray-100" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "João Silva",
      role: "Treinador",
      rating: 5,
      text: "Melhor plataforma para gerenciar meu time!",
      avatar: "👨‍💼",
    },
    {
      name: "Maria Costa",
      role: "Capitã",
      rating: 5,
      text: "Agilidade e organização em um só lugar!",
      avatar: "👩‍💼",
    },
    {
      name: "Pedro Santos",
      role: "Jogador",
      rating: 5,
      text: "Mais tempo para focar no jogo!",
      avatar: "👨‍💼",
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Prova Social - Histórias de Sucesso
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center space-x-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-current text-yellow-500"
                  />
                ))}
              </div>
              <p className="mb-4 text-gray-600">"{testimonial.text}"</p>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "Gestão de Jogadores",
      description: "Perfis, estatísticas e disponibilidade",
    },
    {
      icon: Calendar,
      title: "Agenda Centralizada",
      description: "Treinos e jogos organizados",
    },
    {
      icon: Trophy,
      title: "Organização de Campeonatos",
      description: "Crie e gerencie torneios",
    },
    {
      icon: MessageSquare,
      title: "Comunicação",
      description: "Chat integrado com o time",
    },
    {
      icon: Shield,
      title: "Controle de Acesso",
      description: "Diferentes níveis de permissão",
    },
    {
      icon: Star,
      title: "Análise de Desempenho",
      description: "Estatísticas detalhadas",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Recursos Completos
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20">
      <div className="container mx-auto max-w-7xl px-4 text-center md:px-6">
        <h2 className="mb-4 text-4xl font-bold text-white">
          Pronto para começar?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
          Junte-se a milhares de times que já estão revolucionando sua gestão
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button className="bg-gradient-to-r from-emerald-500 to-green-500 px-8 py-6 text-lg text-white hover:from-emerald-600 hover:to-green-600">
            Criar Conta Grátis
          </Button>
          <Button
            variant="outline"
            className="border-2 border-white px-8 py-6 text-lg text-white hover:bg-white hover:text-gray-900"
          >
            Falar com Vendas
          </Button>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <main className="relative">
      <HeroSection />
      <DemoSection />
      <TestimonialsSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
