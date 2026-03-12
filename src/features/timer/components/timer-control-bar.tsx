"use client";

import { Pause, Play, RotateCcw, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { TimerMode } from "@/types/timer";

interface TimerControlBarProps {
  isActive: boolean;
  time: number;
  timerMode: TimerMode;
  holdProgress: number;
  onResetClick: () => void;
  onPressStart: () => void;
  onPressEnd: () => void;
  onPressCancel: () => void;
}

export function TimerControlBar({
  isActive,
  time,
  timerMode,
  holdProgress,
  onResetClick,
  onPressStart,
  onPressEnd,
  onPressCancel,
}: TimerControlBarProps) {
  const t = useTranslations("timer.controls");
  return (
    <div className="pb-safe fixed right-0 bottom-0 left-0 z-30 border-t border-slate-800 bg-slate-900/90 p-4 backdrop-blur-xl select-none">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <button
          type="button"
          onClick={onResetClick}
          className="rounded-2xl bg-slate-800 p-4 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white active:scale-95"
        >
          <RotateCcw size={24} />
        </button>

        <div className="relative flex-1">
          <button
            type="button"
            onMouseDown={onPressStart}
            onMouseUp={onPressEnd}
            onMouseLeave={onPressCancel}
            onTouchStart={onPressStart}
            onTouchEnd={onPressEnd}
            onTouchCancel={onPressCancel}
            className={`relative z-10 flex w-full transform items-center justify-center space-x-2 overflow-hidden rounded-2xl p-4 text-lg font-bold shadow-xl transition-all active:scale-95 ${
              isActive
                ? "border border-slate-700 bg-slate-800 text-white"
                : "bg-blue-600 text-white shadow-blue-900/30"
            }`}
          >
            {isActive ? (
              <>
                <Pause size={24} fill="currentColor" />
                <span>{t("pause")}</span>
              </>
            ) : (
              <>
                <Play size={24} fill="currentColor" />
                <span>
                  {(timerMode === TimerMode.COUNT_DOWN ||
                    timerMode === TimerMode.LOOP) &&
                  time === 0
                    ? t("finished")
                    : t("start")}
                </span>
              </>
            )}
          </button>

          {/* Hold Progress Bar */}
          {isActive && holdProgress > 0 && (
            <div className="absolute right-2 -bottom-2 left-2 z-0 h-1 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full bg-red-500 transition-all duration-75 ease-linear"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          className="rounded-2xl bg-slate-800 p-4 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white active:scale-95"
        >
          <Share2 size={24} />
        </button>
      </div>
    </div>
  );
}
