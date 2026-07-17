"use client";

import { AlertCircle, Check, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { cn } from "@/lib/utils";

export type GuestLevel = "beginner" | "medium" | "good";

export interface Guest {
  id: string;
  name: string;
  level: GuestLevel;
  rating: number;
  levelLabel: string;
  levelColor: string;
}

const LEVELS: {
  id: GuestLevel;
  rating: number;
  color: string;
}[] = [
  { id: "beginner", rating: 5.5, color: "#F59E0B" },
  { id: "medium", rating: 7, color: "#38BDF8" },
  { id: "good", rating: 8.5, color: "#7CFF4F" },
];

interface GuestsSheetProps {
  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  suggestedMissing: number;
  onClose: () => void;
}

export function GuestsSheet({
  guests,
  setGuests,
  suggestedMissing,
  onClose,
}: GuestsSheetProps) {
  const t = useTranslations("arenaEquipas");

  function makeGuest(index: number): Guest {
    return {
      id: `g-${Date.now()}-${index}`,
      name: t("guests.guestNumberPlaceholder", { n: index + 1 }),
      level: "medium",
      rating: 7,
      levelLabel: t("guests.levels.medium.label"),
      levelColor: "#38BDF8",
    };
  }

  const initialList = guests.length
    ? guests
    : Array.from(
        { length: Math.min(Math.max(suggestedMissing, 1), 11) },
        (_, i) => makeGuest(i),
      );

  const [local, setLocal] = useState<Guest[]>(initialList);

  function add() {
    setLocal(l => [...l, makeGuest(l.length)]);
  }

  function remove(id: string) {
    setLocal(l => l.filter(g => g.id !== id));
  }

  function updateName(id: string, name: string) {
    setLocal(l => l.map(g => (g.id === id ? { ...g, name } : g)));
  }

  function setLevel(id: string, levelId: GuestLevel) {
    const lv = LEVELS.find(x => x.id === levelId);
    if (!lv) return;
    setLocal(l =>
      l.map(g =>
        g.id === id
          ? {
              ...g,
              level: levelId,
              rating: lv.rating,
              levelLabel: t(`guests.levels.${levelId}.label`),
              levelColor: lv.color,
            }
          : g,
      ),
    );
  }

  function save() {
    setGuests(local);
    onClose();
  }

  return (
    <BottomSheet title={t("guests.title")} onClose={onClose}>
      <div className="flex flex-col gap-0 pb-2">
        {/* Info banner */}
        <div className="mx-1 mb-4 flex items-start gap-2.5 rounded-[11px] border border-arena-info/33 bg-arena-info/10 px-3 py-2.5">
          <AlertCircle
            size={14}
            className="mt-0.5 shrink-0 text-arena-info"
            strokeWidth={2}
          />
          <p className="text-[11px] leading-relaxed text-arena-text-sec">
            {t.rich("guests.infoText", {
              strong: chunks => (
                <strong className="font-bold text-arena-text">{chunks}</strong>
              ),
            })}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {local.map((g, i) => (
            <div
              key={g.id}
              className="flex items-center gap-2.5 rounded-[12px] border border-arena-border bg-arena-surface px-3 py-3"
            >
              {/* Number */}
              <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full border border-dashed border-arena-border bg-arena-surface-el/50 text-[11px] font-bold text-arena-text-muted">
                {i + 1}
              </div>

              {/* Name input */}
              <input
                value={g.name}
                onChange={e => updateName(g.id, e.target.value)}
                placeholder={t("guests.guestNumberPlaceholder", { n: i + 1 })}
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-arena-text outline-none placeholder:text-arena-text-muted"
              />

              {/* Level selector */}
              <div className="flex shrink-0 gap-0.5 rounded-[9px] border border-arena-border bg-arena-surface-el p-0.5">
                {LEVELS.map(lv => (
                  <button
                    key={lv.id}
                    type="button"
                    onClick={() => setLevel(g.id, lv.id)}
                    className={cn(
                      "rounded-[7px] px-2.5 py-1 text-[10.5px] font-bold transition-all duration-150 active:scale-[0.95]",
                      g.level === lv.id
                        ? "font-extrabold text-white"
                        : "bg-transparent text-arena-text-muted hover:text-arena-text-sec",
                    )}
                    style={
                      g.level === lv.id
                        ? { background: `${lv.color}33`, color: lv.color }
                        : undefined
                    }
                  >
                    {t(`guests.levels.${lv.id}.short`)}
                  </button>
                ))}
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => remove(g.id)}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-arena-text-muted transition-colors active:scale-[0.97] hover:text-arena-danger"
              >
                <X size={13} strokeWidth={2} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={add}
            className="flex items-center justify-center gap-1.5 rounded-[11px] border border-dashed border-arena-border py-2.5 text-[12px] font-semibold text-arena-text-sec transition-all duration-150 active:scale-[0.97] hover:bg-arena-surface-el/40 hover:border-arena-text-muted/30 hover:text-arena-text"
          >
            <Plus size={13} strokeWidth={2.2} />
            {t("guests.addMore")}
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-arena-border pt-3">
        <Cta variant="secondary" size="md" className="flex-1" onClick={onClose}>
          {t("guests.cancel")}
        </Cta>
        <Cta
          variant="primary"
          size="md"
          className="flex-[2] gap-1.5"
          onClick={save}
        >
          <Check size={15} strokeWidth={2.5} />
          {t("guests.save", { count: local.length })}
        </Cta>
      </div>
    </BottomSheet>
  );
}
