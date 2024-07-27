"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer";
import { MultiStepCreateTeam } from "../onbording";
import { CreateTeamProvider, useCreateTeamContext } from "@/context/create-team-context";
import { useEffect, useMemo } from "react";

function AddNewTeamComponent() {
	const { methods } = useCreateTeamContext();

	useEffect(() => {
		if (methods.formState.isSubmitted) {
			methods.reset();
		}
	}, [methods]);

	const closeDrawer = useMemo(() => {
		return methods.formState.isSubmitted ? false : undefined;
	}, [methods.formState.isSubmitted]);

	const handleCleanDataOnClone = () => {
		setTimeout(() => {
			methods.reset();
		}, 5000);
	};

	return (
		<>
			<Drawer onClose={handleCleanDataOnClone} open={closeDrawer}>
				<DrawerTrigger>
					<Button className="bg-transparent text-gray-700 hover:text-white">
						<PlusCircle className="w-5 h-5 mr-2" />
						Adicionar nova equipa
					</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader className="relative">
						{/* <DrawerClose className="absolute right-2 top-0">
							<X className="w-5 h-5" />
						</DrawerClose> */}
					</DrawerHeader>
					<pre>test: {JSON.stringify(methods.formState.isSubmitted, null, 2)}</pre>

					<MultiStepCreateTeam isAddTeam />
				</DrawerContent>
				<DrawerFooter> </DrawerFooter>
			</Drawer>
		</>
	);
}

const AddNewTeam = () => {
	return (
		<CreateTeamProvider>
			<AddNewTeamComponent />
		</CreateTeamProvider>
	);
};

export default AddNewTeam;
