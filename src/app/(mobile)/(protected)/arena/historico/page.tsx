"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import { ScreenHeader } from "@/components/arena/screen-header";
import { cn } from "@/lib/utils";

// Mock data — visual only
const SEASONS = [
  { year: "2024/25", status: "Em curso", v: 11, e: 4, d: 3, pts: 37, pos: 2, champion: false },
  { year: "2023/24", status: "Concluída", v: 16, e: 5, d: 5, pts: 53, pos: 1, champion: true },
  { year: "2022/23", status: "Concluída", v: 12, e: 7, d: 7, pts: 43, pos: 3, champion: false },
  { year: "2021/22", status: "Concluída", v: 9, e: 8, d: 7, pts: 35, pos: 5, champion: false },
];

const RECENT = [
  { opp: "Sporting C", home: true, r: "E", score: "1-1", date: "12 Abr" },
  { opp: "Benfica B", home: false, r: "V", score: "3-1", date: "5 Abr" },
  { opp: "Porto B", home: true, r: "D", score: "0-2", date: "27 Mar" },
  { opp: "Académica", home: false, r: "V", score: "2-0", date: "15 Mar" },
  { opp: "Belenenses", home: true, r: "V", score: "4-1", date: "1 Mar" },
];

const RESULT_STYLE: Record<string, { text: string; bg: string }> = {
  V: { text: "text-arena-success", bg: "bg-arena-success/20" },
  E: { text: "text-arena-warning", bg: "bg-arena-warning/20" },
  D: { text: "text-arena-danger", bg: "bg-arena-danger/20" },
};

export default function HistoricoPage() {
  const t = useTranslations("arenaHistorico");

  return (
    <div className="min-h-screen bg-arena-bg pb-24">
      <ScreenHeader title={t("title")} />

      {/* Épocas */}
      <div className="px-4 pt-4">
        <div className="mb-2.5 px-0.5 text-[11px] font-bold uppercase tracking-[0.7px] text-arena-text-muted">
          {t("sections.seasons")}
        </div>

        <div className="flex flex-col gap-2">
          {SEASONS.map((s, i) => (
            <motion.div
              key={s.year}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "rounded-[14px] border p-3.5",
                s.status === "Em curso"
                  ? "border-arena-primary/33 bg-arena-surface"
                  : "border-arena-border bg-arena-surface",
              )}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-sora text-[15px] font-bold text-arena-text">
                    {s.year}
                  </span>
                  {s.champion && (
                    <span className="flex items-center gap-1 rounded-[4px] border border-arena-highlight/44 bg-arena-highlight/20 px-1.5 py-px text-[9px] font-extrabold text-arena-highlight">
                      🏆 {t("champion")}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "rounded-[6px] border px-2 py-px text-[10px] font-bold",
                    s.status === "Em curso"
                      ? "border-arena-primary/44 bg-arena-primary/15 text-arena-primary"
                      : "border-arena-border bg-arena-surface-el text-arena-text-muted",
                  )}
                >
                  {s.status}
                </span>
              </div>

              <div className="flex overflow-hidden rounded-[10px] bg-arena-surface-el">
                {[
                  {
                    label: t("stats.pos"),
                    value: `${s.pos}º`,
                    color:
                      s.pos === 1
                        ? "text-arena-highlight"
                        : s.pos <= 3
                          ? "text-arena-primary"
                          : "text-arena-text-sec",
                  },
                  { label: t("stats.pts"), value: s.pts, color: "text-arena-text" },
                  { label: t("stats.v"), value: s.v, color: "text-arena-success" },
                  { label: t("stats.e"), value: s.e, color: "text-arena-warning" },
                  { label: t("stats.d"), value: s.d, color: "text-arena-danger" },
                ].map((stat, si) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "flex flex-1 flex-col items-center py-2",
                      si < 4 ? "border-r border-arena-border" : "",
                    )}
                  >
                    <span className={cn("font-sora text-[14px] font-extrabold", stat.color)}>
                      {stat.value}
                    </span>
                    <span className="mt-0.5 text-[9px] font-semibold text-arena-text-muted">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Últimos resultados */}
      <div className="px-4 pt-5">
        <div className="mb-2.5 px-0.5 text-[11px] font-bold uppercase tracking-[0.7px] text-arena-text-muted">
          {t("sections.recent")}
        </div>

        <div className="flex flex-col overflow-hidden rounded-[14px] border border-arena-border">
          {RECENT.map((r, i) => {
            const style = RESULT_STYLE[r.r] ?? RESULT_STYLE.E;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18, delay: i * 0.04, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                  "flex items-center gap-3 bg-arena-surface px-3.5 py-2.5",
                  i < RECENT.length - 1 ? "border-b border-arena-border" : "",
                )}
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-[7px]",
                    style.bg,
                  )}
                >
                  <span className={cn("text-[11px] font-extrabold", style.text)}>
                    {r.r}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-arena-text">
                    {r.home ? "vs" : "@"} {r.opp}
                  </div>
                  <div className="mt-0.5 text-[11px] text-arena-text-muted">
                    {r.date}
                  </div>
                </div>
                <span className="font-sora text-[14px] font-bold text-arena-text-sec">
                  {r.score}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
