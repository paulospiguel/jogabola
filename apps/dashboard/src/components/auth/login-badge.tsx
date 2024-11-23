"use client";

import calendar from "@/assets/images/schedule.png";
import fieldSoccer from "@/assets/images/soccer-field.svg";
import soccerPlayer from "@/assets/images/soccer-player.svg";
import trophy from "@/assets/images/trophy.svg";
import { useProfile } from "@/context/profile-context";
import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { LogOut, UserCircleIcon } from "@repo/ui/icons";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { LineMdCogLoop } from "../icons";
import LoginButton from "./login-button";
import LogoutButton from "./logout-button";
import AvatarPoligon from "../avatar-poligon";

type Props = {
	user?: Session["user"];
};

const LoginBadge = ({ user }: Props) => {
	const { userRoles, isLoggedIn } = useProfile();

	const { isMANAGER, isPLAYER } = userRoles;
	const baseUri = isMANAGER ? "/manager" : isPLAYER ? "/player" : "";
	const avatarImage = user?.image || "";
	const borderColor = avatarImage ? "bg-green-500 dark:bg-green-600" : "";

	return (
		<>
			{isLoggedIn && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<AvatarPoligon
							borderColor={borderColor}
							avatarImage={"https://github.com/paulospiguel.png"}
							label={user?.name || ""}
						/>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-[300px]" align="end">
						<DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{isMANAGER && (
							<DropdownMenuItem>
								<Link href={`${baseUri}/teams`} className="flex flex-col flex-1 justify-start items-center">
									<Image alt="" width={24} src={fieldSoccer} className="mx-auto w-10" />
									Minhas Equipas
								</Link>
							</DropdownMenuItem>
						)}
						{isPLAYER && (
							<DropdownMenuItem>
								<Link href={`${baseUri}/journey`} className="flex flex-col flex-1 justify-start items-center">
									<Image alt="" width={24} src={soccerPlayer} className="mx-auto w-10" />
									Minha Jornada
								</Link>
							</DropdownMenuItem>
						)}
						{(isPLAYER || isMANAGER) && (
							<>
								<DropdownMenuItem>
									<Link href={`${baseUri}/competitions`} className="flex flex-col flex-1 justify-start items-center">
										<Image alt="" width={24} src={calendar} className="mx-auto w-10" />
										Minhas Competições
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link href={`${baseUri}/achievements`} className="flex flex-col flex-1 justify-start items-center">
										<Image alt="" width={24} src={trophy} className="mx-auto w-10" />
										Minhas Conquistas
									</Link>
								</DropdownMenuItem>
							</>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Link href="/profile/settings" className="flex flex-1 justify-start items-center">
								<LineMdCogLoop className="mr-2" />
								Perfil
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<LogoutButton>
							<DropdownMenuItem className="p-0 m-0">
								<Button variant={"ghost"} className="flex flex-1 justify-around">
									<LogOut /> Sair
								</Button>
							</DropdownMenuItem>
						</LogoutButton>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
			{!isLoggedIn && (
				<LoginButton>
					<Button variant="default" size="sm" className="flex items-center gap-2 rounded-full">
						<span>Entrar</span>
						<UserCircleIcon />
					</Button>
				</LoginButton>
			)}
		</>
	);
};

export default LoginBadge;
