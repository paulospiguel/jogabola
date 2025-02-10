"use client";

import type { Player } from "@repo/db";
import { useTranslations } from "next-intl";
import Link from "next/link";

type PlayerAvatarListProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  count?: number;
  players?: Player[];
  showOnlyCount?: boolean;
};

export default function PlayerAvatarList({
  size = "md",
  showOnlyCount = false,
  className,
  count = 4,
  players = [],
}: PlayerAvatarListProps) {
  const t = useTranslations("player");
  const sizes: Record<"sm" | "md" | "lg", string> = {
    lg: "m-3 size-6",
    md: "m-2 size-12",
    sm: "m-1 size-8",
  };

  if (players.length < count) {
    count = players.length;
  }

  if (players.length === 0) {
    return (
      <Link className="text-sm text-primary" href="/feed?type=players">
        {t("addPlayer")}
      </Link>
    );
  }

  if (showOnlyCount) {
    return <div className="text-sm text-primary">{players.length}</div>;
  }

  return <pre>{JSON.stringify(players, null, 2)}</pre>;
  // return (
  // 	<div className={cn("flex", className)}>
  // 		{players
  // 			?.map((item) => (
  // 				<div
  // 					key={item.name}
  // 					className="group relative z-0 -ml-4 flex scale-100 items-center transition-all duration-200 ease-in-out hover:z-10 hover:scale-110"
  // 				>
  // 					<div className="relative overflow-hidden rounded-full bg-white">
  // 						<div className="bg-size pointer-events-none absolute h-full w-full animate-bg-position from-violet-500 from-30% via-cyan-400 via-50% to-pink-500 to-80% bg-[length:300%_auto] opacity-15 group-hover:bg-linear-to-r" />
  // 						<div className="z-1 blur-lg" />
  // 						<img
  // 							src={item?.image || "https://i.pravatar.cc/300"}
  // 							alt={item?.name}
  // 							className={cn("rounded-full object-cover", sizes[size] ?? sizes.md)}
  // 						/>
  // 					</div>
  // 					<div className="absolute bottom-full left-1/2 -translate-x-1/2 translate-y-2 transform whitespace-nowrap rounded bg-slate-900 p-2 text-white opacity-0 transition-all duration-300 ease-in-out group-hover:-translate-y-2 group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900">
  // 						<div className="text-sm font-semibold">{item?.name}</div>
  // 						<div className="text-sm">{item?.position}</div>
  // 					</div>
  // 				</div>
  // 			))
  // 			.slice(0, count)}

  // 		{players?.length > count && (
  // 			<div className="relative flex items-center justify-center bg-white rounded-full overflow-hidden">
  // 				<div className="rounded-full bg-white p-2">
  // 					<div className="text-sm font-semibold text-slate-900">+{players?.length - count}</div>
  // 				</div>
  // 			</div>
  // 		)}
  // 	</div>
  // );
}
