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
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-emerald-50/60 via-white to-sky-50 text-slate-900 transition-colors dark:from-[#050312] dark:via-[#080a25] dark:to-[#0f163f] dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-200/30 via-white to-sky-200/20 dark:bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(56,189,248,0.15)_0%,rgba(255,255,255,0)_72%)] dark:bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]" />
        <div className="absolute top-32 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-[120px] dark:bg-[#24ffe6]/12" />
        <div className="absolute bottom-16 right-20 h-80 w-80 rounded-full bg-sky-200/40 blur-[120px] dark:bg-[#02a7ff]/12" />
        <div className="absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-lime-200/40 blur-[120px] dark:bg-[#1effbf]/12" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-10 md:px-8 lg:px-12">
        <motion.section
          className="relative mb-10 overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/90 p-8 text-slate-800 shadow-[0_35px_80px_-45px_rgba(16,185,129,0.35)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_35px_80px_-45px_rgba(36,255,230,0.8)]"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent dark:via-[#24ffe6]/60" />
          <div className="absolute top-1/2 -right-24 h-72 w-72 -translate-y-1/2 rounded-full bg-emerald-200/40 blur-[120px] dark:bg-[#24ffe6]/15" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6fffe9]">
                {t("header.subtitle")}
              </span>
              <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl dark:text-white">
                {t("header.title")}
              </h1>
              <p className="max-w-xl text-base text-slate-600 dark:text-slate-200/85">
                {t("header.description")}
              </p>
            </div>
            <Button
              size="lg"
              className="group min-w-[180px] bg-emerald-500 font-semibold text-white shadow-[0_16px_45px_-20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-600 dark:bg-[#24ffe6] dark:text-slate-900 dark:shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] dark:hover:bg-[#24ffe6]/90"
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
                className="group relative overflow-hidden rounded-2xl border border-emerald-100/70 bg-white text-slate-800 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/70 hover:shadow-[0_20px_50px_-30px_rgba(16,185,129,0.35)] dark:border-white/10 dark:bg-white/6 dark:text-white dark:hover:border-[#24ffe6]/45"
              >
                <div className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-[#24ffe6]/15" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 dark:text-white/90">
                    {stat.title}
                  </CardTitle>
                  <div className="rounded-full border border-emerald-100/70 bg-emerald-50/80 p-2.5 shadow dark:border-white/10 dark:bg-white/10">
                    <Icon className="h-5 w-5 text-emerald-500 dark:text-[#6fffe9]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    <span className="bg-linear-to-br from-emerald-500 to-sky-500 bg-clip-text text-transparent dark:from-[#24ffe6] dark:to-[#02a7ff]">
                      {stat.value}
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-500 dark:text-[#6fffe9]">
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
            <MotionCard className="overflow-hidden border border-emerald-100/70 bg-white shadow-2xl backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/6">
              <CardHeader className="relative border-b border-emerald-100/70 dark:border-white/10">
                <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-white">
                  <div className="rounded-full border border-emerald-100/70 bg-emerald-50/80 p-2 shadow dark:border-white/10 dark:bg-white/10">
                    <Calendar className="h-5 w-5 text-emerald-500 dark:text-white" />
                  </div>
                  <span className="bg-linear-to-r from-emerald-500 to-sky-500 bg-clip-text font-bold text-transparent dark:from-[#24ffe6] dark:to-[#02a7ff]">
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
                      className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-emerald-100/70 bg-white p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 dark:border-white/10 dark:bg-white/6 dark:hover:border-[#24ffe6]/35"
                    >
                      <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-emerald-500 to-sky-500 dark:from-[#24ffe6] dark:to-[#02a7ff]" />
                      <div className="flex-1 pl-4">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100/70 bg-emerald-50/80 text-base font-semibold text-emerald-600 shadow dark:border-white/10 dark:bg-white/10 dark:text-white">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white/90">
                            {match.title}
                          </h3>
                          <Badge
                            className={
                              match.status === "confirmed"
                                ? "border-0 bg-emerald-500 font-semibold text-white shadow-[0_16px_45px_-20px_rgba(16,185,129,0.45)] dark:bg-[#24ffe6] dark:text-slate-900 dark:shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)]"
                                : "border border-emerald-100 bg-emerald-50/80 text-emerald-600 dark:border-white/15 dark:bg-white/10 dark:text-white/75"
                            }
                          >
                            {match.status === "confirmed"
                              ? t("matches.status.confirmed")
                              : t("matches.status.pending")}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 dark:text-slate-200/80">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-emerald-500 dark:text-[#6fffe9]" />
                            {match.date}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-emerald-500 dark:text-[#6fffe9]" />
                            {match.time}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-emerald-500 dark:text-[#6fffe9]" />
                            {match.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-emerald-500 dark:text-[#6fffe9]" />
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {match.players}
                            </span>
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-emerald-500 font-semibold text-white shadow-[0_16px_45px_-20px_rgba(16,185,129,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 dark:bg-[#24ffe6] dark:text-slate-900 dark:shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] dark:hover:bg-[#24ffe6]/90"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <Button className="mt-6 w-full bg-emerald-500 font-semibold text-white shadow-[0_16px_45px_-20px_rgba(16,185,129,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 dark:bg-[#24ffe6] dark:text-slate-900 dark:shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] dark:hover:bg-[#24ffe6]/90">
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
            <MotionCard className="overflow-hidden border border-emerald-100/70 bg-white shadow-2xl backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/6">
              <CardHeader className="relative border-b border-emerald-100/70 dark:border-white/10">
                <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-white">
                  <div className="rounded-full border border-emerald-100/70 bg-emerald-50/80 p-2 shadow dark:border-white/10 dark:bg-white/10">
                    <Activity className="h-5 w-5 text-emerald-500 dark:text-white" />
                  </div>
                  <span className="bg-linear-to-r from-emerald-500 to-sky-500 bg-clip-text font-bold text-transparent dark:from-[#24ffe6] dark:to-[#02a7ff]">
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
                      className="group flex items-start gap-4 rounded-2xl border border-emerald-100/70 bg-white p-4 backdrop-blur-xl transition-all duration-300 hover:border-emerald-400 dark:border-white/10 dark:bg-white/6 dark:hover:border-[#24ffe6]/35"
                    >
                      <div
                        className={`rounded-full bg-gradient-to-br p-2 shadow ${
                          activity.type === "win"
                            ? "from-emerald-500 to-sky-500 dark:from-[#24ffe6] dark:to-[#02a7ff]"
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
                        <p className="text-base font-semibold leading-relaxed text-text-primary">
                          {activity.text}
                        </p>
                        <p className="mt-2 text-sm font-medium text-text-secondary">
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
          <MotionCard className="overflow-hidden border border-emerald-100/70 bg-white shadow-2xl backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/6">
            <CardHeader className="border-b border-emerald-100/70 dark:border-white/10">
              <CardTitle className="bg-linear-to-r from-emerald-500 to-sky-500 bg-clip-text text-2xl font-bold text-transparent dark:from-[#24ffe6] dark:to-[#02a7ff]">
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
                      className="group h-auto w-full flex-col gap-3 border-emerald-100/70 bg-white py-6 text-slate-700 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:bg-emerald-50/80 dark:border-white/20 dark:bg-white/8 dark:text-white dark:hover:border-[#24ffe6]/50 dark:hover:bg-[#24ffe6]/15"
                    >
                      <div className="rounded-full border border-emerald-100/70 bg-emerald-50/80 p-3 shadow transition-transform group-hover:scale-110 dark:border-white/10 dark:bg-white/10">
                        <Icon className="h-6 w-6 text-emerald-500 dark:text-white" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {label}
                      </span>
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
