"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, Check, Clock, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import {
  acceptOwnershipTransferById,
  declineOwnershipTransferById,
  getMyIncomingTransfers,
  type IncomingTransfer,
} from "@/actions/team-transfer.actions";
import { useTeams } from "@/hooks/use-teams";
import { useToast } from "@/hooks/use-toast-custom";
import {
  INCOMING_TRANSFERS_QUERY_KEY,
  transferErrorKey,
} from "@/lib/transfer-ui";
import { cn } from "@/lib/utils";

/**
 * In-app card for a logged-in recipient of a pending ownership transfer.
 * The email token is hashed server-side, so the buttons act by request id;
 * the server re-checks that the caller is the recipient.
 */
export function PendingTransferCards({ className }: { className?: string }) {
  const { data } = useQuery({
    queryKey: INCOMING_TRANSFERS_QUERY_KEY,
    queryFn: async (): Promise<IncomingTransfer[]> => {
      const result = await getMyIncomingTransfers();
      return result.success ? result.data : [];
    },
    staleTime: 60_000,
  });

  if (!data || data.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence initial={false}>
        {data.map(transfer => (
          <PendingTransferCard key={transfer.transferId} transfer={transfer} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function PendingTransferCard({ transfer }: { transfer: IncomingTransfer }) {
  const t = useTranslations("teamTransfer");
  const tCreate = useTranslations("arenaCreateTeam");
  const format = useFormatter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setActiveTeamId } = useTeams();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: INCOMING_TRANSFERS_QUERY_KEY,
      }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "teams"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "planTier"] }),
    ]);

  const handleAccept = async () => {
    setBusy("accept");
    setErrorCode(null);
    try {
      const result = await acceptOwnershipTransferById({
        transferId: transfer.transferId,
      });
      if (!result.success) {
        setErrorCode(result.error.code);
        return;
      }
      toast.success(t("feedback.accepted", { team: transfer.teamName }));
      await refresh();
      setActiveTeamId(result.data.teamId);
    } catch {
      setErrorCode("UNKNOWN");
    } finally {
      setBusy(null);
    }
  };

  const handleDecline = async () => {
    setBusy("decline");
    setErrorCode(null);
    try {
      const result = await declineOwnershipTransferById({
        transferId: transfer.transferId,
      });
      if (!result.success) {
        setErrorCode(result.error.code);
        return;
      }
      toast.success(t("feedback.declined"));
      await refresh();
    } catch {
      setErrorCode("UNKNOWN");
    } finally {
      setBusy(null);
    }
  };

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[16px] border border-arena-highlight/30 bg-arena-highlight/5 p-4"
      exit={{ opacity: 0, y: -6 }}
      initial={{ opacity: 0, y: 6 }}
      layout
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-arena-highlight/30 bg-arena-highlight/10 text-arena-highlight">
          <ArrowLeftRight size={18} strokeWidth={2.2} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-arena-highlight">
            {t("card.kicker")}
          </p>
          <h2 className="mt-0.5 text-[14px] font-bold leading-5 text-arena-text">
            {t("card.title", {
              from: transfer.fromName,
              team: transfer.teamName,
            })}
          </h2>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-arena-text-muted">
            <Clock size={11} strokeWidth={2} aria-hidden="true" />
            {t("card.expires", {
              date: format.dateTime(new Date(transfer.expiresAt), {
                dateStyle: "long",
              }),
            })}
          </p>
        </div>
      </div>

      {errorCode && (
        <div
          className="mt-3 rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3 py-2.5 text-left text-[12px] text-arena-danger"
          role="alert"
        >
          {t(transferErrorKey(errorCode))}
          {errorCode === "TEAM_LIMIT_REACHED" && (
            <Link
              className="press ml-1 font-bold underline underline-offset-2"
              href="/pricing"
            >
              {tCreate("upgradeCta")}
            </Link>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className="press btn-press inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface text-[13px] font-semibold text-arena-text-sec transition-colors hover:bg-arena-surface-el hover:text-arena-text disabled:opacity-60"
          disabled={busy !== null}
          onClick={handleDecline}
          type="button"
        >
          {busy === "decline" ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
          )}
          {busy === "decline" ? t("card.declining") : t("card.decline")}
        </button>
        <button
          className="press btn-press inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] bg-arena-primary text-[13px] font-bold text-arena-bg transition-colors hover:bg-arena-primary/90 disabled:opacity-60"
          disabled={busy !== null}
          onClick={handleAccept}
          type="button"
        >
          {busy === "accept" ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Check size={14} strokeWidth={2.4} aria-hidden="true" />
          )}
          {busy === "accept" ? t("card.accepting") : t("card.accept")}
        </button>
      </div>
    </motion.section>
  );
}
