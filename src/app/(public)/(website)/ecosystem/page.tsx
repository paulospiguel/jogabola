"use client";

import { FieldSoccer } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  ExternalLink,
  Globe,
  Smartphone,
  Trophy,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface EcosystemApp {
  id: string;
  icon: React.ElementType;
  status: "launched" | "coming-soon" | "beta";
  url?: string;
  category: "mobile" | "web" | "platform";
  features: string[];
}

const ecosystemApps: EcosystemApp[] = [
  {
    id: "jogabola-timer",
    icon: FieldSoccer,
    status: "beta",
    category: "mobile",
    features: ["Timer", "Cronômetro", "Contador", "Relógio"],
  },
  {
    id: "jogabola-mobile",
    icon: Smartphone,
    status: "coming-soon",
    category: "mobile",
    features: [
      "Encontrar equipas",
      "Reservar campos",
      "Chat em tempo real",
      "Estatísticas",
    ],
  },
  {
    id: "jogabola-web",
    icon: Globe,
    status: "coming-soon",
    url: "/",
    category: "web",
    features: [
      "Dashboard completo",
      "Gestão de equipas",
      "Calendário",
      "Relatórios",
    ],
  },

  {
    id: "jogabola-academy",
    icon: Trophy,
    status: "coming-soon",
    category: "platform",
    features: [
      "Treinos personalizados",
      "Vídeo análise",
      "Progressão",
      "Certificados",
    ],
  },
  {
    id: "jogabola-manager",
    icon: BarChart3,
    status: "coming-soon",
    category: "web",
    features: [
      "Análise táctica",
      "Relatórios detalhados",
      "Gestão de plantel",
      "Scouting",
    ],
  },
  {
    id: "jogabola-events",
    icon: Calendar,
    status: "coming-soon",
    category: "platform",
    features: ["Criação de torneios", "Inscrições", "Brackets", "Transmissões"],
  },
];

const categoryIcons = {
  mobile: "📱",
  web: "🌐",
  platform: "⚡",
};

export default function EcosystemPage() {
  const t = useTranslations("ecosystemPage");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      launched: {
        label: t("status.launched"),
        variant: "default" as const,
        className: "bg-emerald-500 hover:bg-emerald-600 text-white",
      },
      beta: {
        label: t("status.beta"),
        variant: "secondary" as const,
        className: "bg-orange-500 hover:bg-orange-600 text-white",
      },
      "coming-soon": {
        label: t("status.comingSoon"),
        variant: "outline" as const,
        className:
          "bg-slate-500 hover:bg-slate-600 text-white border-slate-400",
      },
    };
    return configs[status as keyof typeof configs];
  };

  return (
    <main className="bg-background relative mt-12">
      {/* Hero Section */}
      <section className="from-background dark:from-background relative overflow-hidden bg-gradient-to-br via-emerald-50/30 to-teal-50/20 px-4 py-20 dark:via-emerald-900/10 dark:to-teal-900/10">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-200/15 blur-2xl" />
          <div className="absolute right-20 bottom-20 h-40 w-40 rounded-full bg-gradient-to-r from-teal-300/15 to-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h1 className="mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              {t("title")}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
              {t("subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="from-background to-muted/30 bg-gradient-to-b px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {ecosystemApps.map(app => {
              const isComingSoon = app.status === "coming-soon";
              const statusInfo = getStatusConfig(app.status);

              return (
                <motion.div
                  key={app.id}
                  variants={cardVariants}
                  className="group relative"
                >
                  <Card
                    className={cn(
                      "h-full border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl dark:bg-slate-900/80 dark:hover:border-emerald-700",
                      isComingSoon && "opacity-70 hover:opacity-90",
                    )}
                  >
                    {/* Coming Soon Ribbon */}
                    {isComingSoon && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="rotate-12 transform rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                          {t("status.comingSoon")}
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 p-3 text-emerald-600 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400">
                            <app.icon className="h-6 w-6" />
                          </div>
                          <span className="text-2xl">
                            {categoryIcons[app.category]}
                          </span>
                        </div>
                        <Badge
                          variant={statusInfo.variant}
                          className={statusInfo.className}
                        >
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <CardTitle className="mb-2 text-xl text-slate-800 dark:text-slate-100">
                        {t(`apps.${app.id}.name`)}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {t(`apps.${app.id}.description`)}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 text-sm font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-300">
                            Funcionalidades
                          </h4>
                          <ul className="space-y-1">
                            {app.features.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                              >
                                <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {app.url && app.status === "launched" && (
                          <Button
                            className="group w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                            onClick={() => window.open(app.url, "_blank")}
                          >
                            Aceder
                            <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        )}

                        {app.status === "beta" && (
                          <Button
                            variant="outline"
                            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                            disabled
                          >
                            Acesso Beta
                          </Button>
                        )}

                        {isComingSoon && (
                          <Button
                            variant="outline"
                            className="w-full border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400"
                            disabled
                          >
                            Brevemente Disponível
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="from-muted/30 to-background bg-gradient-to-br px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-emerald-200/30 bg-gradient-to-r from-emerald-50/80 to-teal-50/60 p-8 backdrop-blur-sm md:p-12 dark:border-emerald-700/30 dark:from-emerald-900/20 dark:to-teal-900/15"
          >
            <h2 className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              {t("cta.description")}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 text-lg text-white hover:from-emerald-600 hover:to-teal-700"
              >
                {t("cta.startNow")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-emerald-300 px-8 text-lg text-emerald-600 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
              >
                {t("cta.learnMore")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
