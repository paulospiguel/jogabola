"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  createScenario,
  type Frame,
  formatOptions,
  frameInterval,
  type Match,
  type MatchEvent,
  type MatchFormat,
  type MatchFormatSettings,
  matchFormats,
  type PositionChange,
  type Scenario,
  type Substitution,
  simulateMatch,
} from "../_simulation/match";
import { PitchView } from "./pitch-view";
import { controlClass, ScenarioControls } from "./scenario-controls";
import { Substitutions } from "./substitutions";

function sampleFrame(frames: Frame[], second: number, length: number) {
  const index = Math.floor(second / frameInterval);
  const frame = frames[index];
  const next = frames.at(index + 1);
  if (!next) return frame;
  const amount = (second - frame.second) / frameInterval;
  const ballAmount = Math.abs(frame.ball.x) > length / 2 ? 0 : amount;
  // Limit tangents at changes of direction so curved runs stay inside the pitch.
  const coordinate = (slot: number, axis: "x" | "z") => {
    const start = frame.players[slot][axis];
    const end = next.players[slot][axis];
    const delta = end - start;
    const tangent = (adjacent: number) =>
      adjacent * delta > 0 ? (2 * adjacent * delta) / (adjacent + delta) : 0;
    const before = frames[index - 1]?.players[slot][axis] ?? start;
    const after = frames[index + 2]?.players[slot][axis] ?? end;
    const t = amount;
    return (
      start +
      delta * t * t * (3 - 2 * t) +
      tangent(start - before) * t * (1 - t) ** 2 -
      tangent(after - end) * t * t * (1 - t)
    );
  };
  return {
    ...frame,
    ball: {
      x: frame.ball.x + (next.ball.x - frame.ball.x) * ballAmount,
      z: frame.ball.z + (next.ball.z - frame.ball.z) * ballAmount,
    },
    players: frame.players.map((player, i) => ({
      ...player,
      x: coordinate(i, "x"),
      z: coordinate(i, "z"),
    })),
  };
}

function metrics(match: Match, { length, width }: MatchFormatSettings) {
  const events = match.events.filter(
    event => "side" in event && event.side === 0,
  );
  const score = match.frames.at(-1)?.score ?? [0, 0];
  const defensivePhases = match.frames
    .slice(0, -1)
    .filter(
      frame =>
        frame.possession === 1 &&
        frame.ball.x >= -length / 2 &&
        frame.ball.x <= -length / 6,
    );
  return {
    score: score.join("–"),
    leftSpace: clock(
      defensivePhases.filter(frame => frame.ball.z < -width * (11 / 68))
        .length * frameInterval,
    ),
    rightSpace: clock(
      defensivePhases.filter(frame => frame.ball.z > width * (11 / 68)).length *
        frameInterval,
    ),
    shots: events.filter(
      event => event.kind === "shot" || event.kind === "goal",
    ).length,
    recovery: events.filter(event => event.kind === "recovery").length,
    conceded: match.events.filter(
      event =>
        (event.kind === "shot" || event.kind === "goal") && event.side === 1,
    ).length,
  };
}

function canApplySubstitutions(scenario: Scenario) {
  const applied = simulateMatch(scenario).events.filter(
    event => event.kind === "substitution",
  );
  return applied.length === scenario.substitutions.length;
}

function clock(second: number) {
  return [Math.floor(second / 60), Math.floor(second % 60)]
    .map(value => String(value).padStart(2, "0"))
    .join(":");
}

export function MatchSimulator() {
  const t = useTranslations("matchSimulator");
  const [format, setFormat] = useState<MatchFormat>(11);
  const formatId = useId();

  return (
    <div className="grid gap-4">
      <div className="grid w-full max-w-xs gap-1 text-sm font-medium text-arena-text-sec">
        <label htmlFor={formatId}>{t("format")}</label>
        <select
          className={controlClass}
          id={formatId}
          aria-describedby={`${formatId}-hint`}
          value={format}
          onChange={event => setFormat(event.target.value === "7" ? 7 : 11)}
        >
          {formatOptions.map(players => (
            <option key={players} value={players}>
              {t("formatOption", { players })}
            </option>
          ))}
        </select>
        <span id={`${formatId}-hint`} className="text-xs">
          {t("formatReset")}
        </span>
      </div>
      <MatchScenario key={format} format={format} />
    </div>
  );
}

function MatchScenario({ format }: { format: MatchFormat }) {
  const t = useTranslations("matchSimulator");
  const settings = matchFormats[format];
  const matchDuration = settings.duration;
  const [scenario, setScenario] = useState(() => createScenario(format));
  const [second, setSecond] = useState(0);
  const elapsed = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [baseline, setBaseline] = useState<ReturnType<typeof metrics>>();
  const [invalid, setInvalid] = useState(false);
  const match = useMemo(() => simulateMatch(scenario), [scenario]);
  const frame = sampleFrame(match.frames, second, settings.length);

  function seek(value: number) {
    elapsed.current = value;
    setSecond(value);
  }

  useEffect(() => {
    if (!playing) return;
    let handle: number;
    let previous: number | undefined;
    function tick(now: number) {
      elapsed.current = Math.min(
        matchDuration,
        elapsed.current + Math.min(now - (previous ?? now), 70) * speed * 0.012,
      );
      previous = now;
      setSecond(elapsed.current);
      if (elapsed.current === matchDuration) {
        setPlaying(false);
        return;
      }
      handle = requestAnimationFrame(tick);
    }
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [matchDuration, playing, speed]);

  function change(next: Scenario) {
    if (next.lineup !== scenario.lineup && !canApplySubstitutions(next)) {
      setInvalid(true);
      return;
    }
    setScenario(next);
    setPlaying(false);
    setInvalid(false);
    seek(0);
  }

  function changeSubstitutions(substitutions: Substitution[]) {
    const next = { ...scenario, substitutions };
    const valid = canApplySubstitutions(next);
    setInvalid(!valid);
    if (valid) setScenario(next);
  }

  function move(position: Omit<PositionChange, "second">) {
    setScenario({
      ...scenario,
      moves: [...scenario.moves, { ...position, second: frame.second }],
    });
  }

  function eventLabel(event: MatchEvent) {
    if (event.kind === "substitution") {
      return t("subEvent", {
        minute: Math.floor(event.second / 60),
        in: event.in,
        out: event.out,
      });
    }
    if (event.kind === "adjustment")
      return t("adjustment", { number: event.number });
    return t(`events.${event.kind}`, {
      team: t(event.side === 0 ? "home" : "away"),
    });
  }

  const canIntervene = !playing && second < matchDuration;
  const events = match.events
    .filter(event => event.second <= second)
    .slice(-10)
    .reverse();
  const current = baseline ? metrics(match, settings) : undefined;
  const actionClass =
    "press inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-arena-border px-3 text-sm font-semibold";

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="grid min-w-0 content-start gap-4">
        <section className="grid gap-3 rounded-xl border border-arena-border bg-arena-surface p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span className="text-arena-primary">{t("home")}</span>
              <strong className="rounded-md bg-arena-bg px-2 py-1 font-mono text-lg">
                {frame.score.join("–")}
              </strong>
              <span className="text-orange-300">{t("away")}</span>
            </div>
            <span className="font-mono text-sm tabular-nums">
              {clock(second)} / {clock(matchDuration)}
            </span>
          </div>
          <PitchView
            frame={{ ...frame, second }}
            settings={settings}
            formation={scenario.formation}
            onSelectPlayer={() => setPlaying(false)}
          />
          <label className="grid gap-1 text-sm text-arena-text-sec">
            {t("timeline")}
            <input
              aria-valuetext={clock(second)}
              className="press h-11 w-full accent-arena-primary"
              type="range"
              min={0}
              max={matchDuration}
              step={frameInterval}
              value={frame.second}
              onChange={event => {
                setPlaying(false);
                seek(Number(event.target.value));
              }}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`${actionClass} border-transparent bg-arena-primary text-arena-bg`}
              onClick={() => {
                if (second === matchDuration) seek(0);
                setPlaying(!playing);
              }}
            >
              {playing ? (
                <Pause size={16} aria-hidden="true" />
              ) : (
                <Play size={16} aria-hidden="true" />
              )}
              {t(playing ? "pause" : "play")}
            </button>
            <button
              type="button"
              className={actionClass}
              onClick={() => {
                setPlaying(false);
                seek(0);
              }}
            >
              <RotateCcw size={16} aria-hidden="true" />
              {t("restart")}
            </button>
            <label className="flex items-center gap-2 text-sm text-arena-text-sec">
              {t("speed")}
              <select
                className="press min-h-11 rounded-lg border border-arena-border bg-arena-bg px-2"
                value={speed}
                onChange={event => setSpeed(Number(event.target.value))}
              >
                {[1, 2, 4].map(rate => (
                  <option key={rate} value={rate}>
                    {rate}×
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
        <Substitutions
          frame={frame}
          settings={settings}
          canIntervene={canIntervene}
          scheduled={scenario.substitutions}
          onAdd={sub => changeSubstitutions([...scenario.substitutions, sub])}
          onRemove={sub =>
            changeSubstitutions(
              scenario.substitutions.filter(item => item !== sub),
            )
          }
        />
        {invalid && (
          <output className="text-sm text-arena-warning">
            {t("invalidSub")}
          </output>
        )}
        <section className="grid gap-2 rounded-xl border border-arena-border bg-arena-surface p-4">
          <h2 className="font-semibold">
            {t("comparison", { minutes: matchDuration / 60 })}
          </h2>
          <button
            className={`${actionClass} justify-self-start`}
            type="button"
            onClick={() => setBaseline(metrics(match, settings))}
          >
            {t("saveBaseline")}
          </button>
          {baseline && current && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th scope="col">{t("metric")}</th>
                  <th scope="col">{t("baseline")}</th>
                  <th scope="col">{t("current")}</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    "score",
                    "shots",
                    "recovery",
                    "conceded",
                    "leftSpace",
                    "rightSpace",
                  ] as const
                ).map(key => (
                  <tr key={key} className="border-arena-border border-t">
                    <th className="py-2 font-normal" scope="row">
                      {t(`metrics.${key}`)}
                    </th>
                    <td>{baseline[key]}</td>
                    <td>{current[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
      <div className="grid min-w-0 content-start gap-4">
        <ScenarioControls
          scenario={scenario}
          onChange={change}
          onMove={move}
          canIntervene={canIntervene}
        />
        {scenario.moves.length > 0 && (
          <button
            type="button"
            className={actionClass}
            onClick={() => change({ ...scenario, moves: [] })}
          >
            {t("clearPositions")}
          </button>
        )}
        <section className="grid gap-2 rounded-xl border border-arena-border bg-arena-surface p-4">
          <h2 className="font-semibold">{t("highlights")}</h2>
          {events.length === 0 ? (
            <p className="text-sm text-arena-text-sec">{t("noHighlights")}</p>
          ) : (
            <ol className="grid">
              {events.map((event, index) => (
                <li key={`${event.second}-${event.kind}-${index}`}>
                  <button
                    type="button"
                    className="press flex min-h-11 w-full items-center gap-2 border-arena-border border-b text-left text-sm"
                    onClick={() => {
                      setPlaying(false);
                      seek(event.second);
                    }}
                  >
                    <span className="font-mono text-arena-text-sec">
                      {clock(event.second)}
                    </span>
                    {eventLabel(event)}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
