import { EventType } from "@/types/timer";
import { AlertTriangle, CircleDot, Skull, Trophy } from "lucide-react";
import React from "react";

interface EventButtonProps {
  type: EventType;
  onClick: () => void;
}

export const EventButton: React.FC<EventButtonProps> = ({ type, onClick }) => {
  let baseClasses =
    "flex flex-col items-center justify-center p-4 rounded-xl transition-all transform active:scale-95 shadow-lg border border-white/10 backdrop-blur-sm ";
  let icon;

  switch (type) {
    case EventType.GOAL:
      baseClasses +=
        "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/50";
      icon = <Trophy size={28} className="mb-1" />;
      break;
    case EventType.ASSIST:
      baseClasses +=
        "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/50";
      icon = <CircleDot size={28} className="mb-1" />;
      break;
    case EventType.YELLOW_CARD:
      baseClasses +=
        "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/50";
      icon = <AlertTriangle size={28} className="mb-1" />;
      break;
    case EventType.RED_CARD:
      baseClasses +=
        "bg-red-600/20 hover:bg-red-600/30 text-red-500 border-red-500/50";
      icon = <Skull size={28} className="mb-1" />;
      break;
    default:
      baseClasses += "bg-slate-700 text-white";
      icon = <CircleDot size={28} className="mb-1" />;
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {icon}
      <span className="text-xs font-bold tracking-wider uppercase">{type}</span>
    </button>
  );
};
