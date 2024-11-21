import directorIcon from "@/assets/icons/director.png";
import footballIcon from "@/assets/icons/football.png";
import fieldLogo from "@/assets/partners/field.png";
import filaLogo from "@/assets/partners/fila.svg";
import redBullLogo from "@/assets/partners/redbull.svg";
import InfiniteHorizontalScroll from "@/components/infinite-scroll";
import Footer from "@/components/site/footer";
import Navbar from "@/components/site/navbar";
import { RoleValues } from "@/schemas";
import { ArrowRight, VideoIcon, Videotape } from "@repo/ui/icons";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations();
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky z-20 top-0 flex min-h-16 py-4 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Navbar />

        <Link
          className="bg-primary shadow-md hover:brightness-110 whitespace-nowrap text-white rounded-full px-4 py-2"
          href="/welcome"
        >
          Launch App
        </Link>
      </header>

      <main className="flex flex-1 flex-col p-4 md:gap-4 md:p-8 relative">
        <div className="absolute z-0 inset-0 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#086_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#086_100%)]" />
        <div className="w-full items-center z-10 px-5 py-24 ">
          <section className="z-auto">
            <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
              <div className="inline-flex justify-center items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
                <Link
                  href={`/welcome?role=${RoleValues.PLAYER}`}
                  className="ml-2
									text-foreground dark:text-white rounded-full px-2 group
									transition-all ease-linear duration-150 py-2 flex gap-2 items-center"
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
                  <span className="text-xs rounded-full px-2 py-1.5">
                    Começar minha jornada
                  </span>
                </Link>
                <div className="h-6 border-r-2 mx-2" />
                <Link
                  href={`/welcome?role=${RoleValues.MANAGER}`}
                  className="flex hover:font-bold
									text-foreground dark:text-white rounded-full px-2 group
									transition-all ease-linear duration-150 py-2 gap-2 items-center"
                >
                  <Image
                    className="group-hover:animate-bounce"
                    src={directorIcon}
                    width={28}
                    height={28}
                    alt="Football icon"
                  />

                  <span className="text-sm font-medium px-2">
                    Criar minha equipa
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                <span className="bg-gradient-to-r from-primary dark:to-white to-gray-600 text-transparent bg-clip-text">
                  {t("homePage.title")}
                </span>
              </h1>
              <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
                Crie sua equipa e dispute competições, gerencie sua equipe e
                veja os resultados.
              </p>
              <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
                <Link
                  href="https://www.youtube.com/watch?v=joga-bola-project"
                  className="inline-flex justify-center items-center py-3 px-5 text-primary  font-medium text-center  rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
                  target="_blank"
                  rel="noreferrer"
                >
                  Saiba mais
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>

                <Link
                  href="/video/B4UDYHG1Kag"
                  className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  <VideoIcon className="w-5 h-5 mr-2" />
                  <span>Assista o vídeo</span>
                </Link>
              </div>
            </div>
          </section>

          <section className="px-4 mt-2 mx-auto md:max-w-screen-md text-center lg:max-w-screen-lg lg:px-36">
            <span className="font-semibold text-gray-400 uppercase">
              Apoios
            </span>
            <div className="flex justify-center md:justify-between gap-2 w-full">
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
