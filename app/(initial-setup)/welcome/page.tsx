import { getSearchParams } from "@/lib/utils";
import { RoleSchema } from "@/schemas/roles";
import Image, { StaticImageData } from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import type { z } from "zod";

import football from "@/assets/icons/football.png";
import managerIcon from "@/assets/icons/director.png";
import { Card } from "@/components/ui/card";

type WelcomeProps = {
	searchParams: {
		[key: string]: string | null;
	};
};

export const metadata = {
	title: "Bem-vindo ao JogaBola",
	description: "O melhor lugar para encontrar sua malta e jogar uma pelada.",
	image: "/images/welcome.jpg",
	url: "https://jogabola.com/welcome",
};

const Role = RoleSchema.Values;

const showInfo = (role: string) => {
	let title: string;
	let description: string;
	let disclaimer: string;
	let buttonText: string;
	let url: string;
	let imageHeader: StaticImageData | null;

	switch (role) {
		case Role.player:
			title = "Encontre sua equipa e jogue seu melhor futebol";
			description = "Encontre amigos, Jogue competições, veja os resultados e divirta-se.";
			disclaimer = "Se você não tem uma equipe, não se preocupe, você pode se juntar a uma equipe existente.";
			buttonText = "Comecar minha jornada";
			url = "/player/join-team";
			imageHeader = football;
			break;

		case Role.manager:
			title = "Pronto para montar seu time dos sonhos?";
			description = "Crie sua equipa e dispute competições, gerencie sua equipe e veja os resultados.";
			disclaimer = "Se você não tem uma equipe, não se preocupe, você pode se juntar a uma equipe existente.";
			buttonText = "Criar minha equipa";
			url = "/manager/create-team";
			imageHeader = managerIcon;
			break;
		default:
			title = "";
			description = "";
			disclaimer = "";
			buttonText = "";
			url = "";
			imageHeader = null;
			break;
	}

	return { title, description, buttonText, disclaimer, url, imageHeader };
};

export default function Welcome({ searchParams }: WelcomeProps) {
	const role = getSearchParams<z.infer<typeof RoleSchema>>(searchParams).get("role");
	const { title, description, buttonText, disclaimer, url, imageHeader } = showInfo(role);

	return (
		<section className="bg-background mt-4 p-4 rounded-xl shadow-md mx-2">
			{imageHeader && (
				<div className="flex w-full items-center justify-center p-4 gap-2">
					<Card className="p-2 rounded-2xl border-none shadow-none">
						<Image src={imageHeader} alt={`icon of ${role}`} width={120} height={120} className="mx-auto" />
					</Card>
				</div>
			)}

			<div className="tracking-wide text-center space-y-2 text-blue-950">
				<p className="italic text-2xl font-heading">{title}</p>
				<p className="italic">{description}</p>
				<p className="">{disclaimer}</p>
				<p className="mt-4 text-blue-950 text-2xl">
					{role ? "Vamos começar?" : <span className="text-base">Volte atrás e escola uma opção para começar.</span>}
				</p>
			</div>

			<div>
				{role && (
					<Link
						href={url}
						className="mt-4 justify-center font-bold text-white hover:text-green-600 rounded-full bg-blue-950 flex gap-2 px-3 py-2"
					>
						<span className="whitespace-nowrap">{buttonText}</span>
						<ArrowRightIcon className="w-6 h-6" />
					</Link>
				)}

				<Link href={"/"} className="mt-4 flex justify-center">
					<ArrowLeftIcon className="w-6 h-6" /> Voltar
				</Link>
			</div>
		</section>
	);
}
