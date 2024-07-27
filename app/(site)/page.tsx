import Image from "next/image";
import Link from "next/link";

import fieldLogo from "@/assets/partners/field.png";
import filaLogo from "@/assets/partners/fila.svg";
import redBullLogo from "@/assets/partners/redbull.svg";
import Navbar from "@/components/site/navbar";
import { RoleValues } from "@/schemas/roles";
import { ArrowRight } from "lucide-react";
import InfiniteHorizontalScroll from "@/components/infinite-scroll";

import footballIcon from "@/assets/icons/football.png";
import directorIcon from "@/assets/icons/director.png";
import Marquee from "@/components/marquee";
import Profile from "@/components/widget/profile";

export default function Home() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<header className="sticky top-0 flex min-h-16 py-4 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
				<Navbar />
			</header>
			<main className="flex flex-1 flex-col p-4 md:gap-4 md:p-8">
				<div className="absolute h-screen z-0 inset-0 mt-[100px] md:mt-0 w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#086_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#086_100%)]">
					<section className="z-auto">
						<div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
							<div className="inline-flex justify-center items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
								<Link
									href={`/welcome?role=${RoleValues.PLAYER}`}
									className="hover:bg-custom-player hover:text-white ml-2
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
									<span className="text-xs bg-primary-600 rounded-full px-2 py-1.5">Começar minha jornada</span>
								</Link>
								<div className="h-6 border-r-2 mx-2" />
								<Link
									href={`/welcome?role=${RoleValues.MANAGER}`}
									className="flex hover:bg-custom-manager hover:text-white
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

									<span className="text-sm font-medium px-2">Criar minha equipa</span>
									<ArrowRight className="w-5 h-5" />
								</Link>
							</div>

							<h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
								<span className="bg-gradient-to-r from-primary dark:to-white to-gray-600 text-transparent bg-clip-text">
									Pronto para montar seu time dos sonhos?
								</span>
							</h1>
							<p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
								Crie sua equipa e dispute competições, gerencie sua equipe e veja os resultados.
							</p>
							<div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
								<Link
									href="https://www.youtube.com/watch?v=joga-bola-project"
									className="inline-flex justify-center items-center py-3 px-5 text-primary  font-medium text-center  rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
									target="_blank"
									rel="noreferrer"
								>
									Saiba mais
									<svg
										className="ml-2 -mr-1 w-5 h-5"
										fill="currentColor"
										viewBox="0 0 20 20"
										xmlns="http://www.w3.org/2000/svg"
										role="img"
										aria-label="Saiba mais"
									>
										<path
											fillRule="evenodd"
											d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</Link>
								<Link
									href="https://youtu.be/3GlLKGmLYL8"
									className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
									target="_blank"
									rel="noreferrer"
								>
									<svg
										className="mr-2 -ml-1 w-5 h-5"
										fill="currentColor"
										viewBox="0 0 20 20"
										xmlns="http://www.w3.org/2000/svg"
										role="img"
										aria-label="Video de demonstração"
									>
										<path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
									</svg>
									Assista o vídeo
								</Link>
							</div>
						</div>
					</section>

					<section className="relative bg-transparent min-w-72 overflow-hidden">
						<Marquee>
							{Array.from({ length: 10 }).map((_, index) => (
								<Profile key={index} />
							))}
						</Marquee>
						<Marquee reverse>
							{Array.from({ length: 10 }).map((_, index) => (
								<Profile key={index} />
							))}
						</Marquee>
					</section>

					<section className="px-4 mt-2 mx-auto md:max-w-screen-md text-center lg:max-w-screen-lg lg:px-36">
						<span className="font-semibold text-gray-400 uppercase">Apoios</span>
						<div className="flex justify-center md:justify-between gap-2 w-full">
							<InfiniteHorizontalScroll
								imageStyles={{
									width: 100,
									height: 100,
									className: "object-contain grayscale hover:grayscale-0 transition-all ease-linear duration-150",
								}}
								images={[fieldLogo, filaLogo, redBullLogo]}
							/>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
