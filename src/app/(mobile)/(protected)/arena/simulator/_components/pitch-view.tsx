"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  type Formation,
  type Frame,
  type MatchFormatSettings,
  playerRole,
} from "../_simulation/match";

import { PlayerCard, type PlayerSelection } from "./player-card";

const Pitch3d = dynamic(() => import("./pitch-3d"), { ssr: false });

export function PitchView({
  frame,
  settings,
  onSelectPlayer,
  formation,
}: {
  frame: Frame;
  settings: MatchFormatSettings;
  onSelectPlayer: () => void;
  formation: Formation;
}) {
  const t = useTranslations("matchSimulator");
  const [view, setView] = useState<"three" | "top" | "two">("three");
  const [selection, setSelection] = useState<PlayerSelection | null>(null);
  const [open, setOpen] = useState(false);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const trigger = useRef<HTMLButtonElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const fail = useCallback(() => {
    setUnavailable(true);
    setView("two");
  }, []);

  return (
    <div>
      <div className="relative isolate aspect-[3/2] overflow-hidden rounded-xl bg-[#111e1b] sm:aspect-[2/1]">
        {view === "two" ? (
          <div className="absolute inset-[8%] rounded-sm border border-white/55 bg-[#326737]">
            <div className="absolute inset-y-0 left-1/2 border-white/55 border-l" />
            <div className="absolute top-1/2 left-1/2 aspect-square w-[17%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/55" />
            <div
              className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
              style={{
                left: `${50 + (frame.ball.x / settings.length) * 100}%`,
                top: `${50 + (frame.ball.z / settings.width) * 100}%`,
              }}
            />
          </div>
        ) : (
          <Pitch3d
            frame={frame}
            settings={settings}
            overhead={view === "top"}
            onUnavailable={fail}
            buttons={buttons}
          />
        )}
        <div
          className={cn(
            "pointer-events-none absolute",
            view === "two" ? "inset-[8%]" : "inset-0",
          )}
        >
          {frame.players.map((player, index) => (
            <button
              key={`${view === "two"}-${player.side}-${player.number}`}
              type="button"
              aria-label={t("playerCard.trigger", {
                number: player.number,
                team: t(player.side === 0 ? "home" : "away"),
              })}
              aria-haspopup="dialog"
              onClick={event => {
                trigger.current = event.currentTarget;
                setSelection({
                  player,
                  slot: index % settings.players,
                  second: frame.second,
                });
                onSelectPlayer();
                setOpen(true);
              }}
              ref={node => {
                buttons.current[index] = node;
              }}
              className={cn(
                "press pointer-events-auto absolute grid size-8 -translate-x-1/2 -translate-y-1/2 justify-items-center rounded-full hover:bg-black/30 focus-visible:bg-black/40 focus-visible:outline-2 focus-visible:outline-white",
                view === "two"
                  ? "place-items-center"
                  : "invisible content-start pt-0.5",
              )}
              style={
                view === "two"
                  ? {
                      left: `${50 + (player.x / settings.length) * 100}%`,
                      top: `${50 + (player.z / settings.width) * 100}%`,
                    }
                  : undefined
              }
            >
              <span
                className={cn(
                  "grid size-4 place-items-center rounded-full text-[10px] font-bold shadow-sm",
                  player.side === 0
                    ? "bg-[#193631] text-[#c4ff91]"
                    : "bg-[#49261c] text-[#ffd4b7]",
                )}
              >
                {player.number}
              </span>
            </button>
          ))}
        </div>
      </div>
      <fieldset className="mt-2 flex flex-wrap items-center gap-1">
        <legend className="sr-only">{t("view")}</legend>
        {(["three", "top", "two"] as const).map(option => (
          <button
            key={option}
            type="button"
            disabled={unavailable && option !== "two"}
            aria-pressed={view === option}
            onClick={() => setView(option)}
            className="press min-h-11 rounded-lg px-3 text-sm text-arena-text-sec aria-pressed:bg-arena-primary/10 aria-pressed:text-arena-primary disabled:opacity-40"
          >
            {t(`views.${option}`)}
          </button>
        ))}
        {unavailable && (
          <output className="text-sm text-arena-text-sec">
            {t("fallback")}
          </output>
        )}
      </fieldset>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-sm rounded-xl"
          onCloseAutoFocus={event => {
            event.preventDefault();
            trigger.current?.focus();
          }}
        >
          {selection && (
            <>
              <DialogTitle>
                {t("player", { number: selection.player.number })}
              </DialogTitle>
              <DialogDescription>{t("playerCard.fictional")}</DialogDescription>
              <PlayerCard
                {...selection}
                role={playerRole(
                  selection.player.side === 0
                    ? formation
                    : settings.formations[1],
                  selection.slot,
                )}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
