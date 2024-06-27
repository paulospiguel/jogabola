import { CreateTeamForm } from "@/components/create-team/create-form";

import managerIcon from "@/assets/icons/director.png";
import Image from "next/image";

export default async function ManagerCreateTeam() {
	return (
		<>
			<Image src={managerIcon} alt="Ícone de um diretor de futebol" width={100} height={100} className="mx-auto" />

			<h1 className="text-4xl mb-2 font-bold text-center mt-4">Crie sua equipa</h1>
			<div className="space-y-2 text-center">
				<p className="italic">Crie sua equipa e dispute competições, gerencie sua equipe e veja os resultados.</p>
				<p className="">Vamos dar o nome a próxima equipa campeã:</p>
			</div>

			<CreateTeamForm />
		</>
	);
}
