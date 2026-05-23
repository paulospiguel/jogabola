"use client";

import { LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { JbAvatar } from "@/components/arena/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";

interface UserMenuProps {
  user: {
    id: string | number;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations("arenaNav");
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <JbAvatar
          id={user.id}
          name={user.name}
          image={user.image}
          size={40}
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-white/10 bg-[#0a0b1e]/95 text-white backdrop-blur-xl"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-white/50">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild>
          <Link
            href="/arena"
            className="cursor-pointer gap-2 focus:bg-white/10 focus:text-white"
          >
            <LayoutDashboard size={16} />
            <span>{t("dashboard")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/arena/profile"
            className="cursor-pointer gap-2 focus:bg-white/10 focus:text-white"
          >
            <User size={16} />
            <span>{t("profile")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/arena/settings"
            className="cursor-pointer gap-2 focus:bg-white/10 focus:text-white"
          >
            <Settings size={16} />
            <span>{t("settings")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400"
        >
          <LogOut size={16} />
          <span>{t("signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
