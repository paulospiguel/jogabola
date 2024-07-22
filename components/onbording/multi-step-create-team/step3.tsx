"use client";

import React from "react";
import { Trash } from "lucide-react";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NameSlider, Slider } from "@/components/ui/slider";
import { PreviewLogo } from "@/components/preview-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { useCreateTeam } from "@/hooks/use-create-team";
import { teamShapeEnum, type teamSchema } from "@/schemas/create-team";
import { checkTeamName, createNewTeam } from "@/actions/team";
import { useToast } from "@/components/ui/use-toast";

const TEAM_TYPES = teamShapeEnum.options;

export const Step3 = React.forwardRef<HTMLFormElement>((props, ref) => {
	const [logoImage, setLogoImage] = React.useState<string>();
	const { keyStorage } = useCreateTeam();
	const form = useFormContext<z.infer<typeof teamSchema>>();
	const { toast } = useToast();

	const { push } = useRouter();

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

	const onSubmit: SubmitHandler<z.infer<typeof teamSchema>> = async (values) => {
		const response = await createNewTeam(values).catch((error) => {
			toast({
				title: "Error",
				description: "Error creating team",
				variant: "destructive",
			});
		});

		if (response?.data?.id) {
			form.reset();
			sessionStorage.removeItem(keyStorage);
			push("/manager/teams");
		}
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
													disabled={!!field.value}
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
							className="w-full dark:text-white"
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
