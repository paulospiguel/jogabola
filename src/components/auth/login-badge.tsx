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
import type { Session } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import { LineMdCogLoop } from "../icons";
import soccerPlayer from "@/assets/images/soccer-player.svg";
import fieldSoccer from "@/assets/images/soccer-field.svg";
import trophy from "@/assets/images/trophy.svg";
import calendar from "@/assets/images/schedule.png";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LoginButton from "./login-button";
import LogoutButton from "./logout-button";
import { RoleValues } from "@/schemas/roles";
import { useProfile } from "@/context/profile-context";
import AvatarPlayer from "../widget/avatar-player";
import { cn } from "@/lib/utils";

type Props = {
  user?: Session["user"];
};

const LoginBadge = ({ user }: Props) => {
  const { userRoles } = useProfile();

  const isManager = userRoles?.includes(RoleValues.MANAGER);
  const isPlayer = userRoles?.includes(RoleValues.PLAYER);

  const baseUri = isManager ? "/manager" : isPlayer ? "/player" : "";

  const avatarImage = user?.image || "";

  const borderColor = avatarImage ? "bg-yellow-500 dark:bg-yellow-600" : "";
  const clipPolygon =
    avatarImage && user?.id
      ? "[clip-path:polygon(50%_0,_100%_25%,_100%_75%,_50%_100%,_0_75%,_0_25%)] rounded-none"
      : "rounded-full";

  return (
    <>
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar
              className={cn(
                borderColor,
                clipPolygon,
                "p-0.5 flex items-center justify-center"
              )}
            >
              <AvatarImage
                src={avatarImage}
                className={cn(clipPolygon, "rounded-none")}
              />
              <AvatarFallback className="bg-green-500">
                <CircleUser className="h-7 w-7" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[300px]" align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isManager && (
              <DropdownMenuItem>
                <Link
                  href={`${baseUri}/teams`}
                  className="flex flex-col flex-1 justify-start items-center"
                >
                  <Image
                    alt=""
                    width={24}
                    src={fieldSoccer}
                    className="mx-auto w-10"
                  />
                  Minhas Equipas
                </Link>
              </DropdownMenuItem>
            )}
            {isPlayer && (
              <DropdownMenuItem>
                <Link
                  href={`${baseUri}/journey`}
                  className="flex flex-col flex-1 justify-start items-center"
                >
                  <Image
                    alt=""
                    width={24}
                    src={soccerPlayer}
                    className="mx-auto w-10"
                  />
                  Minha Jornada
                </Link>
              </DropdownMenuItem>
            )}
            {(isPlayer || isManager) && (
              <>
                <DropdownMenuItem>
                  <Link
                    href={`${baseUri}/competitions`}
                    className="flex flex-col flex-1 justify-start items-center"
                  >
                    <Image
                      alt=""
                      width={24}
                      src={calendar}
                      className="mx-auto w-10"
                    />
                    Minhas Competições
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href={`${baseUri}/achievements`}
                    className="flex flex-col flex-1 justify-start items-center"
                  >
                    <Image
                      alt=""
                      width={24}
                      src={trophy}
                      className="mx-auto w-10"
                    />
                    Minhas Conquistas
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href="/settings/auth"
                className="flex flex-1 justify-start items-center"
              >
                <LineMdCogLoop className="mr-2" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <LogoutButton>
              <DropdownMenuItem className="p-0 m-0">
                <Button
                  variant={"ghost"}
                  className="flex flex-1 justify-around"
                >
                  <LogOut /> Sair
                </Button>
              </DropdownMenuItem>
            </LogoutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!user && (
        <LoginButton>
          <Button
            variant={"default"}
            size="sm"
            className="flex items-center gap-2"
          >
            <span>Entrar</span>
            <UserCircleIcon />
          </Button>
        </LoginButton>
      )}
    </>
  );
};

export default LoginBadge;
