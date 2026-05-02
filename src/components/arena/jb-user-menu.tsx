"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { JbAvatar } from "./jb-avatar";

interface JbUserMenuProps {
  collapsed?: boolean;
  onlyAvatar?: boolean;
}

export function JbUserMenu({ collapsed = false, onlyAvatar = false }: JbUserMenuProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("arenaNav");

  const name = session?.user?.name ?? "User";
  const email = session?.user?.email ?? "";
  const id = session?.user?.id ?? "1";
  const image = session?.user?.image;

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {onlyAvatar ? (
          <button className="outline-none transition-transform hover:scale-105 active:scale-95">
            <JbAvatar id={id} name={name} image={image} size={40} />
          </button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="flex h-auto w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm hover:bg-arena-surface/60 focus-visible:ring-0"
          >
            <JbAvatar id={id} name={name} image={image} size={32} className="shrink-0" />
            {!collapsed && (
              <div className="grid flex-1 overflow-hidden text-left leading-tight">
                <span className="truncate font-semibold text-arena-text">
                  {name}
                </span>
                <span className="truncate text-xs text-arena-text-muted">
                  {email}
                </span>
              </div>
            )}
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={onlyAvatar ? "bottom" : "right"}
        align="end"
        sideOffset={8}
        className="w-52 bg-arena-bg-sec border-arena-border text-arena-text"
      >
        <div className="px-3 py-2">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-arena-text-muted">{email}</p>
        </div>

        <DropdownMenuSeparator className="bg-arena-border" />

        <DropdownMenuItem asChild>
          <Link
            href="/arena/profile"
            className="flex items-center gap-2 cursor-pointer text-arena-text-sec hover:text-arena-text"
          >
            <UserRound size={15} />
            {t("profile")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/arena/settings"
            className="flex items-center gap-2 cursor-pointer text-arena-text-sec hover:text-arena-text"
          >
            <Settings size={15} />
            {t("settings")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-arena-border" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300"
        >
          <LogOut size={15} />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
