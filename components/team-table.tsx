"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { z } from "zod";
import type { teamSchema } from "@/schemas/create-team";
import Link from "next/link";
import { PenIcon, PenSquareIcon, TrashIcon } from "lucide-react";

type Team = z.infer<typeof teamSchema>;

type TeamTableProps = {
	teams: Team[];
};

export default function TeamTable({ teams }: TeamTableProps) {
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [newTeamName, setNewTeamName] = useState("");

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

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableCaption>Lista de suas equipas</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">Emblema</TableHead>
						<TableHead>Nome</TableHead>
						<TableHead>Performace</TableHead>
						<TableHead className="">Atletas</TableHead>
						<TableHead className="text-right"> </TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{teams.map((team) => (
						<TableRow key={team?.id}>
							<TableCell className="font-medium">
								<div className="flex items-center">
									<div className="relative inline-block shrink-0 rounded-2xl me-3">
										<img
											src="https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/riva-dashboard-tailwind/img/img-49-new.jpg"
											className="w-[50px] h-[50px] inline-block shrink-0 rounded-2xl"
											alt=""
										/>
									</div>
									<div className="flex flex-col justify-start">
										<a
											href="#"
											className="mb-1 font-semibold transition-colors duration-200 ease-in-out text-lg/normal text-secondary-inverse hover:text-primary"
										>
											{" "}
										</a>
									</div>
								</div>
							</TableCell>
							<TableCell>{team.name}</TableCell>
							<TableCell>
								<span className="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-base/none text-success bg-success-light rounded-lg">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										className="w-5 h-5 mr-1"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
										/>
									</svg>
									6.5%
								</span>
							</TableCell>
							<TableCell className="">{team.temaMember?.length}</TableCell>
							<TableCell className="text-right flex gap-2 items-center justify-end">
								<TrashIcon className="w-5 h-5 text-neutral-400" />
								<PenSquareIcon className="w-5 h-5 text-neutral-400" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
