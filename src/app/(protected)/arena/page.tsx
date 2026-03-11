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

// ─── Types ────────────────────────────────────────────────────────────────────

type TeamStatus = "TRAINING" | "ACTIVE" | "REST";

interface StatCard {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string; // border-left color
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

// ─── Constants ────────────────────────────────────────────────────────────────

const ARENA_COLOR = "var(--color-journey-arena)";
const ARENA_GLOW = "rgba(var(--color-journey-arena),0.35)";

const statCards: StatCard[] = [
  {
    title: "Win Ratio",
    value: "74.2%",
    sub: "+5.4% from last month",
    icon: TrendingUp,
    accent: ARENA_COLOR,
  },
  {
    title: "Active Players",
    value: "142",
    sub: "8 Registered teams",
    icon: Users,
    accent: "#ffffff",
  },
  {
    title: "Total Goals",
    value: "318",
    sub: "Avg 2.4 per match",
    icon: Target,
    accent: ARENA_COLOR,
  },
  {
    title: "Next Match",
    value: "In 4h 22m",
    sub: "STADIUM A · PITCH 4",
    icon: Clock,
    accent: "#ffffff",
  },
];

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

const quickActions = [
  { label: "Add Player", icon: Users, href: "/arena/players/new" },
  { label: "Fees Status", icon: Wallet, href: "/arena/finances" },
  { label: "Assign Kit", icon: Shield, href: "/arena/kits" },
  { label: "Announce", icon: Volume2, href: "/arena/announcements" },
];

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

function StatusBadge({ status }: { status: TeamStatus }) {
  const map: Record<TeamStatus, { label: string; color: string; bg: string }> =
    {
      TRAINING: {
        label: "Training",
        color: "#bcff00",
        bg: "rgba(188,255,0,0.12)",
      },
      ACTIVE: { label: "Active", color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
      REST: { label: "Rest", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
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
    result === "win" ? "#bcff00" : result === "draw" ? "#94a3b8" : "#ef4444";
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
  return (
    <div className="min-h-screen bg-[#111111] px-6 py-8 text-white">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <h1
            className="font-heading text-4xl font-black italic tracking-wide"
            style={{ color: "#ffffff" }}
          >
            CLUB OVERVIEW
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Data-driven insights for the 2023/24 Amateur League Season.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export Stats
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-black transition hover:opacity-90"
            style={{ backgroundColor: ARENA_COLOR }}
          >
            <Plus className="h-4 w-4" />
            Quick Management
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
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a1a] p-5"
              style={{
                borderLeft: `3px solid ${card.accent}`,
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white/60">
                  {card.title}
                </span>
                <Icon
                  className="h-5 w-5"
                  style={{
                    color:
                      card.accent === ARENA_COLOR
                        ? ARENA_COLOR
                        : "rgba(255,255,255,0.4)",
                  }}
                />
              </div>
              <p className="text-3xl font-black leading-none text-white">
                {card.value}
              </p>
              <p
                className="mt-2 text-xs font-medium"
                style={{
                  color:
                    card.accent === ARENA_COLOR
                      ? ARENA_COLOR
                      : "rgba(255,255,255,0.45)",
                }}
              >
                {card.sub}
              </p>
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
            className="rounded-2xl border border-white/8 bg-[#1a1a1a] p-6"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" style={{ color: ARENA_COLOR }} />
                <h2 className="text-base font-bold text-white">
                  Performance Analytics
                </h2>
              </div>
              <div className="flex gap-1 rounded-xl bg-white/5 p-1">
                {["Week", "Month", "Year"].map(period => (
                  <button
                    key={period}
                    type="button"
                    className="rounded-lg px-3 py-1 text-xs font-semibold transition"
                    style={
                      period === "Month"
                        ? {
                            backgroundColor: ARENA_COLOR,
                            color: "#000",
                          }
                        : { color: "rgba(255,255,255,0.5)" }
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
                    <div className="relative w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-xl transition-all duration-300"
                        style={{
                          height: `${heightPct}%`,
                          backgroundColor: isHighest
                            ? ARENA_COLOR
                            : "rgba(188,255,0,0.45)",
                          boxShadow: isHighest
                            ? `0 0 18px ${ARENA_GLOW}`
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
            className="rounded-2xl border border-white/8 bg-[#1a1a1a] p-6"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.45, delay: 0.25 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Active Teams</h2>
              <Link
                href="/arena/teams"
                className="text-sm font-semibold transition hover:opacity-80"
                style={{ color: ARENA_COLOR }}
              >
                View All Teams
              </Link>
            </div>

            {/* Table header */}
            <div className="mb-3 grid grid-cols-4 gap-4 text-xs font-bold uppercase tracking-widest text-white/30">
              <span className="col-span-2">Team Name</span>
              <span>Status</span>
              <span>Form</span>
            </div>

            <div className="space-y-2">
              {teams.map(team => (
                <div
                  key={team.id}
                  className="grid grid-cols-4 items-center gap-4 rounded-xl border border-white/5 bg-white/3 px-3 py-3 transition hover:bg-white/6"
                >
                  {/* Name */}
                  <div className="col-span-2 flex items-center gap-3">
                    <span
                      className="rounded-lg px-2 py-0.5 text-xs font-black"
                      style={{
                        backgroundColor: ARENA_COLOR,
                        color: "#000",
                      }}
                    >
                      {team.badge}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {team.name}
                    </span>
                  </div>
                  {/* Status */}
                  <StatusBadge status={team.status} />
                  {/* Form + actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {team.form.map((r, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: stable static data
                        <FormDot key={i} result={r} />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="rounded-lg p-1 text-white/30 transition hover:text-white"
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
            className="rounded-2xl border border-white/8 bg-[#1a1a1a] p-6"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <h2 className="mb-5 text-base font-bold text-white">
              Quick Management
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 bg-white/4 py-5 transition hover:border-white/20 hover:bg-white/8"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl transition group-hover:scale-105"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  >
                    <Icon className="h-5 w-5 text-white/70" />
                  </div>
                  <span className="text-xs font-semibold text-white/70">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Season MVP Race */}
          <motion.div
            className="rounded-2xl border border-white/8 bg-[#1a1a1a] p-6"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.45, delay: 0.3 }}
          >
            <h2 className="mb-5 text-base font-bold text-white">
              Season MVP Race
            </h2>
            <div className="space-y-4">
              {mvpPlayers.map(player => (
                <div key={player.rank} className="flex items-center gap-3">
                  {/* Avatar + rank */}
                  <div className="relative shrink-0">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-black"
                      style={{ backgroundColor: ARENA_COLOR }}
                    >
                      {player.avatar}
                    </div>
                    <span
                      className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-black"
                      style={{ backgroundColor: ARENA_COLOR }}
                    >
                      {player.rank}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {player.name}
                    </p>
                    <p className="text-xs text-white/45">{player.stats}</p>
                  </div>

                  {/* Rating */}
                  <div className="text-right">
                    <p
                      className="text-lg font-black"
                      style={{ color: ARENA_COLOR }}
                    >
                      {player.rating}
                    </p>
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30">
                      Rating
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-5 w-full text-center text-xs font-semibold transition hover:opacity-80"
              style={{ color: ARENA_COLOR }}
            >
              View Leaderboards
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
