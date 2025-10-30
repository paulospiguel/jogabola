"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const stats = [
    {
      title: "Partidas Jogadas",
      value: "24",
      change: "+12%",
      icon: Trophy,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/10 to-green-600/10",
    },
    {
      title: "Times Ativos",
      value: "3",
      change: "+1",
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/10",
    },
    {
      title: "Próximas Partidas",
      value: "5",
      change: "Esta semana",
      icon: Calendar,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-500/10 to-pink-600/10",
    },
    {
      title: "Taxa de Vitória",
      value: "68%",
      change: "+5%",
      icon: TrendingUp,
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-500/10 to-amber-600/10",
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

  return (
    <div className="relative flex flex-col overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 h-64 w-64 animate-pulse rounded-full bg-linear-to-r from-emerald-400/20 to-teal-400/10 blur-3xl dark:from-emerald-900/30 dark:to-blue-900/20" />
        <div className="absolute right-32 bottom-40 h-80 w-80 animate-pulse rounded-full bg-linear-to-r from-teal-400/20 to-emerald-400/10 blur-3xl delay-1000 dark:from-blue-900/30 dark:to-emerald-900/20" />
        <div className="absolute top-1/2 left-1/3 h-72 w-72 animate-pulse rounded-full bg-linear-to-r from-emerald-400/10 to-teal-400/20 blur-3xl delay-2000 dark:from-slate-900/40 dark:to-emerald-900/20" />
      </div>

      <div className="relative container mx-auto p-4 md:p-6 lg:p-8">
        {/* Welcome Section with Glass Morphism */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-lg backdrop-blur-xl dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-slate-800/40 dark:shadow-black/40">
          {/* Football Pattern Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-8 h-16 w-16 rounded-full border-4 border-emerald-500 dark:border-emerald-700" />
            <div className="absolute top-12 right-16 h-12 w-12 rounded-full border-4 border-teal-500 dark:border-blue-700" />
            <div className="absolute bottom-8 left-24 h-20 w-20 rounded-full border-4 border-emerald-500 dark:border-emerald-700" />
            <div className="absolute right-32 bottom-4 h-10 w-10 rounded-full border-4 border-teal-500 dark:border-blue-700" />
          </div>

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl dark:from-emerald-400 dark:to-blue-400">
                Bem-vindo de volta! ⚽
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Confira suas estatísticas e próximas partidas
              </p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white shadow-xl hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-700 dark:to-blue-700 dark:shadow-emerald-900/50 dark:hover:from-emerald-600 dark:hover:to-blue-600"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Partida
            </Button>
          </div>
        </div>

        {/* Stats Grid with Glass Morphism */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="relative overflow-hidden border border-slate-200 bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-slate-800/40 dark:hover:shadow-emerald-900/30"
              >
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`rounded-full bg-gradient-to-br p-2.5 ${stat.gradient} shadow-lg`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold">
                    <span
                      className={`bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming Matches */}
          <Card className="border border-slate-200 bg-white/80 shadow-2xl backdrop-blur-xl lg:col-span-2 dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-slate-800/40 dark:shadow-black/40">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-2 shadow-lg dark:from-emerald-700 dark:to-blue-700">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text font-bold text-transparent dark:from-emerald-400 dark:to-blue-400">
                  Próximas Partidas
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {upcomingMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className="group relative flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700/50 dark:bg-gradient-to-r dark:from-slate-800/50 dark:to-slate-900/30 dark:hover:shadow-emerald-900/20"
                  >
                    {/* Field line decoration */}
                    <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-blue-600" />

                    <div className="flex-1 pl-3">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white shadow-lg dark:from-emerald-700 dark:to-blue-700">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          {match.title}
                        </h3>
                        <Badge
                          className={
                            match.status === "confirmed"
                              ? "border-0 bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-white shadow-md dark:from-emerald-700 dark:to-blue-700"
                              : "border border-slate-300 bg-slate-200 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          }
                        >
                          {match.status === "confirmed"
                            ? "✓ Confirmada"
                            : "⏳ Pendente"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                          {match.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Clock className="h-4 w-4 text-teal-600 dark:text-blue-500" />
                          {match.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                          {match.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Users className="h-4 w-4 text-teal-600 dark:text-blue-500" />
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {match.players}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white shadow-lg hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-700 dark:to-blue-700 dark:hover:from-emerald-600 dark:hover:to-blue-600"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white shadow-lg hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-700 dark:to-blue-700 dark:shadow-emerald-900/30 dark:hover:from-emerald-600 dark:hover:to-blue-600">
                Ver Todas as Partidas
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-slate-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-slate-800/40 dark:shadow-black/40">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700/50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-2 shadow-lg dark:from-emerald-700 dark:to-blue-700">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text font-bold text-transparent dark:from-emerald-400 dark:to-blue-400">
                  Atividade Recente
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all duration-300 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:shadow-emerald-900/20"
                  >
                    <div
                      className={`rounded-full bg-gradient-to-br p-2 ${
                        activity.type === "win"
                          ? "from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700"
                          : "from-red-400 to-pink-500 dark:from-red-600 dark:to-pink-700"
                      } shadow-lg`}
                    >
                      {activity.type === "win" ? (
                        <Trophy className="h-4 w-4 text-white" />
                      ) : (
                        <Target className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="leading-relaxed font-medium text-slate-800 dark:text-slate-200">
                        {activity.text}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions with Glass Morphism */}
        <Card className="mt-6 overflow-hidden border border-slate-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-slate-800/40 dark:shadow-black/40">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700/50">
            <CardTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent dark:from-emerald-400 dark:to-blue-400">
              ⚡ Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button
                className="group h-auto flex-col gap-3 border border-slate-200 bg-slate-50/50 py-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/30 dark:hover:shadow-emerald-900/30"
                variant="outline"
              >
                <div className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-lg transition-transform group-hover:scale-110 dark:from-emerald-700 dark:to-blue-700">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Agendar Partida
                </span>
              </Button>
              <Button
                className="group h-auto flex-col gap-3 border border-slate-200 bg-slate-50/50 py-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/30 dark:hover:shadow-emerald-900/30"
                variant="outline"
              >
                <div className="rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 p-3 shadow-lg transition-transform group-hover:scale-110 dark:from-blue-700 dark:to-emerald-700">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Convidar Amigos
                </span>
              </Button>
              <Button
                className="group h-auto flex-col gap-3 border border-slate-200 bg-slate-50/50 py-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/30 dark:hover:shadow-emerald-900/30"
                variant="outline"
              >
                <div className="rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 p-3 shadow-lg transition-transform group-hover:scale-110 dark:from-emerald-700 dark:via-green-800 dark:to-blue-700">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Criar Torneio
                </span>
              </Button>
              <Button
                className="group h-auto flex-col gap-3 border border-slate-200 bg-slate-50/50 py-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/30 dark:hover:shadow-emerald-900/30"
                variant="outline"
              >
                <div className="rounded-full bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 p-3 shadow-lg transition-transform group-hover:scale-110 dark:from-blue-700 dark:via-emerald-700 dark:to-green-800">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Ver Estatísticas
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
