import { motion } from "framer-motion";
import { Hourglass, Star } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { JbAvatar } from "@/components/arena/avatar";
import { type BadgeStatus, JbBadge } from "@/components/arena/badge";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { ATTENDANCE_STATUS } from "@/constants/attendance";
import type { SquadPlayer } from "@/hooks/use-squad";

interface SquadPlayerRowProps {
  player: SquadPlayer;
  index: number;
  onEmail: (player: SquadPlayer) => void;
}

function getBadgeStatus(playerStatus: SquadPlayer["status"]): BadgeStatus {
  return playerStatus === "new" ? ATTENDANCE_STATUS.PENDING : playerStatus;
}

export function SquadPlayerRow({ player, index }: SquadPlayerRowProps) {
  const t = useTranslations("arenaSquad");
  const statusKey = getBadgeStatus(player.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.15,
        delay: index * 0.025,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Link
        href={`/arena/squads/player/${player.id}`}
        className="flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-3 py-3.5 transition-all duration-150 hover:border-arena-primary/30 hover:bg-arena-primary/5 active:scale-[0.99]"
      >
        <JbAvatar
          image={player.image}
          name={player.name}
          size={46}
          id={player.id}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[14px] font-semibold text-arena-text">
              {player.name}
            </span>
            <VerifiedBadge variant="icon" verified={player.isVerified} />
            {player.highlight && (
              <Star
                size={12}
                className="shrink-0 text-arena-highlight"
                strokeWidth={1.5}
              />
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {player.position && (
              <span className="rounded-[5px] border border-arena-border bg-arena-surface-el px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
                {player.position}
              </span>
            )}
            {player.selfRating != null && (
              <span className="rounded-[5px] border border-arena-primary/30 bg-arena-primary/10 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-arena-primary">
                OVR {player.selfRating.toFixed(1)}
              </span>
            )}
            {player.rating != null && (
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-arena-highlight">
                <Star size={10} fill="currentColor" strokeWidth={0} />
                {player.rating % 1 === 0
                  ? player.rating.toFixed(0)
                  : player.rating.toFixed(1)}
              </span>
            )}
            {!player.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-[5px] border border-arena-warning/25 bg-arena-warning/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-arena-warning">
                <Hourglass size={8} strokeWidth={2} />
                {t("pendingValidation")}
              </span>
            )}
          </div>
        </div>

        <JbBadge status={statusKey} size="sm" />
      </Link>
    </motion.div>
  );
}
