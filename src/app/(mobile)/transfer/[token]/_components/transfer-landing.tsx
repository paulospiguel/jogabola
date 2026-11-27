"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  CircleCheck,
  CircleSlash,
  Clock,
  Loader2,
  type LucideIcon,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import {
  acceptOwnershipTransfer,
  declineOwnershipTransfer,
} from "@/actions/team-transfer.actions";
import { Logo } from "@/components/logo";
import { useTeams } from "@/hooks/use-teams";
import {
  INCOMING_TRANSFERS_QUERY_KEY,
  transferErrorKey,
} from "@/lib/transfer-ui";
import { cn } from "@/lib/utils";

type TransferDetails = {
  teamName: string;
  fromName: string;
  expiresAt: Date;
  status: string;
};

export type TransferLandingInitial =
  | { ok: true; transfer: TransferDetails }
  | { ok: false; code: string };

type View =
  | { kind: "pending" }
  | { kind: "accepted" }
  | { kind: "declined" }
  | { kind: "status"; status: "accepted" | "cancelled" | "expired" }
  | { kind: "error"; code: string };

/** A malformed token is indistinguishable from an unknown one. */
const normalizeCode = (code: string) =>
  code === "VALIDATION_ERROR" ? "TRANSFER_NOT_FOUND" : code;

function initialView(initial: TransferLandingInitial): View {
  if (!initial.ok) return { kind: "error", code: normalizeCode(initial.code) };
  const { status } = initial.transfer;
  if (status === "pending") return { kind: "pending" };
  if (status === "accepted" || status === "cancelled" || status === "expired")
    return { kind: "status", status };
  return { kind: "error", code: "TRANSFER_NOT_FOUND" };
}

const primaryClass =
  "press btn-press inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-arena-primary text-[15px] font-bold text-arena-bg transition-colors hover:bg-arena-primary/90 disabled:opacity-60";
const secondaryClass =
  "press btn-press inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] border border-arena-border bg-arena-surface text-[15px] font-semibold text-arena-text-sec transition-colors hover:bg-arena-surface-el hover:text-arena-text disabled:opacity-60";

/**
 * Landing for the emailed transfer link. Presentation only: accept and
 * decline re-check the recipient, expiry and plan limits on the server.
 */
export function TransferLanding({
  token,
  initial,
}: {
  token: string;
  initial: TransferLandingInitial;
}) {
  const [view, setView] = useState<View>(() => initialView(initial));
  const transfer = initial.ok ? initial.transfer : null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-arena-bg px-4 py-12 font-body">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-arena-primary/5 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] rounded-full bg-arena-info/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mb-8">
        <Logo className="text-arena-primary" href="/arena" size="medium" />
      </div>

      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[24px] border border-arena-border bg-arena-surface/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pt-8 pb-8 sm:px-8"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key={view.kind === "status" ? view.status : view.kind}
            transition={{ duration: 0.18 }}
          >
            <LandingBody
              onResolved={setView}
              token={token}
              transfer={transfer}
              view={view}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function LandingBody({
  view,
  token,
  transfer,
  onResolved,
}: {
  view: View;
  token: string;
  transfer: TransferDetails | null;
  onResolved: (view: View) => void;
}) {
  const t = useTranslations("teamTransfer");

  switch (view.kind) {
    case "pending":
      return transfer ? (
        <PendingView
          onResolved={onResolved}
          token={token}
          transfer={transfer}
        />
      ) : null;
    case "accepted":
      return (
        <StateView
          icon={Sparkles}
          sub={t("page.acceptedSub", { team: transfer?.teamName ?? "" })}
          title={t("page.acceptedTitle")}
          tone="success"
        />
      );
    case "declined":
      return (
        <StateView
          icon={CircleSlash}
          sub={t("page.declinedSub")}
          title={t("page.declinedTitle")}
          tone="neutral"
        />
      );
    case "status":
      return (
        <StateView
          icon={view.status === "accepted" ? CircleCheck : Clock}
          sub={t(`page.status.${view.status}.sub`)}
          title={t(`page.status.${view.status}.title`)}
          tone="neutral"
        />
      );
    case "error":
      return (
        <StateView
          icon={AlertTriangle}
          showUpgrade={view.code === "TEAM_LIMIT_REACHED"}
          sub={t(transferErrorKey(view.code))}
          title={t("page.errorTitle")}
          tone="danger"
        />
      );
  }
}

function PendingView({
  token,
  transfer,
  onResolved,
}: {
  token: string;
  transfer: TransferDetails;
  onResolved: (view: View) => void;
}) {
  const t = useTranslations("teamTransfer");
  const format = useFormatter();
  const queryClient = useQueryClient();
  const { setActiveTeamId } = useTeams();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);

  const refreshTeams = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard", "teams"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "planTier"] }),
      queryClient.invalidateQueries({
        queryKey: INCOMING_TRANSFERS_QUERY_KEY,
      }),
    ]);

  const handleAccept = async () => {
    setBusy("accept");
    try {
      const result = await acceptOwnershipTransfer({ token });
      if (!result.success) {
        onResolved({ kind: "error", code: normalizeCode(result.error.code) });
        return;
      }
      await refreshTeams();
      setActiveTeamId(result.data.teamId);
      onResolved({ kind: "accepted" });
    } catch {
      onResolved({ kind: "error", code: "UNKNOWN" });
    } finally {
      setBusy(null);
    }
  };

  const handleDecline = async () => {
    setBusy("decline");
    try {
      const result = await declineOwnershipTransfer({ token });
      if (!result.success) {
        onResolved({ kind: "error", code: normalizeCode(result.error.code) });
        return;
      }
      await refreshTeams();
      onResolved({ kind: "declined" });
    } catch {
      onResolved({ kind: "error", code: "UNKNOWN" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-arena-highlight/30 bg-arena-highlight/10 text-arena-highlight">
          <ArrowLeftRight size={22} strokeWidth={2.2} aria-hidden="true" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-arena-highlight">
          {t("page.kicker")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-arena-text">
          {t("page.title", { team: transfer.teamName })}
        </h1>
        <p className="text-sm leading-6 text-arena-text-sec">
          {t("page.body", {
            from: transfer.fromName,
            team: transfer.teamName,
          })}
        </p>
        <p className="flex items-center gap-1.5 text-[12px] text-arena-text-muted">
          <Clock size={12} strokeWidth={2} aria-hidden="true" />
          {t("page.expires", {
            date: format.dateTime(new Date(transfer.expiresAt), {
              dateStyle: "long",
            }),
          })}
        </p>
      </div>

      <div className="flex gap-2.5 rounded-[12px] border border-arena-warning/25 bg-arena-warning/5 px-3 py-2.5 text-[12px] leading-5 text-arena-text-sec">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-arena-warning"
          size={15}
          strokeWidth={2}
        />
        {t("page.warning")}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:grid sm:grid-cols-2">
        <button
          className={secondaryClass}
          disabled={busy !== null}
          onClick={handleDecline}
          type="button"
        >
          {busy === "decline" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <X size={16} strokeWidth={2.2} aria-hidden="true" />
          )}
          {busy === "decline" ? t("page.declining") : t("page.decline")}
        </button>
        <button
          className={primaryClass}
          disabled={busy !== null}
          onClick={handleAccept}
          type="button"
        >
          {busy === "accept" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Check size={16} strokeWidth={2.4} aria-hidden="true" />
          )}
          {busy === "accept" ? t("page.accepting") : t("page.accept")}
        </button>
      </div>
    </div>
  );
}

const TONES = {
  success: "border-arena-success/25 bg-arena-success/10 text-arena-success",
  neutral: "border-arena-border bg-arena-surface-el text-arena-text-sec",
  danger: "border-arena-danger/25 bg-arena-danger/10 text-arena-danger",
} as const;

/** Icon + title + sub + CTA, for every non-actionable outcome. */
function StateView({
  icon: Icon,
  title,
  sub,
  tone,
  showUpgrade = false,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  tone: keyof typeof TONES;
  showUpgrade?: boolean;
}) {
  const t = useTranslations("teamTransfer");
  const tCreate = useTranslations("arenaCreateTeam");

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl border",
          TONES[tone],
        )}
      >
        <Icon size={26} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight text-arena-text">
          {title}
        </h1>
        <p className="text-sm leading-6 text-arena-text-muted">{sub}</p>
      </div>
      <div className="mt-2 flex w-full flex-col gap-2">
        {showUpgrade && (
          <Link className={primaryClass} href="/pricing">
            {tCreate("upgradeCta")}
          </Link>
        )}
        <Link
          className={showUpgrade ? secondaryClass : primaryClass}
          href="/arena"
        >
          {t("page.goArena")}
        </Link>
      </div>
    </div>
  );
}
