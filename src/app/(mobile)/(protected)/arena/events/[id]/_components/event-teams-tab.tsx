"use client";

import {
  AlertCircle,
  Check,
  ChevronRight,
  Sparkles,
  UserPlus,
} from "lucide-react";
import type { TranslationValues, useTranslations } from "next-intl";
import { useState } from "react";
import type { EventRosterEntry } from "@/actions/attendance.actions";
import {
  type BalancedPlayer,
  balanceTeamsWithAI,
} from "@/actions/team-balancer.actions";
import { JbAvatar } from "@/components/arena/avatar";
import { type Guest, GuestsSheet } from "@/components/arena/guests-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Format = "5vs5" | "7vs7" | "11vs11";
type NumTeams = 2 | 3 | 4;

interface BalanceResult {
  teamA: BalancedPlayer[];
  teamB: BalancedPlayer[];
  avgA: string;
  avgB: string;
}

interface EventTeamsTabProps {
  eventId: number;
  roster: EventRosterEntry[];
  filledSpots: number;
  totalSpots: number;
  t: ReturnType<typeof useTranslations<"arenaEventDetail">>;
}

export function EventTeamsTab({
  eventId,
  roster,
  filledSpots,
  totalSpots,
  t,
}: EventTeamsTabProps) {
  const [format, setFormat] = useState<Format>("7vs7");
  const [numTeams, setNumTeams] = useState<NumTeams>(2);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [balancing, setBalancing] = useState(false);
  const [balanceResult, setBalanceResult] = useState<BalanceResult | null>(
    null,
  );

  const totalFilled = filledSpots + guests.length;
  const vacancies = Math.max(0, totalSpots - totalFilled);

  const handleBalance = async () => {
    setBalancing(true);
    try {
      const result = await balanceTeamsWithAI(
        eventId,
        guests.map(g => ({ id: g.id, name: g.name, rating: g.rating })),
      );
      if (result.success) {
        setBalanceResult(result.data);
      }
    } finally {
      setBalancing(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {vacancies > 0 ? (
        <div className="bg-arena-warning/5 border border-arena-warning/25 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-[0_4px_24px_rgba(245,158,11,0.02)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-arena-warning/10 border border-arena-warning/20 flex items-center justify-center shrink-0">
              <AlertCircle
                className="w-5.5 h-5.5 text-arena-warning"
                strokeWidth={1.8}
              />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-arena-text block">
                {t("interactive.missingAlert", {
                  count: vacancies,
                } as TranslationValues)}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5">
                {t("interactive.missingAlertSub", {
                  format,
                  teamsCount: numTeams,
                } as TranslationValues)}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-sora font-extrabold text-lg text-arena-text">
              {totalFilled}
              <span className="text-xs font-semibold text-arena-text-muted">
                /{totalSpots}
              </span>
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-arena-success/5 border border-arena-success/25 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-[0_4px_24px_rgba(34,197,94,0.02)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-arena-success/10 border border-arena-success/20 flex items-center justify-center shrink-0">
              <Check
                className="w-5.5 h-5.5 text-arena-primary"
                strokeWidth={2.8}
              />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-arena-text block">
                {t("interactive.squadFull")}
              </span>
              <span className="text-xs text-arena-text-muted block mt-0.5">
                {t("interactive.readyToBalance")}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-sora font-extrabold text-lg text-arena-text">
              {totalFilled}
              <span className="text-xs font-semibold text-arena-text-muted">
                /{totalSpots}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Format selector */}
      <div className="bg-arena-surface border border-arena-border rounded-[16px] p-3.5 flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-extrabold text-arena-text-muted uppercase tracking-wider">
            {t("interactive.formatLabel")}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(["5vs5", "7vs7", "11vs11"] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={cn(
                  "h-10 rounded-xl font-extrabold text-xs border transition-all active:scale-97 flex items-center justify-center",
                  format === f
                    ? "bg-arena-surface border-arena-primary/40 text-arena-primary"
                    : "bg-arena-bg-sec/50 border-arena-border text-arena-text-sec hover:border-arena-border/80",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-arena-border/30 pt-3.5 gap-2">
          <span className="text-xs font-bold text-arena-text-sec min-w-0">
            {t("interactive.teamsNumLabel")}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {([2, 3, 4] as const).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setNumTeams(n)}
                className={cn(
                  "w-8 h-8 rounded-lg border font-extrabold text-xs transition-all active:scale-97 flex items-center justify-center",
                  numTeams === n
                    ? "border-arena-primary text-arena-primary bg-arena-primary/10"
                    : "border-arena-border bg-arena-bg-sec/50 text-arena-text-sec hover:border-arena-border/80",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Player list */}
      <div className="flex flex-col gap-2">
        <div className="text-[10px] uppercase font-bold tracking-widest text-arena-text-muted px-1.5">
          {t("interactive.squadCount", {
            count: totalFilled,
          } as TranslationValues)}
        </div>
        <div className="bg-arena-surface border border-arena-border rounded-[16px] divide-y divide-arena-border/50 overflow-hidden">
          {roster.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3.5 gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-4 shrink-0 text-center text-[10px] font-bold text-arena-text-muted">
                  {idx + 1}
                </span>
                <div className="relative shrink-0">
                  <JbAvatar
                    id={player.id}
                    name={player.name}
                    size={32}
                    className="rounded-full overflow-hidden"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-arena-text truncate block">
                    {player.name}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-arena-text-muted mt-0.5 block truncate">
                    {player.pos}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {guests.map((guest, idx) => (
            <div
              key={guest.id}
              className="flex items-center justify-between p-3.5 gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-4 shrink-0 text-center text-[10px] font-bold text-arena-text-muted">
                  {roster.length + idx + 1}
                </span>
                <div className="relative shrink-0">
                  <JbAvatar
                    id={guest.id}
                    name={guest.name}
                    size={32}
                    className="rounded-full overflow-hidden"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-arena-text truncate">
                      {guest.name}
                    </span>
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.25 bg-arena-primary/15 text-arena-primary rounded border border-arena-primary/20 leading-none shrink-0">
                      {t("interactive.guest")}
                    </span>
                  </div>
                  <span
                    className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5 block font-bold"
                    style={{ color: guest.levelColor }}
                  >
                    {guest.levelLabel}
                  </span>
                </div>
              </div>
              <span className="font-sora font-extrabold text-sm text-arena-primary shrink-0">
                {guest.rating.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add guests */}
      <button
        type="button"
        onClick={() => setGuestsOpen(true)}
        className="w-full flex items-center justify-between p-3.5 border border-dashed border-arena-primary/30 bg-arena-surface rounded-[16px] active:scale-97 text-left transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-arena-primary/10 border border-arena-primary/20 flex items-center justify-center shrink-0">
            <UserPlus
              className="w-5.5 h-5.5 text-arena-primary"
              strokeWidth={1.8}
            />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm text-arena-text block">
              {t("interactive.addGuests")}
            </span>
            <span className="text-xs text-arena-text-muted block mt-0.5">
              {t("interactive.addGuestsSub", {
                count: vacancies,
              } as TranslationValues)}
            </span>
          </div>
        </div>
        <ChevronRight size={18} className="text-arena-text-muted shrink-0" />
      </button>

      {/* AI team balancer */}
      <div
        className="bg-arena-surface border border-arena-primary/30 rounded-[16px] p-4 flex flex-col gap-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(124, 255, 79, 0.08) 0%, var(--color-arena-surface) 60%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-arena-primary/15 border border-arena-primary/20 flex items-center justify-center shrink-0">
            <Sparkles
              className="w-4.5 h-4.5 text-arena-primary animate-pulse"
              strokeWidth={2}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-arena-text truncate block">
                {t("interactive.aiBalancerBeta")}
              </span>
              <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.25 bg-arena-primary/20 text-arena-primary rounded border border-arena-primary/30 leading-none shrink-0">
                BETA
              </span>
            </div>
            <span className="text-xs text-arena-text-muted block mt-0.5">
              {t("interactive.aiBalancerBetaSub")}
            </span>
          </div>
        </div>

        <Button
          onClick={handleBalance}
          disabled={balancing || roster.length === 0}
          className="w-full bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/95 font-bold h-auto py-3 rounded-xl text-sm transition-all gap-1.5 shadow-[0_0_24px_rgba(124,255,79,0.22)] disabled:opacity-60 whitespace-normal text-center"
        >
          <Sparkles
            className={cn(
              "w-4 h-4 shrink-0 fill-current",
              balancing && "animate-spin",
            )}
          />
          {t("interactive.aiBalancerCta", {
            count: numTeams,
          } as TranslationValues)}
        </Button>

        {balanceResult && (
          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                {
                  label: "A",
                  team: balanceResult.teamA,
                  avg: balanceResult.avgA,
                },
                {
                  label: "B",
                  team: balanceResult.teamB,
                  avg: balanceResult.avgB,
                },
              ] as const
            ).map(side => (
              <div
                key={side.label}
                className="bg-arena-bg-sec/50 border border-arena-border rounded-xl p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-arena-primary">
                    {t("interactive.teamLabel", {
                      label: side.label,
                    } as TranslationValues)}
                  </span>
                  <span className="text-[10px] font-bold text-arena-text-muted">
                    {side.avg}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {side.team.map(p => (
                    <div key={p.id} className="flex items-center gap-2 min-w-0">
                      <JbAvatar
                        id={p.id}
                        name={p.name}
                        size={22}
                        className="rounded-full overflow-hidden shrink-0"
                      />
                      <span className="text-xs font-medium text-arena-text truncate">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {guestsOpen && (
        <GuestsSheet
          guests={guests}
          setGuests={setGuests}
          suggestedMissing={vacancies}
          onClose={() => setGuestsOpen(false)}
        />
      )}
    </div>
  );
}
