import { EventType, GameEvent } from "@/types/timer";
import { Clock, Pencil, Trash2 } from "lucide-react";
import React from "react";

interface EventLogProps {
  events: GameEvent[];
  onDelete: (id: string) => void;
  onEdit: (event: GameEvent) => void;
  onEditTime: (event: GameEvent) => void;
}

export const EventLog: React.FC<EventLogProps> = ({
  events,
  onDelete,
  onEdit,
  onEditTime,
}) => {
  const reversedEvents = [...events].reverse();

  return (
    <div className="custom-scrollbar h-64 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800/50 p-4">
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-slate-800/95 py-2 text-xs font-bold tracking-wider text-slate-400 uppercase backdrop-blur">
        <span>Match Events</span>
        <span className="text-[10px] font-normal text-slate-500">
          Tap time to edit • Tap row for player
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-600 italic">
          No events recorded yet.
        </div>
      ) : (
        <div className="space-y-2">
          {reversedEvents.map(event => (
            <div
              key={event.id}
              onClick={() => onEdit(event)}
              className="group animate-in fade-in slide-in-from-bottom-2 flex cursor-pointer items-center justify-between rounded-lg border border-slate-700/50 bg-slate-700/40 p-3 transition-all duration-300 hover:border-slate-600 hover:bg-slate-700/80"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onEditTime(event);
                    }}
                    className="group/time flex items-center gap-1 rounded bg-slate-800 px-2 py-1 font-mono text-xs text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
                    title="Edit Time"
                  >
                    {event.formattedTime}
                    <Clock
                      size={10}
                      className="opacity-0 transition-opacity group-hover/time:opacity-100"
                    />
                  </button>

                  <span
                    className={`text-sm font-semibold ${
                      event.type === EventType.GOAL
                        ? "text-emerald-400"
                        : event.type === EventType.RED_CARD
                          ? "text-red-400"
                          : event.type === EventType.YELLOW_CARD
                            ? "text-yellow-400"
                            : "text-blue-400"
                    }`}
                  >
                    {event.type}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({event.gamePart})
                  </span>
                </div>

                {/* Player Tag */}
                {event.playerName ? (
                  <div className="mt-1 ml-1 flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        event.playerTeam === "A"
                          ? "bg-blue-500"
                          : event.playerTeam === "B"
                            ? "bg-red-500"
                            : "bg-slate-500"
                      }`}
                    />
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-300">
                      {event.playerName}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 ml-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Pencil size={10} /> Assign Player
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={e => {
                  e.stopPropagation(); // Prevent opening edit modal
                  onDelete(event.id);
                }}
                className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-800 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
