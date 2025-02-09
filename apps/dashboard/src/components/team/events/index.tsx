"use client";

import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "@repo/ui/icons";
import { useState } from "react";
import { GameCardContent } from "./cards/game";
import { EventTypes } from "@/types/events";
import { cn } from "@repo/utils";

const events = [
  {
    id: 1,
    type: EventTypes.GAME,
    title: "Partida de Futebol",
    team: {
      name: "Estrelas do Futebol FC",
      image: undefined,
    },
    opponent: {
      name: "Bravos do Futebol FC",
      image: undefined,
    },
    score: null,
    datetime: "2024-12-15T20:00:00",
    status: "scheduled",
    location: "Estádio Municipal",
  },
  {
    id: 2,
    type: EventTypes.TRAINING,
    title: "Treino de Futebol",
    team: "Estrelas do Futebol FC",
    opponent: null,
    score: null,
    status: "scheduled",
    datetime: "2024-12-15T09:00:00",
    location: "Centro de Treinamento",
  },
  {
    id: 3,
    type: EventTypes.GAME,
    title: "Partida de Futebol",
    team: {
      name: "Estrelas do Futebol FC",
      image: undefined,
    },
    opponent: {
      name: "Rivais Unidos",
      image: undefined,
    },
    score: null,
    date: "2024-12-15",
    status: "ongoing",
    time: "20:00",
    location: "Estádio Municipal",
  },
];

type EventCardProps = {
  className?: string;
};

const EventCard: React.FC<EventCardProps> = ({ className }) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const nextEvent = () => {
    setCurrentEventIndex(prevIndex => (prevIndex + 1) % events.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex(
      prevIndex => (prevIndex - 1 + events.length) % events.length,
    );
  };

  const renderEventCard = ({ ...props }) => {
    const currentEvent = events[currentEventIndex];

    if (!currentEvent) {
      return null;
    }

    switch (currentEvent.type) {
      case EventTypes.GAME:
        return (
          <GameCardContent
            datetime={props.datetime}
            location={props.location}
            title={props.title}
            type={props.type}
            team={props.team}
            opponent={props.opponent}
            score={props.score}
            status={props.status}
          />
        );
      case EventTypes.TRAINING:
        return <div>Training Card Content</div>;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "mb-4 w-full overflow-hidden rounded-lg bg-white shadow-md",

        className,
      )}
    >
      <div className="bg-primary py-2">
        <div className="flex items-center justify-center text-lg font-semibold text-white">
          Próximos Eventos
        </div>
      </div>
      <div className="relative max-h-[200px] overflow-auto p-4">
        <>
          <Button
            className="absolute left-2 top-5 -translate-y-1/2"
            onClick={prevEvent}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            className="absolute right-2 top-5 -translate-y-1/2"
            onClick={nextEvent}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
        {events[currentEventIndex] && (
          <>{renderEventCard({ ...events[currentEventIndex] })}</>
        )}
      </div>
    </div>
  );
};

export default EventCard;
