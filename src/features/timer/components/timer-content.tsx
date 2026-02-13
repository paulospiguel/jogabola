"use client";

import { Settings, Timer, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { AuthButton } from "@/components/timer/AuthButton";
import { ConfirmationModal } from "@/components/timer/ConfirmationModal";
import { PlayerSelectionModal } from "@/components/timer/PlayerSelectionModal";
import { SettingsModal } from "@/components/timer/SettingsModal";
import { TeamBuilder } from "@/components/timer/TeamBuilder";
import { TimeEditModal } from "@/components/timer/TimeEditModal";
import { TimerControlBar } from "@/features/timer/components/timer-control-bar";
import { TimerView } from "@/features/timer/components/timer-view";
import { useTimerManager } from "@/features/timer/hooks/use-timer-manager";

export function TimerContent() {
  const {
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
    timerColor,
    targetDuration,
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
  } = useTimerManager();

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
              type="button"
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
            type="button"
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
            type="button"
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
          <TimerView
            gamePart={gamePart}
            isActive={isActive}
            onPartChange={handlePartChange}
            time={time}
            targetDuration={targetDuration}
            timerColor={timerColor}
            onEventButtonClick={handleEventButtonClick}
            events={events}
            onDeleteEvent={deleteEvent}
            onEditEvent={handleEventEdit}
            onEditTime={handleEventTimeEdit}
            summary={summary}
            isGeneratingSummary={isGeneratingSummary}
            onGenerateSummary={handleGenerateSummary}
          />
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
        <TimerControlBar
          isActive={isActive}
          time={time}
          timerMode={settings.timerMode}
          holdProgress={holdProgress}
          onResetClick={handleResetClick}
          onPressStart={handlePressStart}
          onPressEnd={handlePressEnd}
          onPressCancel={handlePressCancel}
        />
      )}

      {/* Modals */}
      <PlayerSelectionModal
        isOpen={isPlayerModalOpen}
        onClose={handlePlayerModalClose}
        onSelectPlayer={handlePlayerSelect}
        players={players}
        eventType={pendingEventType}
        settings={settings}
        events={events}
      />

      <TimeEditModal
        isOpen={!!timeEditEvent}
        onClose={() => setTimeEditEvent(null)}
        initialSeconds={timeEditEvent?.timestamp || 0}
        onSave={saveEventTime}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

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
