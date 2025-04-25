import * as React from "react";
import directorIcon from "@/assets/icons/director.png";
import footballIcon from "@/assets/icons/football.png";
import fieldLogo from "@/assets/partners/field.png";
import filaLogo from "@/assets/partners/fila.svg";
import redBullLogo from "@/assets/partners/redbull.svg";
import InfiniteHorizontalScroll from "@/components/infinite-scroll";
import { RoleValues } from "@/schemas";
import {
  AppleStore,
  LuArrowRight as ArrowRight,
  GooglePlay,
} from "@/components/icons";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import jBTube from "@/assets/icons/jogabola-tube.svg";
import { COMPANY } from "@/constants/app";
import { AnimatedGallery } from "@/components/ui/animated-gallery";

export default async function Home() {
  const t = await getTranslations();

  const mobileScreen = [
    {
      quote: t("store.screen1.quote"),
      name: t("store.screen1.name"),
      designation: t("store.screen1.designation"),
      src: "/assets/store/screen1.png",
    },
    {
      quote: t("store.screen2.quote"),
      name: t("store.screen2.name"),
      designation: t("store.screen2.designation"),
      src: "/assets/store/screen2.png",
    },
  ];

  return (
    <main className="relative flex flex-1 flex-col p-4 md:gap-4 md:p-8">
      <div className="absolute inset-0 z-0 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#086_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#086_100%)]" />
      <div className="z-10 w-full items-center px-5 py-24">
        <section className="z-auto">
          <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8 text-center lg:px-12 lg:py-16">
            <div className="mb-7 inline-flex items-center justify-center rounded-full bg-gray-100 px-1 py-1 pr-4 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
              <Link
                href={`/welcome?role=${RoleValues.PLAYER}`}
                className="group text-foreground ml-2 flex items-center gap-2 rounded-full px-2 py-2 transition-all duration-150 ease-linear dark:text-white"
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
                  {t("homePage.startMyJourney")}
                </span>
              </Link>
              <div className="mx-2 h-6 border-r-2" />
              <Link
                href={`/welcome?role=${RoleValues.MANAGER}`}
                className="group text-foreground flex items-center gap-2 rounded-full px-2 py-2 transition-all duration-150 ease-linear hover:font-bold dark:text-white"
              >
                <Image
                  className="group-hover:animate-bounce"
                  src={directorIcon}
                  width={28}
                  height={28}
                  alt="Football icon"
                />

                <span className="px-2 text-sm font-medium">
                  {t("homePage.createMyTeams")}
                </span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <h1 className="mb-4 text-4xl leading-none font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
              <span className="from-primary bg-linear-to-r to-gray-600 bg-clip-text text-transparent dark:to-white">
                {t("homePage.title")}
              </span>
            </h1>
            <p className="mb-8 text-lg font-normal text-gray-500 sm:px-16 lg:text-xl xl:px-48 dark:text-gray-400">
              {t("homePage.description")}
            </p>
            <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4 lg:mb-16">
              <Link
                href="https://www.youtube.com/watch?v=joga-bola-project"
                className="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:focus:ring-primary-900 text-primary inline-flex items-center justify-center rounded-lg px-5 py-3 text-center font-medium focus:ring-4"
                target="_blank"
                rel="noreferrer"
              >
                {t("common.knowMore")}
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/video/B4UDYHG1Kag"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-center text-base font-medium text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                <Image
                  src={jBTube}
                  width={24}
                  height={24}
                  alt={`${COMPANY.NAME} Tube`}
                />
                <span className="ml-2">{t("homePage.watchVideo")}</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-2 px-4 text-center md:max-w-(--breakpoint-md) lg:max-w-(--breakpoint-lg) lg:px-36">
          <span className="font-semibold text-gray-400 uppercase">
            {t("homePage.sponsors")}
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

        {/* Seção de Download do App */}
        <section className="mx-auto mt-2 flex flex-col items-center justify-center gap-6 rounded-2xl">
          <h2 className="-mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {t("homePage.downloadAppTitle")}
          </h2>
          <p className="mb-4 max-w-2xl text-center text-gray-600 dark:text-gray-300">
            {t("homePage.downloadAppDescription")}
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="https://apps.apple.com/app/id000000000" // Substitua pelo link real
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("homePage.downloadOnAppStore")}
              tabIndex={0}
              className="focus:ring-primary-500 rounded-lg focus:ring-2 focus:outline-none"
            >
              <AppleStore className="h-12 w-auto dark:invert" />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.jogabola" // Substitua pelo link real
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("homePage.downloadOnGooglePlay")}
              tabIndex={0}
              className="focus:ring-primary-500 rounded-lg focus:ring-2 focus:outline-none"
            >
              <GooglePlay className="h-12 w-auto dark:invert" />
            </a>
          </div>
          <div className="mt-6 w-full rounded-4xl bg-white/35 p-6 dark:bg-zinc-800/35">
            <AnimatedGallery view="mobile" gallerySources={mobileScreen} />
          </div>
        </section>
      </div>
    </main>
  );
}
