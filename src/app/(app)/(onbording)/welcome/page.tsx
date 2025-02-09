import { ArrowRightIcon } 
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import { getUser as getUserAction } from "@/actions";
import managerIcon from "@/assets/icons/director.png";
import football from "@/assets/icons/football.png";
import routes from "@/constants/routes";
import { RoleValues } from "@/schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@/utils";
import { redirect } from "next/navigation";
import { ErrorsServerActionResponse } from "@/components/errors-server-actions";
import { getTranslations } from "next-intl/server";

const defaultImage = "/assets/images/soccer-field.svg";

type WelcomeProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata({ searchParams }: WelcomeProps) {
  const { role = "Guest" } = await searchParams; //getSearchParams<z.infer<typeof RoleSchema>>(searchParams).get("role") || "Guest";
  return {
    title: `Bem-vindo ${role} ao JogaBola`,
    description: "O melhor lugar para encontrar sua malta e jogar a bola.",
  };
}

const Role = RoleValues;

export default async function WelcomePage({ searchParams }: WelcomeProps) {
  const t = await getTranslations("onbording");
  const { role = "Guest" } = await searchParams;

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
        title = t("myJourney.title");
        description = t("myJourney.description");
        disclaimer = t("myJourney.disclaimer");
        buttonText = t("myJourney.actionButton");
        url = routes.onbording.myJourney;
        imageHeader = football;
        buttonColor = "bg-orange-600 hover:bg-orange-700";
        break;

      case Role.MANAGER:
        title = t("createTeam.title");
        description = t("createTeam.description");
        disclaimer = t("createTeam.disclaimer");
        buttonText = t("createTeam.actionButton");
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

  const {
    title,
    description,
    buttonText,
    disclaimer,
    url,
    imageHeader,
    buttonColor,
  } = showInfo(role);

  const hasNotInfo =
    !title ||
    !description ||
    !disclaimer ||
    !buttonText ||
    !url ||
    !imageHeader ||
    !buttonColor;

  const { user: userInfo, roles } = (await getUserAction()) || {};

  if (userInfo && roles?.isMANAGER) {
    return redirect(routes.manager.teams);
  }

  if (userInfo && roles?.isPLAYER) {
    return redirect(routes.player.journey);
  }

  const renderNoInfo = () => {
    return (
      <section className="mx-2 mt-4 rounded-xl bg-white p-4 shadow-md">
        <div className="space-y-2 text-center tracking-wide text-blue-950">
          <p className="font-heading text-2xl italic">Bem-vindo ao JogaBola</p>
          <p className="italic">
            O melhor lugar para encontrar sua malta e jogar a bola.
          </p>
          <p className="">Escolha uma opção para começar.</p>

          <div className="grid grid-cols-2 place-content-center gap-4 p-4">
            {[Role.PLAYER, Role.MANAGER].map(role => (
              <Link key={role} href={showInfo(role).url} className="group">
                <Card className="h-full w-full border-2 bg-white hover:border-secondary hover:text-white group-hover:bg-primary">
                  <CardHeader>
                    <CardTitle>{showInfo(role).title}</CardTitle>
                    <CardDescription className="group-hover:text-white">
                      {t("createTeam.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Image
                      src={showInfo(role).imageHeader || defaultImage}
                      alt={`icon of ${role}`}
                      width={120}
                      height={120}
                      className="mx-auto"
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderWithInfo = () => {
    return (
      <section className="mx-2 mt-4 rounded-xl bg-white p-4 shadow-md dark:bg-slate-800">
        {imageHeader && (
          <div className="flex w-full items-center justify-center gap-2 p-4">
            <Card className="rounded-2xl border-none bg-transparent p-2 shadow-none">
              <Image
                src={imageHeader}
                alt={`icon of ${role}`}
                width={120}
                height={120}
                className="mx-auto"
              />
            </Card>
          </div>
        )}

        <div className="space-y-2 text-center tracking-wide text-blue-950 dark:text-slate-200">
          <p className="font-heading text-2xl italic">{title}</p>
          <p className="italic">{description}</p>
          <p className="">{disclaimer}</p>
          <p className="mt-4 text-2xl text-blue-950 dark:text-teal-500">
            {role ? (
              "Vamos começar?"
            ) : (
              <span className="text-base">
                Volte atrás e escola uma opção para começar.
              </span>
            )}
          </p>
        </div>

        <div>
          {role && (
            <Link
              href={url}
              className={cn(
                "mt-4 flex h-12 items-center justify-center gap-2 rounded-full px-3 py-2 font-bold text-white",
                buttonColor,
              )}
            >
              <span className="whitespace-nowrap">{buttonText}</span>
              <ArrowRightIcon className="h-6 w-6" />
            </Link>
          )}
        </div>
      </section>
    );
  };

  return (
    <>
      {hasNotInfo ? renderNoInfo() : renderWithInfo()}
      {/* <ErrorsServerActionResponse
				errors={{
					serverError,
				}}
			/> */}
    </>
  );
}
