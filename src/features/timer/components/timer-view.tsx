"use client";

import { CircularTimer } from "@/components/timer/CircularTimer";
import { EventButton } from "@/components/timer/EventButton";
import { EventLog } from "@/components/timer/EventLog";
import type { GameEvent } from "@/types/timer";
import { EventType, GamePart } from "@/types/timer";
import { AiSummarySection } from "./ai-summary-section";
import { GamePartSelector } from "./game-part-selector";

interface TimerViewProps {
  gamePart: GamePart;
  isActive: boolean;
  onPartChange: (part: GamePart) => void;
  time: number;
  targetDuration: number;
  timerColor: string;
  onEventButtonClick: (type: EventType) => void;
  events: GameEvent[];
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: GameEvent) => void;
  onEditTime: (event: GameEvent) => void;
  summary: string | null;
  isGeneratingSummary: boolean;
  onGenerateSummary: () => void;
}

export function TimerView({
  gamePart,
  isActive,
  onPartChange,
  time,
  targetDuration,
  timerColor,
  onEventButtonClick,
  events,
  onDeleteEvent,
  onEditEvent,
  onEditTime,
  summary,
  isGeneratingSummary,
  onGenerateSummary,
}: TimerViewProps) {
  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <GamePartSelector
        gamePart={gamePart}
        isActive={isActive}
        onPartChange={onPartChange}
      />

      <div className="flex justify-center py-2 select-none">
        <CircularTimer
          currentTime={time}
          duration={targetDuration}
          radius={130}
          stroke={8}
          color={timerColor}
        />
      </div>

      <div className="grid grid-cols-4 gap-3 select-none">
        {[
          EventType.GOAL,
          EventType.ASSIST,
          EventType.YELLOW_CARD,
          EventType.RED_CARD,
        ].map(type => (
          <EventButton
            key={type}
            type={type}
            onClick={() => onEventButtonClick(type)}
          />
        ))}
      </div>

      <EventLog
        events={events}
        onDelete={onDeleteEvent}
        onEdit={onEditEvent}
        onEditTime={onEditTime}
      />

      <AiSummarySection
        summary={summary}
        isGenerating={isGeneratingSummary}
        onGenerate={onGenerateSummary}
      />
    </div>
  );
}
