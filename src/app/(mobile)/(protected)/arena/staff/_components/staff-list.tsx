"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ChevronRight,
  Clock,
  Crown,
  ShieldCheck,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  getTeamStaff,
  type TeamStaffEntry,
} from "@/actions/team-staff.actions";
import {
  getPendingTransfer,
  type PendingTransfer,
} from "@/actions/team-transfer.actions";
import { JbAvatar } from "@/components/arena/avatar";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { invalidateStaffChange, permissionLabelKey } from "@/lib/staff-ui";
import type { OwnerTransferData } from "@/lib/transfer-ui";
import { cn } from "@/lib/utils";
import {
  type StaffRow,
  staffQueryKey,
  toStaffRows,
} from "../_utils/staff-view";
import { StaffMemberSheet } from "./staff-member-sheet";
import { TransferTeamSheet } from "./transfer-team-sheet";

interface StaffListProps {
  teamId: number;
  viewerId: string;
  viewerIsOwner: boolean;
  initialStaff: TeamStaffEntry[];
  /** Owner-only transfer data; null for staff viewers. */
  transfer: OwnerTransferData | null;
}

export function StaffList({
  teamId,
  viewerId,
  viewerIsOwner,
  initialStaff,
  transfer,
}: StaffListProps) {
  const t = useTranslations("teamStaff");
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: staffQueryKey(teamId),
    queryFn: async () => {
      const result = await getTeamStaff({ teamId });
      if (!result.success) throw new Error(result.error.code);
      return result.data;
    },
    initialData: initialStaff,
    staleTime: 30_000,
  });

  const rows = useMemo(
    () => toStaffRows(data, viewerIsOwner),
    [data, viewerIsOwner],
  );
  const selected = rows.find(row => row.userId === selectedId) ?? null;
  const hasStaff = rows.some(row => !row.isOwner);

  const refresh = () => invalidateStaffChange(queryClient, teamId);

  return (
    <motion.div
      className="mx-auto h-full max-w-screen-lg"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="jb-page-inner flex flex-col pb-24">
        <header className="mb-5 flex w-full shrink-0 flex-col gap-1 border-b border-arena-border/20 py-4">
          <h1 className="text-xl font-extrabold tracking-tight text-arena-text">
            {t("page.title")}
          </h1>
          <p className="text-[12px] text-arena-text-muted">
            {viewerIsOwner ? t("page.subOwner") : t("page.subStaff")}
          </p>
        </header>

        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.08em] text-arena-text-muted">
          {t("page.count", { count: rows.length })}
        </p>

        <ul className="grid gap-2 md:grid-cols-2">
          {rows.map((row, index) => (
            <motion.li
              key={row.userId}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.15,
                delay: index * 0.03,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <StaffRowItem
                isViewer={row.userId === viewerId}
                onEdit={() => setSelectedId(row.userId)}
                row={row}
              />
            </motion.li>
          ))}
        </ul>

        {viewerIsOwner && transfer && (
          <TransferTeamEntry teamId={teamId} transfer={transfer} />
        )}

        {!hasStaff && (
          <ArenaEmptyState
            className="mt-4"
            icon={ShieldCheck}
            title={t("empty.title")}
            description={t("empty.sub")}
            action={
              <Link
                className="press btn-press inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-arena-primary px-4 text-xs font-bold text-arena-bg hover:bg-arena-primary/90"
                href="/arena/squads"
              >
                <Users2 size={14} strokeWidth={2.2} />
                {t("empty.cta")}
              </Link>
            }
          />
        )}
      </div>

      {selected?.editable && (
        <StaffMemberSheet
          key={selected.userId}
          member={selected}
          onClose={() => setSelectedId(null)}
          onChanged={refresh}
          teamId={teamId}
        />
      )}
    </motion.div>
  );
}

const transferQueryKey = (teamId: number) =>
  ["team-transfer-pending", teamId] as const;

/** Owner entry for "Transferir equipa", with the pending request summary. */
function TransferTeamEntry({
  teamId,
  transfer,
}: {
  teamId: number;
  transfer: OwnerTransferData;
}) {
  const t = useTranslations("teamTransfer");
  const format = useFormatter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: pending } = useQuery({
    queryKey: transferQueryKey(teamId),
    queryFn: async (): Promise<PendingTransfer | null> => {
      const result = await getPendingTransfer({ teamId });
      if (!result.success) throw new Error(result.error.code);
      return result.data;
    },
    initialData: transfer.initialPending,
    staleTime: 30_000,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: transferQueryKey(teamId) });
  };

  return (
    <section className="mt-6 rounded-[14px] border border-arena-border bg-arena-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-arena-highlight/25 bg-arena-highlight/10 text-arena-highlight">
          <ArrowLeftRight size={18} strokeWidth={2.2} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-bold text-arena-text">
            {t("entry.title")}
          </h2>
          {pending ? (
            <p className="mt-0.5 flex items-start gap-1 text-[12px] text-arena-text-sec">
              <Clock
                aria-hidden="true"
                className="mt-[3px] shrink-0"
                size={11}
                strokeWidth={2}
              />
              {t("entry.pendingSub", {
                recipient: pending.toName ?? pending.toEmail ?? "",
                date: format.dateTime(new Date(pending.expiresAt), {
                  dateStyle: "long",
                }),
              })}
            </p>
          ) : (
            <p className="mt-0.5 text-[12px] text-arena-text-muted">
              {t("entry.sub")}
            </p>
          )}
        </div>
      </div>
      <button
        className="press btn-press mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface-el px-4 text-xs font-bold text-arena-text transition-colors hover:border-arena-primary/30 hover:bg-arena-primary/5 md:w-auto"
        onClick={() => setOpen(true)}
        type="button"
      >
        <ArrowLeftRight size={14} strokeWidth={2.2} aria-hidden="true" />
        {pending ? t("entry.view") : t("entry.cta")}
      </button>

      {open && (
        <TransferTeamSheet
          candidates={transfer.candidates}
          onChanged={refresh}
          onClose={() => setOpen(false)}
          pending={pending}
          teamId={teamId}
          teamName={transfer.teamName}
        />
      )}
    </section>
  );
}

function StaffRowItem({
  row,
  isViewer,
  onEdit,
}: {
  row: StaffRow;
  isViewer: boolean;
  onEdit: () => void;
}) {
  const t = useTranslations("teamStaff");
  const titleLabel = row.isOwner ? t("owner") : t(`titles.${row.title}`);

  const content = (
    <>
      <JbAvatar id={row.userId} image={row.image} name={row.name} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[14px] font-semibold text-arena-text">
            {row.name}
          </span>
          {isViewer && (
            <span className="shrink-0 text-[11px] font-semibold text-arena-text-muted">
              {t("list.you")}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider",
              row.isOwner
                ? "border-arena-highlight/30 bg-arena-highlight/10 text-arena-highlight"
                : "border-arena-info/30 bg-arena-info/10 text-arena-info",
            )}
          >
            {row.isOwner ? (
              <Crown size={9} strokeWidth={2.2} aria-hidden="true" />
            ) : (
              <ShieldCheck size={9} strokeWidth={2.2} aria-hidden="true" />
            )}
            {titleLabel}
          </span>
          {row.isAthlete && (
            <span className="rounded-[5px] border border-arena-border bg-arena-surface-el px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-arena-text-muted">
              {t("list.athlete")}
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-arena-text-sec">
          {row.isOwner
            ? t("list.allPermissions")
            : row.permissions.length === 0
              ? t("list.noPermissions")
              : row.permissions
                  .map(permission =>
                    t(`permissions.${permissionLabelKey(permission)}`),
                  )
                  .join(" · ")}
        </p>
      </div>
    </>
  );

  const baseClass =
    "flex w-full items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-3 py-3.5 text-left";

  if (!row.editable) return <div className={baseClass}>{content}</div>;

  return (
    <button
      aria-label={t("list.editAria", { name: row.name })}
      className={cn(
        baseClass,
        "press transition-all duration-150 hover:border-arena-primary/30 hover:bg-arena-primary/5",
      )}
      onClick={onEdit}
      type="button"
    >
      {content}
      <ChevronRight
        className="shrink-0 text-arena-text-muted"
        size={16}
        strokeWidth={2}
      />
    </button>
  );
}
