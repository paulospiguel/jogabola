"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { JbAvatar } from "@/components/arena/avatar";
import { ScreenHeader } from "@/components/arena/screen-header";
import { cn } from "@/lib/utils";
import {
  LIGA_STANDINGS,
  TOP_ASSISTS,
  TOP_SCORERS,
} from "../_fixtures/rankings-mock";

type Tab = "league" | "scorers" | "assists";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.03 } } },
  item: {
    initial: { opacity: 0, y: 6 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
    },
  },
};

export function RankingsClient() {
  const t = useTranslations("arenaRankings");
  const [tab, setTab] = useState<Tab>("league");

  const tabs: { id: Tab; label: string }[] = [
    { id: "league", label: t("tabs.league") },
    { id: "scorers", label: t("tabs.scorers") },
    { id: "assists", label: t("tabs.assists") },
  ];

  return (
    <div className="min-h-screen bg-arena-bg pb-24">
      <ScreenHeader title={t("title")} />

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

      {tab === "league" && (
        <div className="px-4 py-3.5">
          <div className="mb-1.5 flex px-3.5 text-[10px] font-bold uppercase tracking-[0.6px] text-arena-text-muted">
            <span className="w-6">#</span>
            <span className="flex-1">{t("table.team")}</span>
            {(["j", "v", "e", "d", "pts"] as const).map(h => (
              <span key={h} className="w-7 text-center">
                {t(`table.headers.${h}`)}
              </span>
            ))}
          </div>

          <motion.div
            className="flex flex-col"
            variants={stagger.container}
            initial="initial"
            animate="animate"
          >
            {LIGA_STANDINGS.map((row, i) => (
              <motion.div
                key={row.pos}
                variants={stagger.item}
                className={cn(
                  "flex items-center border px-3.5 py-2.5",
                  i === 0 ? "rounded-t-[14px]" : "",
                  i === LIGA_STANDINGS.length - 1 ? "rounded-b-[14px]" : "",
                  i > 0 ? "border-t-0" : "",
                  row.own
                    ? "border-arena-primary/44 bg-arena-primary/[0.07]"
                    : "border-arena-border bg-arena-surface",
                )}
              >
                <span
                  className={cn(
                    "w-6 text-[12px] font-bold",
                    row.pos <= 3
                      ? "text-arena-primary"
                      : "text-arena-text-muted",
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
                        row.own
                          ? "text-arena-primary"
                          : "text-arena-text-muted",
                      )}
                    >
                      {row.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "truncate text-[13px]",
                      row.own
                        ? "font-bold text-arena-primary"
                        : "font-medium text-arena-text",
                    )}
                  >
                    {row.name}
                  </span>
                  {row.own && (
                    <span className="shrink-0 rounded-[3px] bg-arena-primary/20 px-1 py-px text-[9px] font-extrabold text-arena-primary">
                      {t("table.myTeamBadge")}
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

      {tab === "scorers" && (
        <div className="flex flex-col gap-2 px-4 py-3.5">
          {TOP_SCORERS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.18,
                delay: i * 0.03,
                ease: [0.4, 0, 0.2, 1],
              }}
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
                <div className="text-[11px] text-arena-text-muted">
                  {p.role}
                </div>
              </div>
              <div className="text-right">
                <div className="font-sora text-[18px] font-extrabold text-arena-text">
                  {p.goals}
                </div>
                <div className="text-[9px] text-arena-text-muted">
                  {t("stats.goals")}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "assists" && (
        <div className="flex flex-col gap-2 px-4 py-3.5">
          {TOP_ASSISTS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.18,
                delay: i * 0.03,
                ease: [0.4, 0, 0.2, 1],
              }}
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
                <div className="text-[11px] text-arena-text-muted">
                  {p.role}
                </div>
              </div>
              <div className="text-right">
                <div className="font-sora text-[18px] font-extrabold text-arena-text">
                  {p.assists}
                </div>
                <div className="text-[9px] text-arena-text-muted">
                  {t("stats.assists")}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
