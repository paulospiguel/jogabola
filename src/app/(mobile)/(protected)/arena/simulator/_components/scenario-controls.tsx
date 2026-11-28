"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  matchFormats,
  opponentParameters,
  type PositionChange,
  type Scenario,
  type Style,
} from "../_simulation/match";

export const controlClass =
  "press min-h-11 w-full rounded-lg border border-arena-border bg-arena-bg px-2 text-arena-text";
const labelClass = "grid min-w-0 gap-1 text-sm font-medium text-arena-text-sec";

interface ScenarioControlsProps {
  scenario: Scenario;
  onChange: (scenario: Scenario) => void;
  onMove: (move: Omit<PositionChange, "second">) => void;
  canIntervene: boolean;
}

const profiles = {
  balanced: { level: 3, style: "balanced" },
  pressure: { level: 4, style: "highPress" },
  defensive: { level: 2, style: "lowBlock" },
} satisfies Record<string, { level: number; style: Style }>;

export function ScenarioControls({
  scenario,
  onChange,
  onMove,
  canIntervene,
}: ScenarioControlsProps) {
  const t = useTranslations("matchSimulator");
  const [profile, setProfile] = useState<keyof typeof profiles>("balanced");
  const settings = matchFormats[scenario.format];
  const [slot, setSlot] = useState(settings.players - 1);
  const [depth, setDepth] = useState(0);
  const [width, setWidth] = useState(0);
  const params = opponentParameters(scenario.level);

  function selectPlayer(number: number) {
    const lineup = [...scenario.lineup];
    const swap = lineup.indexOf(number);
    if (swap !== -1) lineup[swap] = lineup[slot];
    lineup[slot] = number;
    onChange({ ...scenario, lineup });
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-3 rounded-xl border border-arena-border bg-arena-surface p-4">
        <h2 className="font-semibold">{t("opponent")}</h2>
        <label className={labelClass}>
          {t("profile")}
          <select
            className={controlClass}
            value={profile}
            onChange={event => {
              const value = event.target.value as keyof typeof profiles;
              setProfile(value);
              onChange({ ...scenario, ...profiles[value] });
            }}
          >
            {Object.keys(profiles).map(key => (
              <option key={key} value={key}>
                {t(`profiles.${key}`)}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          {t("style")}
          <select
            className={controlClass}
            value={scenario.style}
            onChange={event =>
              onChange({ ...scenario, style: event.target.value as Style })
            }
          >
            {(["balanced", "highPress", "lowBlock"] as const).map(style => (
              <option key={style} value={style}>
                {t(`styles.${style}`)}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          {t("level", { level: scenario.level })}
          <input
            type="range"
            min="1"
            max="5"
            value={scenario.level}
            className="press h-11 w-full accent-arena-primary"
            onChange={event =>
              onChange({ ...scenario, level: Number(event.target.value) })
            }
          />
        </label>
        <p className="text-sm text-arena-text-sec">{t("parameters", params)}</p>
      </section>

      <section className="grid gap-3 rounded-xl border border-arena-border bg-arena-surface p-4">
        <h2 className="font-semibold">{t("lineup")}</h2>
        <label className={labelClass}>
          {t("formation")}
          <select
            className={controlClass}
            value={scenario.formation}
            onChange={event =>
              onChange({
                ...scenario,
                formation: event.target.value as Scenario["formation"],
              })
            }
          >
            {settings.formations.map(formation => (
              <option key={formation}>{formation}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className={labelClass}>
            {t("position")}
            <select
              className={controlClass}
              value={slot}
              onChange={event => setSlot(Number(event.target.value))}
            >
              {scenario.lineup.map((number, index) => (
                <option key={number} value={index}>
                  {index === 0 ? t("keeper") : t("slot", { number: index + 1 })}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {t("starter")}
            <select
              className={controlClass}
              value={scenario.lineup[slot]}
              onChange={event => selectPlayer(Number(event.target.value))}
            >
              {settings.squad.map(number => (
                <option key={number} value={number}>
                  {t("player", { number })}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {t("depth")}
            <input
              className={controlClass}
              type="number"
              min={-15}
              max={15}
              value={depth}
              onChange={event => setDepth(Number(event.target.value))}
            />
          </label>
          <label className={labelClass}>
            {t("width")}
            <input
              className={controlClass}
              type="number"
              min={-15}
              max={15}
              value={width}
              onChange={event => setWidth(Number(event.target.value))}
            />
          </label>
        </div>
        <button
          type="button"
          className={controlClass}
          disabled={
            !canIntervene ||
            (!depth && !width) ||
            Math.abs(depth) > 15 ||
            Math.abs(width) > 15
          }
          onClick={() => onMove({ slot, depth, width })}
        >
          {t("applyPosition")}
        </button>
      </section>
    </div>
  );
}
