import { playWhistle } from "@/services/audioService";
import { AppSettings, GamePart, GameType, TimerMode } from "@/types/timer";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  LayoutGrid,
  Palette,
  Repeat,
  Save,
  Volume2,
  X,
} from "lucide-react";
import React, { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  const handleDurationChange = (part: GamePart, minutes: string) => {
    const mins = parseInt(minutes) || 0;
    setLocalSettings(prev => ({
      ...prev,
      durations: {
        ...prev.durations,
        [part]: mins * 60,
      },
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="animate-in fade-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl duration-200">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/95 p-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <Clock size={20} className="text-blue-500" />
            Match Settings
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="custom-scrollbar space-y-8 overflow-y-auto p-6">
          {/* Match Mode Section */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
              <LayoutGrid size={14} /> Match Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(GameType).map(type => (
                <button
                  key={type}
                  onClick={() =>
                    setLocalSettings(s => ({ ...s, gameType: type }))
                  }
                  className={`rounded-xl border px-2 py-3 text-sm font-bold transition-all ${
                    localSettings.gameType === type
                      ? "border-blue-500 bg-blue-600/20 text-blue-400"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Team Customization */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
              <Palette size={14} /> Team Customization
            </label>
            <div className="space-y-4">
              {/* Team A */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3">
                <span className="mb-2 block text-xs font-bold text-slate-400">
                  Team A (Home)
                </span>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={localSettings.teamA.color}
                    onChange={e =>
                      setLocalSettings(s => ({
                        ...s,
                        teamA: { ...s.teamA, color: e.target.value },
                      }))
                    }
                    className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent"
                    title="Choose Team Color"
                  />
                  <input
                    type="text"
                    value={localSettings.teamA.name}
                    onChange={e =>
                      setLocalSettings(s => ({
                        ...s,
                        teamA: { ...s.teamA, name: e.target.value },
                      }))
                    }
                    className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="Team Name"
                  />
                </div>
              </div>

              {/* Team B */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3">
                <span className="mb-2 block text-xs font-bold text-slate-400">
                  Team B (Away)
                </span>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={localSettings.teamB.color}
                    onChange={e =>
                      setLocalSettings(s => ({
                        ...s,
                        teamB: { ...s.teamB, color: e.target.value },
                      }))
                    }
                    className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent"
                    title="Choose Team Color"
                  />
                  <input
                    type="text"
                    value={localSettings.teamB.name}
                    onChange={e =>
                      setLocalSettings(s => ({
                        ...s,
                        teamB: { ...s.teamB, name: e.target.value },
                      }))
                    }
                    className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="Team Name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timer Mode Section */}
          <div>
            <label className="mb-3 block text-xs font-bold tracking-wider text-slate-500 uppercase">
              Timer Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() =>
                  setLocalSettings(s => ({
                    ...s,
                    timerMode: TimerMode.COUNT_UP,
                  }))
                }
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                  localSettings.timerMode === TimerMode.COUNT_UP
                    ? "border-blue-500 bg-blue-600/20 text-blue-400"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <ArrowUpCircle size={24} />
                <span className="text-[10px] font-bold sm:text-xs">
                  Progressive
                </span>
              </button>
              <button
                onClick={() =>
                  setLocalSettings(s => ({
                    ...s,
                    timerMode: TimerMode.COUNT_DOWN,
                  }))
                }
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                  localSettings.timerMode === TimerMode.COUNT_DOWN
                    ? "border-blue-500 bg-blue-600/20 text-blue-400"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <ArrowDownCircle size={24} />
                <span className="text-[10px] font-bold sm:text-xs">
                  Regressive
                </span>
              </button>
              <button
                onClick={() =>
                  setLocalSettings(s => ({ ...s, timerMode: TimerMode.LOOP }))
                }
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                  localSettings.timerMode === TimerMode.LOOP
                    ? "border-blue-500 bg-blue-600/20 text-blue-400"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <Repeat size={24} />
                <span className="text-[10px] font-bold sm:text-xs">Loop</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {localSettings.timerMode === TimerMode.COUNT_UP
                ? "Timer counts up from 00:00."
                : localSettings.timerMode === TimerMode.COUNT_DOWN
                  ? "Timer counts down to 00:00 and plays a sound."
                  : "Timer counts down, plays a sound, and resets. User must start next round manually."}
            </p>
          </div>

          {/* Durations Section */}
          <div>
            <label className="mb-3 block text-xs font-bold tracking-wider text-slate-500 uppercase">
              Part Durations (Minutes)
            </label>
            <div className="space-y-3">
              {Object.values(GamePart).map(part => (
                <div
                  key={part}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3"
                >
                  <span className="text-sm font-medium text-slate-300">
                    {part}
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={Math.floor(localSettings.durations[part] / 60)}
                    onChange={e => handleDurationChange(part, e.target.value)}
                    className="w-16 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sound Test */}
          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3">
            <span className="text-sm text-slate-400">Timer End Sound</span>
            <button
              onClick={playWhistle}
              className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1.5 text-xs text-white transition-colors hover:bg-slate-600"
            >
              <Volume2 size={14} />
              Test Sound
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-slate-800 bg-slate-900/95 p-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-500"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
