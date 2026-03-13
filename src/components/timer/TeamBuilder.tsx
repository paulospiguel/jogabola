import { generateBalancedTeams } from "@/services/geminiService";
import {
    AppSettings,
    EventType,
    GameEvent,
    GameType,
    Player,
    PlayerStats,
    Position,
} from "@/types/timer";
import {
    Activity,
    ArrowDownUp,
    BarChart2,
    ClipboardList,
    Goal,
    Hand,
    Pencil,
    RefreshCw,
    Save,
    Settings,
    Shield,
    Shirt,
    Skull,
    SlidersHorizontal,
    Sparkles,
    Trash2,
    UserPlus,
    X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { PlayerStatsChart } from "./PlayerStatsChart";

interface TeamBuilderProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  settings: AppSettings;
  events: GameEvent[];
}

// Helper to generate stats based on Position and Skill (1-5)
const generateStats = (pos: Position, skill: number): PlayerStats => {
  // Base multiplier: skill 1=50, 3=70, 5=90 (approx)
  const base = 40 + skill * 10;
  const variance = () => Math.floor(Math.random() * 10) - 5; // +/- 5 randomness

  const stats: PlayerStats = {
    pace: base,
    shooting: base,
    passing: base,
    dribbling: base,
    defense: base,
    physical: base,
  };

  // Adjust based on position
  switch (pos) {
    case Position.FWD:
      stats.shooting += 15;
      stats.pace += 10;
      stats.dribbling += 10;
      stats.defense -= 20;
      break;
    case Position.MID:
      stats.passing += 15;
      stats.dribbling += 5;
      stats.defense += 5;
      break;
    case Position.DEF:
      stats.defense += 20;
      stats.physical += 15;
      stats.shooting -= 15;
      stats.dribbling -= 10;
      break;
    case Position.GK:
      stats.physical += 10;
      stats.defense += 10; // Using defense as "Reflexes/Positioning" proxy
      stats.pace -= 10;
      stats.shooting -= 30;
      stats.passing += 5;
      break;
  }

  // Clamp values between 0-99
  (Object.keys(stats) as Array<keyof PlayerStats>).forEach(key => {
    stats[key] = Math.min(99, Math.max(10, stats[key] + variance()));
  });

  return stats;
};

const GAME_LIMITS: Record<GameType, number> = {
  [GameType.FIVE]: 5,
  [GameType.SEVEN]: 7,
  [GameType.ELEVEN]: 11,
};

export const TeamBuilder: React.FC<TeamBuilderProps> = ({
  players,
  setPlayers,
  settings,
  events,
}) => {
  const { gameType } = settings;

  // Add Player State
  const [newName, setNewName] = useState("");
  const [newPos, setNewPos] = useState<Position>(Position.MID);
  const [newSkill, setNewSkill] = useState(3);

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null); // For animation

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Player | null>(null);

  // Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");

  // Custom Stats State
  const [showCustomStats, setShowCustomStats] = useState(false);
  const [customStats, setCustomStats] = useState<PlayerStats>({
    pace: 70,
    shooting: 70,
    passing: 70,
    dribbling: 70,
    defense: 70,
    physical: 70,
  });

  // Auto-update stats when Position or Skill changes (unless manually editing)
  useEffect(() => {
    if (!showCustomStats) {
      setCustomStats(generateStats(newPos, newSkill));
    }
  }, [newPos, newSkill, showCustomStats]);

  // Helper to check if player is sent off
  const isPlayerSentOff = (playerId: string): boolean => {
    if (!events) return false;
    const playerEvents = events.filter(e => e.playerId === playerId);
    const yellowCards = playerEvents.filter(
      e => e.type === EventType.YELLOW_CARD,
    ).length;
    const redCards = playerEvents.filter(
      e => e.type === EventType.RED_CARD,
    ).length;

    return redCards > 0 || yellowCards >= 2;
  };

  const addPlayer = () => {
    if (!newName.trim()) return;

    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName.trim(),
      position: newPos,
      skill: newSkill,
      team: null,
      stats: customStats,
      isSubstitute: false,
    };
    setPlayers(prev => [...prev, player]);
    setNewName("");
    setShowCustomStats(false);
  };

  const processImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split("\n");
    const newPlayers: Player[] = [];

    lines.forEach(line => {
      // Regex to strip numbers, bullets etc.
      const cleanName = line.replace(/^[\d\.\-\)\*\•\s]+/, "").trim();

      if (cleanName.length > 1) {
        newPlayers.push({
          id: Math.random().toString(36).substr(2, 9),
          name: cleanName,
          position: Position.MID, // Default
          skill: 3, // Default
          team: null,
          stats: generateStats(Position.MID, 3),
          isSubstitute: false,
        });
      }
    });

    if (newPlayers.length > 0) {
      setPlayers(prev => [...prev, ...newPlayers]);
      setImportText("");
      setShowImportModal(false);
    }
  };

  const deletePlayer = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlayerSentOff(id)) {
      alert("Cannot delete a player who has been sent off during a match.");
      return;
    }

    // Use a slight timeout to allow the event loop to clear before confirm blocks
    setTimeout(() => {
      if (window.confirm("Are you sure you want to delete this player?")) {
        setPlayers(prev => prev.filter(p => p.id !== id));
      }
    }, 10);
  };

  // --- Edit Functions ---

  const startEditing = (player: Player, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlayerSentOff(player.id)) return; // Cannot edit sent off player
    setEditingId(player.id);
    setEditData(JSON.parse(JSON.stringify(player)));
    setExpandedPlayerId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const saveEdit = () => {
    if (!editData || !editingId) return;
    setPlayers(prev => prev.map(p => (p.id === editingId ? editData : p)));
    setEditingId(null);
    setEditData(null);
  };

  const recalculateEditStats = () => {
    if (!editData) return;
    const newStats = generateStats(editData.position, editData.skill);
    setEditData({ ...editData, stats: newStats });
  };

  // --- Team Generation ---

  const handleAiGeneration = async () => {
    if (players.length < 2) return;
    setIsGenerating(true);
    try {
      const { teamAIds, teamBIds } = await generateBalancedTeams(
        players,
        gameType,
      );
      const limit = GAME_LIMITS[gameType];

      setPlayers(prev => {
        // Helper to sort IDs by skill to determine starters
        const getPlayer = (id: string) => prev.find(p => p.id === id);

        // Sort generated teams by skill desc
        const sortedA = teamAIds
          .map(getPlayer)
          .filter((p): p is Player => !!p)
          .sort((a, b) => b.skill - a.skill);

        const sortedB = teamBIds
          .map(getPlayer)
          .filter((p): p is Player => !!p)
          .sort((a, b) => b.skill - a.skill);

        const startersA = new Set(sortedA.slice(0, limit).map(p => p.id));
        const startersB = new Set(sortedB.slice(0, limit).map(p => p.id));

        return prev.map(p => {
          if (teamAIds.includes(p.id)) {
            return { ...p, team: "A", isSubstitute: !startersA.has(p.id) };
          }
          if (teamBIds.includes(p.id)) {
            return { ...p, team: "B", isSubstitute: !startersB.has(p.id) };
          }
          return { ...p, team: null, isSubstitute: false };
        });
      });
    } catch {
      alert("Failed to generate teams. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const manualAssign = (
    id: string,
    team: "A" | "B" | null,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
    if (isPlayerSentOff(id)) {
      // Trigger shake or alert? Shake handled in render maybe, or simple return
      return;
    }

    setPlayers(prev => {
      const currentTeamCount = prev.filter(
        p => p.team === team && !p.isSubstitute && p.id !== id,
      ).length;
      const limit = GAME_LIMITS[gameType];

      // If moving to a team, check if starters are full. If so, make sub.
      let isSub = false;
      if (team !== null && currentTeamCount >= limit) {
        isSub = true;
      }

      return prev.map(p =>
        p.id === id ? { ...p, team, isSubstitute: isSub } : p,
      );
    });
  };

  const toggleSubstitute = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlayerSentOff(id)) {
      setShakingId(id);
      setTimeout(() => setShakingId(null), 400);
      return;
    }

    const player = players.find(p => p.id === id);
    if (!player || !player.team) return;

    // Validation: If trying to become a starter (currently isSubstitute=true)
    if (player.isSubstitute) {
      const limit = GAME_LIMITS[gameType];
      const currentStarters = players.filter(
        p => p.team === player.team && !p.isSubstitute && p.id !== id,
      ).length;

      if (currentStarters >= limit) {
        // Trigger Shake Animation
        setShakingId(id);
        setTimeout(() => setShakingId(null), 400); // Match animation duration
        return;
      }
    }

    setPlayers(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isSubstitute: !p.isSubstitute } : p,
      ),
    );
  };

  const resetTeams = () => {
    setPlayers(prev =>
      prev.map(p => ({ ...p, team: null, isSubstitute: false })),
    );
  };

  const toggleExpand = (id: string) => {
    if (editingId === id) return;
    setExpandedPlayerId(prev => (prev === id ? null : id));
  };

  const getPositionIcon = (pos: Position) => {
    switch (pos) {
      case Position.GK:
        return <Hand size={14} className="text-yellow-500" />;
      case Position.DEF:
        return <Shield size={14} className="text-blue-400" />;
      case Position.MID:
        return <Activity size={14} className="text-emerald-400" />;
      case Position.FWD:
        return <Goal size={14} className="text-red-400" />;
    }
  };

  const renderPlayerCard = (p: Player, showActions = true) => {
    const isEditing = editingId === p.id;

    // --- EDIT MODE CARD ---
    if (isEditing && editData) {
      return (
        <div
          key={p.id}
          className="animate-in fade-in zoom-in-95 relative mb-2 overflow-hidden rounded-lg border-2 border-blue-500/50 bg-slate-800 shadow-lg duration-200"
        >
          <div className="space-y-4 p-4">
            {/* Header Edit */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={editData.name}
                onChange={e =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold text-white focus:border-blue-500 focus:outline-none"
                placeholder="Name"
              />
              <div className="flex gap-2">
                <select
                  value={editData.position}
                  onChange={e =>
                    setEditData({
                      ...editData,
                      position: e.target.value as Position,
                    })
                  }
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {Object.values(Position).map(pos => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                <select
                  value={editData.skill}
                  onChange={e =>
                    setEditData({ ...editData, skill: Number(e.target.value) })
                  }
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5].map(s => (
                    <option key={s} value={s}>
                      {s} ★
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats Edit Grid */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Attributes
                </span>
                <button
                  onClick={recalculateEditStats}
                  className="flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[10px] text-blue-400 transition-colors hover:text-blue-300"
                >
                  <RefreshCw size={10} />
                  Recalculate
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {editData.stats &&
                  (Object.keys(editData.stats) as Array<keyof PlayerStats>).map(
                    stat => (
                      <div key={stat}>
                        <Label
                          htmlFor={`edit-stat-${stat}`}
                          className="mb-1 block truncate text-[10px] font-bold tracking-wider text-slate-500 uppercase"
                        >
                          {stat.slice(0, 3)}
                        </Label>
                        <input
                          id={`edit-stat-${stat}`}
                          type="number"
                          value={editData.stats![stat]}
                          onChange={e => {
                            const val = Math.min(
                              99,
                              Math.max(0, parseInt(e.target.value) || 0),
                            );
                            setEditData({
                              ...editData,
                              stats: { ...editData.stats!, [stat]: val },
                            });
                          }}
                          className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1 text-center font-mono text-xs text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    ),
                  )}
              </div>
            </div>

            {/* Edit Actions */}
            <div className="flex justify-end gap-2 border-t border-slate-700 pt-1">
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-700"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-500"
              >
                <Save size={14} />
                Save
              </button>
            </div>
          </div>
        </div>
      );
    }

    // --- DISPLAY MODE CARD ---
    const displayStats = p.stats || generateStats(p.position, p.skill);
    const isExpanded = expandedPlayerId === p.id;
    const isSub = p.isSubstitute && p.team;
    const isShaking = shakingId === p.id;
    const isSentOff = isPlayerSentOff(p.id);

    // Determine border color based on team
    let borderClass = "border-slate-700";
    if (p.team === "A")
      borderClass =
        "border-l-4 border-l-[var(--team-a-color)] border-slate-700";
    else if (p.team === "B")
      borderClass =
        "border-l-4 border-l-[var(--team-b-color)] border-slate-700";

    const cardStyle = {
      "--team-a-color": settings.teamA.color,
      "--team-b-color": settings.teamB.color,
    } as React.CSSProperties;

    return (
      <div
        key={p.id}
        style={cardStyle}
        className={`group relative mb-2 overflow-hidden rounded-lg border bg-slate-800/50 transition-all duration-300 ${isShaking ? "shake-animation" : ""} ${isExpanded ? "bg-slate-800" : "hover:border-slate-600"} ${isSub ? "opacity-75" : ""} ${isSentOff ? "border-red-900/50 bg-red-900/10 opacity-60 grayscale" : ""} ${p.team ? borderClass : "border-slate-700"}`}
      >
        {/* Card Header / Main Info */}
        <div className="flex items-center justify-between p-3">
          <div
            className="flex flex-1 cursor-pointer items-center gap-3"
            onClick={() => toggleExpand(p.id)}
          >
            <div
              className={`rounded-md p-2 transition-colors group-hover:bg-slate-600 ${isSub ? "bg-slate-800 text-slate-500" : "bg-slate-700"}`}
            >
              {getPositionIcon(p.position)}
            </div>
            <div>
              <div
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isSub ? "text-slate-400" : isSentOff ? "text-red-400" : "text-slate-200 group-hover:text-white"}`}
              >
                {p.name}
                {isSub && (
                  <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Sub
                  </span>
                )}
                {isSentOff && (
                  <span className="flex items-center gap-1 rounded bg-red-900/50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-red-300 uppercase">
                    <Skull size={10} /> Suspended
                  </span>
                )}
              </div>
              <div className="flex space-x-1 text-xs text-slate-500">
                <span>{p.position}</span>
                <span>•</span>
                <div className="flex text-yellow-500">
                  {[...Array(p.skill)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Team assignment buttons */}
            {showActions && !isSentOff && (
              <>
                <button
                  onClick={e => manualAssign(p.id, "A", e)}
                  style={{ backgroundColor: settings.teamA.color }}
                  className={`flex h-6 w-6 items-center justify-center rounded border border-white/10 text-xs font-bold transition-colors ${p.team === "A" ? "opacity-100 ring-2 ring-white/20" : "opacity-20 hover:opacity-60"}`}
                >
                  A
                </button>
                <button
                  onClick={e => manualAssign(p.id, "B", e)}
                  style={{ backgroundColor: settings.teamB.color }}
                  className={`flex h-6 w-6 items-center justify-center rounded border border-white/10 text-xs font-bold transition-colors ${p.team === "B" ? "opacity-100 ring-2 ring-white/20" : "opacity-20 hover:opacity-60"}`}
                >
                  B
                </button>
              </>
            )}

            {/* Sub Toggle (Only if assigned and not sent off) */}
            {p.team && (
              <button
                onClick={e => toggleSubstitute(p.id, e)}
                disabled={isSentOff}
                className={`ml-1 p-1.5 transition-colors ${
                  isSentOff
                    ? "cursor-not-allowed text-slate-600"
                    : p.isSubstitute
                      ? "text-slate-500 hover:text-white"
                      : "text-emerald-400 hover:text-emerald-300"
                }`}
                title={
                  isSentOff
                    ? "Player Suspended"
                    : p.isSubstitute
                      ? "Make Starter"
                      : "Make Substitute"
                }
              >
                <ArrowDownUp size={16} />
              </button>
            )}

            {/* Edit Button */}
            <button
              onClick={e => startEditing(p, e)}
              disabled={isSentOff}
              className={`ml-1 p-1.5 transition-colors ${isSentOff ? "text-slate-700" : "text-slate-500 hover:text-yellow-400"}`}
              title="Edit Player"
            >
              <Pencil size={16} />
            </button>

            {/* Expand Stats Button */}
            <button
              onClick={() => toggleExpand(p.id)}
              className={`p-1.5 transition-colors ${isExpanded ? "text-blue-400" : "text-slate-500 hover:text-blue-400"}`}
            >
              <BarChart2 size={16} />
            </button>

            {/* Delete / Remove Button */}
            {showActions ? (
              <button
                type="button"
                onClick={e => deletePlayer(p.id, e)}
                disabled={isSentOff}
                className={`ml-1 p-1.5 transition-colors ${isSentOff ? "text-slate-700" : "text-slate-600 hover:text-red-400"}`}
              >
                <Trash2 size={16} />
              </button>
            ) : (
              <button
                onClick={e => manualAssign(p.id, null, e)}
                disabled={isSentOff}
                className={`ml-2 rounded px-2 py-1 text-xs transition-colors ${isSentOff ? "cursor-not-allowed text-slate-700" : "text-slate-500 hover:bg-slate-700 hover:text-slate-300"}`}
              >
                X
              </button>
            )}
          </div>
        </div>

        {/* Expanded Stats Section */}
        {isExpanded && (
          <div className="animate-in slide-in-from-top-2 border-t border-slate-700 bg-slate-900/50 p-4 duration-200">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              {/* Radar Chart */}
              <div className="flex-shrink-0 rounded-full bg-slate-900 p-2 shadow-inner">
                <PlayerStatsChart
                  stats={displayStats}
                  size={140}
                  color={
                    p.team === "B" ? settings.teamB.color : settings.teamA.color
                  }
                />
              </div>

              {/* Numeric Stats Grid */}
              <div className="grid w-full grid-cols-2 gap-x-6 gap-y-2 text-xs">
                {Object.entries(displayStats).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between border-b border-slate-800/50 pb-1"
                  >
                    <span className="font-bold tracking-wider text-slate-400 uppercase">
                      {key.substring(0, 4)}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        value > 80
                          ? "text-emerald-400"
                          : value > 60
                            ? "text-blue-400"
                            : "text-slate-500"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTeamColumn = (teamId: "A" | "B", teamPlayers: Player[]) => {
    const isTeamA = teamId === "A";
    const teamConfig = isTeamA ? settings.teamA : settings.teamB;

    const starters = teamPlayers.filter(p => !p.isSubstitute);
    const subs = teamPlayers.filter(p => p.isSubstitute);
    const limit = GAME_LIMITS[gameType];

    return (
      <div
        className="flex h-full flex-col rounded-2xl border bg-slate-900/30 p-4 transition-colors duration-300"
        style={{ borderColor: `${teamConfig.color}40` }} // 25% opacity
      >
        <h3
          className="mb-4 flex items-center justify-between font-bold tracking-wider uppercase"
          style={{ color: teamConfig.color }}
        >
          {teamConfig.name}
          <span
            className="rounded px-2 py-0.5 font-mono text-xs font-bold text-white"
            style={{ backgroundColor: `${teamConfig.color}80` }}
          >
            {teamPlayers.length}
          </span>
        </h3>

        {/* Starters */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
              <Shirt size={12} /> Starting Lineup
            </h4>
            <span
              className={`font-mono text-[10px] ${starters.length === limit ? "text-emerald-400" : starters.length > limit ? "text-red-400" : "text-slate-600"}`}
            >
              {starters.length}/{limit}
            </span>
          </div>
          {starters.length === 0 && (
            <div className="mb-2 rounded-lg border border-dashed border-slate-800 py-3 text-center text-xs text-slate-700 italic">
              No starters
            </div>
          )}
          <div className="space-y-0">
            {starters.map(p => renderPlayerCard(p, false))}
          </div>
        </div>

        {/* Substitutes */}
        {subs.length > 0 && (
          <div className="mt-auto border-t border-slate-800/50 pt-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wide text-slate-600 uppercase">
              <ArrowDownUp size={12} /> Substitutes
            </h4>
            <div className="space-y-0">
              {subs.map(p => renderPlayerCard(p, false))}
            </div>
          </div>
        )}

        {teamPlayers.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-600 italic">
            No players assigned
          </div>
        )}
      </div>
    );
  };

  const teamA = players.filter(p => p.team === "A");
  const teamB = players.filter(p => p.team === "B");
  const unassigned = players.filter(p => !p.team);

  return (
    <div className="space-y-6 pb-32">
      {/* Match Mode Badge */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5 shadow-lg">
          <Settings size={14} className="text-slate-400" />
          <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
            Match Mode:
          </span>
          <span className="text-xs font-bold text-blue-400">{gameType}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Player Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addPlayer()}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <select
              value={newPos}
              onChange={e => setNewPos(e.target.value as Position)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              {Object.values(Position).map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={newSkill}
              onChange={e => setNewSkill(Number(e.target.value))}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map(s => (
                <option key={s} value={s}>
                  {s} ★
                </option>
              ))}
            </select>

            {/* Custom Stats Toggle */}
            <button
              onClick={() => setShowCustomStats(!showCustomStats)}
              className={`rounded-xl border p-2 transition-colors ${
                showCustomStats
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
              }`}
              title="Customize Stats"
            >
              <SlidersHorizontal size={20} />
            </button>

            <button
              onClick={addPlayer}
              className="rounded-xl bg-emerald-600 p-2 text-white shadow-lg shadow-emerald-900/20 transition-colors hover:bg-emerald-500"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>

        {/* Manual Stats Inputs (Add Form) */}
        {showCustomStats && (
          <div className="animate-in slide-in-from-top-2 grid grid-cols-3 gap-2 rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 sm:grid-cols-6">
            {(Object.keys(customStats) as Array<keyof PlayerStats>).map(
              stat => (
                <div key={stat}>
                  <Label
                    htmlFor={`custom-stat-${stat}`}
                    className="mb-1 block text-[10px] font-bold tracking-wider text-slate-500 uppercase"
                  >
                    {stat.slice(0, 3)}
                  </Label>
                  <input
                    id={`custom-stat-${stat}`}
                    type="number"
                    value={customStats[stat]}
                    onChange={e => {
                      const val = Math.min(
                        99,
                        Math.max(0, parseInt(e.target.value) || 0),
                      );
                      setCustomStats(prev => ({ ...prev, [stat]: val }));
                    }}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-center font-mono text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ),
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          {/* AI Balance Button */}
          <button
            onClick={handleAiGeneration}
            disabled={isGenerating || players.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:from-purple-500 hover:to-blue-500 disabled:opacity-50"
          >
            <Sparkles size={18} />
            {isGenerating ? "Balancing Teams..." : "AI Auto-Balance"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 font-medium text-slate-300 transition-colors hover:bg-slate-700"
            >
              <ClipboardList size={18} />
              Import List
            </button>

            <button
              onClick={resetTeams}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 font-medium text-slate-400 transition-colors hover:bg-slate-700 hover:text-red-400"
            >
              <Trash2 size={18} />
              Reset Teams
            </button>
          </div>
        </div>
      </div>

      {/* Teams Display */}
      <div className="grid items-start gap-4 md:grid-cols-2">
        {renderTeamColumn("A", teamA)}
        {renderTeamColumn("B", teamB)}
      </div>

      {/* Unassigned Pool */}
      {unassigned.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <h3 className="mb-4 flex items-center justify-between font-bold tracking-wider text-slate-400 uppercase">
            Unassigned{" "}
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-300">
              {unassigned.length}
            </span>
          </h3>
          <div className="grid gap-2 md:grid-cols-2">
            {unassigned.map(p => renderPlayerCard(p, true))}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowImportModal(false)}
          />
          <div className="animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <ClipboardList className="text-blue-500" size={20} />
                Import Players
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-400">
              Paste your player list below. We support numbered lists (e.g., "1.
              Name"), bullet points, or names on new lines.
            </p>
            <textarea
              className="mb-4 h-40 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              placeholder={
                "1. Lionel Messi\n2. Cristiano Ronaldo\n3. Neymar Jr\n- Kylian Mbappé"
              }
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={processImport}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
              >
                Process Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
