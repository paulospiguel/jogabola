"use client";

import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import Link from "next/link";
import { formatMinute } from "./format";
import { decodeResult } from "./share";
import { onColor } from "./team-color";

export function ResultView({ data }: { data: string | null }) {
  const r = data ? decodeResult(data) : null;

  if (!r) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-arena-text-sec">
          Resultado inválido ou expirado.
        </p>
        <Link
          href="/timer"
          className="rounded-[10px] bg-arena-primary px-4 py-2 text-sm font-bold text-arena-bg"
        >
          Abrir cronómetro
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-4 px-4 py-8">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-arena-primary/15 ring-1 ring-arena-primary/40">
          <Timer size={18} className="text-arena-primary" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
          JogaBola · {r.t}
        </span>
      </div>

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className="flex items-center justify-center gap-4 rounded-[20px] border border-arena-border bg-arena-surface py-7"
      >
        <div className="flex flex-col items-center gap-1.5">
          <span
            className="grid size-11 place-items-center rounded-xl text-base font-extrabold"
            style={{ background: r.a.c, color: onColor(r.a.c) }}
          >
            {r.a.n.slice(0, 1).toUpperCase()}
          </span>
          <span className="max-w-[88px] truncate text-sm font-bold text-arena-text-sec">
            {r.a.n}
          </span>
        </div>
        <span className="font-sora text-5xl font-extrabold tabular-nums text-arena-text">
          {r.sa}
          <span className="px-1 text-arena-text-muted">-</span>
          {r.sb}
        </span>
        <div className="flex flex-col items-center gap-1.5">
          <span
            className="grid size-11 place-items-center rounded-xl text-base font-extrabold"
            style={{ background: r.b.c, color: onColor(r.b.c) }}
          >
            {r.b.n.slice(0, 1).toUpperCase()}
          </span>
          <span className="max-w-[88px] truncate text-sm font-bold text-arena-text-sec">
            {r.b.n}
          </span>
        </div>
      </motion.div>

      {r.g.length > 0 && (
        <section className="flex flex-col gap-1.5 rounded-[16px] border border-arena-border bg-arena-surface p-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
            Golos
          </h2>
          {r.g.map(([side, min, name, assist]) => (
            <div
              key={`${side}-${min}-${name}`}
              className="flex items-center gap-2 text-sm"
            >
              <span className="w-8 font-mono text-xs text-arena-text-muted">
                {formatMinute(min * 60)}
              </span>
              <span>⚽</span>
              <span className="font-semibold text-arena-text">{name}</span>
              {assist && (
                <span className="text-xs text-arena-info">
                  assist. {assist}
                </span>
              )}
              <span
                className="ml-auto text-xs font-bold"
                style={{ color: side === "A" ? r.a.c : r.b.c }}
              >
                {(side === "A" ? r.a.n : r.b.n).slice(0, 3)}
              </span>
            </div>
          ))}
        </section>
      )}

      {r.k.length > 0 && (
        <section className="flex flex-col gap-1.5 rounded-[16px] border border-arena-border bg-arena-surface p-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
            Cartões
          </h2>
          {r.k.map(([side, min, name, color]) => (
            <div
              key={`${side}-${min}-${name}`}
              className="flex items-center gap-2 text-sm"
            >
              <span className="w-8 font-mono text-xs text-arena-text-muted">
                {formatMinute(min * 60)}
              </span>
              <span
                className="h-4 w-2.5 rounded-[2px]"
                style={{ background: color === "red" ? "#EF4444" : "#FACC15" }}
              />
              <span className="font-semibold text-arena-text">{name}</span>
              <span
                className="ml-auto text-xs font-bold"
                style={{ color: side === "A" ? r.a.c : r.b.c }}
              >
                {(side === "A" ? r.a.n : r.b.n).slice(0, 3)}
              </span>
            </div>
          ))}
        </section>
      )}

      <Link
        href="/timer"
        className="mt-2 flex items-center justify-center rounded-[14px] bg-arena-primary py-3.5 font-extrabold text-arena-bg"
      >
        Criar o meu jogo
      </Link>
    </div>
  );
}
