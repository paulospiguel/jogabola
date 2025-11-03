"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Activity,
  Calendar,
  Clock,
  MapPin,
  Play,
  Plus,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

export default function ArenaPage() {
  const t = useTranslations("arena");

  const stats = [
    {
      title: t("stats.matchesPlayed"),
      value: "24",
      change: "+12%",
      icon: Trophy,
    },
    {
      title: t("stats.activeTeams"),
      value: "3",
      change: "+1",
      icon: Users,
    },
    {
      title: t("stats.upcomingMatches"),
      value: "5",
      change: t("stats.thisWeek"),
      icon: Calendar,
    },
    {
      title: t("stats.winRate"),
      value: "68%",
      change: "+5%",
      icon: TrendingUp,
    },
  ];

  const upcomingMatches = [
    {
      id: 1,
      title: "Pelada do Final de Semana",
      date: "Sáb, 02 Nov",
      time: "16:00",
      location: "Arena Central",
      players: "8/10",
      status: "confirmed",
    },
    {
      id: 2,
      title: "Rachão da Galera",
      date: "Dom, 03 Nov",
      time: "09:00",
      location: "Quadra Vila Nova",
      players: "6/12",
      status: "pending",
    },
    {
      id: 3,
      title: "Amistoso Mensal",
      date: "Seg, 04 Nov",
      time: "19:30",
      location: "Campo do Parque",
      players: "10/10",
      status: "confirmed",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "win",
      text: "Vitória 5-3 contra Time Rival",
      time: "Há 2 dias",
    },
    {
      id: 2,
      type: "win",
      text: "João Silva entrou no seu time",
      time: "Há 3 dias",
    },
    {
      id: 3,
      type: "loss",
      text: "Derrota 2-4 contra Veteranos FC",
      time: "Há 5 dias",
    },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
  };

  const MotionCard = motion(Card);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]" />
        <div className="absolute top-32 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-[#24ffe6]/12 blur-[120px]" />
        <div className="absolute bottom-16 right-20 h-80 w-80 rounded-full bg-[#02a7ff]/12 blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-[#1effbf]/12 blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-10 md:px-8 lg:px-12">
        <motion.section
          className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_35px_80px_-45px_rgba(36,255,230,0.8)] backdrop-blur-xl"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#24ffe6]/60 to-transparent" />
          <div className="absolute top-1/2 -right-24 h-72 w-72 -translate-y-1/2 rounded-full bg-[#24ffe6]/15 blur-[120px]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6fffe9]">
                {t("header.subtitle")}
              </span>
              <h1 className="text-3xl font-semibold text-white md:text-4xl">
                {t("header.title")}
              </h1>
              <p className="max-w-xl text-base text-slate-200/85">
                {t("header.description")}
              </p>
            </div>
            <Button
              size="lg"
              className="group min-w-[180px] bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#24ffe6]/90"
            >
              <Plus className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              {t("actions.newMatch")}
            </Button>
          </div>
        </motion.section>

        <motion.section
          className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.08, delayChildren: 0.12 }}
        >
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <MotionCard
                key={stat.title}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#24ffe6]/45"
              >
                <div className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-[#24ffe6]/15 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-white/90">
                    {stat.title}
                  </CardTitle>
                  <div className="rounded-full border border-white/10 bg-white/10 p-2.5 shadow">
                    <Icon className="h-5 w-5 text-[#6fffe9]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    <span className="bg-gradient-to-br from-[#24ffe6] to-[#02a7ff] bg-clip-text text-transparent">
                      {stat.value}
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#6fffe9]">
                    {stat.change}
                  </p>
                </CardContent>
              </MotionCard>
            );
          })}
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.section
            className="lg:col-span-2"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <MotionCard className="overflow-hidden border border-white/10 bg-white/6 shadow-2xl backdrop-blur-xl">
              <CardHeader className="relative border-b border-white/10">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="rounded-full border border-white/10 bg-white/10 p-2 shadow">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-[#24ffe6] to-[#02a7ff] bg-clip-text font-bold text-transparent">
                    {t("matches.title")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {upcomingMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      variants={fadeUp}
                      initial="initial"
                      animate="animate"
                      transition={{ duration: 0.45, delay: index * 0.1 }}
                      className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#24ffe6]/35"
                    >
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#24ffe6] to-[#02a7ff]" />
                      <div className="flex-1 pl-4">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-base font-semibold text-white shadow">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-white/90">
                            {match.title}
                          </h3>
                          <Badge
                            className={
                              match.status === "confirmed"
                                ? "border-0 bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)]"
                                : "border border-white/15 bg-white/10 text-white/75"
                            }
                          >
                            {match.status === "confirmed"
                              ? t("matches.status.confirmed")
                              : t("matches.status.pending")}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-200/80">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-[#6fffe9]" />
                            {match.date}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-[#6fffe9]" />
                            {match.time}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-[#6fffe9]" />
                            {match.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-[#6fffe9]" />
                            <span className="font-semibold text-white">
                              {match.players}
                            </span>
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24ffe6]/90"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <Button className="mt-6 w-full bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24ffe6]/90">
                  {t("matches.viewAll")}
                </Button>
              </CardContent>
            </MotionCard>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.55, delay: 0.3 }}
          >
            <MotionCard className="overflow-hidden border border-white/10 bg-white/6 shadow-2xl backdrop-blur-xl">
              <CardHeader className="relative border-b border-white/10">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="rounded-full border border-white/10 bg-white/10 p-2 shadow">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-[#24ffe6] to-[#02a7ff] bg-clip-text font-bold text-transparent">
                    {t("activity.title")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      variants={fadeUp}
                      initial="initial"
                      animate="animate"
                      transition={{ duration: 0.45, delay: index * 0.12 }}
                      className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#24ffe6]/35"
                    >
                      <div
                        className={`rounded-full bg-gradient-to-br p-2 shadow ${
                          activity.type === "win"
                            ? "from-[#24ffe6] to-[#02a7ff]"
                            : "from-red-400 to-pink-500"
                        }`}
                      >
                        {activity.type === "win" ? (
                          <Trophy className="h-4 w-4 text-white" />
                        ) : (
                          <Target className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-relaxed text-white/90">
                          {activity.text}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-300/75">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </MotionCard>
          </motion.section>
        </div>

        <motion.section
          className="mt-10"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.55, delay: 0.4 }}
        >
          <MotionCard className="overflow-hidden border border-white/10 bg-white/6 shadow-2xl backdrop-blur-xl">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="bg-gradient-to-r from-[#24ffe6] to-[#02a7ff] bg-clip-text text-2xl font-bold text-transparent">
                {t("actions.quickActions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: t("actions.scheduleMatch"), icon: Calendar },
                  { label: t("actions.inviteFriends"), icon: Users },
                  { label: t("actions.createTournament"), icon: Trophy },
                  { label: t("actions.viewStats"), icon: TrendingUp },
                ].map(({ label, icon: Icon }, index) => (
                  <motion.div
                    key={label}
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                  >
                    <Button
                      variant="outline"
                      className="group h-auto w-full flex-col gap-3 border-white/20 bg-white/8 py-6 text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#24ffe6]/50 hover:bg-[#24ffe6]/15"
                    >
                      <div className="rounded-full border border-white/10 bg-white/10 p-3 shadow transition-transform group-hover:scale-110">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-semibold text-white">{label}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </MotionCard>
        </motion.section>
      </div>
    </div>
  );
}
