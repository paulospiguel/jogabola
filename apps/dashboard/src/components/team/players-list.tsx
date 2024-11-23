"use client";

import { Button } from "@repo/ui/components/button";
import { Users, Plus, MessageCircleIcon, MessageCircleHeart, MessageSquare, MessageSquareShare } from "@repo/ui/icons";
import { useState } from "react";

const initilaData = [
	{ id: 1, name: "Carlos Silva", position: "Atacante", number: 10, nationality: "🇧🇷", invited: false },
	{ id: 2, name: "João Oliveira", position: "Meio-campo", number: 8, nationality: "🇵🇹", invited: false },
	{ id: 3, name: "Pedro Santos", position: "Defensor", number: 4, nationality: "🇧🇷", invited: true },
	{ id: 4, name: "André Gomes", position: "Goleiro", number: 1, nationality: "🇦🇷", invited: false },
];

interface Player {
	id: number;
	name: string;
	position: string;
	number: number;
	nationality: string;
	invited: boolean;
}

interface PlayerListProps {
	hasEditPermission: boolean;
}

const PlayerList: React.FC<PlayerListProps> = ({ hasEditPermission }) => {
	const [players, setPlayers] = useState<Player[]>(initilaData);

	const addPlayer = (name: string, position: string, number: number, nationality: string) => {
		setPlayers([...players, { id: Date.now(), name, position, number, nationality, invited: true }]);
	};

	const toggleInvite = (id: number) => {
		setPlayers(players.map((player) => (player.id === id ? { ...player, invited: !player.invited } : player)));
	};

	return (
		<div className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-4">
			<div className="bg-primary py-2">
				<div className="text-lg font-semibold text-white flex items-center justify-center">Elenco</div>
			</div>
			<div className="p-4 flex flex-col">
				{hasEditPermission && (
					<Button
						onClick={() => addPlayer("Novo Jogador", "Posição", 0, "🏴")}
						className="mb-4 absolute bottom-2 right-2 hover:brightness-110 shadow-md"
					>
						<Plus className="h-4 w-4 mr-2" /> Adicionar Jogador
					</Button>
				)}
				<ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{players.map((player) => (
						<li key={player.id} className="flex items-center bg-gray-50 p-3 rounded-lg">
							<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-sans mr-4">
								{player.number}
							</div>
							<div>
								<p className="font-semibold">
									{player.name} {player.nationality}
								</p>
								<p className="text-sm text-gray-600">{player.position}</p>
							</div>
							<div className="flex items-center ml-auto">
								{player.invited && (
									<Button variant="outline" size="sm" onClick={() => toggleInvite(player.id)} className="ml-auto">
										Convidar
									</Button>
								)}

								<Button variant="link" size="sm" className="">
									<MessageSquareShare className="size-6 mr-2" />
								</Button>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default PlayerList;
