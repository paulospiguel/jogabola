"use client";
import React from "react";
import type { Session } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Edit, Plus, Repeat2, Save, Send, Share2, Trash2, Trophy } from "@repo/ui/icons";
import { ToastAction } from "@repo/ui/components/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/utils";
import { useState } from "react";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { FormField } from "@repo/ui/components/form";
import { Label } from "@repo/ui/components/label";
import { toast } from "@repo/ui/components/use-toast";
import ShareDialog from "../share-link-dialog";

const initialTeamData = {
	name: "Estrelas do Futebol FC",
	foundedYear: 1950,
	homeStadium: "Estádio Municipal",
	phone: "+351 123 456 789",
	bio: "Um clube com tradição e paixão pelo futebol, formando estrelas desde 1950.",
};

const initialStaff = [
	{
		id: 1,
		name: "João Silva",
		role: "coach",
		email: "WQGxH@example.com",
		invited: false,
	},
	{
		id: 2,
		name: "Maria Santos",
		role: "physiotherapist",
		email: "V5vCf@example.com",
		invited: true,
	},
];

const roles = [
	"president",
	"vice-president",
	"director",
	"secretary",
	"performance-analyst",
	"manager",
	"coach",
	"admin",
	"owner",
	"guest",
	"assistant",
	"assistent-coach",
	"assistant-manager",
	"manager-coach",
	"assistant-manager-coach",
	"techinal-analyst",
	"watcher",
	"observer",
	"financial-analyst",
	"trainer",
	"physical-trainer",
	"goalkeeper-trainer",
];

const addStaffSchema = z.object({
	name: z.string(),
	role: z.string(),
	email: z.string().email(),
});

type TeamsTab = {
	session: Session | null;
	hasEditPermission: boolean;
};

export default function TeamTab({ session, hasEditPermission }: TeamsTab) {
	const [teamData, setTeamData] = useState(initialTeamData);
	const [staff, setStaff] = useState(initialStaff);
	const [isShowAddStaff, setIsShowAddStaff] = useState(false);
	const [sendingInvitations, setSendingInvitations] = useState<number[]>([]);
	const [openShareModal, setOpenShareModal] = useState<string | number | null>(null);

	const t = useTranslations();

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<z.infer<typeof addStaffSchema>>({
		defaultValues: {
			name: "",
			email: "",
			role: "",
		},
	});

	const addStaffMember = (name: string, role: string, email: string) => {
		setStaff([...staff, { id: Date.now(), name, role, email, invited: true }]);
	};

	const handleAddStaff = (formData: z.infer<typeof addStaffSchema>) => {
		addStaffMember(formData.name, formData.role, formData.email);
		reset();
		setIsShowAddStaff(false);
	};

	const sendInvitation = (id: number, action?: "send" | "retry" | "undo") => {
		const member = { ...staff.find((member) => member.id === id) };
		setSendingInvitations([...sendingInvitations, id]);

		if (action === "undo") {
			setSendingInvitations(sendingInvitations.filter((id) => id !== member.id));
			setStaff(staff.map((member) => (member.id === id ? { ...member, invited: true } : member)));
			return;
		}

		new Promise((resolve) => setTimeout(resolve, 3000)).then(() => {
			setSendingInvitations(sendingInvitations.filter((id) => id !== member.id));
			setStaff(staff.map((member) => (member.id === id ? { ...member, invited: action === "send" } : member)));
			toast({
				title: "Invitation sent",
				description: "Your invitation has been sent successfully.",
				action: (
					<ToastAction
						onClick={() => sendInvitation(id, "undo")}
						className="text-primary rounded-lg"
						altText="Cancel invitation"
					>
						Undo
					</ToastAction>
				),
			});
		});
	};

	const removeMember = (id: number) => {
		setStaff(staff.filter((member) => member.id !== id));
	};

	const formatShareLink = (id: string | number) => {
		if (!id) return "";
		const url = new URL(window.location.href);
		url.searchParams.set("share", id?.toString());
		return url.toString();
	};

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-sans flex items-center">
						<Trophy className="mr-2 h-6 w-6 text-primary" />
						{t("tabs.team-info")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Object.entries(teamData).map(([key, value]) => (
							<div key={key} className="flex items-center justify-between">
								<Label htmlFor={key} className="font-medium">
									{t(`team.${key}`)}
								</Label>
								<div className="flex items-center">
									<Input
										id={key}
										value={value}
										onChange={(e) => setTeamData({ ...teamData, [key]: e.target.value })}
										className="w-64"
										disabled={!hasEditPermission}
									/>
									{hasEditPermission && (
										<Button variant="ghost" size="icon" className="ml-2">
											<Edit className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>
						))}
					</div>

					<div className="mt-8 ">
						<div className="flex justify-between">
							<h3 className="text-xl font-semibold mb-4">Comissão Técnica</h3>
							{hasEditPermission && (
								<Button onClick={() => setIsShowAddStaff(true)} className="mb-4 hover:brightness-105">
									<Plus className="h-4 w-4 mr-2" /> Adicionar Membro
								</Button>
							)}
						</div>
						<ul className="space-y-4">
							{staff.map((member) => (
								<li key={member.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
									<div>
										<p className="font-semibold">{member.name}</p>
										<p className="text-sm text-gray-600">{t(`roles.${member.role}`)}</p>
									</div>
									<div className="flex items-center gap-1">
										{member.invited && (
											<Button variant="outline" size="sm" onClick={() => sendInvitation(member.id)}>
												<Send
													className={cn("h-4 w-4 mr-1", {
														"animate-pulse": sendingInvitations.includes(member.id),
													})}
												/>{" "}
												{t("global.to-invite")}
											</Button>
										)}
										{!member.invited && (
											<>
												<Button
													disabled={!hasEditPermission}
													variant="outline"
													size="sm"
													onClick={() => setOpenShareModal(member.id)}
												>
													<Share2 className={cn("h-4 w-4 mr-1")} />
												</Button>
												<Button
													disabled={!hasEditPermission}
													variant="outline"
													size="sm"
													onClick={() => sendInvitation(member.id)}
												>
													<Repeat2
														className={cn("h-4 w-4 mr-1", {
															"animate-spin": sendingInvitations.includes(member.id),
														})}
													/>
												</Button>
											</>
										)}
										<Button
											disabled={!hasEditPermission}
											variant="outline"
											size="sm"
											onClick={() =>
												confirm(`Tem certeza que deseja remover o membro ${member.name}?`) && removeMember(member.id)
											}
										>
											<Trash2 className="h-4 w-4 mr-1" />
										</Button>
									</div>
								</li>
							))}
						</ul>
					</div>
				</CardContent>
			</Card>
			<Dialog open={isShowAddStaff} onOpenChange={() => setIsShowAddStaff(!isShowAddStaff)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Adicionar Staff</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit(handleAddStaff)}>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name" className="text-right">
									Name
								</Label>
								<Input {...register("name")} placeholder="Name" id="name" className="col-span-3" />
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="email" className="text-right">
									Email
								</Label>
								<Input {...register("email")} placeholder="Email" id="email" type="email" className="col-span-3" />
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="role" className="text-right">
									Função
								</Label>

								<FormField
									control={control}
									name="role"
									render={({ field }) => (
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<SelectTrigger className="w-[280px]">
												<SelectValue placeholder="Selecione a função" />
											</SelectTrigger>
											<SelectContent>
												{roles.map((item) => (
													<SelectItem key={item} value={item}>
														{t(`roles.${item}`)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
							</div>
						</div>
						<div className="flex justify-end">
							<Button>
								<Save className="h-4 w-4 mr-1" /> Salvar
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			<ShareDialog
				isOpen={!!openShareModal}
				onOpenChange={() => setOpenShareModal(null)}
				link={formatShareLink(String(openShareModal))}
			/>
		</>
	);
}
