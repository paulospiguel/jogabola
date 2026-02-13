"use client";

import { GamePart } from "@/types/timer";

interface GamePartSelectorProps {
  gamePart: GamePart;
  isActive: boolean;
  onPartChange: (part: GamePart) => void;
}

export function GamePartSelector({
  gamePart,
  isActive,
  onPartChange,
}: GamePartSelectorProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 select-none sm:mx-0 sm:px-0">
      <div className="flex min-w-max space-x-2">
        {Object.values(GamePart).map(part => {
          const isCurrent = gamePart === part;
          const isDisabled = isActive && !isCurrent;

          return (
            <button
              key={part}
              type="button"
              onClick={() => onPartChange(part)}
              disabled={isDisabled}
              className={`rounded-xl border px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
                isCurrent
                  ? "border-slate-600 bg-slate-800 text-white shadow"
                  : isDisabled
                    ? "cursor-not-allowed border-transparent bg-slate-900/20 text-slate-600 opacity-50"
                    : "border-transparent bg-slate-900/50 text-slate-500 hover:bg-slate-800"
              }`}
            >
              {part}
            </button>
          );
        })}
      </div>
    </div>
  );
}
