"use client";

import { createContext, use, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import type { z } from "zod";
import { teamSchema } from "@/schemas/create-team";
import type { Steps } from "@/types/multi-steps";

import { getTeamInfo } from "@/actions/team";

type CreateTeamContextValue = {
	isPending: boolean;
	error: string;
	success: string;
	setError: (error: string) => void;
	setSuccess: (success: string) => void;
	data: z.infer<typeof teamSchema>;
	setTeamData: (value: z.infer<typeof teamSchema>) => void;
	goToStep: (step: Steps) => void;
	currentStep: Steps;
	isCompleted?: boolean;
	keyStorage: string;
};

const initialData = {
	teamName: "",
	bio: undefined,
	logo: undefined,
	...teamSchema
		.pick({
			currentStep: true,
			location: true,
			language: true,
			teamShape: true,
			radiusPlayerArea: true,
			radiusPlayerAge: true,
		})
		.parse({}),
} as z.infer<typeof teamSchema>;

const CreateTeamContext = createContext<CreateTeamContextValue | undefined>(undefined);

export const CreateTeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isPending, setIsPending] = useState(false);
	const [isCompleted, setIsCompleted] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [teamData, setData] = useState<z.infer<typeof teamSchema>>(initialData);
	const { data: session } = useSession();

	const setTeamData = (value: z.infer<typeof teamSchema>) => {
		setTeamData(value);
	};

	const goToStep = (step: Steps) => {
		setData((prevState) => ({ ...prevState, currentStep: step }));
	};

	useEffect(() => {
		if (session?.user.id) {
			getTeamInfo(session?.user.id).then((team) => {
				if (team) {
					console.log("Team", team);
					//	setTeamData(team);
				}
			});
		}
	}, [session]);

	const value = {
		isPending,
		error,
		success,
		setError,
		setSuccess,
		data: teamData,
		setTeamData,
		goToStep,
		currentStep: teamData?.currentStep,
		isCompleted,
		keyStorage: `create-team-${session?.user.id}`,
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
