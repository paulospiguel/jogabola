"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import { ScreenHeader } from "@/components/arena/screen-header";
import { JbAvatar } from "@/components/arena/avatar";
import { cn } from "@/lib/utils";

// Mock data — visual only, to be replaced when rankings action is available
const LIGA = [
  { pos: 1, name: "Benfica B", j: 18, v: 13, e: 3, d: 2, pts: 42, form: ["V", "V", "E", "V", "V"], own: false },
  { pos: 2, name: "FC Bairro Alto", j: 18, v: 11, e: 4, d: 3, pts: 37, form: ["V", "E", "V", "V", "D"], own: true },
  { pos: 3, name: "Sporting C", j: 18, v: 10, e: 5, d: 3, pts: 35, form: ["V", "V", "D", "E", "V"], own: false },
  { pos: 4, name: "Porto B", j: 18, v: 9, e: 4, d: 5, pts: 31, form: ["D", "V", "V", "E", "D"], own: false },
  { pos: 5, name: "Académica", j: 18, v: 8, e: 5, d: 5, pts: 29, form: ["E", "V", "D", "V", "E"], own: false },
  { pos: 6, name: "Belenenses", j: 18, v: 7, e: 6, d: 5, pts: 27, form: ["E", "E", "V", "D", "V"], own: false },
  { pos: 7, name: "Estrela", j: 18, v: 6, e: 5, d: 7, pts: 23, form: ["D", "E", "D", "V", "E"], own: false },
  { pos: 8, name: "Casa Pia B", j: 18, v: 5, e: 6, d: 7, pts: 21, form: ["E", "D", "E", "V", "D"], own: false },
];

const TOP_SCORERS = [
  { id: 1, name: "Carlos Mendes", role: "Avançado", goals: 12 },
  { id: 2, name: "Rui Ferreira", role: "Médio", goals: 9 },
  { id: 3, name: "Pedro Alves", role: "Avançado", goals: 7 },
  { id: 4, name: "João Silva", role: "Médio", goals: 5 },
  { id: 5, name: "Miguel Costa", role: "Defesa", goals: 3 },
];

const TOP_ASSISTS = [
  { id: 1, name: "Rui Ferreira", role: "Médio", assists: 10 },
  { id: 2, name: "Carlos Mendes", role: "Avançado", assists: 7 },
  { id: 3, name: "André Santos", role: "Médio", assists: 6 },
  { id: 4, name: "Pedro Alves", role: "Avançado", assists: 4 },
  { id: 5, name: "Luís Pereira", role: "Lateral", assists: 3 },
];

const FORM_COLOR: Record<string, string> = {
  V: "text-arena-success",
  E: "text-arena-warning",
  D: "text-arena-danger",
};
const FORM_BG: Record<string, string> = {
  V: "bg-arena-success/20",
  E: "bg-arena-warning/20",
  D: "bg-arena-danger/20",
};

type Tab = "liga" | "marcadores" | "assist";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.03 } } },
  item: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } },
  },
};

export default function RankingsPage() {
  const t = useTranslations("arenaRankings");
  const [tab, setTab] = useState<Tab>("liga");

  const tabs: { id: Tab; label: string }[] = [
    { id: "liga", label: t("tabs.liga") },
    { id: "marcadores", label: t("tabs.marcadores") },
    { id: "assist", label: t("tabs.assist") },
  ];

  return (
    <div className="min-h-screen bg-arena-bg pb-24">
      <ScreenHeader title={t("title")} />

      {/* Tab bar */}
      <div className="sticky top-14 z-20 flex gap-0 border-b border-arena-border bg-arena-bg">
        {tabs.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "flex flex-1 items-center justify-center border-b-2 py-3 text-[13px] font-semibold transition-colors duration-150",
              tab === item.id
                ? "border-arena-primary text-arena-primary"
                : "border-transparent text-arena-text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Liga table */}
      {tab === "liga" && (
        <div className="px-4 py-3.5">
          {/* Header row */}
          <div className="mb-1.5 flex px-3.5 text-[10px] font-bold uppercase tracking-[0.6px] text-arena-text-muted">
            <span className="w-6">#</span>
            <span className="flex-1">Equipa</span>
            {["J", "V", "E", "D", "Pts"].map(h => (
              <span key={h} className="w-7 text-center">
                {h}
              </span>
            ))}
          </div>

          <motion.div
            className="flex flex-col"
            variants={stagger.container}
            initial="initial"
            animate="animate"
          >
            {LIGA.map((row, i) => (
              <motion.div
                key={row.pos}
                variants={stagger.item}
                className={cn(
                  "flex items-center border px-3.5 py-2.5",
                  i === 0 ? "rounded-t-[14px]" : "",
                  i === LIGA.length - 1 ? "rounded-b-[14px]" : "",
                  i > 0 ? "border-t-0" : "",
                  row.own
                    ? "border-arena-primary/44 bg-arena-primary/[0.07]"
                    : "border-arena-border bg-arena-surface",
                )}
              >
                <span
                  className={cn(
                    "w-6 text-[12px] font-bold",
                    row.pos <= 3 ? "text-arena-primary" : "text-arena-text-muted",
                  )}
                >
                  {row.pos}
                </span>
                <div className="flex flex-1 min-w-0 items-center gap-2">
                  <div
                    className={cn(
                      "flex size-[22px] shrink-0 items-center justify-center rounded-[6px] border",
                      row.own
                        ? "border-arena-primary/44 bg-arena-primary/20"
                        : "border-arena-border bg-arena-surface-el",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[8px] font-extrabold",
                        row.own ? "text-arena-primary" : "text-arena-text-muted",
                      )}
                    >
                      {row.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "truncate text-[13px]",
                      row.own ? "font-bold text-arena-primary" : "font-medium text-arena-text",
                    )}
                  >
                    {row.name}
                  </span>
                  {row.own && (
                    <span className="shrink-0 rounded-[3px] bg-arena-primary/20 px-1 py-px text-[9px] font-extrabold text-arena-primary">
                      TU
                    </span>
                  )}
                </div>
                {[row.j, row.v, row.e, row.d].map((v, vi) => (
                  <span
                    key={vi}
                    className="w-7 text-center text-[12px] text-arena-text-sec"
                  >
                    {v}
                  </span>
                ))}
                <span
                  className={cn(
                    "w-7 text-center text-[13px] font-bold",
                    row.own ? "text-arena-primary" : "text-arena-text",
                  )}
                >
                  {row.pts}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Marcadores */}
      {tab === "marcadores" && (
        <div className="flex flex-col gap-2 px-4 py-3.5">
          {TOP_SCORERS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.03, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-3.5 py-3"
            >
              <span
                className={cn(
                  "w-6 text-[14px] font-extrabold",
                  i === 0
                    ? "text-arena-highlight"
                    : i < 3
                      ? "text-arena-primary"
                      : "text-arena-text-muted",
                )}
              >
                #{i + 1}
              </span>
              <JbAvatar name={p.name} size={34} />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-arena-text">
                  {p.name}
                </div>
                <div className="text-[11px] text-arena-text-muted">{p.role}</div>
              </div>
              <div className="text-right">
                <div className="font-sora text-[18px] font-extrabold text-arena-text">
                  {p.goals}
                </div>
                <div className="text-[9px] text-arena-text-muted">golos</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Assistências */}
      {tab === "assist" && (
        <div className="flex flex-col gap-2 px-4 py-3.5">
          {TOP_ASSISTS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.03, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-3.5 py-3"
            >
              <span
                className={cn(
                  "w-6 text-[14px] font-extrabold",
                  i === 0
                    ? "text-arena-highlight"
                    : i < 3
                      ? "text-arena-primary"
                      : "text-arena-text-muted",
                )}
              >
                #{i + 1}
              </span>
              <JbAvatar name={p.name} size={34} />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-arena-text">
                  {p.name}
                </div>
                <div className="text-[11px] text-arena-text-muted">{p.role}</div>
              </div>
              <div className="text-right">
                <div className="font-sora text-[18px] font-extrabold text-arena-text">
                  {p.assists}
                </div>
                <div className="text-[9px] text-arena-text-muted">assist.</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
