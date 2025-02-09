import directorIcon from "@/assets/icons/director.png";
import footballIcon from "@/assets/icons/football.png";
import fieldLogo from "@/assets/partners/field.png";
import filaLogo from "@/assets/partners/fila.svg";
import redBullLogo from "@/assets/partners/redbull.svg";
import InfiniteHorizontalScroll from "@/components/infinite-scroll";
import Footer from "@/components/site/footer";
import HeaderHome from "@/components/site/header-home";
import { RoleValues } from "@/schemas";
import { ArrowRight, VideoIcon } from "@repo/ui/icons";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations();
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-20 flex min-h-16 items-center gap-4 border-b bg-background px-4 py-4 md:px-6">
        <HeaderHome />
      </header>

      <main className="relative flex flex-1 flex-col p-4 md:gap-4 md:p-8">
        <div className="absolute inset-0 z-0 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#086_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#086_100%)]" />
        <div className="z-10 w-full items-center px-5 py-24">
          <section className="z-auto">
            <div className="mx-auto max-w-screen-xl px-4 py-8 text-center lg:px-12 lg:py-16">
              <div className="mb-7 inline-flex items-center justify-center rounded-full bg-gray-100 px-1 py-1 pr-4 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                <Link
                  href={`/welcome?role=${RoleValues.PLAYER}`}
                  className="group ml-2 flex items-center gap-2 rounded-full px-2 py-2 text-foreground transition-all duration-150 ease-linear dark:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    className="group-hover:animate-bounce"
                    src={footballIcon}
                    width={24}
                    height={24}
                    alt="Football icon"
                  />
                  <span className="rounded-full px-2 py-1.5 text-xs">
                    Começar minha jornada
                  </span>
                </Link>
                <div className="mx-2 h-6 border-r-2" />
                <Link
                  href={`/welcome?role=${RoleValues.MANAGER}`}
                  className="group flex items-center gap-2 rounded-full px-2 py-2 text-foreground transition-all duration-150 ease-linear hover:font-bold dark:text-white"
                >
                  <Image
                    className="group-hover:animate-bounce"
                    src={directorIcon}
                    width={28}
                    height={28}
                    alt="Football icon"
                  />

                  <span className="px-2 text-sm font-medium">
                    Criar minha equipa
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-primary to-gray-600 bg-clip-text text-transparent dark:to-white">
                  {t("homePage.title")}
                </span>
              </h1>
              <p className="mb-8 text-lg font-normal text-gray-500 dark:text-gray-400 sm:px-16 lg:text-xl xl:px-48">
                Crie sua equipa e dispute competições, gerencie sua equipe e
                veja os resultados.
              </p>
              <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0 lg:mb-16">
                <Link
                  href="https://www.youtube.com/watch?v=joga-bola-project"
                  className="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:focus:ring-primary-900 inline-flex items-center justify-center rounded-lg px-5 py-3 text-center font-medium text-primary focus:ring-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  Saiba mais
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>

                <Link
                  href="/video/B4UDYHG1Kag"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-center text-base font-medium text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  <VideoIcon className="mr-2 h-5 w-5" />
                  <span>Assista o vídeo</span>
                </Link>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-2 px-4 text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36">
            <span className="font-semibold uppercase text-gray-400">
              Apoios
            </span>
            <div className="flex w-full justify-center gap-2 md:justify-between">
              <InfiniteHorizontalScroll
                imageStyles={{
                  width: 100,
                  height: 100,
                  className:
                    "object-contain grayscale hover:grayscale-0 transition-all ease-linear duration-150",
                }}
                images={[fieldLogo, filaLogo, redBullLogo]}
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
//
