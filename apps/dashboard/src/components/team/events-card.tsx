"use client";

import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "@repo/ui/icons";
import { useState } from "react";

const events = [
  {
    id: 1,
    type: "Jogo",
    title: "Estrelas do Futebol FC vs Rivais Unidos",
    date: "2024-06-15",
    time: "20:00",
    location: "Estádio Municipal",
  },
  {
    id: 2,
    type: "Treino",
    title: "Treino Tático",
    date: "2024-06-10",
    time: "09:00",
    location: "Centro de Treinamento",
  },
];

const EventCard: React.FC = () => {
  const nextEvent = () => {
    setCurrentEventIndex(prevIndex => (prevIndex + 1) % events.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex(
      prevIndex => (prevIndex - 1 + events.length) % events.length,
    );
  };

  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  return (
    <div className="mb-4 w-full overflow-hidden rounded-lg bg-white shadow-md">
      <div className="bg-primary py-2">
        <div className="flex items-center justify-center text-lg font-semibold text-white">
          Próximos Eventos
        </div>
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <Button onClick={prevEvent} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={nextEvent} variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {events[currentEventIndex] && (
          <div>
            <p className="font-semibold">{events[currentEventIndex].title}</p>
            <p className="text-sm text-gray-600">
              {events[currentEventIndex].type}
            </p>
            <p className="text-sm">
              {new Date(events[currentEventIndex].date).toLocaleDateString()} -{" "}
              {events[currentEventIndex].time}
            </p>
            <p className="text-sm text-gray-600">
              {events[currentEventIndex].location}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
