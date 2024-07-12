"use client";

import { createContext, use, useContext, useEffect, useState } from "react";

import type { z } from "zod";
import { CreateTeamSchema } from "@/schemas/create-team";
import type { Steps } from "@/types/multi-steps";

import teamService from "@/services/team";

type CreateTeamContextValue = {
	isPending: boolean;
	error: string;
	success: string;
	setError: (error: string) => void;
	setSuccess: (success: string) => void;
	data: z.infer<typeof CreateTeamSchema>;
	setCreateTeamData: (value: z.infer<typeof CreateTeamSchema>) => void;
	goToStep: (step: Steps) => void;
	currentStep: Steps;
	isCompleted?: boolean;
};

const initialData = {
	teamName: "",
	bio: undefined,
	logo: undefined,
	...CreateTeamSchema.pick({
		currentStep: true,
		location: true,
		language: true,
		teamTypes: true,
		radiusPlayerArea: true,
		radiusPlayerAge: true,
	}).parse({}),
} as z.infer<typeof CreateTeamSchema>;

const CreateTeamContext = createContext<CreateTeamContextValue | undefined>(undefined);

export const CreateTeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isPending, setIsPending] = useState(false);
	const [isCompleted, setIsCompleted] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [teamData, setTeamData] = useState<z.infer<typeof CreateTeamSchema>>(initialData);

	const setCreateTeamData = (value: z.infer<typeof CreateTeamSchema>) => {
		setTeamData(value);
	};

	const goToStep = (step: Steps) => {
		setTeamData((prevState) => ({ ...prevState, currentStep: step }));
	};

	useEffect(() => {
		teamService.getTeamInfo("").then((data) => {
			console.log("data", data);
			//setIsCompleted(data.isCompleted);
		});
	}, []);

	const value = {
		isPending,
		error,
		success,
		setError,
		setSuccess,
		data: teamData,
		setCreateTeamData,
		goToStep,
		currentStep: teamData?.currentStep,
		isCompleted,
	};

	return <CreateTeamContext.Provider value={value}>{children}</CreateTeamContext.Provider>;
};

export const useCreateTeamContext = () => {
	const context = useContext(CreateTeamContext);

	if (!context) {
		throw new Error("useCreateTeamContext must be used within a CreateTeamProvider");
	}
	return context;
};
