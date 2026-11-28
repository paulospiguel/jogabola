"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type {
  Frame,
  MatchFormatSettings,
  Substitution,
} from "../_simulation/match";
import { controlClass } from "./scenario-controls";

interface SubstitutionsProps {
  frame: Frame;
  settings: MatchFormatSettings;
  canIntervene: boolean;
  scheduled: Substitution[];
  onAdd: (sub: Substitution) => void;
  onRemove: (sub: Substitution) => void;
}

export function Substitutions({
  frame,
  settings,
  canIntervene,
  scheduled,
  onAdd,
  onRemove,
}: SubstitutionsProps) {
  const t = useTranslations("matchSimulator");
  const matchDuration = settings.duration;
  const [out, setOut] = useState<number>(settings.players);
  const [incoming, setIncoming] = useState(settings.players + 1);
  const [minute, setMinute] = useState(matchDuration / 90);
  const onPitch = frame.players
    .filter(player => player.side === 0)
    .map(player => player.number);
  const bench = settings.squad.filter(number => !onPitch.includes(number));
  const selectedOut = onPitch.includes(out) ? out : (onPitch.at(-1) ?? 1);
  const selectedIn = bench.includes(incoming) ? incoming : bench[0];
  const second = minute * 60;

  return (
    <section className="grid gap-3 rounded-xl border border-arena-border bg-arena-surface p-4">
      <h2 className="font-semibold">{t("substitutions")}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label className="grid gap-1 text-sm text-arena-text-sec">
          {t("out")}
          <select
            className={controlClass}
            value={selectedOut}
            onChange={event => setOut(Number(event.target.value))}
          >
            {onPitch.map(number => (
              <option key={number} value={number}>
                {t("player", { number })}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-arena-text-sec">
          {t("in")}
          <select
            className={controlClass}
            value={selectedIn}
            onChange={event => setIncoming(Number(event.target.value))}
          >
            {bench.map(number => (
              <option key={number} value={number}>
                {t("player", { number })}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-arena-text-sec">
          {t("minute")}
          <input
            className={controlClass}
            type="number"
            min={1}
            max={matchDuration / 60 - 1}
            value={minute}
            onChange={event => setMinute(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className={controlClass}
          disabled={!canIntervene}
          onClick={() =>
            onAdd({ out: selectedOut, in: selectedIn, second: frame.second })
          }
        >
          {t("subNow")}
        </button>
        <button
          type="button"
          className={controlClass}
          disabled={
            !canIntervene ||
            second <= frame.second ||
            second >= matchDuration ||
            !Number.isInteger(minute)
          }
          onClick={() => onAdd({ out: selectedOut, in: selectedIn, second })}
        >
          {t("schedule")}
        </button>
      </div>
      {scheduled.length > 0 && (
        <ul className="grid gap-1">
          {scheduled.map(sub => (
            <li
              key={`${sub.second}-${sub.out}`}
              className="flex items-center justify-between gap-2 text-sm text-arena-text-sec"
            >
              {t("subEvent", {
                minute: Math.floor(sub.second / 60),
                in: sub.in,
                out: sub.out,
              })}
              <button
                className="press min-h-11 px-2 text-arena-text disabled:opacity-40"
                type="button"
                disabled={!canIntervene}
                onClick={() => onRemove(sub)}
              >
                {t("remove")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
