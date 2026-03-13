import { Clock, Save, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

interface TimeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeconds: number;
  onSave: (newSeconds: number) => void;
}

export const TimeEditModal: React.FC<TimeEditModalProps> = ({
  isOpen,
  onClose,
  initialSeconds,
  onSave,
}) => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMinutes(Math.floor(initialSeconds / 60));
      setSeconds(initialSeconds % 60);
    }
  }, [isOpen, initialSeconds]);

  if (!isOpen) return null;

  const handleSave = () => {
    const totalSeconds = minutes * 60 + seconds;
    onSave(totalSeconds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Clock size={20} className="text-blue-500" />
            Edit Time
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex flex-col items-center">
            <Label
              htmlFor="time-edit-minutes"
              className="mb-1 text-[10px] font-bold uppercase text-slate-500"
            >
              Min
            </Label>
            <input
              id="time-edit-minutes"
              type="number"
              min="0"
              max="150"
              value={minutes}
              onChange={e =>
                setMinutes(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-20 h-16 text-3xl font-mono text-center bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <span className="text-2xl font-bold text-slate-600 mt-4">:</span>
          <div className="flex flex-col items-center">
            <Label
              htmlFor="time-edit-seconds"
              className="mb-1 text-[10px] font-bold uppercase text-slate-500"
            >
              Sec
            </Label>
            <input
              id="time-edit-seconds"
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={e =>
                setSeconds(
                  Math.min(59, Math.max(0, parseInt(e.target.value) || 0)),
                )
              }
              className="w-20 h-16 text-3xl font-mono text-center bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
