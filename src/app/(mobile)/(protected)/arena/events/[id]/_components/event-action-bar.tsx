"use client";

import { Check, Loader2, Share2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ATTENDANCE_STATUS } from "@/constants/attendance";
import { cn } from "@/lib/utils";

interface EventActionBarProps {
  myStatus: string | null;
  actionLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onShare: () => void;
  t: ReturnType<typeof useTranslations<"arenaEventDetail">>;
}

export function EventActionBar({
  myStatus,
  actionLoading,
  onConfirm,
  onCancel,
  onShare,
  t,
}: EventActionBarProps) {
  return (
    <motion.div
      className="fixed bottom-[68px] left-0 right-0 px-5 pb-3.5 pt-2 flex items-center gap-2.5 z-40 md:hidden"
      style={{
        background:
          "linear-gradient(0deg, var(--color-arena-bg) 60%, transparent)",
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <Button
        onClick={onShare}
        variant="outline"
        className="press w-12 h-12 bg-arena-surface border border-arena-border hover:bg-arena-surface-el flex items-center justify-center shrink-0 rounded-xl"
      >
        <Share2 className="w-5 h-5 text-arena-text-sec" strokeWidth={1.8} />
      </Button>

      <Button
        onClick={myStatus === ATTENDANCE_STATUS.CONFIRMED ? onCancel : onConfirm}
        disabled={actionLoading}
        className={cn(
          "flex-1 h-12 font-extrabold text-sm rounded-xl transition-all gap-2 shadow-[0_0_24px_rgba(124,255,79,0.22)]",
          myStatus === ATTENDANCE_STATUS.CONFIRMED
            ? "bg-arena-danger/10 border border-arena-danger/25 text-arena-danger hover:bg-arena-danger/15"
            : "bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/95",
        )}
      >
        {actionLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : myStatus === ATTENDANCE_STATUS.CONFIRMED ? (
          <>
            <X className="w-4.5 h-4.5" strokeWidth={2.5} />
            {t("actions.cancel")}
          </>
        ) : (
          <>
            <Check className="w-4.5 h-4.5" strokeWidth={2.8} />
            {t("actions.confirm")}
          </>
        )}
      </Button>
    </motion.div>
  );
}
