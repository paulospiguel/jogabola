"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import type { z } from "zod";

import { newTeam } from "@/actions/create-team/new-team";
import { CreateTeamSchema } from "@/schemas/create-team";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateTeamContext } from "./create-team-context";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function CreateTeamForm() {
	const [isPending, startTransition] = useTransition();
	const { push } = useRouter();

	const { data, error, setSuccess, success, setError, addTeamValue } = useCreateTeamContext();

	const form = useForm<z.infer<typeof CreateTeamSchema>>({
		resolver: zodResolver(CreateTeamSchema),
		defaultValues: {
			teamName: "",
			language: "pt",
		},
		values: data,
	});

	const onSubmit = async (values: z.infer<typeof CreateTeamSchema>) => {
		console.log("Creating team with data", values);
		addTeamValue(values);
		push("/manager/create-team/profile");
		// startTransition(async () => {
		// 	try {
		// 		const { success, error } = await newTeam(values);
		// 		if (error) setError(error);
		// 		setSuccess(success || "");
		// 		form.reset();
		// 	} catch (error) {
		// 		setSuccess("");
		// 		setError("Algo deu errado.");
		// 		form.reset();
		// 	}
		// });
	};

	return (
		<>
			<Form {...form}>
				<form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
					<div className="space-y-4 ">
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
												disabled={isPending}
											/>
										</FormControl>
										<FormDescription className="hidden">Nome da equipa.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="language"
								render={({ field }) => (
									<FormItem className="w-1/6">
										<FormLabel>Idioma</FormLabel>
										<FormControl>
											<Select defaultValue={field.value} onValueChange={field.onChange} {...field}>
												<SelectTrigger>
													<SelectValue placeholder="Selecione seu idioma" />
												</SelectTrigger>
												<SelectContent>
													{["pt", "en", "es"]?.map((type) => (
														<SelectItem key={type} value={type}>
															{type}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
						{/*  
              {error && <FormMessage type="error" message={error} title="Erro" />}
              {success && <FormMessage type="success" message={success} title="Sucesso" />} */}
						<Button variant={"default"} className="w-full bg-blue-950 hover:bg-blue-950/75" disabled={isPending}>
							<LoaderIcon className={!isPending ? "hidden" : "animate-spin mr-2"} />
							<span>Avançar</span>
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
