"use client";

import { createContext, useContext, useState } from "react";

import type { z } from "zod";
import { CreateTeamSchema } from "@/schemas/create-team";
import type { Steps } from "@/types/multi-steps";

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
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [teamData, setTeamData] = useState<z.infer<typeof CreateTeamSchema>>(initialData);

	const setCreateTeamData = (value: z.infer<typeof CreateTeamSchema>) => {
		setTeamData(value);
	};

	const goToStep = (step: Steps) => {
		setTeamData((prevState) => ({ ...prevState, currentStep: step }));
	};

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
