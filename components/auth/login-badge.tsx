"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUser, LogOut, UserCircleIcon } from "lucide-react";
import type { User } from "next-auth";
import Link from "next/link";
import { LineMdCogLoop } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LoginButton from "./login-button";
import LogoutButton from "./logout-button";

type Props = {
	user?: User;
};

const LoginBadge = ({ user }: Props) => {
	return (
		<>
			{user && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Avatar>
							<AvatarImage src={user?.image || ""} />
							<AvatarFallback className="bg-green-500">
								<CircleUser className="h-7 w-7" />
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Link href="/auth/settings" className="flex flex-1 justify-start items-center">
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
			{!user && (
				<LoginButton>
					<Button variant={"default"} size="sm" className="flex items-center gap-2">
						<span>Entrar</span>
						<UserCircleIcon />
					</Button>
				</LoginButton>
			)}
		</>
	);
};

export default LoginBadge;
