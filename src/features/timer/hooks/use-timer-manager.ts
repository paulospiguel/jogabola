"use client";

import { useEffect, useRef, useState } from "react";
import { useTimer } from "@/hooks/use-timer";
import { useSession } from "@/lib/auth-client";
import { playWhistle } from "@/services/audioService";
import { generateMatchSummary } from "@/services/geminiService";
import {
  type AppSettings,
  EventType,
  type GameEvent,
  GamePart,
  GameType,
  type Player,
  TimerMode,
} from "@/types/timer";

export function useTimerManager() {
  // Auth State
  const { data: session } = useSession();

  // Navigation State
  const [currentView, setCurrentView] = useState<"timer" | "teams">("timer");

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
      teamA: { name: "Team A", color: "#3b82f6" },
      teamB: { name: "Team B", color: "#ef4444" },
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
  const [partTimes, setPartTimes] = useTimer<Record<string, number>>(
    "promatch_part_times",
    {},
    session?.user,
  );
  const [players, setPlayers] = useTimer<Player[]>(
    "promatch_players",
    [],
    session?.user,
  );

  // Local UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [pendingEventType, setPendingEventType] = useState<EventType | null>(
    null,
  );
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [timeEditEvent, setTimeEditEvent] = useState<GameEvent | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);

  const holdTimerRef = useRef<number | null>(null);
  const isLongPressTriggered = useRef(false);
  const isPressing = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const getInitialTime = () => {
    if (partTimes[gamePart] !== undefined) return partTimes[gamePart];
    return settings.timerMode === TimerMode.COUNT_DOWN ||
      settings.timerMode === TimerMode.LOOP
      ? settings.durations[gamePart]
      : 0;
  };

  const [time, setTime] = useState(getInitialTime());

  // Restore/Sync Time when Game Part or Settings change
  useEffect(() => {
    if (!isActive) {
      if (partTimes[gamePart] !== undefined) {
        setTime(partTimes[gamePart]);
      } else {
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
          let newTime: number;
          const targetTime = settings.durations[gamePart];

          if (settings.timerMode === TimerMode.COUNT_UP) {
            newTime = prevTime + 1;
          } else if (settings.timerMode === TimerMode.COUNT_DOWN) {
            if (prevTime <= 1) {
              setIsActive(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
              playWhistle();
              newTime = 0;
            } else {
              newTime = prevTime - 1;
            }
          } else if (settings.timerMode === TimerMode.LOOP) {
            if (prevTime <= 1) {
              playWhistle();
              setIsActive(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
              newTime = targetTime;
            } else {
              newTime = prevTime - 1;
            }
          } else {
            newTime = prevTime;
          }

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

  const handleResetClick = () => setIsResetModalOpen(true);

  const executeReset = () => {
    setIsActive(false);
    const targetTime = settings.durations[gamePart];
    const resetValue =
      settings.timerMode === TimerMode.COUNT_DOWN ||
      settings.timerMode === TimerMode.LOOP
        ? targetTime
        : 0;

    setTime(resetValue);
    setPartTimes({});
    setEvents([]);
    setSummary(null);
    setHoldProgress(0);
    setIsResetModalOpen(false);
  };

  const handlePartChange = (part: GamePart) => {
    if (isActive) return;
    setGamePart(part);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    const modeChanged = newSettings.timerMode !== settings.timerMode;
    setSettings(newSettings);
    setIsActive(false);
    setIsSettingsOpen(false);

    if (modeChanged) {
      setPartTimes({});
      const target =
        newSettings.timerMode === TimerMode.COUNT_DOWN ||
        newSettings.timerMode === TimerMode.LOOP
          ? newSettings.durations[gamePart]
          : 0;
      setTime(target);
    }
  };

  const handleEventButtonClick = (type: EventType) => {
    setPendingEventType(type);
    setEditingEventId(null);
    setIsPlayerModalOpen(true);
  };

  const handleEventEdit = (event: GameEvent) => {
    setPendingEventType(event.type);
    setEditingEventId(event.id);
    setIsPlayerModalOpen(true);
  };

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

  const handlePlayerSelect = (player: Player | null) => {
    if (editingEventId) {
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
      logEvent(pendingEventType, player);
    }
    handlePlayerModalClose();
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    const duration = settings.durations[gamePart];
    const elapsedSeconds =
      settings.timerMode === TimerMode.COUNT_UP ? time : duration - time;

    try {
      const result = await generateMatchSummary(
        events,
        gamePart,
        elapsedSeconds,
      );
      setSummary(result);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handlePressStart = () => {
    isPressing.current = true;
    if (!isActive) return;

    isLongPressTriggered.current = false;
    const startTime = Date.now();
    const duration = 3000;

    if (holdTimerRef.current) clearInterval(holdTimerRef.current);

    holdTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        isLongPressTriggered.current = true;
        setIsActive(false);
        setIsResetModalOpen(true);
        setHoldProgress(0);
        isPressing.current = false;
      }
    }, 16);
  };

  const handlePressEnd = () => {
    if (!isPressing.current) return;
    isPressing.current = false;

    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldProgress(0);

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

  const getTimerColor = () => {
    const targetDuration = settings.durations[gamePart];
    if (settings.timerMode === TimerMode.COUNT_UP) {
      return time > targetDuration ? "#ef4444" : "#3b82f6";
    }
    return time < 60 ? "#ef4444" : "#3b82f6";
  };

  return {
    // State
    session,
    currentView,
    setCurrentView,
    settings,
    gamePart,
    events,
    players,
    setPlayers,
    time,
    isActive,
    summary,
    isGeneratingSummary,
    holdProgress,
    isSettingsOpen,
    isResetModalOpen,
    isPlayerModalOpen,
    pendingEventType,
    timeEditEvent,

    // Computed
    timerColor: getTimerColor(),
    targetDuration: settings.durations[gamePart],

    // Actions
    setIsSettingsOpen,
    setIsResetModalOpen,
    setTimeEditEvent,
    handleResetClick,
    executeReset,
    handlePartChange,
    handleSaveSettings,
    handleEventButtonClick,
    handleEventEdit,
    handleEventTimeEdit,
    saveEventTime,
    handlePlayerModalClose,
    handlePlayerSelect,
    deleteEvent,
    handleGenerateSummary,
    handlePressStart,
    handlePressEnd,
    handlePressCancel,
  };
}
