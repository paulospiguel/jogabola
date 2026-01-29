"use client";

import { motion } from "framer-motion";
import { CheckCircle, Globe, Handshake, Sparkles, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { partners, partnersByCategory } from "@/constants/partners";
import { cn } from "@/lib/utils";
import type { Partner, PartnerCategory } from "@/types/partners";

interface PartnersSectionProps {
  className?: string;
}

const categoryStyles = {
  premium: {
    container:
      "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200/50 dark:border-amber-700/30",
    logo: "grayscale-0 scale-110",
    badge: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
  },
  official: {
    container:
      "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-700/30",
    logo: "grayscale-0 scale-105",
    badge: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
  },
  supporter: {
    container:
      "bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200/50 dark:border-slate-700/30",
    logo: "grayscale hover:grayscale-0",
    badge: "bg-gradient-to-r from-slate-500 to-gray-500 text-white",
  },
};

const PartnerCard = ({
  partner,
  index,
}: {
  partner: Partner;
  index: number;
}) => {
  const styles = categoryStyles[partner.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.05,
        y: -5,
        transition: { duration: 0.2 },
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 hover:shadow-xl",
        styles.container,
      )}
    >
      {/* Badge de categoria */}
      <div
        className={cn(
          "absolute top-3 right-3 rounded-full px-2 py-1 text-xs font-semibold tracking-wider uppercase",
          styles.badge,
        )}
      >
        {partner.category}
      </div>

      {/* Logo do parceiro */}
      <div className="flex h-24 items-center justify-center">
        <Image
          src={partner.logo}
          alt={`${partner.name} logo`}
          width={120}
          height={80}
          className={cn(
            "object-contain transition-all duration-500 group-hover:scale-110",
            styles.logo,
          )}
        />
      </div>

      {/* Nome do parceiro */}
      <div className="mt-4 text-center">
        <h3 className="text-foreground/80 group-hover:text-foreground font-semibold transition-colors">
          {partner.name}
        </h3>
      </div>

      {/* Efeito de hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
};

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

// Componente para o estado vazio
const EmptyPartnersState = () => {
  const t = useTranslations();

  const features = [
    { icon: Globe, text: "Visibilidade global na nossa plataforma" },
    { icon: Users, text: "Acesso a uma comunidade apaixonada" },
    { icon: Sparkles, text: "Oportunidades de co-criação de conteúdo" },
    { icon: CheckCircle, text: "Impacto real no desenvolvimento do futebol" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mx-auto max-w-4xl text-center"
    >
      {/* Ícone central com animação */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="relative mx-auto mb-8 h-32 w-32"
      >
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] opacity-20" />
        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-gradient-to-r from-[#2b0071] to-[#21005a]">
          <Sparkles className="h-12 w-12 text-[#00cfb1]" />
        </div>
      </motion.div>

      {/* Título principal */}
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent md:text-4xl"
      >
        Em Busca de Parceiros Visionários
      </motion.h3>

      {/* Descrição */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12 text-lg leading-relaxed text-[#ba93ff]"
      >
        Estamos numa fase emocionante de crescimento e procuramos parceiros que
        partilhem a nossa paixão por transformar o mundo do futebol amador.
        Juntos, podemos criar oportunidades únicas e revolucionar o desporto que
        tanto amamos.
      </motion.p>

      {/* Lista de benefícios */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center gap-4 rounded-xl border border-[#00cfb1]/20 bg-gradient-to-r from-[#2b0071]/20 to-[#21005a]/20 p-4 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf]">
                <Icon className="h-5 w-5 text-[#21005a]" />
              </div>
              <span className="font-medium text-white">{feature.text}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Botão de call-to-action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block"
      >
        <Link
          href="/become-partner"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] px-8 py-4 font-bold text-[#21005a] shadow-lg transition-all duration-300 hover:from-[#1effbf] hover:to-[#00cfb1] hover:shadow-xl hover:shadow-[#00cfb1]/25"
        >
          <Handshake className="mr-2 h-5 w-5" />
          {t("homePage.partnersSection.makePartner")}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default function PartnersSection({ className }: PartnersSectionProps) {
  const t = useTranslations();

  const hasPartners = partners.length > 0;

  const groupedPartners = hasPartners
    ? partnersByCategory
    : ({} as Record<PartnerCategory, Partner[]>);

  const categoryOrder: PartnerCategory[] = ["premium", "official", "supporter"];
  const categoryTitles = {
    premium: "Parceiros Premium",
    official: "Parceiros Oficiais",
    supporter: "Apoiantes",
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden py-24",
        // Usando as cores do designer.md
        "from-[#21005a] via-[#2b0071] to-[#21005a] dark:bg-gradient-to-br",
        "bg-white",
        className,
      )}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb delay={0} size={200} position="top-20 left-10" />
        <FloatingOrb delay={1} size={150} position="top-40 right-20" />
        <FloatingOrb delay={2} size={100} position="bottom-20 left-1/4" />
        <FloatingOrb delay={3} size={120} position="bottom-40 right-1/3" />
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
            {t("homePage.sponsors")}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
          >
            Nossos Parceiros
          </motion.h2>

          {hasPartners && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto max-w-3xl text-lg leading-relaxed text-[#ba93ff]"
            >
              Juntos, estamos a revolucionar o futebol amador com o apoio de
              marcas que acreditam na nossa visão.
            </motion.p>
          )}
        </motion.div>

        {/* Conteúdo condicional */}
        {hasPartners ? (
          <>
            {/* Grid de parceiros por categoria */}
            <div className="space-y-16">
              {categoryOrder.map(category => {
                const categoryPartners = groupedPartners[category];
                if (!categoryPartners?.length) return null;

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Título da categoria */}
                    <motion.h3
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                      className="mb-8 text-center text-2xl font-bold text-white"
                    >
                      {categoryTitles[category]}
                    </motion.h3>

                    {/* Grid de parceiros */}
                    <div
                      className={cn(
                        "grid gap-6",
                        category === "premium"
                          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                          : category === "official"
                            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                            : "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
                      )}
                    >
                      {categoryPartners.map((partner, index) => (
                        <PartnerCard
                          key={`${category}-${partner.name}`}
                          partner={partner}
                          index={index}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Call to action para parceiros existentes */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-16 text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link
                  href="/become-partner"
                  className="rounded-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] px-8 py-4 font-bold text-[#21005a] shadow-lg transition-all duration-300 hover:from-[#1effbf] hover:to-[#00cfb1] hover:shadow-xl hover:shadow-[#00cfb1]/25"
                >
                  {t("homePage.becomePartner")}
                </Link>
              </motion.div>
            </motion.div>
          </>
        ) : (
          <EmptyPartnersState />
        )}
      </div>
    </section>
  );
}
