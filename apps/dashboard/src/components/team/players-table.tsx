"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlayersByUserId } from "@/actions/player";
import noLogo from "@/assets/images/no-logo.png";
import type { Player } from "@/types";
import { Input } from "@repo/ui/components/input";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import TeamsList from "../player-avatar-list";
import { AddNewPlayer } from "./add-new-player";

export default function PlayersTable() {
	const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
	const [newPlayer, setNewPlayer] = useState<Player | null>(null);

	const { data: players } = useQuery({
		queryKey: ["player"],
		queryFn: () => getPlayersByUserId(""),
	});

	//const { push } = useRouter();

	// const handleEditTeam = (team: Player) => {
	// 	setEditingTeam(team);
	// 	setNewTeamName(team.Player);
	// };
	// const handleSaveTeam = () => {
	// 	//setTeams(teams.map((team) => (team.id === editingTeam.id ? { ...team, name: newTeamName } : team)))
	// 	setEditingTeam(null);
	// };
	// const handleDeleteTeam = (teamId: string | undefined) => {
	// 	//setTeams(teams.filter((team) => team.id !== teamId))
	// };
	// const handleTogglePublic = (teamId: string | undefined) => {
	// 	// setTeams(teams.map((team) => (team.id === teamId ? { ...team, isPublic: !team.isPublic } : team)))
	// };

	// const handleInvite = (teamId: string) => {
	// 	//push(`/manager/teams/${teamId}/invite`);
	// };

	// const handleOpenTeam = (teamId: string) => {
	// 	push(`/manager/teams/${teamId}`);
	// };

	// const calculatePerformance = useMemo(() => {
	// 	return {
	// 		average: 6.5,
	// 		increase: true,
	// 	};
	// }, []);

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableCaption className="px-4 space-y-4">
					<div className="flex justify-end">
						<AddNewPlayer />
					</div>
					<Input placeholder="Pesquisar jogador" />
				</TableCaption>
				<ScrollArea className="h-[65vh] w-full">
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">Avatar</TableHead>
							<TableHead>Name</TableHead>
							<TableHead className="">Teams</TableHead>
							<TableHead className="">V/E/D</TableHead>
							<TableHead className="">Competições</TableHead>
							<TableHead>Performace</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right"> </TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{players?.map((player) => (
							<TableRow key={player?.id}>
								<TableCell className="font-medium">
									<div className="flex items-center">
										<div className="relative inline-block shrink-0 rounded-2xl me-3">
											<Image
												width={42}
												height={42}
												src={player?.image || noLogo}
												className="inline-block shrink-0 rounded-2xl"
												alt={`Avatar of ${player.name}`}
											/>
										</div>
									</div>
								</TableCell>
								<TableCell>{player.name}</TableCell>
								<TableCell className="">
									<Suspense fallback={<div>0</div>}>
										<TeamsList size="sm" />
									</Suspense>
								</TableCell>
								<TableCell className="">{"0/0/0"}</TableCell>
								<TableCell className="">{0}</TableCell>
								<TableCell>
									<span className="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-base/none bg-success-light rounded-lg">
										{/* {calculatePerformance.increase ? (
											<TrendingUp className="w-5 h-5 mr-1 text-success" />
										) : (
											<TrendingDown className="w-5 h-5 mr-1 text-error" />
										)}
										<span>{calculatePerformance.average}%</span>
									*/}
									</span>
								</TableCell>
								<TableCell className="">
									{/* {team.isPublic ? (
										<Badge>
											<GlobeIcon className="w-4 h-4 mr-1" />
											Public
										</Badge>
									) : (
										<Badge variant="secondary">
											<LockIcon className="w-4 h-4 mr-1" />
											Private
										</Badge>
									)} */}
								</TableCell>
								<TableCell className="text-right flex items-center justify-end">
									{/* <Button onClick={() => handleOpenTeam(String(team.slug))} variant="ghost" className="p-2">
										<ViewIcon className="w-5 h-5 text-neutral-400" />
									</Button> */}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</ScrollArea>
			</Table>
		</div>
	);
}
