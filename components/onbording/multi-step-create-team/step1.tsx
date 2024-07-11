"use client";

import type { z } from "zod";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import type { CreateTeamSchema } from "@/schemas/create-team";
import managerIcon from "@/assets/icons/director.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateTeam } from "@/hooks/use-create-team";
import { Steps } from "@/types/multi-steps";

export function Step1() {
	const { goToStep, setCreateTeam } = useCreateTeam();

	const form = useFormContext<z.infer<typeof CreateTeamSchema>>();

	const handleNextStep = () => {
		const values = form.getValues();
		form.setValue("currentStep", Steps.Step2);
		setCreateTeam({ ...values, currentStep: Steps.Step2 });
	};

	return (
		<>
			<Image src={managerIcon} alt="Ícone de um diretor de futebol" width={100} height={100} className="mx-auto" />

			<h1 className="text-4xl mb-2 font-bold text-center mt-4">Crie sua equipa</h1>
			<div className="space-y-2 text-center">
				<p className="italic">Crie sua equipa e dispute competições, gerencie sua equipe e veja os resultados.</p>
				<p className="">Vamos dar o nome a próxima equipa campeã:</p>
			</div>

			<form className="w-full">
				<div className="space-y-4">
					<div className="flex w-full gap-2">
						<FormField
							control={form.control}
							name="teamName"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormLabel>Name da equipa</FormLabel>
									<FormControl>
										<Input
											className="rounded-full"
											autoComplete="off"
											type="name"
											placeholder="Nomeie sua equipa com algo único!"
											required
											{...field}
										/>
									</FormControl>
									<FormDescription className="hidden">Nome da equipa.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button
						type="button"
						onClick={handleNextStep}
						variant={"default"}
						className="w-full bg-blue-950 hover:bg-blue-950/75"
					>
						<span>Avançar</span>
					</Button>
				</div>
			</form>
		</>
	);
}
