"use client";

import { LIMIT_CREATE_TEAM } from "@/constants";
import { CreateTeamProvider, useCreateTeamContext } from "@/context/create-team-context";
import { Button } from "@repo/ui/components/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTrigger,
} from "@repo/ui/components/drawer";
import { PlusCircle, X } from "@repo/ui/icons";
import { useEffect, useMemo } from "react";
import { MultiStepCreateTeam } from "../onbording";
import { useAction } from "next-safe-action/hooks";

function AddNewTeamComponent({ disabled = false }) {
	const { methods, createdTeamCounter } = useCreateTeamContext();

	useEffect(() => {
		if (methods.formState.isSubmitted) {
			methods.reset();
		}
	}, [methods]);

	const closeDrawer = useMemo(() => {
		return methods.formState.isSubmitted ? false : undefined;
	}, [methods.formState.isSubmitted]);

	const handleCleanDataOnClone = () => {
		//setTimeout(() => {
		methods.reset();
		//}, 5000);
	};

	const hasCreateTeam = createdTeamCounter >= LIMIT_CREATE_TEAM;

	return (
		<>
			<Drawer onClose={handleCleanDataOnClone} open={closeDrawer}>
				<DrawerTrigger>
					<Button variant="outline" disabled={hasCreateTeam} className="hover:bg-primary hover:text-white">
						<PlusCircle className="w-5 h-5 mr-2" />
						Add new team
					</Button>
				</DrawerTrigger>
				<p className="ml-2">
					{createdTeamCounter} de {LIMIT_CREATE_TEAM} teams
				</p>
				<DrawerContent>
					<DrawerHeader className="relative">
						<DrawerClose className="absolute right-2 top-0">
							<X className="w-5 h-5" />
						</DrawerClose>
					</DrawerHeader>

					<MultiStepCreateTeam isAddTeam />
				</DrawerContent>
				<DrawerFooter> </DrawerFooter>
			</Drawer>
		</>
	);
}

const AddNewTeam = ({ disabled }: { disabled?: boolean }) => {
	return (
		<CreateTeamProvider>
			<AddNewTeamComponent disabled={disabled} />
		</CreateTeamProvider>
	);
};

export default AddNewTeam;
