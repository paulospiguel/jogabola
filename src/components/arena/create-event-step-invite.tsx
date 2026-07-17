"use client";

import { Check, Search } from "lucide-react";
import type { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { getAvatarColor } from "./create-event-avatar-color";

interface Player {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface CreateEventStepInviteProps {
  rosterPlayers: Player[];
  filteredPlayers: Player[];
  selectedPlayerIds: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTogglePlayer: (playerId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  t: ReturnType<typeof useTranslations<"arenaCreateEvent">>;
}

function getDisplayPos(initials: string, role: string): string {
  if (role === "captain") return "PL";
  const map: Record<string, string> = {
    DF: "GR",
    AC: "DD",
    TM: "DC",
    BA: "DC",
    RP: "DE",
    FR: "MC",
    NS: "MC",
    JM: "MD",
  };
  return map[initials] ?? "PL";
}

export function CreateEventStepInvite({
  rosterPlayers,
  filteredPlayers,
  selectedPlayerIds,
  searchQuery,
  onSearchChange,
  onTogglePlayer,
  onSelectAll,
  onClearAll,
  t,
}: CreateEventStepInviteProps) {
  const allSelected = selectedPlayerIds.length === rosterPlayers.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-arena-text-muted">
          {selectedPlayerIds.length}/{rosterPlayers.length}{" "}
          {t("final.selectedCount", { count: rosterPlayers.length })}
        </span>
        <button
          type="button"
          onClick={allSelected ? onClearAll : onSelectAll}
          className="text-[11px] font-bold text-arena-primary hover:underline transition-all"
        >
          {allSelected ? t("invite.clear") : t("invite.all")}
        </button>
      </div>

      <div className="relative flex items-center shrink-0">
        <Search className="absolute left-3.5 size-4 text-arena-text-muted" />
        <Input
          placeholder={t("invite.search")}
          onChange={e => onSearchChange(e.target.value)}
          value={searchQuery}
          className="h-11 pl-10 pr-4 rounded-xl border-arena-border bg-[#0B0F14]/50 text-xs font-semibold placeholder:text-arena-text-muted/60 focus-visible:ring-arena-primary/45 w-full"
        />
      </div>

      <div className="flex flex-col gap-2 mt-1.5 overflow-y-auto max-h-[36vh] pr-1">
        {filteredPlayers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-arena-border px-4 py-8 text-center text-xs text-arena-text-muted font-medium bg-[#0B0F14]/10">
            {t("invite.empty")}
          </div>
        ) : (
          filteredPlayers.map(player => {
            const checked = selectedPlayerIds.includes(player.id);
            const initials = player.name
              .split(" ")
              .map(n => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const initialsBg = getAvatarColor(initials);
            const displayPos = getDisplayPos(initials, player.role);

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => onTogglePlayer(player.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all hover:bg-arena-surface-el",
                  checked
                    ? "border-arena-primary/40 bg-arena-primary/5"
                    : "border-arena-border bg-[#0B0F14]/30",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                      initialsBg,
                    )}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[13px] font-extrabold text-arena-text leading-none">
                      {player.name}
                    </span>
                    <span className="block text-[9px] font-black uppercase text-arena-text-muted mt-1 leading-none tracking-widest">
                      {displayPos}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "size-[18px] rounded-[5px] border flex items-center justify-center transition-colors shrink-0 mr-1",
                    checked
                      ? "bg-arena-primary border-arena-primary text-[#0B0F14]"
                      : "border-arena-border bg-[#0B0F14]",
                  )}
                >
                  {checked && <Check size={12} strokeWidth={4} />}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
