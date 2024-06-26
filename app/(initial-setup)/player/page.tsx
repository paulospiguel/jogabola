import Image from "next/image";
import football from "@/assets/icons/football.png";

export default function PlayerPage() {
	return (
		<>
			<Image src={football} alt="Ícone de um diretor de futebol" width={100} height={100} className="mx-auto" />

			<h1>Player</h1>
		</>
	);
}
