"use client";

import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  Users2,
  X,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  cancelOwnershipTransfer,
  type PendingTransfer,
  requestOwnershipTransfer,
} from "@/actions/team-transfer.actions";
import { JbAvatar } from "@/components/arena/avatar";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { staffLabelClass } from "@/components/arena/staff-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast-custom";
import {
  looksLikeEmail,
  type TransferCandidate,
  teamNameMatches,
  transferErrorKey,
} from "@/lib/transfer-ui";
import { cn } from "@/lib/utils";

type RecipientMode = "member" | "email";

interface TransferTeamSheetProps {
  teamId: number;
  teamName: string;
  candidates: TransferCandidate[];
  pending: PendingTransfer | null;
  onClose: () => void;
  /** Refetches the pending request after a request or a cancel. */
  onChanged: () => Promise<void>;
}

interface PanelProps {
  teamId: number;
  onBusyChange: (busy: boolean) => void;
  onChanged: () => Promise<void>;
}

const inputClass =
  "h-11 rounded-xl border border-arena-border bg-arena-surface px-3 text-sm text-arena-text placeholder:text-arena-text-muted focus-visible:border-arena-primary/50 focus-visible:ring-1 focus-visible:ring-arena-primary/30 focus-visible:ring-offset-0";

const warningClass =
  "flex gap-2.5 rounded-[12px] border border-arena-warning/25 bg-arena-warning/5 px-3 py-2.5 text-[12px] leading-5 text-arena-text-sec";

/**
 * Owner hands the team to a roster/staff member or an email. Presentation
 * only: the server re-checks ownership, the recipient and the typed name.
 */
export function TransferTeamSheet({
  teamId,
  teamName,
  candidates,
  pending,
  onClose,
  onChanged,
}: TransferTeamSheetProps) {
  const t = useTranslations("teamTransfer");
  const [busy, setBusy] = useState(false);

  return (
    <Sheet
      open
      onOpenChange={open => {
        if (!open && !busy) onClose();
      }}
    >
      <SheetContent
        className="flex w-full flex-col gap-0 border-arena-border bg-arena-bg-sec p-0 text-arena-text sm:max-w-md"
        side="right"
      >
        <SheetHeader className="border-b border-arena-border px-5 pt-5 pb-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-base font-bold text-arena-text">
            <ArrowLeftRight
              aria-hidden="true"
              className="text-arena-primary"
              size={18}
              strokeWidth={2.2}
            />
            {pending ? t("pending.title") : t("sheet.title")}
          </SheetTitle>
          <SheetDescription className="text-[12px] text-arena-text-muted">
            {t("sheet.description", { team: teamName })}
          </SheetDescription>
        </SheetHeader>

        {pending ? (
          <PendingPanel
            candidates={candidates}
            onBusyChange={setBusy}
            onChanged={onChanged}
            pending={pending}
            teamId={teamId}
          />
        ) : (
          <RequestPanel
            candidates={candidates}
            onBusyChange={setBusy}
            onChanged={onChanged}
            teamId={teamId}
            teamName={teamName}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      className="rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3 py-2.5 text-[13px] text-arena-danger"
      role="alert"
    >
      {message}
    </div>
  );
}

/** Pending request: recipient, expiry and "Cancelar transferência". */
function PendingPanel({
  teamId,
  pending,
  candidates,
  onBusyChange,
  onChanged,
}: PanelProps & {
  pending: PendingTransfer;
  candidates: TransferCandidate[];
}) {
  const t = useTranslations("teamTransfer");
  const format = useFormatter();
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recipientImage =
    candidates.find(c => c.userId === pending.toUserId)?.image ?? null;

  const handleCancel = async () => {
    setCancelling(true);
    onBusyChange(true);
    setError(null);
    try {
      const result = await cancelOwnershipTransfer({ teamId });
      if (!result.success) {
        setError(t(transferErrorKey(result.error.code)));
      } else {
        toast.success(t("feedback.cancelled"));
      }
      await onChanged();
    } catch {
      setError(t(transferErrorKey(undefined)));
    } finally {
      setCancelling(false);
      onBusyChange(false);
    }
  };

  return (
    <>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-5 py-5">
        <div className="rounded-[14px] border border-arena-border bg-arena-surface p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-arena-text-muted">
            {t("pending.recipient")}
          </p>
          <div className="mt-2 flex items-center gap-3">
            {pending.toUserId ? (
              <JbAvatar
                id={pending.toUserId}
                image={recipientImage}
                name={pending.toName ?? ""}
                size={40}
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-arena-border bg-arena-surface-el text-arena-text-sec">
                <Mail size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-arena-text">
                {pending.toName ?? pending.toEmail}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-arena-text-muted">
                <Clock size={11} strokeWidth={2} aria-hidden="true" />
                {t("pending.expires", {
                  date: format.dateTime(new Date(pending.expiresAt), {
                    dateStyle: "long",
                  }),
                })}
              </p>
            </div>
          </div>
        </div>
        <p className="text-[12px] leading-5 text-arena-text-sec">
          {t("pending.note")}
        </p>
        <ErrorBox message={error} />
      </div>

      <div className="border-t border-arena-border px-5 pt-3 pb-5">
        <Button
          className="press btn-press h-[50px] w-full rounded-[14px] border border-arena-danger/30 bg-transparent text-[15px] font-bold text-arena-danger hover:bg-arena-danger/10"
          disabled={cancelling}
          onClick={handleCancel}
          type="button"
          variant="ghost"
        >
          {cancelling ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <X size={16} strokeWidth={2.2} />
          )}
          {cancelling ? t("pending.cancelling") : t("pending.cancel")}
        </Button>
      </div>
    </>
  );
}

/** New request: recipient, both warnings and the typed-name confirmation. */
function RequestPanel({
  teamId,
  teamName,
  candidates,
  onBusyChange,
  onChanged,
}: PanelProps & { teamName: string; candidates: TransferCandidate[] }) {
  const t = useTranslations("teamTransfer");
  const { toast } = useToast();
  const confirmId = useId();

  const [mode, setMode] = useState<RecipientMode>(
    candidates.length > 0 ? "member" : "email",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = candidates.find(c => c.userId === selectedId) ?? null;
  const hasRecipient =
    mode === "member" ? selected !== null : looksLikeEmail(email);
  const canSubmit =
    hasRecipient && teamNameMatches(confirmName, teamName) && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    onBusyChange(true);
    setError(null);
    try {
      const recipient =
        mode === "member" && selected
          ? { toUserId: selected.userId }
          : { toEmail: email.trim() };
      const result = await requestOwnershipTransfer({
        teamId,
        confirmTeamName: confirmName,
        ...recipient,
      });
      if (!result.success) {
        setError(t(transferErrorKey(result.error.code)));
        return;
      }
      toast.success(
        t("feedback.requested", { recipient: selected?.name ?? email.trim() }),
      );
      await onChanged();
    } catch {
      setError(t(transferErrorKey(undefined)));
    } finally {
      setSubmitting(false);
      onBusyChange(false);
    }
  };

  return (
    <>
      <div className="min-h-0 flex-1 space-y-5 overflow-auto px-5 py-5">
        <RecipientModeToggle mode={mode} onChange={setMode} />

        {mode === "member" ? (
          <MemberPicker
            candidates={candidates}
            onSelect={setSelectedId}
            onUseEmail={() => setMode("email")}
            selectedId={selectedId}
          />
        ) : (
          <EmailField onChange={setEmail} value={email} />
        )}

        <ul className="space-y-2">
          <li className={warningClass}>
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-arena-warning"
              size={15}
              strokeWidth={2}
            />
            {t("sheet.warningPrivileges")}
          </li>
          <li className={warningClass}>
            <CreditCard
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-arena-warning"
              size={15}
              strokeWidth={2}
            />
            {t("sheet.warningPayments")}
          </li>
        </ul>

        <div>
          <Label className={staffLabelClass} htmlFor={confirmId}>
            {t("sheet.confirmLabel")}
          </Label>
          <Input
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={inputClass}
            id={confirmId}
            onChange={event => setConfirmName(event.target.value)}
            placeholder={teamName}
            spellCheck={false}
            value={confirmName}
          />
          <p className="mt-1.5 text-[11px] text-arena-text-muted">
            {t("sheet.confirmHint", { team: teamName })}
          </p>
        </div>

        <ErrorBox message={error} />
      </div>

      <div className="border-t border-arena-border px-5 pt-3 pb-5">
        <Button
          className="press btn-press h-[50px] w-full rounded-[14px] bg-arena-primary text-[15px] font-bold text-arena-bg hover:bg-arena-primary/90"
          disabled={!canSubmit}
          onClick={handleSubmit}
          type="button"
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <ArrowLeftRight size={16} strokeWidth={2.2} />
          )}
          {submitting ? t("sheet.submitting") : t("sheet.submit")}
        </Button>
      </div>
    </>
  );
}

function RecipientModeToggle({
  mode,
  onChange,
}: {
  mode: RecipientMode;
  onChange: (mode: RecipientMode) => void;
}) {
  const t = useTranslations("teamTransfer");

  return (
    <div>
      <p className={staffLabelClass}>{t("sheet.recipientLabel")}</p>
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-arena-border bg-arena-surface p-1">
        {(["member", "email"] as const).map(option => {
          const Icon = option === "member" ? Users2 : Mail;
          return (
            <button
              aria-pressed={mode === option}
              className={cn(
                "press flex h-9 items-center justify-center gap-1.5 rounded-[9px] text-[12px] font-semibold transition-colors",
                mode === option
                  ? "bg-arena-primary/15 text-arena-primary"
                  : "text-arena-text-muted hover:text-arena-text",
              )}
              key={option}
              onClick={() => onChange(option)}
              type="button"
            >
              <Icon size={14} strokeWidth={2} aria-hidden="true" />
              {option === "member"
                ? t("sheet.modeMember")
                : t("sheet.modeEmail")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MemberPicker({
  candidates,
  selectedId,
  onSelect,
  onUseEmail,
}: {
  candidates: TransferCandidate[];
  selectedId: string | null;
  onSelect: (userId: string) => void;
  onUseEmail: () => void;
}) {
  const t = useTranslations("teamTransfer");

  if (candidates.length === 0) {
    return (
      <ArenaEmptyState
        icon={Users2}
        title={t("sheet.noMembersTitle")}
        description={t("sheet.noMembersSub")}
        action={
          <button
            className="press btn-press inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-arena-primary px-4 text-xs font-bold text-arena-bg hover:bg-arena-primary/90"
            onClick={onUseEmail}
            type="button"
          >
            <Mail size={14} strokeWidth={2.2} />
            {t("sheet.noMembersCta")}
          </button>
        }
      />
    );
  }

  return (
    <div>
      <p className="mb-2 text-[11px] text-arena-text-muted">
        {t("sheet.memberHint")}
      </p>
      <ul
        aria-label={t("sheet.recipientLabel")}
        className="max-h-64 space-y-1.5 overflow-auto"
      >
        {candidates.map(candidate => {
          const active = candidate.userId === selectedId;
          return (
            <li key={candidate.userId}>
              <button
                aria-pressed={active}
                className={cn(
                  "press flex w-full items-center gap-3 rounded-[12px] border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-arena-primary/50 bg-arena-primary/10"
                    : "border-arena-border bg-arena-surface hover:border-arena-primary/30",
                )}
                onClick={() => onSelect(candidate.userId)}
                type="button"
              >
                <JbAvatar
                  id={candidate.userId}
                  image={candidate.image}
                  name={candidate.name}
                  size={32}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-arena-text">
                  {candidate.name}
                </span>
                {active && (
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-arena-primary"
                    size={16}
                    strokeWidth={2.4}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmailField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("teamTransfer");
  const emailId = useId();

  return (
    <div>
      <Label className={staffLabelClass} htmlFor={emailId}>
        {t("sheet.emailLabel")}
      </Label>
      <Input
        autoComplete="email"
        className={inputClass}
        id={emailId}
        inputMode="email"
        onChange={event => onChange(event.target.value)}
        placeholder={t("sheet.emailPlaceholder")}
        type="email"
        value={value}
      />
      <p className="mt-1.5 text-[11px] text-arena-text-muted">
        {t("sheet.emailHint")}
      </p>
    </div>
  );
}
