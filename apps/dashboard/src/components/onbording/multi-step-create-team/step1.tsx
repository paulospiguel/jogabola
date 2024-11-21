"use client";

import Image from "next/image";
import React, { type KeyboardEvent, useState } from "react";
import { z } from "zod";

import { checkTeamByName } from "@/actions/team";
import managerIcon from "@/assets/icons/director.png";
import { teamSchema } from "@/schemas";
import { Steps } from "@/types";
import { Button } from "@repo/ui/components/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useCreateTeam } from "@/context/create-team-context";

type TeamTypes = keyof z.infer<typeof teamSchema>;

export const Step1 = React.forwardRef<HTMLDivElement>((props, ref) => {
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
	const {
		goToStep,
		methods: { setError, clearErrors, getValues, formState, getFieldState, setValue, ...form },
	} = useCreateTeam();

	const handleNextStep = () => {
		try {
			teamSchema
				.pick({
					name: true,
				})
				.parse(getValues());

			goToStep(Steps.Step2);
		} catch (error) {
			if (error instanceof z.ZodError) {
				// biome-ignore lint/complexity/noForEach: <explanation>
				error.issues.forEach((issue) => {
					setError(issue.path[0] as TeamTypes, { message: issue.message });
				});
			}
		}
	};

	const handelCheckTeamName = async (teamName: string) => {
		if (!teamName) {
			clearErrors("name");
			return;
		}

		const response = await checkTeamByName({ teamName });
		if (response?.validationErrors) {
			setError("name", { message: "Team name already exists!" });
		} else {
			clearErrors("name");
		}
	};

	const getField = (inputName: TeamTypes) => {
		const value = getValues(inputName);
		const state = getFieldState(inputName, formState);
		const isDisabledButton = !value || state?.invalid;

		return { value: String(value).trim(), state, isDisabledButton };
	};

	const handleOnKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleNextStep();
			return;
		}

		if (typingTimeout) {
			clearTimeout(typingTimeout);
		}

		const newTimeout = setTimeout(() => {
			const teamName = getField("name")?.value.trim();
			handelCheckTeamName(teamName);
		}, 300);

		setTypingTimeout(newTimeout);
	};

	return (
		<div ref={ref}>
			<Image src={managerIcon} alt="Ícone de um diretor de futebol" width={100} height={100} className="mx-auto" />

			<h1 className="text-4xl mb-2 font-bold text-center mt-4">Crie sua equipa</h1>
			<div className="space-y-2 text-center">
				<p className="italic">Crie sua equipa e dispute competições, gerencie sua equipe e veja os resultados.</p>
				<p className="">Vamos dar o nome a próxima equipa campeã:</p>
			</div>

			<div className="flex w-full gap-2 px-2">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem className="flex-1">
							<Label>Nome da equipa</Label>
							<FormControl>
								<Input
									{...field}
									required
									className="rounded-full"
									autoComplete="off"
									placeholder="Nomeie sua equipa com algo único!"
									isError={!!getField("name").state.error?.message}
									onKeyDown={handleOnKeyDown}
								/>
							</FormControl>
							<FormDescription className="hidden">Nome da equipa.</FormDescription>
							<FormMessage>{getField("name").state.error?.message}</FormMessage>
							<Button
								type="button"
								onClick={handleNextStep}
								variant={"default"}
								disabled={getField("name").isDisabledButton}
								className="w-full bg-blue-950 hover:bg-blue-950/75"
							>
								Avançar
							</Button>
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
});
