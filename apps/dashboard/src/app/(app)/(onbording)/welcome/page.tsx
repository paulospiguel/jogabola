import { ArrowRightIcon } from "@repo/ui/icons";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { z } from "zod";

import { getUser as getUserAction } from "@/actions";
import managerIcon from "@/assets/icons/director.png";
import football from "@/assets/icons/football.png";
import routes from "@/constants/routes";
import { type RoleSchema, RoleValues } from "@/schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { cn } from "@repo/ui/utils";
import { getSearchParams } from "@repo/utils";
import { redirect } from "next/navigation";

type WelcomeProps = {
	searchParams: Record<string, string>;
};

export async function generateMetadata({ searchParams }: WelcomeProps) {
	const role = getSearchParams<z.infer<typeof RoleSchema>>(searchParams).get("role") || "Guest";
	return {
		title: `Bem-vindo ${role.toLowerCase()} ao JogaBola`,
		description: "O melhor lugar para encontrar sua malta e jogar a bola.",
	};
}

const Role = RoleValues;

const showInfo = (role: string) => {
	let title: string;
	let description: string;
	let disclaimer: string;
	let buttonText: string;
	let buttonColor: string;
	let url: string;
	let imageHeader: StaticImageData | null;

	switch (role) {
		case Role.PLAYER:
			title = "Encontre sua equipa e jogue seu melhor futebol";
			description = "Encontre amigos, Jogue competições, veja os resultados e divirta-se.";
			disclaimer = "Se você não tem uma equipe, não se preocupe, você pode se juntar a uma equipe existente.";
			buttonText = "Comecar minha jornada";
			url = routes.onbording.myJourney;
			imageHeader = football;
			buttonColor = "bg-orange-600 hover:bg-orange-700";
			break;

		case Role.MANAGER:
			title = "Pronto para montar seu time dos sonhos?";
			description = "Crie sua equipa e dispute competições, gerencie sua equipe e veja os resultados.";
			disclaimer = "Se você não tem uma equipe, não se preocupe, você pode se juntar a uma equipe existente.";
			buttonText = "Criar minha equipa";
			url = routes.onbording.createTeam;
			imageHeader = managerIcon;
			buttonColor = "hover:bg-green-700 bg-green-600";
			break;

		default:
			title = "";
			description = "";
			disclaimer = "";
			buttonText = "";
			url = "";
			buttonColor = "bg-blue-950 hover:bg-blue-950/90";
			imageHeader = null;
			break;
	}

	return {
		title,
		description,
		buttonText,
		disclaimer,
		url,
		imageHeader,
		buttonColor,
	};
};

export default async function Welcome({ searchParams }: WelcomeProps) {
	const role = getSearchParams<z.infer<typeof RoleSchema>>(searchParams).get("role");
	const { title, description, buttonText, disclaimer, url, imageHeader, buttonColor } = showInfo(role);

	const hasNotInfo = !title || !description || !disclaimer || !buttonText || !url || !imageHeader || !buttonColor;

	const { data } = (await getUserAction()) || {};

	const userInfo = data?.user;
	const roles = data?.roles;

	if (roles?.includes(Role.MANAGER) && userInfo) {
		return redirect(routes.onbording.createTeam);
	}

	if (roles?.includes(Role.PLAYER) && userInfo) {
		return redirect(routes.onbording.myJourney);
	}

	if (hasNotInfo) {
		return (
			<section className="mt-4 p-4 rounded-xl shadow-md mx-2 bg-white">
				<div className="tracking-wide text-center space-y-2 text-blue-950">
					<p className="italic text-2xl font-heading">Bem-vindo ao JogaBola</p>
					<p className="italic">O melhor lugar para encontrar sua malta e jogar a bola.</p>
					<p className="">Escolha uma opção para começar.</p>

					<div className="grid grid-cols-2 place-content-center gap-4 p-4">
						<Link href={routes.onbording.myJourney}>
							<Card className="h-full w-full bg-white hover:bg-slate-100">
								<CardHeader>
									<CardTitle>Encontre uma equipa</CardTitle>
									<CardDescription>
										Encontre amigos, Jogue competições, veja os resultados e divirta-se.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Image src={football} alt="icon of player" width={120} height={120} className="mx-auto" />
								</CardContent>
							</Card>
						</Link>

						<Link href={routes.onbording.createTeam}>
							<Card className="h-full w-full bg-white hover:bg-slate-100">
								<CardHeader>
									<CardTitle>Crie sua equipa</CardTitle>
									<CardDescription>
										Crie sua equipa e dispute competições, gerencie sua equipe e veja os resultados.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Image src={managerIcon} alt="icon of manager" width={120} height={120} className="mx-auto" />
								</CardContent>
							</Card>
						</Link>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="bg-white dark:bg-slate-800 mt-4 p-4 rounded-xl shadow-md mx-2">
			{imageHeader && (
				<div className="flex w-full items-center justify-center p-4 gap-2">
					<Card className="p-2 rounded-2xl border-none shadow-none bg-transparent">
						<Image src={imageHeader} alt={`icon of ${role}`} width={120} height={120} className="mx-auto" />
					</Card>
				</div>
			)}

			<div className="tracking-wide text-center space-y-2 text-blue-950 dark:text-slate-200">
				<p className="italic text-2xl font-heading">{title}</p>
				<p className="italic">{description}</p>
				<p className="">{disclaimer}</p>
				<p className="mt-4 text-blue-950 text-2xl dark:text-teal-500">
					{role ? "Vamos começar?" : <span className="text-base">Volte atrás e escola uma opção para começar.</span>}
				</p>
			</div>

			<div>
				{role && (
					<Link
						href={url}
						className={cn(
							"mt-4 justify-center items-center h-12 font-bold text-white rounded-full flex gap-2 px-3 py-2",
							buttonColor,
						)}
					>
						<span className="whitespace-nowrap">{buttonText}</span>
						<ArrowRightIcon className="w-6 h-6" />
					</Link>
				)}
			</div>
		</section>
	);
}
