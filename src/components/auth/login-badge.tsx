"use client";

import calendar from "@/assets/images/schedule.png";
import fieldSoccer from "@/assets/images/soccer-field.svg";
import soccerPlayer from "@/assets/images/soccer-player.svg";
import trophy from "@/assets/images/trophy.svg";
import { useProfile } from "@/context/profile-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircleIcon } 
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

const rolesBorderColor = {
  MANAGER: "bg-yellow-500 dark:bg-yellow-600 hover:border-yellow-900",
  PLAYER: "bg-green-500 dark:bg-green-600 hover:border-green-500",
  GUEST: "bg-blue-500 dark:bg-blue-600 hover:border-blue-500",
};

const LoginBadge = ({ user }: Props) => {
  const { userRoles, isLoggedIn } = useProfile();

  const { isMANAGER, isPLAYER } = userRoles;
  const baseUri = isMANAGER ? "/manager" : isPLAYER ? "/player" : "";
  const avatarImage = user?.image || "";
  const borderColor = avatarImage
    ? rolesBorderColor[isMANAGER ? "MANAGER" : isPLAYER ? "PLAYER" : "GUEST"]
    : "";

  return (
    <>
      {isLoggedIn && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <AvatarPoligon
              className="transition-all duration-300 ease-in-out hover:scale-110"
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
                <Link
                  href={`${baseUri}/teams`}
                  className="flex flex-1 flex-col items-center justify-start"
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
            {isPLAYER && (
              <DropdownMenuItem>
                <Link
                  href={`${baseUri}/journey`}
                  className="flex flex-1 flex-col items-center justify-start"
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
            {(isPLAYER || isMANAGER) && (
              <>
                <DropdownMenuItem>
                  <Link
                    href={`${baseUri}/competitions`}
                    className="flex flex-1 flex-col items-center justify-start"
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
                    className="flex flex-1 flex-col items-center justify-start"
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
                href="/profile/settings"
                className="flex flex-1 items-center justify-start"
              >
                <LineMdCogLoop className="mr-2" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <LogoutButton>
              <DropdownMenuItem className="m-0 p-0">
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
      {!isLoggedIn && (
        <LoginButton>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 rounded-full"
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
