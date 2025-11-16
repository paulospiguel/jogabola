"use client";

import { getProfileData } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPositionConfig, getPositionLabel } from "@/constants/positions";
import { useSession } from "@/lib/auth-client";
import { Experience } from "@/schemas/profile";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const nextMatch = {
  label: "Próximo jogo",
  datetime: "Dom 10/11 — 19:30",
  location: "Arena Centenário",
};

const quickStats = [
  {
    title: "Jogos disputados",
    value: "24",
    icon: Trophy,
    progress: 75, // 24/32 jogos possíveis
    maxValue: 32,
  },
  // {
  //   title: "Gols",
  //   value: "18",
  //   icon: Goal,
  //   progress: 60, // 18/30 gols meta
  //   maxValue: 30,
  // },
  // {
  //   title: "Assistências",
  //   value: "11",
  //   icon: Target,
  //   progress: 55, // 11/20 assistências meta
  //   maxValue: 20,
  // },
  {
    title: "Nota média",
    value: "8.7",
    icon: TrendingUp,
    progress: 87, // 8.7/10
    maxValue: 10,
  },
];

const achievements = [
  { emoji: "🔥", title: "Hat-trick Hero", description: "3 gols no mesmo jogo" },
  {
    emoji: "🎯",
    title: "100 passes certos",
    description: "Precisão máxima em 4 partidas",
  },
  {
    emoji: "🛡️",
    title: "MVP defensivo",
    description: "Domínio total do meio-campo",
  },
];

const feedUpdates = [
  "⚽ Lucas marcou 3 gols no treino de ontem.",
  "🔥 Nova partida marcada para domingo!",
  "🧠 Review tático liberado para a equipe.",
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

interface ProfileData {
  name: string;
  fullName: string;
  greeting: string;
  position: string;
  image: string | null;
  level: number;
  experience: string;
  customFields: Record<string, any>;
}

export default function PlayZonePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado para controlar visibilidade de painéis secundários
  const [showAchievements, setShowAchievements] = useState(true);
  const [showInsights, setShowInsights] = useState(true);
  const [showFeed, setShowFeed] = useState(true);
  const [showActions, setShowActions] = useState(true);

  // Buscar dados do perfil
  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const result = await getProfileData(session.user.id);
        if (result.success && result.data) {
          setProfileData({
            name: result.data.name,
            fullName: result.data.name,
            greeting: "Olá, seja bem-vindo ao Jogabola!",
            position: result.data.customFields?.position || "",
            image: session?.user?.image || null,
            level: result.data.level || 1,
            experience: result.data.experience || "",
            customFields: result.data.customFields || {},
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [session]);

  // Mapear experiência para labels
  const experienceLabels: Record<string, string> = {
    beginner: "Iniciante",
    intermediate: "Intermediário",
    advanced: "Avançado",
    professional: "Profissional",
  };

  // Calcular dados do jogador
  const player = useMemo(() => {
    const userName = session?.user?.name || profileData?.name || "Jogador";
    const firstName = userName.split(" ")[0];

    // Buscar posição dos customFields (definida no onboarding)
    const positionValue = profileData?.customFields?.position as string;
    const positionLabel = getPositionLabel(positionValue);

    // Buscar experiência (nível)
    const experienceValue = profileData?.experience as string;
    const experienceLabel = experienceValue
      ? experienceLabels[experienceValue] || experienceValue
      : null;

    // Combinação: posição + experiência (se houver)
    const positionDisplay = positionLabel || experienceLabel || "Jogador";

    return {
      name: firstName,
      fullName: userName || profileData?.name || "Jogador",
      greeting: `👋 Olá, ${firstName}!`,
      subtitle: `Pronto para o próximo jogo?`,
      position: positionDisplay,
      positionValue: positionValue,
      image: session?.user?.image || null,
      level: profileData?.level,
      experience: profileData?.experience as Experience,
      experienceLabel: experienceLabel,
    };
  }, [session, profileData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050312] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#6fffe9] border-t-transparent" />
          <p className="text-text-secondary">Carregando sua jornada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050312] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />

      <main className="container mx-auto px-4 py-12 md:px-8 lg:px-12">
        {/* Header */}
        <motion.header
          className="mb-12 flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur-xl md:p-8 lg:flex-row lg:items-center lg:justify-between"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-3">
            <p className="text-2xl tracking-[0.35em] text-[#6fffe9] uppercase">
              Play Zone
            </p>
            <h2 className="text-2xl font-semibold text-white md:text-3xl lg:text-[34px]">
              {player.greeting}
            </h2>
            <h3 className="text-text-secondary text-lg">{player.subtitle}</h3>
          </div>

          <div className="flex flex-col items-end gap-2 text-sm text-slate-200">
            {(() => {
              const positionConfig = getPositionConfig(player.positionValue);
              const PositionIcon = positionConfig?.icon;
              return (
                <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/15 px-3 py-1 text-xs font-medium tracking-wide text-white/80 uppercase">
                  {positionConfig?.emoji && (
                    <span className="text-sm">{positionConfig.emoji}</span>
                  )}
                  {PositionIcon && (
                    <PositionIcon className="h-3.5 w-3.5 text-[#00cfb1]" />
                  )}
                  {player.position}
                </span>
              );
            })()}
            {player.experienceLabel && (
              <span className="flex items-center text-sm text-[#6fffe9]">
                {player.experienceLabel}
              </span>
            )}
            <span className="flex items-center gap-2 text-sm text-[#6fffe9]">
              <Star className="h-4 w-4" /> Nível {player.level}
            </span>
          </div>
        </motion.header>

        {/* Layout principal com hierarquia clara */}
        <div className="space-y-8">
          {/* Seção principal: Próximo jogo (destaque máximo) */}
          <motion.section
            className="relative overflow-hidden rounded-3xl border-2 border-[#24ffe6]/50 bg-gradient-to-br from-[#0b1933] via-[#0c213d] to-[#081326] p-8 shadow-[0_35px_80px_-45px_rgba(36,255,230,0.8)] sm:p-10"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <div className="pointer-events-none absolute -top-14 -right-14 h-48 w-48 rounded-full bg-[#24ffe6]/20 blur-3xl" />
            <div className="relative z-10">
              <div className="text-text-secondary mb-4 flex flex-wrap items-center gap-4 text-base">
                <div className="text-text-primary flex items-center gap-2 font-medium">
                  <CalendarDays className="text-neon-primary h-5 w-5" />
                  {nextMatch.datetime}
                </div>
                <div className="text-text-primary flex items-center gap-2 font-medium">
                  <MapPin className="text-neon-primary h-5 w-5" />
                  {nextMatch.location}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                {nextMatch.label}
              </h2>
              <p className="text-text-secondary mt-3 text-lg leading-relaxed">
                Confirme presença e garanta sua vaga no time titular. Chegue 30
                minutos antes para aquecimento e briefing tático.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="group bg-neon-secondary hover:bg-neon-secondary/90 min-w-[200px] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(36,255,230,1)]"
                >
                  Confirmar presença
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="hover:border-neon-secondary/60 hover:bg-neon-secondary/15 border-2 border-white/25 bg-white/10 text-white backdrop-blur transition-all duration-300"
                >
                  Ver detalhes
                </Button>
              </div>
            </div>
          </motion.section>

          {/* Grid principal: Estatísticas + Sidebar */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              {/* Estatísticas rápidas - Destaque secundário */}
              <motion.section
                className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur-xl"
                variants={fadeUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.45, delay: 0.12 }}
              >
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-xl font-bold text-white">
                    Estatísticas rápidas
                  </h3>
                  <span className="text-neon-primary text-sm font-medium tracking-[0.25em] uppercase">
                    Atualizado em tempo real
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {quickStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.title}
                        className="group hover:border-neon-secondary/50 relative flex min-h-[180px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-transform duration-300 hover:-translate-y-1"
                        variants={fadeUp}
                        initial="initial"
                        animate="animate"
                        transition={{
                          duration: 0.45,
                          delay: index * 0.12 + 0.12,
                        }}
                      >
                        {/* Ícone no canto superior direito */}
                        <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#6fffe9]/40 bg-transparent">
                          <Icon className="h-5 w-5 text-[#6fffe9]" />
                        </div>

                        {/* Conteúdo */}
                        <div className="mt-0 flex flex-1 flex-col justify-between">
                          {/* Título */}
                          <p className="mb-4 text-[10px] leading-tight font-semibold tracking-[0.15em] text-[#6fffe9] uppercase">
                            {stat.title.split(" ").map((word, i) => (
                              <span key={i}>
                                {word}
                                {i < stat.title.split(" ").length - 1 && <br />}
                              </span>
                            ))}
                          </p>

                          {/* Valor numérico */}
                          <div className="mb-4 flex items-baseline gap-1">
                            <p className="text-2xl leading-none font-bold text-white">
                              {stat.value}
                            </p>
                            {stat.maxValue && (
                              <span className="text-sm leading-none font-medium text-white/60">
                                / {stat.maxValue}
                              </span>
                            )}
                          </div>

                          {/* Barra de progresso e porcentagem */}
                          <div className="mt-auto space-y-2">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-[#6fffe9] to-[#00d4ff]"
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.progress}%` }}
                                transition={{
                                  duration: 0.8,
                                  delay: index * 0.1 + 0.3,
                                  ease: "easeOut",
                                }}
                              />
                            </div>
                            <p className="text-right text-sm font-medium text-white">
                              {stat.progress}%
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <Link
                  href="/playzone/stats"
                  className="group hover:text-neon-primary mt-2 flex w-full items-center justify-end text-right no-underline"
                >
                  <span className="group-hover:text-neon-primary text-sm font-medium text-white transition-colors">
                    Ver todas as estatísticas
                  </span>
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.section>

              {/* Conquistas - Painel colapsável */}
              <motion.section
                className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur-xl"
                variants={fadeUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.45, delay: 0.18 }}
              >
                <button
                  onClick={() => setShowAchievements(!showAchievements)}
                  className="mb-4 flex w-full items-center justify-between text-left"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Conquistas recentes
                    </h3>
                    <span className="text-text-secondary text-sm">
                      Últimas 4 semanas
                    </span>
                  </div>
                  {showAchievements ? (
                    <ChevronUp className="text-neon-primary h-5 w-5" />
                  ) : (
                    <ChevronDown className="text-neon-primary h-5 w-5" />
                  )}
                </button>
                {showAchievements && (
                  <div className="grid gap-4 md:grid-cols-3">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.title}
                        className="relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/12 via-white/6 to-white/12 p-5"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.45,
                          delay: index * 0.12 + 0.18,
                        }}
                        whileHover={{ scale: 1.03 }}
                      >
                        <motion.div
                          className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#24ffe6]/25 to-transparent opacity-0 blur-2xl"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                        <div className="relative flex items-start gap-3">
                          <span className="text-3xl">{achievement.emoji}</span>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {achievement.title}
                            </p>
                            <p className="text-text-secondary mt-1 text-sm">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>

              {/* Insights - Painel colapsável */}
              <motion.section
                className="border-neon-primary/30 relative overflow-hidden rounded-3xl border bg-gradient-to-r from-[#091530] via-[#0d1f45] to-[#14265c] p-6 sm:p-7"
                variants={fadeUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <button
                  onClick={() => setShowInsights(!showInsights)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-neon-primary/20 text-neon-primary rounded-full p-3">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Insight do treinador virtual
                      </h3>
                      {showInsights && (
                        <p className="text-text-secondary mt-2 text-base leading-relaxed">
                          Seu desempenho melhorou{" "}
                          <strong className="text-neon-primary">15%</strong> nas
                          últimas 4 semanas. Mantenha o foco nos passes
                          verticais: eles renderam{" "}
                          <strong className="text-neon-primary">
                            8 assistências
                          </strong>{" "}
                          e abriram 12 oportunidades claras.
                        </p>
                      )}
                    </div>
                  </div>
                  {showInsights ? (
                    <ChevronUp className="text-neon-primary h-5 w-5 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="text-neon-primary h-5 w-5 flex-shrink-0" />
                  )}
                </button>
              </motion.section>
            </div>

            {/* Sidebar - Painéis secundários */}
            <div className="space-y-6">
              {/* Feed da equipe - Painel colapsável */}
              <motion.section
                className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur"
                variants={fadeUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.45, delay: 0.2 }}
              >
                <button
                  onClick={() => setShowFeed(!showFeed)}
                  className="mb-4 flex w-full items-center justify-between text-left"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Feed da equipe
                    </h3>
                    <p className="text-neon-primary text-sm tracking-[0.3em] uppercase">
                      Últimos eventos
                    </p>
                  </div>
                  {showFeed ? (
                    <ChevronUp className="text-neon-primary h-5 w-5" />
                  ) : (
                    <ChevronDown className="text-neon-primary h-5 w-5" />
                  )}
                </button>
                {showFeed && (
                  <div className="space-y-4">
                    {feedUpdates.map((update, index) => (
                      <motion.button
                        key={update}
                        className="group w-full rounded-2xl border border-white/12 bg-white/10 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#24ffe6]/40 hover:bg-[#24ffe6]/10"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.12 + 0.25,
                        }}
                      >
                        <p className="text-base font-medium text-white">
                          {update}
                        </p>
                        <div className="text-text-secondary mt-2 flex items-center gap-2 text-sm">
                          <Clock
                            className="text-neon-primary h-4 w-4"
                            aria-hidden="true"
                          />
                          <span>Atualizado há {index + 1}h</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.section>

              {/* Chamadas de ação - Painel colapsável */}
              <motion.section
                className="space-y-4"
                variants={fadeUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.45, delay: 0.42 }}
              >
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="mb-4 flex w-full items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-white">
                    Ações rápidas
                  </h3>
                  {showActions ? (
                    <ChevronUp className="text-neon-primary h-5 w-5" />
                  ) : (
                    <ChevronDown className="text-neon-primary h-5 w-5" />
                  )}
                </button>
                {showActions && (
                  <>
                    <Card className="overflow-hidden rounded-3xl border border-[#24ffe6]/25 bg-gradient-to-br from-[#042d39] to-[#081b2d] p-1">
                      <CardContent className="relative rounded-[26px] border border-white/10 bg-[#050c1f]/85 p-6">
                        <div className="absolute top-1/2 -right-16 h-40 w-40 -translate-y-1/2 rounded-full bg-[#24ffe6]/30 blur-2xl" />
                        <div className="relative flex items-start gap-3 text-left">
                          <Trophy className="mt-1 h-6 w-6 text-[#24ffe6]" />
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              Avaliar colegas do último jogo
                            </h3>
                            <p className="text-text-secondary mt-2 text-base">
                              Libere recompensas da equipe deixando feedback
                              sobre o desempenho.
                            </p>
                            <Button className="mt-4 bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_20px_50px_-28px_rgba(36,255,230,0.9)] transition-all hover:-translate-y-0.5 hover:bg-[#24ffe6]/90">
                              Começar avaliação
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-3xl border border-white/12 bg-white/8">
                      <CardContent className="flex flex-col gap-4 p-6">
                        <div className="flex items-center gap-3 text-left">
                          <Target className="text-neon-primary h-6 w-6" />
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              Explorar desafios semanais
                            </h3>
                            <p className="text-text-secondary pt-1 text-base">
                              Complete missões especiais e suba no ranking da
                              PlayZone.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-neon-primary hover:bg-neon-primary/10 justify-start gap-2"
                        >
                          Ver desafios disponíveis
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}
              </motion.section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
