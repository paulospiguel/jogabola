"use client";

import { Logo } from "@/components/logo";
import { AuthButton } from "@/components/timer/AuthButton";
import { CircularTimer } from "@/components/timer/CircularTimer";
import { ConfirmationModal } from "@/components/timer/ConfirmationModal";
import { EventButton } from "@/components/timer/EventButton";
import { EventLog } from "@/components/timer/EventLog";
import { PlayerSelectionModal } from "@/components/timer/PlayerSelectionModal";
import { SettingsModal } from "@/components/timer/SettingsModal";
import { TeamBuilder } from "@/components/timer/TeamBuilder";
import { TimeEditModal } from "@/components/timer/TimeEditModal";
import { useTimer } from "@/hooks/use-timer";
import { useSession } from "@/lib/auth-client";
import { playWhistle } from "@/services/audioService";
import { generateMatchSummary } from "@/services/geminiService";
import {
  AppSettings,
  EventType,
  GameEvent,
  GamePart,
  GameType,
  Player,
  TimerMode,
} from "@/types/timer";
import {
  Pause,
  Play,
  RotateCcw,
  Settings,
  Share2,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function App() {
  // Auth State - Using Better Auth
  const { data: session } = useSession();

  // Navigation State (Local only, no need to persist view preference usually)
  const [currentView, setCurrentView] = useState<"timer" | "teams">("timer");

  // --- Persisted State (Local Storage + Cloud) ---

  // App Settings
  const [settings, setSettings] = useTimer<AppSettings>(
    "promatch_settings",
    {
      timerMode: TimerMode.COUNT_UP,
      durations: {
        [GamePart.FIRST_HALF]: 45 * 60,
        [GamePart.SECOND_HALF]: 45 * 60,
        [GamePart.EXTRA_TIME]: 15 * 60,
        [GamePart.TRAINING]: 10 * 60,
      },
      gameType: GameType.FIVE,
      teamA: { name: "Team A", color: "#3b82f6" }, // Blue
      teamB: { name: "Team B", color: "#ef4444" }, // Red
    },
    session?.user,
  );

  // Match Data
  const [gamePart, setGamePart] = useTimer<GamePart>(
    "promatch_game_part",
    GamePart.FIRST_HALF,
    session?.user,
  );
  const [events, setEvents] = useTimer<GameEvent[]>(
    "promatch_events",
    [],
    session?.user,
  );

  // Timer Data - Persist time for EACH part separately
  // Structure: { "1st Half": 120, "2nd Half": 0, ... }
  const [partTimes, setPartTimes] = useTimer<Record<string, number>>(
    "promatch_part_times",
    {},
    session?.user,
  );

  // Team Data
  const [players, setPlayers] = useTimer<Player[]>(
    "promatch_players",
    [],
    session?.user,
  );

  // Local UI State (Non-persisted)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // We initialize local time state based on the current part's persisted data or default
  const getInitialTime = () => {
    if (partTimes[gamePart] !== undefined) return partTimes[gamePart];
    // Both Count Down and Loop modes start at the full duration
    return settings.timerMode === TimerMode.COUNT_DOWN ||
      settings.timerMode === TimerMode.LOOP
      ? settings.durations[gamePart]
      : 0;
  };

  const [time, setTime] = useState(getInitialTime());

  const [isActive, setIsActive] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Modal State
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [pendingEventType, setPendingEventType] = useState<EventType | null>(
    null,
  );
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Time Edit Modal State
  const [timeEditEvent, setTimeEditEvent] = useState<GameEvent | null>(null);

  // Long Press State
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const isLongPressTriggered = useRef(false);
  const isPressing = useRef(false); // Track if the user is actively pressing the button

  const intervalRef = useRef<number | null>(null);

  // Note: Better Auth session is managed by useSession hook
  // No need for manual auth listener

  // Restore/Sync Time when Game Part or Settings change
  useEffect(() => {
    if (!isActive) {
      // If we have a saved time for this part, load it.
      if (partTimes[gamePart] !== undefined) {
        setTime(partTimes[gamePart]);
      } else {
        // Otherwise, initialize with default (0 or Duration)
        const target =
          settings.timerMode === TimerMode.COUNT_DOWN ||
          settings.timerMode === TimerMode.LOOP
            ? settings.durations[gamePart]
            : 0;
        setTime(target);
      }
    }
  }, [gamePart, settings.timerMode, settings.durations, partTimes, isActive]);

  // Timer Logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTime(prevTime => {
          let newTime;
          const targetTime = settings.durations[gamePart];

          if (settings.timerMode === TimerMode.COUNT_UP) {
            newTime = prevTime + 1;
          } else if (settings.timerMode === TimerMode.COUNT_DOWN) {
            // Count Down Logic
            if (prevTime <= 1) {
              setIsActive(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
              playWhistle();
              newTime = 0;
            } else {
              newTime = prevTime - 1;
            }
          } else if (settings.timerMode === TimerMode.LOOP) {
            // Loop Logic
            if (prevTime <= 1) {
              playWhistle();
              // Stop the timer to wait for manual restart
              setIsActive(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
              // Reset to full duration immediately for the next match
              newTime = targetTime;
            } else {
              newTime = prevTime - 1;
            }
          } else {
            newTime = prevTime; // Fallback
          }

          // Persist the new time for the CURRENT part
          setPartTimes(prev => ({
            ...prev,
            [gamePart]: newTime,
          }));

          return newTime;
        });
      }, 1000);
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    isActive,
    settings.timerMode,
    gamePart,
    settings.durations,
    setPartTimes,
  ]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStartPause = () => setIsActive(!isActive);

  const handleResetClick = () => {
    setIsResetModalOpen(true);
  };

  const executeReset = () => {
    setIsActive(false);
    const targetTime = settings.durations[gamePart];
    const resetValue =
      settings.timerMode === TimerMode.COUNT_DOWN ||
      settings.timerMode === TimerMode.LOOP
        ? targetTime
        : 0;

    setTime(resetValue);
    // Clear ALL persisted times for a full match reset
    setPartTimes({});
    setEvents([]);
    setSummary(null);
    setHoldProgress(0);
  };

  const handlePartChange = (part: GamePart) => {
    if (isActive) return; // Prevent navigation while timer is running
    setGamePart(part);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    const modeChanged = newSettings.timerMode !== settings.timerMode;
    setSettings(newSettings);
    setIsActive(false);

    if (modeChanged) {
      // If switching modes, previous saved times are invalid (e.g., 10s elapsed vs 10s remaining)
      setPartTimes({});
      const target =
        newSettings.timerMode === TimerMode.COUNT_DOWN ||
        newSettings.timerMode === TimerMode.LOOP
          ? newSettings.durations[gamePart]
          : 0;
      setTime(target);
    }
    // If only durations changed, the useEffect will handle updating start times if needed
  };

  // --- Event Handling ---

  // Triggered when an event button is clicked (New Event)
  const handleEventButtonClick = (type: EventType) => {
    setPendingEventType(type);
    setEditingEventId(null); // Ensure we are not editing
    setIsPlayerModalOpen(true);
  };

  // Triggered when clicking an existing event in the log (Edit Event)
  const handleEventEdit = (event: GameEvent) => {
    setPendingEventType(event.type);
    setEditingEventId(event.id);
    setIsPlayerModalOpen(true);
  };

  // Triggered when clicking the time of an event
  const handleEventTimeEdit = (event: GameEvent) => {
    setTimeEditEvent(event);
  };

  const saveEventTime = (newTotalSeconds: number) => {
    if (!timeEditEvent) return;

    setEvents(prev =>
      prev.map(e =>
        e.id === timeEditEvent.id
          ? {
              ...e,
              timestamp: newTotalSeconds,
              formattedTime: formatTime(newTotalSeconds),
            }
          : e,
      ),
    );

    setTimeEditEvent(null);
  };

  const handlePlayerModalClose = () => {
    setIsPlayerModalOpen(false);
    setPendingEventType(null);
    setEditingEventId(null);
  };

  // Called when player is selected (or null for generic) from Modal
  const handlePlayerSelect = (player: Player | null) => {
    if (editingEventId) {
      // Update existing event
      setEvents(prev =>
        prev.map(e =>
          e.id === editingEventId
            ? {
                ...e,
                playerId: player?.id,
                playerName: player?.name,
                playerTeam: player?.team,
              }
            : e,
        ),
      );
    } else if (pendingEventType) {
      // Create new event
      logEvent(pendingEventType, player);
    }
    handlePlayerModalClose();
  };

  const logEvent = (type: EventType, player: Player | null = null) => {
    const duration = settings.durations[gamePart];
    const elapsedSeconds =
      settings.timerMode === TimerMode.COUNT_UP ? time : duration - time;

    const newEvent: GameEvent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: elapsedSeconds,
      gamePart: gamePart,
      formattedTime: formatTime(elapsedSeconds),
      playerId: player?.id,
      playerName: player?.name,
      playerTeam: player?.team,
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    const duration = settings.durations[gamePart];
    const elapsedSeconds =
      settings.timerMode === TimerMode.COUNT_UP ? time : duration - time;

    const result = await generateMatchSummary(events, gamePart, elapsedSeconds);
    setSummary(result);
    setIsGeneratingSummary(false);
  };

  // --- Long Press Logic for Reset ---
  const handlePressStart = () => {
    isPressing.current = true; // Mark interaction start

    if (!isActive) return; // Only activate long press if timer is running

    isLongPressTriggered.current = false;
    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    if (holdTimerRef.current) clearInterval(holdTimerRef.current);

    holdTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        isLongPressTriggered.current = true;
        setIsActive(false); // Pause immediately
        setIsResetModalOpen(true);
        setHoldProgress(0);
        isPressing.current = false; // Reset press state
      }
    }, 16); // ~60 FPS
  };

  const handlePressEnd = () => {
    if (!isPressing.current) return; // Ignore spurious events
    isPressing.current = false;

    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldProgress(0);

    // If we didn't trigger the long press action, treat it as a click
    if (!isLongPressTriggered.current) {
      handleStartPause();
    }
    isLongPressTriggered.current = false;
  };

  const handlePressCancel = () => {
    if (isPressing.current) {
      isPressing.current = false;
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      setHoldProgress(0);
      isLongPressTriggered.current = false;
    }
  };

  const targetDuration = settings.durations[gamePart];

  // Visual calculation for circular timer
  // For Loop mode, we want it to look like countdown (full -> empty)
  const getTimerColor = () => {
    if (settings.timerMode === TimerMode.COUNT_UP) {
      return time > targetDuration ? "#ef4444" : "#3b82f6";
    } else {
      // Count Down or Loop
      return time < 60 ? "#ef4444" : "#3b82f6";
    }
  };

  return (
    <div className="pb-safe relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* App Header */}
      <header className="safe-top sticky top-0 z-40 flex flex-col gap-4 border-b border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="small" variant="white" />
          </div>
          <div className="flex items-center gap-2">
            <AuthButton user={session?.user || null} />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-full p-2 transition-colors hover:bg-slate-800"
            >
              <Settings size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex rounded-xl bg-slate-800 p-1 shadow-inner select-none">
          <button
            onClick={() => setCurrentView("timer")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
              currentView === "timer"
                ? "bg-slate-700 text-white shadow-md ring-1 ring-white/5"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Timer size={16} />
            Match
          </button>
          <button
            onClick={() => setCurrentView("teams")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
              currentView === "teams"
                ? "bg-slate-700 text-white shadow-md ring-1 ring-white/5"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users size={16} />
            Teams
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4 pb-36">
        {currentView === "timer" ? (
          <div className="animate-in fade-in space-y-6 duration-500">
            {/* Game Part Selector - Scrollable on mobile */}
            <div className="-mx-4 overflow-x-auto px-4 pb-2 select-none sm:mx-0 sm:px-0">
              <div className="flex min-w-max space-x-2">
                {Object.values(GamePart).map(part => {
                  const isCurrent = gamePart === part;
                  const isDisabled = isActive && !isCurrent;

                  return (
                    <button
                      key={part}
                      onClick={() => handlePartChange(part)}
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

            {/* Main Circular Timer */}
            <div className="flex justify-center py-2 select-none">
              <CircularTimer
                currentTime={time}
                duration={targetDuration}
                radius={130}
                stroke={8}
                color={getTimerColor()}
              />
            </div>

            {/* Event Actions */}
            <div className="grid grid-cols-4 gap-3 select-none">
              <EventButton
                type={EventType.GOAL}
                onClick={() => handleEventButtonClick(EventType.GOAL)}
              />
              <EventButton
                type={EventType.ASSIST}
                onClick={() => handleEventButtonClick(EventType.ASSIST)}
              />
              <EventButton
                type={EventType.YELLOW_CARD}
                onClick={() => handleEventButtonClick(EventType.YELLOW_CARD)}
              />
              <EventButton
                type={EventType.RED_CARD}
                onClick={() => handleEventButtonClick(EventType.RED_CARD)}
              />
            </div>

            {/* Event Log */}
            <EventLog
              events={events}
              onDelete={deleteEvent}
              onEdit={handleEventEdit}
              onEditTime={handleEventTimeEdit}
            />

            {/* AI Summary Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  <Sparkles size={14} className="text-purple-400" />
                  AI Analysis
                </h3>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-900/20 transition-colors select-none hover:bg-purple-500 disabled:opacity-50"
                >
                  {isGeneratingSummary ? "Generating..." : "Analyze Match"}
                </button>
              </div>

              {summary && (
                <div className="prose prose-invert prose-sm max-w-none rounded-xl border border-slate-800/50 bg-slate-950 p-4 text-sm leading-relaxed">
                  {summary.split("\n").map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <TeamBuilder
              players={players}
              setPlayers={setPlayers}
              settings={settings}
              events={events}
            />
          </div>
        )}
      </main>

      {/* Persistent Timer Control Bar (Only visible in Timer View) */}
      {currentView === "timer" && (
        <div className="pb-safe fixed right-0 bottom-0 left-0 z-30 border-t border-slate-800 bg-slate-900/90 p-4 backdrop-blur-xl select-none">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <button
              onClick={handleResetClick}
              className="rounded-2xl bg-slate-800 p-4 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white active:scale-95"
            >
              <RotateCcw size={24} />
            </button>

            <div className="relative flex-1">
              <button
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressCancel}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onTouchCancel={handlePressCancel}
                className={`relative z-10 flex w-full transform items-center justify-center space-x-2 overflow-hidden rounded-2xl p-4 text-lg font-bold shadow-xl transition-all active:scale-95 ${
                  isActive
                    ? "border border-slate-700 bg-slate-800 text-white"
                    : "bg-blue-600 text-white shadow-blue-900/30"
                }`}
              >
                {isActive ? (
                  <>
                    <Pause size={24} fill="currentColor" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={24} fill="currentColor" />
                    <span>
                      {(settings.timerMode === TimerMode.COUNT_DOWN ||
                        settings.timerMode === TimerMode.LOOP) &&
                      time === 0
                        ? "Finished"
                        : "Start"}
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

            <button className="rounded-2xl bg-slate-800 p-4 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white active:scale-95">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Player Selection Modal */}
      <PlayerSelectionModal
        isOpen={isPlayerModalOpen}
        onClose={handlePlayerModalClose}
        onSelectPlayer={handlePlayerSelect}
        players={players}
        eventType={pendingEventType}
        settings={settings}
        events={events}
      />

      {/* Time Edit Modal */}
      <TimeEditModal
        isOpen={!!timeEditEvent}
        onClose={() => setTimeEditEvent(null)}
        initialSeconds={timeEditEvent?.timestamp || 0}
        onSave={saveEventTime}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={executeReset}
        title="Stop Match Indefinitely?"
        message="Do you want to finish this match? This will reset the timer and clear all event data."
        confirmText="Yes, Finish & Reset"
        isDestructive={true}
      />
    </div>
  );
}
