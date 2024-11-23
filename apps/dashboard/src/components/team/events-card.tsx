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
		setCurrentEventIndex((prevIndex) => (prevIndex + 1) % events.length);
	};

	const prevEvent = () => {
		setCurrentEventIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
	};

	const [currentEventIndex, setCurrentEventIndex] = useState(0);
	return (
		<div className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-4">
			<div className="bg-primary py-2">
				<div className="text-lg font-semibold text-white flex items-center justify-center">Próximos Eventos</div>
			</div>
			<div className="p-4">
				<div className="flex justify-between items-center mb-4">
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
						<p className="text-sm text-gray-600">{events[currentEventIndex].type}</p>
						<p className="text-sm">
							{new Date(events[currentEventIndex].date).toLocaleDateString()} - {events[currentEventIndex].time}
						</p>
						<p className="text-sm text-gray-600">{events[currentEventIndex].location}</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default EventCard;
