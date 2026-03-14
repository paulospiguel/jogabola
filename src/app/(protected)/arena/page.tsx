"use client";

import { motion } from "framer-motion";
import {
  BarChart2,
  Clock,
  Download,
  MoreHorizontal,
  Plus,
  Shield,
  Target,
  TrendingUp,
  Users,
  Volume2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AddPlayerModal } from "@/components/arena/add-player-modal";
import { useSession } from "@/lib/auth-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type TeamStatus = "TRAINING" | "ACTIVE" | "REST";

interface StatCard {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  highlight: boolean;
}

interface Team {
  id: number;
  badge: string;
  name: string;
  status: TeamStatus;
  form: ("win" | "loss" | "draw")[];
}

interface MvpPlayer {
  rank: number;
  name: string;
  stats: string;
  rating: number;
  avatar: string;
}

const analyticsData = [
  { month: "JAN", value: 38 },
  { month: "FEB", value: 52 },
  { month: "MAR", value: 35 },
  { month: "APR", value: 88 },
  { month: "MAY", value: 72 },
  { month: "JUN", value: 65 },
  { month: "JUL", value: 80 },
  { month: "AUG", value: 48 },
];

const analyticsMax = Math.max(...analyticsData.map(d => d.value));

const teams: Team[] = [
  {
    id: 1,
    badge: "U19",
    name: "Under 19s Elite",
    status: "TRAINING",
    form: ["win", "win", "loss"],
  },
  {
    id: 2,
    badge: "U17",
    name: "Under 17s Squad",
    status: "ACTIVE",
    form: ["win", "draw", "win"],
  },
  {
    id: 3,
    badge: "SEN",
    name: "Senior First Team",
    status: "REST",
    form: ["loss", "win", "win"],
  },
];

const mvpPlayers: MvpPlayer[] = [
  {
    rank: 1,
    name: "Luca Rossi",
    stats: "22 Goals · 8 Assists",
    rating: 9.2,
    avatar: "LR",
  },
  {
    rank: 2,
    name: "Sam Peterson",
    stats: "14 Goals · 12 Assists",
    rating: 8.7,
    avatar: "SP",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({
  status,
  labels,
}: {
  status: TeamStatus;
  labels: Record<TeamStatus, string>;
}) {
  const map: Record<TeamStatus, { label: string; color: string; bg: string }> =
    {
      TRAINING: {
        label: labels.TRAINING,
        color: "#6fffe9",
        bg: "rgba(111,255,233,0.12)",
      },
      ACTIVE: {
        label: labels.ACTIVE,
        color: "#4ade80",
        bg: "rgba(74,222,128,0.1)",
      },
      REST: {
        label: labels.REST,
        color: "#94a3b8",
        bg: "rgba(148,163,184,0.1)",
      },
    };
  const { label, color, bg } = map[status];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
      style={{ color, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}

function FormDot({ result }: { result: "win" | "loss" | "draw" }) {
  const color =
    result === "win" ? "#24ffe6" : result === "draw" ? "#94a3b8" : "#f43f5e";
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export default function ArenaPage() {
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [playerCount, setPlayerCount] = useState(142);
  const { data: session } = useSession();
  const t = useTranslations("arenaPage");
  const statCards: StatCard[] = [
    {
      title: t("stats.winRatio.title"),
      value: "74.2%",
      sub: t("stats.winRatio.detail"),
      icon: TrendingUp,
      highlight: true,
    },
    {
      title: t("stats.activePlayers.title"),
      value: "142",
      sub: t("stats.activePlayers.detail"),
      icon: Users,
      highlight: false,
    },
    {
      title: t("stats.totalGoals.title"),
      value: "318",
      sub: t("stats.totalGoals.detail"),
      icon: Target,
      highlight: true,
    },
    {
      title: t("stats.nextMatch.title"),
      value: t("stats.nextMatch.value"),
      sub: t("stats.nextMatch.detail"),
      icon: Clock,
      highlight: false,
    },
  ];
  const quickActions = [
    {
      label: t("quickActions.addPlayer"),
      icon: Users,
      href: null,
      action: "addPlayer",
    },
    {
      label: t("quickActions.feesStatus"),
      icon: Wallet,
      href: "/arena/finances",
      action: null,
    },
    {
      label: t("quickActions.assignKit"),
      icon: Shield,
      href: "/arena/kits",
      action: null,
    },
    {
      label: t("quickActions.announce"),
      icon: Volume2,
      href: "/arena/announcements",
      action: null,
    },
  ] as const;
  const teamStatusLabels: Record<TeamStatus, string> = {
    TRAINING: t("teamStatus.training"),
    ACTIVE: t("teamStatus.active"),
    REST: t("teamStatus.rest"),
  };

  const handlePlayerAdded = () => setPlayerCount(c => c + 1);

  // Patch "Active Players" card with live optimistic count
  const liveStatCards = statCards.map(c =>
    c.title === t("stats.activePlayers.title")
      ? { ...c, value: String(playerCount) }
      : c,
  );

  return (
    <>
      <AddPlayerModal
        open={addPlayerOpen}
        onOpenChange={setAddPlayerOpen}
        managerId={session?.user?.id}
        onSuccess={handlePlayerAdded}
      />
      <div className="min-h-screen px-6 mt-8 py-8 text-white">
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <motion.div
          className="mb-8 flex justify-end"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 backdrop-blur transition-all duration-300 hover:border-white/30 hover:text-white"
            >
              <Download className="h-4 w-4" />
              {t("hero.exportStats")}
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl bg-[#24ffe6] px-4 py-2.5 text-sm font-bold text-black shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24ffe6]/90"
            >
              <Plus className="h-4 w-4" />
              {t("hero.quickManagement")}
            </button>
          </div>
        </motion.div>

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <motion.div
          className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}
        >
          {liveStatCards.map(card => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur transition-all duration-300 hover:border-white/12 hover:bg-white/8"
                style={{
                  borderLeft: `3px solid ${card.highlight ? "#6fffe9" : "rgba(255,255,255,0.12)"}`,
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">
                    {card.title}
                  </span>
                  <Icon
                    className="h-4 w-4"
                    style={{
                      color: card.highlight
                        ? "#6fffe9"
                        : "rgba(255,255,255,0.3)",
                    }}
                  />
                </div>
                <p className="text-3xl font-black leading-none text-white tabular-nums">
                  {card.value}
                </p>
                <p
                  className="mt-2 text-xs font-medium"
                  style={{
                    color: card.highlight ? "#6fffe9" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {card.sub}
                </p>
                {card.highlight && (
                  <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#6fffe9]/10 blur-2xl" />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Main Grid ───────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ─ Left (2/3) ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Performance Analytics */}
            <motion.div
              className="rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur shadow-[0_35px_80px_-45px_rgba(36,255,230,0.15)]"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="h-5 w-5 text-[#6fffe9]" />
                  <h2 className="text-base font-bold text-white">
                    Performance Analytics
                  </h2>
                </div>
                <div className="flex gap-1 rounded-xl bg-white/5 p-1">
                  {["Week", "Month", "Year"].map(period => (
                    <button
                      key={period}
                      type="button"
                      className="rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-200"
                      style={
                        period === "Month"
                          ? { backgroundColor: "#24ffe6", color: "#000" }
                          : { color: "rgba(255,255,255,0.45)" }
                      }
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="flex h-48 items-end gap-2">
                {analyticsData.map(item => {
                  const heightPct = (item.value / analyticsMax) * 100;
                  const isHighest = item.value === analyticsMax;
                  return (
                    <div
                      key={item.month}
                      className="group flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="relative flex w-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-xl transition-all duration-300 group-hover:opacity-90"
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: isHighest
                              ? "#24ffe6"
                              : "rgba(111,255,233,0.25)",
                            boxShadow: isHighest
                              ? "0 0 24px rgba(36,255,230,0.5)"
                              : undefined,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-white/40">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Active Teams */}
            <motion.div
              className="rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.45, delay: 0.25 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold text-white">Active Teams</h2>
                <Link
                  href="/arena/teams"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-[#6fffe9] transition-opacity hover:opacity-70"
                >
                  View All →
                </Link>
              </div>

              {/* Table header */}
              <div className="mb-3 grid grid-cols-4 gap-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">
                <span className="col-span-2">Team Name</span>
                <span>Status</span>
                <span>Form</span>
              </div>

              <div className="space-y-2">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className="grid grid-cols-4 items-center gap-4 rounded-2xl border border-white/5 bg-white/3 px-3 py-3 transition-all duration-200 hover:border-white/10 hover:bg-white/6"
                  >
                    {/* Name */}
                    <div className="col-span-2 flex items-center gap-3">
                      <span className="rounded-lg bg-[#24ffe6] px-2 py-0.5 text-xs font-black text-black">
                        {team.badge}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {team.name}
                      </span>
                    </div>
                    {/* Status */}
                    <StatusBadge
                      status={team.status}
                      labels={teamStatusLabels}
                    />
                    {/* Form + actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {team.form.map((r, i) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: stable static data
                          <FormDot key={i} result={r} />
                        ))}
                      </div>
                      <button
                        type="button"
                        className="rounded-lg p-1 text-white/30 transition-colors hover:text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ─ Right (1/3) ────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Quick Management */}
            <motion.div
              className="rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6fffe9]">
                ⚡ Quick Actions
              </p>
              <h2 className="mb-5 text-base font-bold text-white">
                Management
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(({ label, icon: Icon, href, action }) => {
                  const inner = (
                    <>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 transition-all duration-300 group-hover:border-[#6fffe9]/30 group-hover:bg-[#6fffe9]/10">
                        <Icon className="h-5 w-5 text-white/60 transition-colors group-hover:text-[#6fffe9]" />
                      </div>
                      <span className="text-xs font-semibold text-white/60 group-hover:text-white">
                        {label}
                      </span>
                    </>
                  );
                  if (action === "addPlayer") {
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setAddPlayerOpen(true)}
                        className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 bg-white/5 py-5 transition-all duration-300 hover:border-[#6fffe9]/30 hover:bg-white/8 hover:-translate-y-0.5"
                      >
                        {inner}
                      </button>
                    );
                  }
                  if (!href) {
                    return null;
                  }
                  return (
                    <Link
                      key={label}
                      href={href}
                      className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 bg-white/5 py-5 transition-all duration-300 hover:border-[#6fffe9]/30 hover:bg-white/8 hover:-translate-y-0.5"
                    >
                      {inner}
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Season MVP Race */}
            <motion.div
              className="rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur shadow-[0_35px_80px_-45px_rgba(36,255,230,0.2)]"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.45, delay: 0.3 }}
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6fffe9]">
                Season
              </p>
              <h2 className="mb-5 text-base font-bold text-white">MVP Race</h2>
              <div className="space-y-4">
                {mvpPlayers.map(player => (
                  <div key={player.rank} className="flex items-center gap-3">
                    {/* Avatar + rank */}
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-full bg-[#6fffe9]/20 blur-lg" />
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#24ffe6]/60 bg-[#080a25] text-sm font-black text-[#6fffe9]">
                        {player.avatar}
                      </div>
                      <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#24ffe6] text-[9px] font-black text-black">
                        {player.rank}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">
                        {player.name}
                      </p>
                      <p className="text-xs text-white/45">{player.stats}</p>
                    </div>

                    {/* Rating */}
                    <div className="text-right">
                      <p className="text-lg font-black tabular-nums text-[#6fffe9]">
                        {player.rating}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">
                        Rating
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-5 w-full text-center text-xs font-bold uppercase tracking-[0.2em] text-[#6fffe9] transition-opacity hover:opacity-70"
              >
                View Leaderboards →
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
