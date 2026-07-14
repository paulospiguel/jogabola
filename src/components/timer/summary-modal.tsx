"use client";

import { useStatsigClient } from "@statsig/react-bindings";
import { motion } from "framer-motion";
import { Check, Copy, Home, Plus, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { formatMinute } from "./format";
import { encodeResult, resultText } from "./share";
import { onColor } from "./team-color";
import type { Match } from "./types";
import { score } from "./use-match-store";

export function SummaryModal({
  match,
  onClose,
  onNewGame,
  onHome,
}: {
  match: Match;
  onClose: () => void;
  onNewGame: () => void;
  onHome: () => void;
}) {
  const s = score(match);
  const { logEvent } = useStatsigClient();
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/timer/resultado?d=${encodeResult(match)}`;
  }, [match]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${resultText(match)}\n${shareUrl}`);
      logEvent("timer_result_shared", undefined, { method: "copy" });
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Resultado JogaBola",
          text: resultText(match),
          url: shareUrl,
        });
        logEvent("timer_result_shared", undefined, { method: "web_share" });
        return;
      } catch {
        /* user cancelled — fall through */
      }
    }
    copy();
  }

  const goals = [...match.events]
    .filter(e => e.type === "goal")
    .sort((a, b) => a.atSec - b.atSec);

  return (
    <BottomSheet onClose={onClose} title="Fim do jogo">
      <div className="flex flex-col gap-4 overflow-y-auto">
        {/* result */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex items-center justify-center gap-4 rounded-[18px] border border-arena-border bg-arena-surface py-5"
        >
          <div className="flex flex-col items-center gap-1">
            <span
              className="grid size-9 place-items-center rounded-lg text-sm font-extrabold"
              style={{
                background: match.teams.A.color,
                color: onColor(match.teams.A.color),
              }}
            >
              {match.teams.A.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-[80px] truncate text-xs font-bold text-arena-text-sec">
              {match.teams.A.name}
            </span>
          </div>
          <span className="font-sora text-4xl font-extrabold tabular-nums text-arena-text">
            {s.A} <span className="text-arena-text-muted">-</span> {s.B}
          </span>
          <div className="flex flex-col items-center gap-1">
            <span
              className="grid size-9 place-items-center rounded-lg text-sm font-extrabold"
              style={{
                background: match.teams.B.color,
                color: onColor(match.teams.B.color),
              }}
            >
              {match.teams.B.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-[80px] truncate text-xs font-bold text-arena-text-sec">
              {match.teams.B.name}
            </span>
          </div>
        </motion.div>

        {goals.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {goals.map(g => {
              const p = match.teams[g.team].players.find(
                x => x.id === g.playerId,
              );
              return (
                <div key={g.id} className="flex items-center gap-2 text-sm">
                  <span className="w-8 font-mono text-xs text-arena-text-muted">
                    {formatMinute(g.atSec)}
                  </span>
                  <span>⚽</span>
                  <span className="font-semibold text-arena-text">
                    {p?.name ?? "Golo"}
                  </span>
                  <span
                    className="ml-auto text-xs font-bold"
                    style={{ color: match.teams[g.team].color }}
                  >
                    {match.teams[g.team].name.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* share */}
        <div className="flex items-center gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3">
          {shareUrl && (
            <div className="rounded-lg bg-arena-surface-el p-1.5">
              <QRCode
                value={shareUrl}
                size={76}
                bgColor="transparent"
                fgColor="#7CFF4F"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2">
            <Cta size="sm" fullWidth onClick={share}>
              <Share2 size={15} className="mr-1.5" /> Partilhar
            </Cta>
            <Cta size="sm" variant="secondary" fullWidth onClick={copy}>
              {copied ? (
                <Check size={15} className="mr-1.5 text-arena-primary" />
              ) : (
                <Copy size={15} className="mr-1.5" />
              )}
              {copied ? "Copiado!" : "Copiar resultado"}
            </Cta>
          </div>
        </div>

        <div className="flex gap-2">
          <Cta variant="secondary" className="flex-1" onClick={onHome}>
            <Home size={16} className="mr-1.5" /> Início
          </Cta>
          <Cta className="flex-1" onClick={onNewGame}>
            <Plus size={16} className="mr-1.5" /> Novo jogo
          </Cta>
        </div>
      </div>
    </BottomSheet>
  );
}
