"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { PlayerStatus } from "@/constants/player";
import { cn } from "@/lib/utils";
import { JbAvatar } from "./jb-avatar";
import { JbBadge } from "./jb-badge";
import { VerifiedBadge } from "./verified-badge";

interface JbPlayerRowProps {
  id: string | number;
  name: string;
  image?: string | null;
  role?: string;
  position?: string | null;
  status?: PlayerStatus;
  isVerified?: boolean | null;
  href: string;
  className?: string;
}

export function JbPlayerRow({
  id,
  name,
  image,
  position,
  status,
  isVerified,
  href,
  className,
}: JbPlayerRowProps) {
  const tCommon = useTranslations("common");

  return (
    <Link className={cn("jb-card jb-list-row", className)} href={href}>
      <JbAvatar id={id} name={name} image={image} size={34} />
      <span className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="block truncate text-sm font-semibold text-arena-text">
            {name}
          </span>
          <VerifiedBadge variant="icon" verified={!!isVerified} />
        </div>
        {position && (
          <span className="mt-0.5 block text-[11px] text-arena-text-muted">
            {tCommon(`positions.${position}`)}
          </span>
        )}
      </span>
      {status && <JbBadge status={status} />}
    </Link>
  );
}
