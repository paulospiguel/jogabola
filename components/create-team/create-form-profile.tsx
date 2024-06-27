"use client";

import { useForm } from "react-hook-form";
import { useCreateTeamContext } from "./create-team-context";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTeamSchema, TeamType } from "@/schemas/create-team";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { Textarea } from "../ui/textarea";
import { Slider } from "../ui/slider";
import React from "react";
import { PreviewLogo } from "../preview-logo";
import { Trash } from "lucide-react";
import { LanguageToggle } from "../language-toggle";

const TEAM_TYPES = TeamType.options;

export const FormCreateProfile = () => {
	const [logoImage, setLogoImage] = React.useState<string>();
	const { data } = useCreateTeamContext();

	const form = useForm<z.infer<typeof CreateTeamSchema>>({
		resolver: zodResolver(CreateTeamSchema),
		defaultValues: {
			teamName: "",
			bio: "",
			logo: undefined,
			location: "",
			teamTypes: "fut11",
			language: "pt",
			radiusPlayerArea: [0, 0],
			radiusPlayerAge: [15, 35],
		},
		values: data,
	});

	const handleRadiusPlayerAge = (e: React.ChangeEvent<HTMLInputElement>) => {
		const index = Number(e.target.name);
		const value = e.target.value;
		const radiusPlayerAge = form.getValues("radiusPlayerAge");
		radiusPlayerAge[index] = Number(value);
		form.setValue("radiusPlayerAge", radiusPlayerAge);
	};

	const handleRadiusPlayerArea = (e: React.ChangeEvent<HTMLInputElement>) => {
		const index = Number(e.target.name);
		const value = e.target.value;
		const radiusPlayerAge = form.getValues("radiusPlayerArea");
		radiusPlayerAge[index] = Number(value);
		form.setValue("radiusPlayerArea", radiusPlayerAge);
	};

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
		return value.reduce((acc, curr) => acc + curr, 0);
	};

	const onSubmit = async (values: z.infer<typeof CreateTeamSchema>) => {
		console.log("Creating team with data", values);
	};

	return (
		<>
			<Form {...form}>
				<form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
					<Card>
						<CardHeader>
							<CardTitle>Create Your Team</CardTitle>
							<CardDescription>Fill out the form to build your dream team.</CardDescription>
						</CardHeader>
						<CardContent>
							<form className="grid gap-4">
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
										name="teamName"
										render={({ field }) => (
											<FormItem className="flex-1">
												<Label htmlFor="teamName">Nome da equipa</Label>
												<Input placeholder="Equipa de sucesso chama-se..." {...field} />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="language"
										render={({ field }) => (
											<FormItem>
												<LanguageToggle />
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
										<Label htmlFor="teamTypes">Formação</Label>
										<FormField
											control={form.control}
											name="teamTypes"
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
										render={({ field }) => (
											<FormItem className="w-full">
												<Label htmlFor="radiusPlayerArea">
													Raio de localização{" "}
													<span className="text-xs text-gray-500">({calculateRadius(field.value)}km)</span>
												</Label>
												<Slider step={1} defaultValue={[field.value[1]]} onChange={handleRadiusPlayerArea} />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="radiusPlayerAge"
										render={({ field }) => {
											const [min, max] = field.value;
											return (
												<FormItem className="w-full">
													<Label htmlFor="radiusPlayerAge">
														Intervalo de idade <span className="text-xs text-gray-500">({`${min} - ${max}`} anos)</span>
													</Label>
													<Slider
														min={15}
														minStepsBetweenThumbs={1}
														defaultValue={field.value}
														trackLength={2}
														onChange={handleRadiusPlayerAge}
													/>
												</FormItem>
											);
										}}
									/>
								</div>
							</form>
						</CardContent>
						<CardFooter>
							<Button className="w-full" type="submit">
								Criar equipa
							</Button>
						</CardFooter>
					</Card>
				</form>
			</Form>
		</>
	);
};
