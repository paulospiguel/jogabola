"use client";

import { getProfileData } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Settings,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const nextMatch = {
  label: "Próximo jogo",
  datetime: "Dom 10/11 — 19:30",
  location: "Arena Centenário",
};

const quickStats = [
  { title: "Jogos disputados", value: "24" },
  { title: "Gols", value: "18" },
  { title: "Assistências", value: "11" },
  { title: "Nota média", value: "8.7" },
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

  // Mapear posições para labels
  const positionLabels: Record<string, string> = {
    goalkeeper: "Guarda-Redes",
    defender: "Defesa",
    midfielder: "Médio",
    forward: "Avançado",
    versatile: "Polivalente",
  };

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
    const positionLabel = positionValue
      ? positionLabels[positionValue] || positionValue
      : "Jogador";

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
      greeting: `👋 Olá, ${firstName}! Pronto para o próximo jogo?`,
      position: positionDisplay,
      image: session?.user?.image || null,
      level: profileData?.level,
    };
  }, [session, profileData]);

  // Calcular tempo de atualização (mockado por enquanto)
  const lastUpdated = useMemo(() => {
    if (!session?.user) return "2h";
    // TODO: calcular tempo real da última atualização
    return "2h";
  }, [session]);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050312] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#6fffe9] border-t-transparent" />
          <p className="text-slate-400">Carregando sua jornada...</p>
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
            <p className="text-xs tracking-[0.35em] text-[#6fffe9] uppercase">
              Centro da jornada do jogador
            </p>
            <h1 className="text-2xl font-semibold text-white md:text-3xl lg:text-[34px]">
              {player.greeting}
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1 text-xs font-medium tracking-wide text-white/80 uppercase">
                {player.position}
              </span>
              <span className="flex items-center gap-2 text-sm text-[#6fffe9]">
                <Star className="h-4 w-4" /> Nível {player.level}
              </span>
            </div>
          </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-4 rounded-xl p-2 transition-all hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#6fffe9]/40 focus-visible:outline-none">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[#6fffe9]/30 blur-xl" />
                  <Avatar className="relative h-16 w-16 border-2 border-[#6fffe9]/80 shadow-[0_0_35px_rgba(111,255,233,0.35)]">
                    <AvatarImage
                      src={player.image || undefined}
                      alt={player.fullName}
                    />
                    <AvatarFallback className="bg-[#101b46] text-lg font-semibold text-[#6fffe9]">
                      {player.name[0]?.toUpperCase() || "J"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-left text-sm">
                  <p className="font-medium text-white">{player.fullName}</p>
                  <p className="text-xs text-slate-400 lowercase first-letter:uppercase">
                    {player.position}
                  </p>
                </div>
              </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
              className="w-56 border-white/10 bg-[#0b1933]/95 text-white backdrop-blur"
              >
                <DropdownMenuLabel className="text-white">
                  Minha Conta
                </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10"
                  onClick={() => router.push("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10">
                <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10">
                <Trophy className="mr-2 h-4 w-4" />
                  Estatísticas
                </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="cursor-pointer text-red-400 hover:bg-white/10 focus:bg-white/10"
                onClick={handleSignOut}
              >
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {/* Próximo jogo */}
            <motion.section
              className="relative overflow-hidden rounded-3xl border border-[#24ffe6]/35 bg-gradient-to-br from-[#0b1933] via-[#0c213d] to-[#081326] p-6 shadow-[0_35px_80px_-45px_rgba(36,255,230,0.8)] sm:p-8"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              <div className="pointer-events-none absolute -top-14 -right-14 h-48 w-48 rounded-full bg-[#24ffe6]/20 blur-3xl" />
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
                <div className="flex items-center gap-2 text-white">
                  <CalendarDays className="h-5 w-5 text-[#6fffe9]" />
                  {nextMatch.datetime}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#6fffe9]" />
                  {nextMatch.location}
          </div>
        </div>
              <h2 className="mt-5 text-2xl font-semibold text-white">
                {nextMatch.label}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Confirme presença e garanta sua vaga no time titular. Chegue 30
                minutos antes para aquecimento e briefing tático.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="group min-w-[180px] bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#24ffe6]/90">
                  Confirmar presença
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white backdrop-blur transition-all duration-300 hover:border-[#24ffe6]/60 hover:bg-[#24ffe6]/15"
                >
                  Ver detalhes
                </Button>
              </div>
            </motion.section>

            {/* Estatísticas rápidas */}
            <section>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Estatísticas rápidas
                </h3>
                <span className="text-xs tracking-[0.25em] text-[#6fffe9] uppercase">
                  Atualizado em tempo real
                </span>
        </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quickStats.map((stat, index) => (
                  <motion.div
                key={stat.title}
                    className="group rounded-2xl border border-white/8 bg-white/6 p-5 backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:border-[#24ffe6]/50"
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 0.45, delay: index * 0.12 + 0.12 }}
                  >
                    <p className="text-xs tracking-[0.3em] text-slate-400 uppercase">
                    {stat.title}
                  </p>
                    <p className="mt-3 text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                    <div className="mt-4 h-1.5 w-full rounded-full bg-white/10">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-[#24ffe6] to-[#02a7ff] opacity-80" />
                    </div>
                  </motion.div>
                ))}
                    </div>
            </section>

            {/* Conquistas */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Conquistas recentes</h3>
                <span className="text-xs text-slate-400">
                  Últimas 4 semanas
                        </span>
                      </div>
              <div className="grid gap-4 md:grid-cols-3">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    className="relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/12 via-white/6 to-white/12 p-5"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, delay: index * 0.12 + 0.18 }}
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
                        <p className="mt-1 text-xs text-slate-300">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                      ))}
                    </div>
            </section>

            {/* Insights */}
            <motion.section
              className="relative overflow-hidden rounded-3xl border border-[#6fffe9]/30 bg-gradient-to-r from-[#091530] via-[#0d1f45] to-[#14265c] p-6 sm:p-7"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="absolute top-1/2 -left-16 h-48 w-48 -translate-y-1/2 rounded-full bg-[#6fffe9]/18 blur-3xl" />
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[#6fffe9]/20 p-3 text-[#6fffe9]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Insight do treinador virtual
                  </h3>
                  <p className="mt-2 text-sm text-slate-200">
                    Seu desempenho melhorou{" "}
                    <strong className="text-[#6fffe9]">15%</strong> nas últimas
                    4 semanas. Mantenha o foco nos passes verticais: eles
                    renderam{" "}
                    <strong className="text-[#6fffe9]">8 assistências</strong> e
                    abriram 12 oportunidades claras.
                  </p>
            </div>
            </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Feed da equipe */}
            <motion.section
              className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white">
                Feed da equipe
              </h3>
              <p className="text-xs tracking-[0.3em] text-[#6fffe9] uppercase">
                Últimos eventos
              </p>
              <div className="mt-5 space-y-4">
                {feedUpdates.map((update, index) => (
                  <motion.button
                    key={update}
                    className="group w-full rounded-2xl border border-white/12 bg-white/10 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#24ffe6]/40 hover:bg-[#24ffe6]/10"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.12 + 0.25 }}
                  >
                    <p className="text-sm text-white">{update}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-[#6fffe9]" />
                      Atualizado há {index + 1}h
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.section>

            {/* Chamadas de ação */}
            <motion.section
              className="space-y-4"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.45, delay: 0.42 }}
            >
              <Card className="overflow-hidden rounded-3xl border border-[#24ffe6]/25 bg-gradient-to-br from-[#042d39] to-[#081b2d] p-1">
                <CardContent className="relative rounded-[26px] border border-white/10 bg-[#050c1f]/85 p-6">
                  <div className="absolute top-1/2 -right-16 h-40 w-40 -translate-y-1/2 rounded-full bg-[#24ffe6]/30 blur-2xl" />
                  <div className="relative flex items-start gap-3 text-left">
                    <Trophy className="mt-1 h-6 w-6 text-[#24ffe6]" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Avaliar colegas do último jogo
                      </h3>
                      <p className="mt-2 text-sm text-slate-300">
                        Libere recompensas da equipe deixando feedback sobre o
                        desempenho.
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
                    <Target className="h-6 w-6 text-[#6fffe9]" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Explorar desafios semanais
                      </h3>
                      <p className="pt-1 text-sm text-slate-300">
                        Complete missões especiais e suba no ranking da
                        PlayZone.
                      </p>
                    </div>
                  </div>
                <Button
                    variant="ghost"
                    className="justify-start gap-2 text-[#6fffe9] hover:bg-[#6fffe9]/10"
                >
                    Ver desafios disponíveis
                    <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}
