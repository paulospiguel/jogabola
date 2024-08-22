"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { type SubmitHandler, useFormContext } from "react-hook-form";
import type { z } from "zod";

import { checkTeamName, createNewTeam } from "@/actions/team";
import { LanguageToggle } from "@/components/language-toggle";
import { PreviewLogo } from "@/components/preview-logo";
import { useCreateTeam } from "@/hooks/use-create-team";
import { type teamSchema, teamShapeEnum } from "@/schemas/create-team";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Form, FormField, FormItem, FormMessage } from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { NameSlider, Slider } from "@repo/ui/components/ui/slider";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useToast } from "@repo/ui/components/ui/use-toast";

const TEAM_TYPES = teamShapeEnum.options;

type Team = z.infer<typeof teamSchema>;

type Step3Props = {
	isMultiStep?: boolean;
};

export const Step3 = React.forwardRef<HTMLFormElement, Step3Props>(({ isMultiStep }, ref) => {
	const [logoImage, setLogoImage] = React.useState<string>();
	const form = useFormContext<Team>();
	const { toast } = useToast();
	const { push } = useRouter();
	const client = useQueryClient();
	const { keyStorage } = useCreateTeam();

	const handleLogoChange = (image: string) => {
		setLogoImage(image);
		form.setValue("logo", image);
		console.log("Logo", image);
	};

	const removeLogo = () => {
		setLogoImage(undefined);
		form.setValue("logo", undefined);
	};

	const calculateRadius = (value: number[]) => {
		return value?.reduce((acc, curr) => acc + curr, 0);
	};

	const createTeamMutation = useMutation({
		mutationFn: createNewTeam,
		onSuccess: (response, variable, context) => {
			client.invalidateQueries({
				queryKey: ["teams"],
			});

			if (isMultiStep) {
				form.reset();
				sessionStorage.removeItem(keyStorage);
				push("/manager/teams");
			}
		},
		onError: () => {
			console.log("ERROR:", "createTeam");
			toast({
				title: "Error",
				description: "Error creating team",
				variant: "destructive",
			});
		},
	});

	const onSubmit: SubmitHandler<z.infer<typeof teamSchema>> = async (values) => {
		await createTeamMutation.mutateAsync(values);
	};

	const handelCheckTeamName = async (teamName: string) => {
		const response = await checkTeamName(teamName);
		if (response.error) {
			form.setError("name", { message: response.error });
		} else {
			form.clearErrors("name");
		}
	};

	return (
		<Form {...form}>
			<form ref={ref} onSubmit={form.handleSubmit(onSubmit)}>
				<Card>
					<CardHeader>
						<CardTitle>Create Your Team</CardTitle>
						<CardDescription>Fill out the form to build your dream team.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<div className="space-y-2 relative">
								<FormField
									control={form.control}
									name="logo"
									render={({ field }) => <PreviewLogo {...field} updateImage={handleLogoChange} image={logoImage} />}
								/>
								{logoImage && (
									<button type="button" onClick={removeLogo}>
										<Trash className="w-6 h-6 text-gray-500 absolute right-2 top-2" />
									</button>
								)}
							</div>
							<div className="flex items-end space-x-2">
								<FormField
									control={form.control}
									name="name"
									render={({ field, fieldState }) => (
										<>
											<FormItem className="flex-1">
												<Label htmlFor="teamName">Nome da equipa</Label>
												<Input
													{...field}
													//disabled={!!field.value}
													isError={!!fieldState.error?.message}
													placeholder="Equipa de sucesso chama-se..."
													onBlur={() => handelCheckTeamName(field.value)}
												/>
												<FormMessage />
											</FormItem>
										</>
									)}
								/>
								<FormField
									control={form.control}
									name="language"
									render={({ field }) => (
										<FormItem>
											<LanguageToggle value={field.value} onChangeValue={field.onChange} />
										</FormItem>
									)}
								/>
							</div>

							<div className="space-y-2">
								<Label>Bio</Label>
								<FormField
									control={form.control}
									name="bio"
									render={({ field }) => <Textarea placeholder="Qual o lema de sua equipa" {...field} />}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Localização</Label>
									<FormField
										control={form.control}
										name="location"
										render={({ field }) => <Input placeholder="Ex: Lisboa" {...field} />}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="teamShape">Formação</Label>
									<FormField
										control={form.control}
										name="teamShape"
										render={({ field }) => (
											<Select {...field} onValueChange={field.onChange} defaultValue={field.value}>
												<SelectTrigger>
													<SelectValue placeholder="Select" />
												</SelectTrigger>
												<SelectContent>
													{TEAM_TYPES?.map((type) => (
														<SelectItem key={type} value={type}>
															{type}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									/>
								</div>
							</div>
							<div className="flex gap-2">
								<FormField
									control={form.control}
									name="radiusPlayerArea"
									render={({ field }) => {
										const values = field?.value || [];
										return (
											<FormItem className="w-full">
												<Label htmlFor="radiusPlayerArea">
													Raio de localização
													<span className="text-xs text-gray-500">({calculateRadius(field?.value)}km)</span>
												</Label>
												<Slider
													showFirstTrack={false}
													step={1}
													defaultValue={values}
													onValueChange={(value) => {
														value[NameSlider.MIN] = 0;
														field.onChange(value);
													}}
												/>
											</FormItem>
										);
									}}
								/>
								<FormField
									control={form.control}
									name="radiusPlayerAge"
									render={({ field }) => {
										const [min, max] = field?.value || [];
										return (
											<FormItem className="w-full">
												<Label htmlFor="radiusPlayerAge">
													Intervalo de idade <span className="text-xs text-gray-500">({`${min} - ${max}`} anos)</span>
												</Label>
												<Slider
													min={15}
													minStepsBetweenThumbs={1}
													defaultValue={field?.value}
													showFirstTrack={true}
													onValueChange={(value) => {
														field.onChange(value);
													}}
												/>
											</FormItem>
										);
									}}
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							type="submit"
							data-loading={String(form.formState.isSubmitting)}
							disabled={form.formState.isSubmitting || !form.formState.isValid}
							className="w-full dark:text-white cursor-hand"
						>
							Criar equipa
						</Button>
					</CardFooter>
				</Card>
			</form>
			<FormMessage />
		</Form>
	);
});
