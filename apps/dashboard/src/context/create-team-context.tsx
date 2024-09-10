"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

import { teamSchema } from "@/schemas";
import type { Steps } from "@/types";
import type { z } from "zod";

import { checkUserHasTeam } from "@/actions/team";
import { useRouter } from "next/navigation";

import { type UseFormPersistReturn, useFormPersist } from "@/hooks/use-form-persist";
import { teamStore } from "@/store/team.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@tanstack/react-store";

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
	methods: UseFormPersistReturn<z.infer<typeof teamSchema>>;
	createdTeamCounter: number;
};

const initialData = {
	name: "",
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
	const keyStorage = `jogabolaCreateTeam:${session?.user?.id}`;

	const { createdTeamCounter } = useStore(teamStore);

	const methods = useFormPersist<z.infer<typeof teamSchema>>({
		storageKey: keyStorage,
		storageLocation: sessionStorage,
		resolver: zodResolver(teamSchema),
		includeDirtyFields: true,
		defaultValues: teamData,
		callback(values, isSubmitting, isSubmitted) {
			if (isSubmitted) {
				setIsCompleted(isSubmitted);
			}
		},
	});

	const { push } = useRouter();

	const setTeamData = (value: z.infer<typeof teamSchema>) => {
		setTeamData(value);
	};

	const goToStep = (step: Steps) => {
		setData((prevState) => ({ ...prevState, currentStep: step }));
	};

	useEffect(() => {
		if (session?.user?.id) {
			checkUserHasTeam(session?.user?.id).then((hasTeam) => {
				if (hasTeam) {
					push("/manager/teams");
					return;
				}
			});
		}
	}, [session, push]);

	const value: CreateTeamContextValue = {
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
		keyStorage,
		methods,
		createdTeamCounter,
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
