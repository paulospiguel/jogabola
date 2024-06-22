import { getSearchParams } from "@/lib/utils";
import { RoleSchema } from "@/schemas/roles";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import z from "zod";

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
  let title: string = "";
  let description: string = "";
  let disclaimer: string = "";
  let buttonText: string = "";
  let url: string = "";

  switch (role) {
    case Role.player:
      title = "Encontre sua equipa e jogue seu melhor futebol";
      description = "Encontre amigos, Jogue competições, veja os resultados e divirta-se.";
      disclaimer = "Se você não tem uma equipe, não se preocupe, você pode se juntar a uma equipe existente.";
      buttonText = "Comecar minha jornada";
      url = "/player/join-team";
      break;

    case Role.manager:
      title = "Pronto para montar seu time dos sonhos?";
      description = "Crie sua equipa e dispute competições, gerencie sua equipe e veja os resultados.";
      disclaimer = "Se você não tem uma equipe, não se preocupe, você pode se juntar a uma equipe existente.";
      buttonText = "Criar minha equipa";
      url = "/manager/create-team";
      break;
    default:
      break;
  }

  return { title, description, buttonText, disclaimer, url };
};

export default function Welcome({ searchParams }: WelcomeProps) {
  const role = getSearchParams<z.infer<typeof RoleSchema>>(searchParams).get("role")
  const { title, description, buttonText, disclaimer, url } = showInfo(role);

  return (
    <>
      <div className="tracking-wide text-center leading-loose text-blue-950">
        <h1 className="text-4xl mb-2 font-bold">Bem-vindo ao JogaBola!</h1>

        <p className="italic">
          {title}
        </p>
        <p className="italic">
          {description}
        </p>
        <p className="text-xl">
          {disclaimer}
        </p>
        <p className="text-2xl mt-4 text-blue-950">
          Vamos começar?
        </p>
      </div>

      <div className="">
        <Link href={url} className="mt-4 justify-center hover:text-green-600 rounded-full bg-white flex gap-2 px-3 py-2">
          <span className="whitespace-nowrap">{buttonText}</span>
          <ArrowRightIcon className="w-6 h-6" />
        </Link>

        <Link href={"/"} className="mt-4 flex justify-center">
          <ArrowLeftIcon className="w-6 h-6" /> Voltar
        </Link>
      </div>
    </>
  );
}