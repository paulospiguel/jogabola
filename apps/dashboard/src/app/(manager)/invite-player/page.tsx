import email from "@/assets/icons/email.svg";
import facebookIcon from "@/assets/icons/facebook.svg";
import telegramIcon from "@/assets/icons/telegram.svg";
import whatsapp from "@/assets/icons/whatsapp.svg";
import stadium from "@/assets/images/stadium.svg";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import Image from "next/image";

export default function Component() {
	return (
		<div className="flex flex-col items-center rounded-xl w-full max-w-2xl mx-auto p-4 bg-white shadow-lg">
			<Image alt="" src={stadium} className="w-36 h-36" />
			<h1 className="text-4xl p-2 font-bold mb-4">Convidar jogador para sua equipa</h1>
			<p className="text-sm mb-4 text-center text-gray-400">
				Adicione jogadores à sua equipa para que possam colaborar nos seus projetos. Pode convidar jogadores para a sua
				equipa através de e-mail ou partilhando um link.
			</p>
			<div className="flex items-center space-x-2 mb-4">
				<span>Convidar por</span>
				<Image alt="" src={facebookIcon} className="w-6 h-6" />
				<Image alt="" src={telegramIcon} className="w-6 h-6" />
				<Image alt="" src={whatsapp} className="w-6 h-6" />
				<Image alt="" src={email} className="w-6 h-6" />
			</div>
			<div className="w-full mb-4">
				<p className="text-sm mb-2">Copie este link e compartilhe com o jogador que queira integrar a sua equipa:</p>
				<div className="flex">
					<Input type="text" value="https://miro.com/welcome/QmpvM2N" readOnly className="flex-grow" />
					<Button className="ml-2">Copiar</Button>
				</div>
			</div>
			<div className="w-full mb-4">
				<Input type="email" placeholder="Digite e-mails aqui" className="w-full" />
			</div>
			<Button className="w-full mb-4">Enviar convites</Button>
			<Button variant="outline" className="w-full">
				Ignorar por enquanto
			</Button>
		</div>
	);
}
