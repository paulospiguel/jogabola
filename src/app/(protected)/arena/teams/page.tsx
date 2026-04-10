"use client";

import { useTranslations } from "next-intl";
import { Plus, Settings2, Shield, Activity, Users, MoreVertical, Trophy, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MOCK_TEAMS = [
  {
    id: "t1",
    name: "JogaBola FC",
    logo: "/images/placeholders/team-1.webp",
    status: "active",
    players: 22,
    winRate: 68,
    form: ["W", "W", "D", "L", "W"],
    plan: "PRO",
    lastMatch: "Vitória por 3-1",
  },
  {
    id: "t2",
    name: "Neon Strikers",
    logo: "/images/placeholders/team-2.webp",
    status: "onboarding",
    players: 14,
    winRate: 45,
    form: ["D", "L", "D", "W", "L"],
    plan: "BASE",
    lastMatch: "Empate 1-1",
  },
];

export default function ActiveTeamsPage() {
  const t = useTranslations("activeTeamsPage");
  
  // Mock business plan
  const planTotal = 3;
  const planUsed = MOCK_TEAMS.length;
  const progressPercent = (planUsed / planTotal) * 100;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 relative">
      {/* Plan Usage Banner */}
      <div className="mb-10 rounded-3xl border border-[#24ffe6]/20 bg-[#24ffe6]/5 p-6 backdrop-blur-xl relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-[#24ffe6] opacity-10 blur-[80px] transition-opacity duration-500 group-hover:opacity-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
              <Shield className="h-6 w-6 text-[#24ffe6]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-wide">{t("planUsage.title")}</h2>
              <p className="mt-1 text-sm text-[#6fffe9]/70">{t("planUsage.used", { used: planUsed, total: planTotal })}</p>
              
              {/* Progress Bar */}
              <div className="mt-3 w-64 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#24ffe6] to-[#02a7ff] rounded-full shadow-[0_0_10px_rgba(36,255,230,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          
          <Link 
            href="/arena/billing"
            className="shrink-0 rounded-2xl border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:border-[#24ffe6]/60 hover:bg-[#24ffe6]/15 hover:shadow-[0_0_20px_rgba(36,255,230,0.2)]"
          >
            {t("planUsage.upgrade")}
          </Link>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_TEAMS.map((team) => (
          <div 
            key={team.id} 
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#6fffe9]/20 hover:shadow-[0_20px_60px_-25px_rgba(111,255,233,0.3)]"
          >
            {/* Top Bar (Status + Menu) */}
            <div className="flex items-start justify-between mb-6">
              <div className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur",
                team.status === "active" 
                  ? "border-[#1effbf]/20 bg-[#1effbf]/10 text-[#1effbf]" 
                  : "border-amber-400/20 bg-amber-400/10 text-amber-400"
              )}>
                {team.status === "active" ? t("teamCard.status.active") : t("teamCard.status.onboarding")}
              </div>
              <button className="text-white/40 hover:text-white transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Team Info */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#6fffe9]/20 blur-2xl rounded-full -z-10 group-hover:bg-[#6fffe9]/40 transition-colors duration-500" />
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white/10 bg-[#0a0b1e]">
                  <Image 
                    src={team.logo} 
                    alt={team.name} 
                    width={80} 
                    height={80} 
                    className="h-full w-full object-cover opacity-80 mix-blend-screen"
                    onError={(e) => {
                      // Fallback visual
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23111827'/%3E%3Cpath d='M50 20 L80 80 L20 80 Z' fill='%23374151'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold text-white lg:text-2xl">{team.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                <Users className="h-4 w-4" />
                {t("teamCard.players", { count: team.players })}
              </p>
            </div>

            {/* divider */}
            <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col items-center rounded-2xl bg-white/5 py-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6fffe9]/60 mb-1">{t("teamCard.performance")}</span>
                <div className="flex items-end gap-1">
                  <span className="font-heading text-2xl font-bold text-white">{team.winRate}</span>
                  <span className="text-sm font-bold text-[#6fffe9] mb-1">%</span>
                </div>
              </div>
              <div className="flex flex-col items-center rounded-2xl bg-white/5 py-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6fffe9]/60 mb-1">{t("teamCard.lastGames")}</span>
                <div className="flex gap-1 mt-1">
                  {team.form.slice(0,4).map((f, i) => (
                    <span 
                      key={i} 
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold",
                        f === "W" ? "bg-emerald-500/20 text-emerald-400" :
                        f === "D" ? "bg-white/10 text-white/70" :
                        "bg-rose-500/20 text-rose-400"
                      )}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mt-auto pt-2">
              <Link 
                href="/arena"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#white/5] border border-white/10 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:text-[#6fffe9]"
              >
                <Settings2 className="h-4 w-4" />
                {t("teamCard.manage")}
              </Link>
            </div>
          </div>
        ))}

        {/* Create Team Card */}
        {planUsed < planTotal && (
          <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/20 bg-transparent p-6 transition-all duration-300 hover:border-[#24ffe6]/50 hover:bg-[#24ffe6]/5 min-h-[420px]">
             <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:border-[#24ffe6]/50 group-hover:bg-[#24ffe6]/10">
                <Plus className="h-8 w-8 text-white/50 group-hover:text-[#24ffe6]" />
             </div>
             <h3 className="font-heading text-lg font-bold text-white text-center mb-2">{t("createTeam.title")}</h3>
             <p className="text-center text-sm text-white/50 max-w-[200px] mb-8">
               {t("createTeam.description")}
             </p>
             <button className="flex items-center justify-center gap-2 rounded-2xl bg-[#24ffe6] px-6 py-3 font-semibold text-slate-900 shadow-[0_10px_30px_-15px_rgba(36,255,230,0.8)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#24ffe6]/90 hover:shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)]">
                <Plus className="h-4 w-4" strokeWidth={3} />
                {t("createTeam.button")}
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
