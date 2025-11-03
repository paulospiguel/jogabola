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
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,#24ffe6_0%,rgba(36,255,230,0)_70%)] blur-3xl opacity-60" />
        <div className="absolute right-24 bottom-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,#00f0ff_0%,rgba(0,240,255,0)_70%)] blur-3xl opacity-60" />
        <div className="absolute top-1/2 left-1/3 h-52 w-52 rounded-full bg-[radial-gradient(circle,#1effbf_0%,rgba(30,255,191,0)_70%)] blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
        {/* Welcome Section with Glass Morphism */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/8 bg-white/5 p-8 backdrop-blur shadow-[0_35px_80px_-45px_rgba(36,255,230,0.8)]">
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 bg-gradient-to-r from-[#24ffe6] to-[#02a7ff] bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                Bem-vindo de volta! ⚽
              </h1>
              <p className="text-lg text-slate-200/80">
                Confira suas estatísticas e próximas partidas
              </p>
            </div>
            <Button
              size="lg"
              className="group min-w-[180px] bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#24ffe6]/90"
            >
              <Plus className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
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
                className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#24ffe6]/25"
              >
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-white/90">
                    {stat.title}
                  </CardTitle>
                  <div className="rounded-full border border-white/10 bg-white/10 p-2.5 shadow">
                    <Icon className="h-5 w-5 text-[#6fffe9]" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold">
                    <span className="bg-gradient-to-br from-[#24ffe6] to-[#02a7ff] bg-clip-text text-transparent">
                      {stat.value}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#6fffe9]">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming Matches */}
          <Card className="border border-white/8 bg-white/5 shadow-2xl backdrop-blur lg:col-span-2">
            <CardHeader className="border-b border-white/8">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="rounded-full border border-white/10 bg-white/10 p-2 shadow">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-[#24ffe6] to-[#02a7ff] bg-clip-text font-bold text-transparent">
                  Próximas Partidas
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {upcomingMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className="group relative flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#24ffe6]/25"
                  >
                    {/* Field line decoration */}
                    <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-[#24ffe6] to-[#02a7ff]" />

                    <div className="flex-1 pl-3">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 font-bold text-white shadow">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-bold text-white/90">
                          {match.title}
                        </h3>
                        <Badge
                          className={
                            match.status === "confirmed"
                              ? "border-0 bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)]"
                              : "border border-white/10 bg-white/10 text-white/80"
                          }
                        >
                          {match.status === "confirmed"
                            ? "✓ Confirmada"
                            : "⏳ Pendente"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5 text-slate-200/80">
                          <Calendar className="h-4 w-4 text-[#6fffe9]" />
                          {match.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-200/80">
                          <Clock className="h-4 w-4 text-[#6fffe9]" />
                          {match.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-200/80">
                          <MapPin className="h-4 w-4 text-[#6fffe9]" />
                          {match.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-200/80">
                          <Users className="h-4 w-4 text-[#6fffe9]" />
                          <span className="font-semibold text-white">
                            {match.players}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24ffe6]/90"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button className="mt-6 w-full bg-[#24ffe6] font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24ffe6]/90">
                Ver Todas as Partidas
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-white/8 bg-white/5 shadow-2xl backdrop-blur">
            <CardHeader className="border-b border-white/8">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="rounded-full border border-white/10 bg-white/10 p-2 shadow">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-[#24ffe6] to-[#02a7ff] bg-clip-text font-bold text-transparent">
                  Atividade Recente
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="group flex items-start gap-4 rounded-xl border border-white/8 bg-white/5 p-4 backdrop-blur transition-all duration-300 hover:border-[#24ffe6]/25"
                  >
                    <div
                      className={`rounded-full bg-gradient-to-br p-2 ${
                        activity.type === "win"
                          ? "from-[#24ffe6] to-[#02a7ff]"
                          : "from-red-400 to-pink-500"
                      } shadow`}
                    >
                      {activity.type === "win" ? (
                        <Trophy className="h-4 w-4 text-white" />
                      ) : (
                        <Target className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="leading-relaxed font-medium text-white/90">
                        {activity.text}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-300/70">
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
        <Card className="mt-6 overflow-hidden border border-white/8 bg-white/5 shadow-2xl backdrop-blur">
          <CardHeader className="border-b border-white/8">
            <CardTitle className="bg-gradient-to-r from-[#24ffe6] to-[#02a7ff] bg-clip-text text-2xl font-bold text-transparent">
              ⚡ Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button
                className="group h-auto flex-col gap-3 border-white/25 bg-white/10 py-6 text-white backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#24ffe6]/60 hover:bg-[#24ffe6]/15"
                variant="outline"
              >
                <div className="rounded-full border border-white/10 bg-white/10 p-3 shadow transition-transform group-hover:scale-110">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-white">
                  Agendar Partida
                </span>
              </Button>
              <Button
                className="group h-auto flex-col gap-3 border-white/25 bg-white/10 py-6 text-white backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#24ffe6]/60 hover:bg-[#24ffe6]/15"
                variant="outline"
              >
                <div className="rounded-full border border-white/10 bg-white/10 p-3 shadow transition-transform group-hover:scale-110">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-white">
                  Convidar Amigos
                </span>
              </Button>
              <Button
                className="group h-auto flex-col gap-3 border-white/25 bg-white/10 py-6 text-white backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#24ffe6]/60 hover:bg-[#24ffe6]/15"
                variant="outline"
              >
                <div className="rounded-full border border-white/10 bg-white/10 p-3 shadow transition-transform group-hover:scale-110">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-white">
                  Criar Torneio
                </span>
              </Button>
              <Button
                className="group h-auto flex-col gap-3 border-white/25 bg-white/10 py-6 text-white backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#24ffe6]/60 hover:bg-[#24ffe6]/15"
                variant="outline"
              >
                <div className="rounded-full border border-white/10 bg-white/10 p-3 shadow transition-transform group-hover:scale-110">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-white">
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
