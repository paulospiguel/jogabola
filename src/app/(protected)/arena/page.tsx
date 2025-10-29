"use client";

import ArenaFooter from "@/components/arena/arena-footer";
import ArenaHeader from "@/components/arena/arena-header";
import ArenaSidebar from "@/components/arena/arena-sidebar";
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
import { useState } from "react";

export default function ArenaPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="relative flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 dark:from-[#020817] dark:via-[#0a1628] dark:to-[#020817]">
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/10 dark:from-emerald-900/30 dark:to-blue-900/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-32 h-80 w-80 rounded-full bg-gradient-to-r from-teal-400/20 to-emerald-400/10 dark:from-blue-900/30 dark:to-emerald-900/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 h-72 w-72 rounded-full bg-gradient-to-r from-emerald-400/10 to-teal-400/20 dark:from-slate-900/40 dark:to-emerald-900/20 blur-3xl animate-pulse delay-2000" />
      </div>
      
      <ArenaHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <ArenaSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="relative flex-1 md:ml-64 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {/* Welcome Section with Glass Morphism */}
            <div className="relative mb-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-slate-800/40 p-8 backdrop-blur-xl overflow-hidden shadow-lg dark:shadow-black/40">
              {/* Football Pattern Background */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 left-8 h-16 w-16 rounded-full border-4 border-emerald-500 dark:border-emerald-700" />
                <div className="absolute top-12 right-16 h-12 w-12 rounded-full border-4 border-teal-500 dark:border-blue-700" />
                <div className="absolute bottom-8 left-24 h-20 w-20 rounded-full border-4 border-emerald-500 dark:border-emerald-700" />
                <div className="absolute bottom-4 right-32 h-10 w-10 rounded-full border-4 border-teal-500 dark:border-blue-700" />
              </div>
              
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Bem-vindo de volta! ⚽
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300 text-lg">
                    Confira suas estatísticas e próximas partidas
                  </p>
                </div>
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 text-white hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-blue-600 font-bold shadow-xl dark:shadow-emerald-900/50">
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Partida
                </Button>
              </div>
            </div>

            {/* Stats Grid with Glass Morphism */}
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="relative overflow-hidden border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-slate-800/40 backdrop-blur-xl hover:shadow-2xl dark:hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {stat.title}
                      </CardTitle>
                      <div className={`rounded-full p-2.5 bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-3xl font-bold">
                        <span className={`bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                          {stat.value}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Upcoming Matches */}
              <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-slate-800/40 backdrop-blur-xl shadow-2xl dark:shadow-black/40">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700/50">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="rounded-full p-2 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 shadow-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent font-bold">
                      Próximas Partidas
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {upcomingMatches.map((match, index) => (
                      <div
                        key={match.id}
                        className="group relative flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-xl dark:hover:shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 bg-slate-50/50 dark:bg-gradient-to-r dark:from-slate-800/50 dark:to-slate-900/30 backdrop-blur-sm"
                      >
                        {/* Field line decoration */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-blue-600 rounded-l-2xl" />
                        
                        <div className="flex-1 pl-3">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 text-white font-bold shadow-lg">
                              {index + 1}
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{match.title}</h3>
                            <Badge
                              className={
                                match.status === "confirmed"
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 text-white border-0 shadow-md font-semibold"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
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
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{match.players}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-blue-600 text-white font-bold shadow-lg">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-blue-600 text-white font-bold shadow-lg dark:shadow-emerald-900/30">
                    Ver Todas as Partidas
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-slate-800/40 backdrop-blur-xl shadow-2xl dark:shadow-black/40">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700/50">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="rounded-full p-2 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 shadow-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent font-bold">
                      Atividade Recente
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    {recentActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="group flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 hover:shadow-lg dark:hover:shadow-emerald-900/20 transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/50"
                      >
                        <div className={`rounded-full p-2 bg-gradient-to-br ${
                          activity.type === "win" 
                            ? "from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700" 
                            : "from-red-400 to-pink-500 dark:from-red-600 dark:to-pink-700"
                        } shadow-lg`}>
                          {activity.type === "win" ? (
                            <Trophy className="h-4 w-4 text-white" />
                          ) : (
                            <Target className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{activity.text}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions with Glass Morphism */}
            <Card className="mt-6 border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-gradient-to-br dark:from-slate-900/60 dark:to-slate-800/40 backdrop-blur-xl shadow-2xl dark:shadow-black/40 overflow-hidden">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700/50">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
                  ⚡ Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button
                    className="group h-auto flex-col gap-3 py-6 border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/30 hover:shadow-xl dark:hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
                    variant="outline"
                  >
                    <div className="rounded-full p-3 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-blue-700 group-hover:scale-110 transition-transform shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Agendar Partida</span>
                  </Button>
                  <Button
                    className="group h-auto flex-col gap-3 py-6 border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/30 hover:shadow-xl dark:hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
                    variant="outline"
                  >
                    <div className="rounded-full p-3 bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-blue-700 dark:to-emerald-700 group-hover:scale-110 transition-transform shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Convidar Amigos</span>
                  </Button>
                  <Button
                    className="group h-auto flex-col gap-3 py-6 border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/30 hover:shadow-xl dark:hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
                    variant="outline"
                  >
                    <div className="rounded-full p-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 dark:from-emerald-700 dark:via-green-800 dark:to-blue-700 group-hover:scale-110 transition-transform shadow-lg">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Criar Torneio</span>
                  </Button>
                  <Button
                    className="group h-auto flex-col gap-3 py-6 border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/30 hover:shadow-xl dark:hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
                    variant="outline"
                  >
                    <div className="rounded-full p-3 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 dark:from-blue-700 dark:via-emerald-700 dark:to-green-800 group-hover:scale-110 transition-transform shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Ver Estatísticas</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <ArenaFooter />
        </main>
      </div>
    </div>
  );
}
