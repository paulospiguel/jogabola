"use client";

import Image from "next/image";
import { Suspense, useMemo, useState } from "react";
import type { z } from "zod";

import { GlobeIcon, LockIcon, TrendingDown, TrendingUp, Eye as ViewIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { teamSchema } from "@/schemas/create-team";

import noLogo from "@/assets/images/no-logo.png";
import { useRouter } from "next/navigation";
import PlayerList from "../player-list";
import { ScrollArea } from "../ui/scroll-area";

type Team = z.infer<typeof teamSchema>;

type TeamTableProps = {
	teams: Team[];
};

export default function TeamsTable({ teams }: TeamTableProps) {
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [newTeamName, setNewTeamName] = useState("");

	const { push } = useRouter();

	const handleEditTeam = (team: Team) => {
		setEditingTeam(team);
		setNewTeamName(team.name);
	};
	const handleSaveTeam = () => {
		//setTeams(teams.map((team) => (team.id === editingTeam.id ? { ...team, name: newTeamName } : team)))
		setEditingTeam(null);
	};
	const handleDeleteTeam = (teamId: string | undefined) => {
		//setTeams(teams.filter((team) => team.id !== teamId))
	};
	const handleTogglePublic = (teamId: string | undefined) => {
		// setTeams(teams.map((team) => (team.id === teamId ? { ...team, isPublic: !team.isPublic } : team)))
	};

	const handleInvite = (teamId: string) => {
		//push(`/manager/teams/${teamId}/invite`);
	};

	const handleOpenTeam = (teamId: string) => {
		push(`/manager/teams/${teamId}`);
	};

	const calculatePerformance = useMemo(() => {
		return {
			average: 6.5,
			increase: true,
		};
	}, []);

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableCaption className="px-4">
					<Input placeholder="Pesquisar equipa" />
				</TableCaption>
				<ScrollArea className="h-[65vh] w-full">
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">Emblema</TableHead>
							<TableHead>Nome</TableHead>
							<TableHead className="">Atletas</TableHead>
							<TableHead className="">V/E/D</TableHead>
							<TableHead className="">Competições</TableHead>
							<TableHead>Performace</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right"> </TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{teams.map((team) => (
							<TableRow key={team?.id}>
								<TableCell className="font-medium">
									<div className="flex items-center">
										<div className="relative inline-block shrink-0 rounded-2xl me-3">
											<Image
												src={team?.logo || noLogo}
												className="w-[50px] h-[50px] inline-block shrink-0 rounded-2xl"
												alt=""
											/>
										</div>
									</div>
								</TableCell>
								<TableCell>{team.name}</TableCell>
								<TableCell className="">
									<Suspense fallback={<div>0</div>}>
										<PlayerList size="sm" />
									</Suspense>
								</TableCell>
								<TableCell className="">{"0/0/0"}</TableCell>
								<TableCell className="">{0}</TableCell>
								<TableCell>
									<span className="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-base/none bg-success-light rounded-lg">
										{calculatePerformance.increase ? (
											<TrendingUp className="w-5 h-5 mr-1 text-success" />
										) : (
											<TrendingDown className="w-5 h-5 mr-1 text-error" />
										)}
										<span>{calculatePerformance.average}%</span>
									</span>
								</TableCell>
								<TableCell className="">
									{team.isPublic ? (
										<Badge>
											<GlobeIcon className="w-4 h-4 mr-1" />
											Public
										</Badge>
									) : (
										<Badge variant="secondary">
											<LockIcon className="w-4 h-4 mr-1" />
											Private
										</Badge>
									)}
								</TableCell>
								<TableCell className="text-right flex items-center justify-end">
									{/* <Button onClick={() => handleEditTeam(team)} variant="ghost" className="p-2">
										<SendIcon className="w-5 h-5 text-neutral-400" />
									</Button> */}

									<Button onClick={() => handleOpenTeam(String(team.slug))} variant="ghost" className="p-2">
										<ViewIcon className="w-5 h-5 text-neutral-400" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</ScrollArea>
			</Table>
		</div>
	);
}
