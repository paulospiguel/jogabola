"use client";

import {
  CheckCircle2,
  Hourglass,
  ListPlus,
  Mail,
  Pencil,
  Plus,
  Search,
  Send,
  Star,
  Users2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, useTransition } from "react";
import { sendRosterPlayerEmail } from "@/actions/teams.actions";
import { AddPlayerSheet } from "@/components/arena/add-player-sheet";
import { JbAvatar } from "@/components/arena/avatar";
import { JbBadge } from "@/components/arena/badge";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { motion } from "framer-motion";
import Loading from "@/components/loading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SquadPlayer } from "@/hooks/use-squad";
import { useSquad } from "@/hooks/use-squad";
import { useTeams } from "@/hooks/use-teams";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "confirmed" | "reserve" | "pending";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "confirmed", label: "Confirm." },
  { key: "reserve", label: "Reservas" },
  { key: "pending", label: "Pendentes" },
];

interface RosterGroup {
  id: string;
  name: string;
  playerIds: string[];
}

function emailLimitFor(planTier: string) {
  if (planTier === "elite") return Number.POSITIVE_INFINITY;
  if (planTier === "pro") return 10;
  return 3;
}

function matchesFilter(p: SquadPlayer, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "confirmed") return p.status === "confirmed";
  if (filter === "reserve") return p.status === "reserve";
  if (filter === "pending") return p.status === "pending" || p.status === "new";
  return true;
}

export function SquadClient({ userId }: { userId: string }) {
  const t = useTranslations("arenaSquad");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [emailPlayer, setEmailPlayer] = useState<SquadPlayer | null>(null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupSelection, setGroupSelection] = useState<string[]>([]);
  const [groups, setGroups] = useState<RosterGroup[]>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);
  const [isSendingEmail, startEmailTransition] = useTransition();

  const { players, activeTeamId, isLoading } = useSquad();
  const { planTier } = useTeams();
  const emailLimit = emailLimitFor(planTier);
  const emailStorageKey = `jogabola.rosterEmailUsage.${new Date().toISOString().slice(0, 7)}`;
  const groupStorageKey = activeTeamId
    ? `jogabola.rosterGroups.${activeTeamId}`
    : null;
  const [emailUsage, setEmailUsage] = useState(0);

  useEffect(() => {
    if (!groupStorageKey || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(groupStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as RosterGroup[];
      setGroups(Array.isArray(parsed) ? parsed : []);
    } catch {
      setGroups([]);
    }
  }, [groupStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setEmailUsage(Number(window.localStorage.getItem(emailStorageKey) ?? "0"));
  }, [emailStorageKey]);

  const filtered = useMemo(
    () =>
      players.filter(p => {
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.position ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.email ?? "").toLowerCase().includes(search.toLowerCase());
        return matchSearch && matchesFilter(p, filter);
      }),
    [players, search, filter],
  );

  function saveGroups(next: RosterGroup[]) {
    setGroups(next);
    if (groupStorageKey && typeof window !== "undefined") {
      window.localStorage.setItem(groupStorageKey, JSON.stringify(next));
    }
  }

  function openCreateGroup() {
    setEditingGroupId(null);
    setGroupName("");
    setGroupSelection([]);
    setGroupOpen(true);
  }

  function openEditGroup(group: RosterGroup) {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setGroupSelection(group.playerIds);
    setGroupOpen(true);
  }

  function saveGroup() {
    if (!groupName.trim() || groupSelection.length === 0) return;
    if (editingGroupId) {
      saveGroups(
        groups.map(group =>
          group.id === editingGroupId
            ? { ...group, name: groupName.trim(), playerIds: groupSelection }
            : group,
        ),
      );
    } else {
      saveGroups([
        ...groups,
        { id: crypto.randomUUID(), name: groupName.trim(), playerIds: groupSelection },
      ]);
    }
    setGroupName("");
    setGroupSelection([]);
    setEditingGroupId(null);
    setGroupOpen(false);
  }

  function openEmail(player: SquadPlayer) {
    setEmailPlayer(player);
    setEmailSubject("Mensagem da equipa");
    setEmailMessage("");
    setEmailFeedback(null);
  }

  function sendEmailToPlayer() {
    if (!emailPlayer || !activeTeamId) return;
    if (emailUsage >= emailLimit) {
      setEmailFeedback(t("email.limitReached"));
      return;
    }
    setEmailFeedback(null);
    startEmailTransition(async () => {
      const result = await sendRosterPlayerEmail({
        teamId: activeTeamId,
        playerId: emailPlayer.id,
        subject: emailSubject,
        message: emailMessage,
      });
      if (result.success) {
        const nextUsage = emailUsage + 1;
        setEmailUsage(nextUsage);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(emailStorageKey, String(nextUsage));
        }
        setEmailFeedback(t("email.sent"));
      } else {
        setEmailFeedback(t("email.error"));
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading text={t("loading")} />
      </div>
    );
  }

  return (
    <>
      {showAdd && (
        <AddPlayerSheet
          onClose={() => setShowAdd(false)}
          managerId={userId}
          teamId={activeTeamId}
        />
      )}

      {emailPlayer && (
        <BottomSheet
          title={t("email.title", { name: emailPlayer.name })}
          onClose={() => setEmailPlayer(null)}
        >
          <div className="space-y-3 overflow-auto">
            <div className="rounded-[14px] border border-arena-border bg-arena-surface px-3 py-2 text-[12px] text-arena-text-sec">
              {Number.isFinite(emailLimit)
                ? t("email.usage", { used: emailUsage, limit: emailLimit })
                : t("email.unlimited")}
            </div>
            <Input
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              placeholder={t("email.subject")}
              className="border-arena-border bg-arena-surface text-arena-text"
            />
            <Textarea
              value={emailMessage}
              onChange={e => setEmailMessage(e.target.value)}
              placeholder={t("email.message")}
              className="min-h-32 border-arena-border bg-arena-surface text-arena-text"
            />
            {emailFeedback && (
              <div className="rounded-[12px] border border-arena-border bg-arena-bg px-3 py-2 text-[12px] text-arena-text-sec">
                {emailFeedback}
              </div>
            )}
            <Cta
              variant="primary"
              size="md"
              fullWidth
              onClick={sendEmailToPlayer}
              disabled={
                isSendingEmail ||
                !emailSubject.trim() ||
                !emailMessage.trim() ||
                emailUsage >= emailLimit
              }
            >
              <Send size={15} />
              {t("email.send")}
            </Cta>
          </div>
        </BottomSheet>
      )}

      {groupOpen && (
        <BottomSheet
          title={editingGroupId ? t("groups.editTitle") : t("groups.createTitle")}
          onClose={() => {
            setGroupOpen(false);
            setEditingGroupId(null);
          }}
        >
          <div className="space-y-3 overflow-auto">
            <Input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder={t("groups.namePlaceholder")}
              className="border-arena-border bg-arena-surface text-arena-text"
            />
            <div className="max-h-72 space-y-2 overflow-auto">
              {players.map(player => {
                const checked = groupSelection.includes(player.id);
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() =>
                      setGroupSelection(current =>
                        checked
                          ? current.filter(id => id !== player.id)
                          : [...current, player.id],
                      )
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[12px] border px-3 py-2 text-left",
                      checked
                        ? "border-arena-primary/50 bg-arena-primary/10"
                        : "border-arena-border bg-arena-surface",
                    )}
                  >
                    <JbAvatar image={player.image} name={player.name} size={32} id={player.id} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-arena-text">
                      {player.name}
                    </span>
                    {checked && <CheckCircle2 size={16} className="text-arena-primary" />}
                  </button>
                );
              })}
            </div>
            <Cta
              variant="primary"
              size="md"
              fullWidth
              onClick={saveGroup}
              disabled={!groupName.trim() || groupSelection.length === 0}
            >
              <ListPlus size={15} />
              {editingGroupId ? t("groups.update") : t("groups.create")}
            </Cta>
          </div>
        </BottomSheet>
      )}

      <motion.div
        className="flex h-full flex-col bg-arena-bg"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Search */}
        <div className="shrink-0 px-4 pt-4 pb-3">
          <div className="flex h-11 items-center gap-2.5 rounded-[14px] border border-arena-border bg-arena-surface px-3.5">
            <Search size={15} className="shrink-0 text-arena-text-muted" strokeWidth={1.7} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("search.placeholder")}
              className="flex-1 border-none bg-transparent p-0 text-[13px] text-arena-text shadow-none placeholder:text-arena-text-muted/60 focus-visible:ring-0 outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                type="button"
                className="flex size-5 items-center justify-center text-arena-text-muted transition-colors hover:text-arena-text active:scale-[0.97]"
                aria-label="Limpar pesquisa"
              >
                <X size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all duration-150 active:scale-[0.96]",
                filter === key
                  ? "bg-arena-primary text-arena-bg"
                  : "border border-arena-border bg-arena-surface text-arena-text-sec hover:border-arena-primary/30 hover:text-arena-text",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Groups (only if any) */}
        {groups.length > 0 && (
          <div className="shrink-0 px-4 pb-3">
            <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-arena-text-muted">
                  {t("groups.title")}
                </span>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] text-arena-text-sec transition-colors hover:text-arena-primary"
                  onClick={openCreateGroup}
                >
                  <Plus size={11} />
                  {t("groups.new")}
                </button>
              </div>
              <div className="flex gap-2 overflow-auto pb-0.5">
                {groups.map(group => (
                  <div
                    key={group.id}
                    className="flex shrink-0 items-center gap-2 rounded-[10px] border border-arena-border bg-arena-bg px-2.5 py-2"
                  >
                    <div>
                      <div className="text-[12px] font-bold text-arena-text">{group.name}</div>
                      <div className="text-[10px] text-arena-text-muted">
                        {t("groups.count", { count: group.playerIds.length })}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={t("groups.edit")}
                      className="flex size-6 items-center justify-center rounded-[7px] border border-arena-border bg-arena-surface text-arena-text-muted transition-colors hover:text-arena-primary active:scale-[0.97]"
                      onClick={() => openEditGroup(group)}
                    >
                      <Pencil size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-[16px] border border-arena-border bg-arena-surface">
                <Users2 size={24} className="text-arena-text-muted" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-arena-text">{t("search.noResults")}</p>
              </div>
              <Cta variant="primary" size="sm" onClick={() => setShowAdd(true)}>
                {t("actions.addPlayer")}
              </Cta>
            </div>
          ) : (
            <>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.08em] text-arena-text-muted">
                {t("stats.playerCount", { count: filtered.length })}
              </p>
              <div className="space-y-2">
                {filtered.map((p, i) => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    index={i}
                    onEmail={openEmail}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-[90px] right-6 z-[100] flex size-[52px] items-center justify-center rounded-full bg-arena-primary text-arena-bg shadow-[0_4px_20px_color-mix(in_srgb,var(--color-arena-primary)_33%,transparent)] transition-all hover:bg-arena-primary/90 active:scale-[0.97] md:hidden"
        type="button"
        aria-label={t("actions.add")}
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>
    </>
  );
}

function PlayerRow({
  player: p,
  index,
  onEmail,
}: {
  player: SquadPlayer;
  index: number;
  onEmail: (p: SquadPlayer) => void;
}) {
  const statusKey =
    p.status === "new" ? "pending" : (p.status as "confirmed" | "reserve" | "pending" | "refused");

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.025, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link
        href={`/arena/squads/player/${p.id}`}
        className="flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-3 py-3.5 transition-all duration-150 hover:border-arena-primary/30 hover:bg-arena-primary/5 active:scale-[0.99]"
      >
        <JbAvatar image={p.image} name={p.name} size={46} id={p.id} />

        <div className="min-w-0 flex-1">
          {/* Name row */}
          <div className="flex items-center gap-1">
            <span className="truncate text-[14px] font-semibold text-arena-text">{p.name}</span>
            <VerifiedBadge variant="icon" verified={p.isVerified} />
            {p.highlight && (
              <Star
                size={12}
                className="shrink-0 text-arena-highlight"
                strokeWidth={1.5}
              />
            )}
          </div>

          {/* Meta row */}
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {p.position && (
              <span className="rounded-[5px] border border-arena-border bg-arena-surface-el px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
                {p.position}
              </span>
            )}
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-arena-highlight">
              <Star size={10} fill="currentColor" strokeWidth={0} />
              {p.rating % 1 === 0 ? p.rating.toFixed(0) : p.rating.toFixed(1)}
            </span>
            {!p.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-[5px] border border-arena-warning/25 bg-arena-warning/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-arena-warning">
                <Hourglass size={8} strokeWidth={2} />
                A VALIDAR
              </span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <JbBadge status={statusKey} size="sm" />
      </Link>
    </motion.div>
  );
}
