"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Share, X } from "lucide-react";
import type { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const isConfirmed = myStatus === ATTENDANCE_STATUS.CONFIRMED;

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
        <Share className="w-5 h-5 text-arena-text-sec" strokeWidth={1.8} />
      </Button>

      {isConfirmed ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={actionLoading}
              className="flex-1 h-12 font-extrabold text-sm rounded-xl transition-all gap-2 bg-arena-danger/10 border border-arena-danger/25 text-arena-danger hover:bg-arena-danger/15"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <X className="w-4.5 h-4.5" strokeWidth={2.5} />
                  {t("actions.cancel")}
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-arena-border bg-arena-surface shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-arena-text">
                {t("actions.cancelConfirm.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-arena-text-sec">
                {t("actions.cancelConfirm.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-3">
              <AlertDialogCancel className="mt-0 flex-1 border-arena-border bg-transparent text-arena-text hover:bg-arena-surface-el">
                {t("actions.cancelConfirm.keep")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="flex-1 bg-arena-danger text-white hover:bg-arena-danger/90"
                onClick={onCancel}
              >
                {t("actions.cancelConfirm.action")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          onClick={onConfirm}
          disabled={actionLoading}
          className={cn(
            "flex-1 h-12 font-extrabold text-sm rounded-xl transition-all gap-2 shadow-[0_0_24px_rgba(124,255,79,0.22)]",
            "bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/95",
          )}
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4.5 h-4.5" strokeWidth={2.8} />
              {t("actions.confirm")}
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
}
