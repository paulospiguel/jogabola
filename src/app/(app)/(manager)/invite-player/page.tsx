import email from "@/assets/icons/email.svg";
import facebookIcon from "@/assets/icons/facebook.svg";
import telegramIcon from "@/assets/icons/telegram.svg";
import whatsapp from "@/assets/icons/whatsapp.svg";
import stadium from "@/assets/images/stadium.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function Component() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-xl bg-white p-4 shadow-lg">
      <Image alt="" src={stadium} className="h-36 w-36" />
      <h1 className="mb-4 p-2 text-4xl font-bold">
        Convidar jogador para sua equipa
      </h1>
      <p className="mb-4 text-center text-sm text-gray-400">
        Adicione jogadores à sua equipa para que possam colaborar nos seus
        projetos. Pode convidar jogadores para a sua equipa através de e-mail ou
        partilhando um link.
      </p>
      <div className="mb-4 flex items-center space-x-2">
        <span>Convidar por</span>
        <Image alt="" src={facebookIcon} className="h-6 w-6" />
        <Image alt="" src={telegramIcon} className="h-6 w-6" />
        <Image alt="" src={whatsapp} className="h-6 w-6" />
        <Image alt="" src={email} className="h-6 w-6" />
      </div>
      <div className="mb-4 w-full">
        <p className="mb-2 text-sm">
          Copie este link e compartilhe com o jogador que queira integrar a sua
          equipa:
        </p>
        <div className="flex">
          <Input
            type="text"
            value="https://miro.com/welcome/QmpvM2N"
            readOnly
            className="grow"
          />
          <Button className="ml-2">Copiar</Button>
        </div>
      </div>
      <div className="mb-4 w-full">
        <Input
          type="email"
          placeholder="Digite e-mails aqui"
          className="w-full"
        />
      </div>
      <Button className="mb-4 w-full">Enviar convites</Button>
      <Button variant="outline" className="w-full">
        Ignorar por enquanto
      </Button>
    </div>
  );
}
