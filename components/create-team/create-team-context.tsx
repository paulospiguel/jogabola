"use client";

import { createContext, useContext, useState } from "react";

import type { z } from "zod";
import type { CreateTeamSchema } from "@/schemas/create-team";

type CreateTeamContextValue = {
	isPending: boolean;
	error: string;
	success: string;
	setError: (error: string) => void;
	setSuccess: (success: string) => void;
	data: z.infer<typeof CreateTeamSchema>;
	addTeamValue: (value: z.infer<typeof CreateTeamSchema>) => void;
};

const CreateTeamContext = createContext<CreateTeamContextValue | undefined>(undefined);

export const CreateTeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [data, setData] = useState<z.infer<typeof CreateTeamSchema>>({} as z.infer<typeof CreateTeamSchema>);

	const addTeamValue = (value: z.infer<typeof CreateTeamSchema>) => {
		setData(value);
	};

	const value = {
		isPending,
		error,
		success,
		setError,
		setSuccess,
		data,
		addTeamValue,
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
