import { AppSettings, EventType, GameEvent, Player } from "@/types/timer";
import { Shield, Skull, User, Users, X } from "lucide-react";
import React from "react";

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlayer: (player: Player | null) => void;
  players: Player[];
  eventType: EventType | null;
  settings?: AppSettings;
  events: GameEvent[];
}

export const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlayer,
  players,
  eventType,
  settings,
  events,
}) => {
  if (!isOpen) return null;

  const teamA = players.filter(p => p.team === "A");
  const teamB = players.filter(p => p.team === "B");
  const unassigned = players.filter(p => !p.team);

  const getEventColor = (type: EventType | null) => {
    switch (type) {
      case EventType.YELLOW_CARD:
        return "text-yellow-400";
      case EventType.RED_CARD:
        return "text-red-500";
      case EventType.GOAL:
        return "text-emerald-400";
      case EventType.ASSIST:
        return "text-blue-400";
      default:
        return "text-white";
    }
  };

  // Helper to check if player is sent off
  const isPlayerSentOff = (playerId: string): boolean => {
    const playerEvents = events.filter(e => e.playerId === playerId);
    const yellowCards = playerEvents.filter(
      e => e.type === EventType.YELLOW_CARD,
    ).length;
    const redCards = playerEvents.filter(
      e => e.type === EventType.RED_CARD,
    ).length;

    return redCards > 0 || yellowCards >= 2;
  };

  const renderPlayerList = (
    list: Player[],
    teamLabel?: string,
    teamColor?: string,
  ) => (
    <div className="mb-4">
      {teamLabel && (
        <h4
          className="mb-2 text-xs font-bold tracking-wider uppercase"
          style={{ color: teamColor || "#94a3b8" }}
        >
          {teamLabel}
        </h4>
      )}
      <div className="grid grid-cols-2 gap-2">
        {list.map(player => {
          const isSentOff = isPlayerSentOff(player.id);

          return (
            <button
              key={player.id}
              onClick={() => !isSentOff && onSelectPlayer(player)}
              disabled={isSentOff}
              className={`relative flex items-center space-x-3 overflow-hidden rounded-xl border p-3 text-left transition-all ${
                isSentOff
                  ? "cursor-not-allowed border-red-900/30 bg-slate-900/50 opacity-60"
                  : "border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-700 active:scale-95"
              }`}
            >
              {isSentOff && (
                <div className="absolute top-2 right-2 text-red-500">
                  <Skull size={14} />
                </div>
              )}
              <div
                className={`rounded-full p-2 ${isSentOff ? "bg-slate-800 text-slate-600" : "bg-slate-900 text-slate-400"}`}
              >
                <User size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-bold ${isSentOff ? "text-red-400 line-through decoration-2" : "text-slate-200"}`}
                >
                  {player.name}
                </p>
                <p className="text-xs text-slate-500">
                  {isSentOff ? "Sent Off" : player.position}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="pointer-events-auto absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="animate-in slide-in-from-bottom-10 pointer-events-auto relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border-t border-slate-800 bg-slate-900 shadow-2xl duration-300 sm:rounded-2xl sm:border">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-800 bg-slate-900/95 p-4">
          <div className="flex items-center gap-2">
            <div
              className={`rounded-lg bg-slate-800 p-2 ${getEventColor(eventType)}`}
            >
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-lg leading-tight font-bold text-white">
                Who receives the {eventType}?
              </h3>
              <p className="text-xs text-slate-400">
                Select a player to assign this event
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto p-4">
          <button
            onClick={() => onSelectPlayer(null)}
            className="mb-6 flex w-full items-center justify-center space-x-2 rounded-xl border border-dashed border-slate-600 p-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
          >
            <Users size={18} />
            <span className="text-sm font-medium">
              General / No Specific Player
            </span>
          </button>

          {players.length === 0 ? (
            <div className="py-8 text-center text-slate-500 italic">
              No players added yet. Go to Team Builder to add players.
            </div>
          ) : (
            <>
              {teamA.length > 0 &&
                renderPlayerList(
                  teamA,
                  settings?.teamA.name || "Team A",
                  settings?.teamA.color || "#3b82f6",
                )}
              {teamB.length > 0 &&
                renderPlayerList(
                  teamB,
                  settings?.teamB.name || "Team B",
                  settings?.teamB.color || "#ef4444",
                )}
              {unassigned.length > 0 &&
                renderPlayerList(unassigned, "Unassigned Players")}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
