"use client";

import { Brain, Check, ChevronRight, Sparkles, UserPlus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Cta } from "@/components/arena/cta";
import type { Guest } from "@/components/arena/guests-sheet";
import { GuestsSheet } from "@/components/arena/guests-sheet";
import { cn } from "@/lib/utils";
import { PlayerRow } from "./equipas-player-row";

type Format = { pPerTeam: 5 | 7 | 11; nTeams: 2 | 3 | 4 };

interface EquipasSetupPhaseProps {
  confirmed: { id: string; name: string; image: string | null }[];
  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  format: Format;
  setFormat: (updater: (f: Format) => Format) => void;
  showGuestsSheet: boolean;
  setShowGuestsSheet: (show: boolean) => void;
  missing: number;
  filled: number;
  required: number;
  canGenerate: boolean;
  statusOk: boolean;
  onGenerate: () => void;
  t: ReturnType<typeof useTranslations<"arenaEquipas">>;
}

export function EquipasSetupPhase({
  confirmed,
  guests,
  setGuests,
  format,
  setFormat,
  showGuestsSheet,
  setShowGuestsSheet,
  missing,
  filled,
  required,
  canGenerate,
  statusOk,
  onGenerate,
  t,
}: EquipasSetupPhaseProps) {
  return (
    <div className="flex flex-col gap-3.5 px-5 py-4 pb-28">
      {/* Status card */}
      <div
        className={cn(
          "rounded-[14px] border p-3.5",
          statusOk
            ? "border-arena-success/44 bg-arena-success/[0.08]"
            : missing > 0
              ? "border-arena-warning/33 bg-arena-warning/[0.07]"
              : "border-arena-border bg-arena-surface",
        )}
      >
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-[10px]",
                statusOk ? "bg-arena-success/22" : "bg-arena-warning/22",
              )}
            >
              {statusOk ? (
                <Check size={15} className="text-arena-success" strokeWidth={2.2} />
              ) : (
                <Users size={15} className="text-arena-warning" strokeWidth={2.2} />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-arena-text">
                {statusOk
                  ? t("status.complete")
                  : missing > 0
                    ? t("status.missing", { count: missing })
                    : t("status.overflow", { count: -missing })}
              </div>
              <div className="text-[11px] text-arena-text-muted">
                {format.pPerTeam}vs{format.pPerTeam} · {format.nTeams}{" "}
                {t("status.teams")}
              </div>
            </div>
          </div>
          <div className="shrink-0 font-sora text-[18px] font-extrabold leading-none text-arena-text">
            {filled}
            <span className="text-[13px] font-semibold text-arena-text-muted">
              /{required}
            </span>
          </div>
        </div>
        <div className="h-[5px] overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${Math.min(100, (filled / required) * 100)}%`,
              background: statusOk ? "#22C55E" : "#F59E0B",
            }}
          />
        </div>
      </div>

      {/* Format selector */}
      <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3.5">
        <div className="mb-2.5 flex items-center gap-1.5">
          <span className="text-[11px] font-bold tracking-[0.7px] text-arena-text-sec uppercase">
            {t("format.label")}
          </span>
        </div>
        <div className="mb-2.5 flex gap-1.5">
          {([5, 7, 11] as const).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setFormat(f => ({ ...f, pPerTeam: n }))}
              className={cn(
                "flex h-9 flex-1 items-center justify-center rounded-[10px] border text-[13px] font-bold transition-all duration-100 active:scale-[0.97]",
                format.pPerTeam === n
                  ? "border-arena-primary/55 bg-arena-primary/15 text-arena-primary"
                  : "border-arena-border bg-arena-surface-el text-arena-text-sec",
              )}
            >
              {n}vs{n}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-arena-text-muted">
            {t("format.numTeams")}
          </span>
          <div className="flex gap-1">
            {([2, 3, 4] as const).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setFormat(f => ({ ...f, nTeams: n }))}
                className={cn(
                  "flex size-8 items-center justify-center rounded-[8px] border text-[12px] font-bold transition-all duration-100 active:scale-[0.97]",
                  format.nTeams === n
                    ? "border-arena-primary/55 bg-arena-primary/15 text-arena-primary"
                    : "border-arena-border bg-arena-surface-el text-arena-text-sec",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmed list */}
      <div>
        <div className="mb-2 px-0.5 text-[12px] font-bold uppercase tracking-[0.6px] text-arena-text">
          {t("confirmed.label")}{" "}
          <span className="font-medium text-arena-text-muted">
            · {confirmed.length}
          </span>
        </div>
        {confirmed.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-arena-border px-4 py-4 text-center text-[12px] text-arena-text-muted">
            {t("confirmed.empty")}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {confirmed.map((p, i) => (
              <PlayerRow
                key={p.id}
                player={{ ...p, rating: 0, isGuest: false }}
                rank={i + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Guests */}
      <div>
        <div className="mb-2 flex items-center justify-between px-0.5">
          <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-arena-text">
            {t("guests.label")}{" "}
            <span className="font-medium text-arena-text-muted">
              · {guests.length}
            </span>
          </span>
          {guests.length > 0 && (
            <button
              type="button"
              onClick={() => setShowGuestsSheet(true)}
              className="text-[12px] font-semibold text-arena-primary"
            >
              {t("guests.edit")}
            </button>
          )}
        </div>
        {guests.length === 0 ? (
          <button
            type="button"
            onClick={() => setShowGuestsSheet(true)}
            className="flex w-full items-center gap-3 rounded-[12px] border border-dashed border-arena-primary/44 bg-arena-surface px-3.5 py-3 active:scale-[0.97]"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[11px] border border-arena-primary/33 bg-arena-primary/18">
              <UserPlus size={17} className="text-arena-primary" strokeWidth={2.2} />
            </div>
            <div className="flex-1 text-left">
              <div className="text-[13px] font-bold text-arena-text">
                {t("guests.addTitle")}
              </div>
              <div className="mt-0.5 text-[11px] text-arena-text-muted">
                {missing > 0
                  ? t("guests.addSubMissing", { count: missing })
                  : t("guests.addSub")}
              </div>
            </div>
            <ChevronRight size={16} className="text-arena-text-muted" strokeWidth={2} />
          </button>
        ) : (
          <div className="flex flex-col gap-1.5">
            {guests.map((g, i) => (
              <PlayerRow
                key={g.id}
                player={{ ...g, id: g.id, isGuest: true, image: null }}
                rank={confirmed.length + i + 1}
                color={g.levelColor}
              />
            ))}
            <button
              type="button"
              onClick={() => setShowGuestsSheet(true)}
              className="flex items-center justify-center gap-1.5 rounded-[11px] border border-dashed border-arena-border py-2.5 text-[12px] font-semibold text-arena-text-sec transition-colors active:scale-[0.97]"
            >
              <UserPlus size={13} strokeWidth={2.2} />
              {t("guests.addMore")}
            </button>
          </div>
        )}
      </div>

      {/* AI Card */}
      <div
        className="relative overflow-hidden rounded-[16px] border border-arena-primary/33 p-4"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,255,79,0.10) 0%,var(--color-arena-surface) 60%)",
        }}
      >
        <div
          className="pointer-events-none absolute -top-8 -right-8 size-[140px] rounded-full"
          style={{
            background:
              "radial-gradient(circle,rgba(124,255,79,0.22) 0%,transparent 70%)",
          }}
        />
        <div className="relative mb-2.5 flex items-center gap-2.5">
          <div className="flex size-[34px] items-center justify-center rounded-[11px] border border-arena-primary/44 bg-arena-primary/22">
            <Brain size={17} className="text-arena-primary" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[14px] font-bold text-arena-text">
              {t("ai.title")}
              <span className="rounded-[5px] border border-arena-primary/44 bg-arena-primary/22 px-1.5 py-px text-[9px] font-bold tracking-[0.6px] text-arena-primary uppercase">
                BETA
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-arena-text-muted">
              {t("ai.sub")}
            </div>
          </div>
        </div>
        <Cta
          variant={canGenerate ? "primary" : "secondary"}
          size="lg"
          fullWidth
          disabled={!canGenerate}
          onClick={onGenerate}
          className={cn(canGenerate && "shadow-[0_0_24px_rgba(124,255,79,0.33)]")}
        >
          <Sparkles size={17} strokeWidth={2.2} />
          {canGenerate
            ? t("ai.cta", { count: format.nTeams })
            : t("ai.ctaDisabled", { count: format.nTeams * 2 - filled })}
        </Cta>
      </div>

      {showGuestsSheet && (
        <GuestsSheet
          guests={guests}
          setGuests={setGuests}
          suggestedMissing={missing}
          onClose={() => setShowGuestsSheet(false)}
        />
      )}
    </div>
  );
}
