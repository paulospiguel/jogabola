"use client";

import {
  BadgeCheck,
  CheckCircle2,
  Hourglass,
  ListPlus,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Send,
  UserPlus,
  Users2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, useTransition } from "react";
import { sendRosterPlayerEmail } from "@/actions/teams.actions";
import { AddPlayerSheet } from "@/components/arena/add-player-sheet";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBottomSheet } from "@/components/arena/jb-bottom-sheet";
import { JbUserMenu } from "@/components/arena/jb-user-menu";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { RadialProgressIcon } from "@/components/arena/radial-progress-icon";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SquadPlayer } from "@/hooks/use-squad";
import { useSquad } from "@/hooks/use-squad";
import { useTeams } from "@/hooks/use-teams";
import { cn } from "@/lib/utils";

const FILTERS_DATA = [
  { id: "all", label: "filters.all", Icon: Users2 },
  { id: "verified", label: "filters.verified", Icon: BadgeCheck },
  { id: "manual", label: "filters.manual", Icon: UserPlus },
  { id: "pending", label: "filters.pending", Icon: Hourglass },
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

export function SquadClient({ userId }: { userId: string }) {
  const t = useTranslations("arenaSquad");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
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

  const filtered = players.filter(p => {
    const ms =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(search.toLowerCase());
    const mf =
      filter === "all" ||
      (filter === "verified" && p.isVerified) ||
      (filter === "manual" && !p.isVerified && p.status === "new") ||
      (filter === "pending" && !p.isVerified);
    return ms && mf;
  });

  const stats = useMemo(
    () => ({
      total: players.length,
      verified: players.filter(p => p.isVerified).length,
      manual: players.filter(p => !p.isVerified && p.status === "new").length,
      pending: players.filter(p => !p.isVerified).length,
    }),
    [players],
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
            ? {
                ...group,
                name: groupName.trim(),
                playerIds: groupSelection,
              }
            : group,
        ),
      );
    } else {
      saveGroups([
        ...groups,
        {
          id: crypto.randomUUID(),
          name: groupName.trim(),
          playerIds: groupSelection,
        },
      ]);
    }
    setGroupName("");
    setGroupSelection([]);
    setEditingGroupId(null);
    setGroupOpen(false);
  }

  function openEmail(player: SquadPlayer) {
    setEmailPlayer(player);
    setEmailSubject(`Mensagem da equipa`);
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
      <div className="jb-page flex items-center justify-center">
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
        <JbBottomSheet
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
            <Button
              type="button"
              onClick={sendEmailToPlayer}
              disabled={
                isSendingEmail ||
                !emailSubject.trim() ||
                !emailMessage.trim() ||
                emailUsage >= emailLimit
              }
              className="h-11 w-full rounded-[14px] bg-arena-primary font-bold text-arena-bg hover:bg-arena-primary/90"
            >
              <Send size={15} />
              {t("email.send")}
            </Button>
          </div>
        </JbBottomSheet>
      )}

      {groupOpen && (
        <JbBottomSheet
          title={
            editingGroupId ? t("groups.editTitle") : t("groups.createTitle")
          }
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
                    <JbAvatar
                      image={player.image}
                      name={player.name}
                      size={32}
                      id={player.id}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-arena-text">
                      {player.name}
                    </span>
                    {checked && (
                      <CheckCircle2 size={16} className="text-arena-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            <Button
              type="button"
              onClick={saveGroup}
              disabled={!groupName.trim() || groupSelection.length === 0}
              className="h-11 w-full rounded-[14px] bg-arena-primary font-bold text-arena-bg hover:bg-arena-primary/90"
            >
              <ListPlus size={15} />
              {editingGroupId ? t("groups.update") : t("groups.create")}
            </Button>
          </div>
        </JbBottomSheet>
      )}

      <div className="jb-page px-3 pt-4 sm:px-5 md:px-7">
        <div className="jb-page-inner">
          <div className="w-full">
            <header className="jb-topbar">
              <div className="flex w-full items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="jb-kicker">{t("kicker")}</div>
                  <div className="flex items-center gap-2">
                    <Users2 className="size-5 shrink-0 text-arena-primary sm:size-6" />
                    <h1 className="jb-title">{t("title")}</h1>
                  </div>
                  <p className="mt-1 max-w-2xl text-[13px] text-arena-text-muted">
                    {t("subtitle")}
                  </p>
                </div>
                <JbUserMenu onlyAvatar className="hidden md:block" />
              </div>
            </header>
            <div className="mb-4 grid grid-cols-2 gap-2 md:flex md:justify-end">
              <Button
                className="jb-action justify-center"
                onClick={openCreateGroup}
                type="button"
                variant="ghost"
                size="sm"
              >
                <ListPlus size={15} strokeWidth={2.5} />
                {t("groups.action")}
              </Button>
              <Button
                className="jb-action jb-action-primary justify-center"
                onClick={() => setShowAdd(true)}
                type="button"
                variant="ghost"
                size="sm"
              >
                <Plus size={15} strokeWidth={2.5} />
                {t("actions.add")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              [t("filters.all"), stats.total],
              [t("filters.verified"), stats.verified],
              [t("filters.manual"), stats.manual],
              [t("filters.pending"), stats.pending],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[14px] border border-arena-border bg-arena-surface px-3 py-2"
              >
                <div className="font-sora text-lg font-extrabold text-arena-text">
                  {value}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {groups.length > 0 && (
            <section className="mt-4 rounded-[16px] border border-arena-border bg-arena-surface p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                  {t("groups.title")}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11px] text-arena-text-sec hover:text-arena-primary"
                  onClick={openCreateGroup}
                >
                  <Plus size={13} />
                  {t("groups.new")}
                </Button>
              </div>
              <div className="flex gap-2 overflow-auto pb-1">
                {groups.map(group => (
                  <div
                    key={group.id}
                    className="w-[min(78vw,220px)] shrink-0 rounded-[12px] border border-arena-border bg-arena-bg px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-arena-text">
                          {group.name}
                        </div>
                        <div className="text-[11px] text-arena-text-muted">
                          {t("groups.count", {
                            count: group.playerIds.length,
                          })}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("groups.edit")}
                        className="size-7 rounded-[8px] border border-arena-border bg-arena-surface text-arena-text-muted hover:text-arena-primary"
                        onClick={() => openEditGroup(group)}
                      >
                        <Pencil size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-4">
            <div className="flex h-11 items-center gap-2.5 rounded-[12px] border border-arena-border bg-arena-surface px-3.5">
              <Search size={16} className="shrink-0 text-arena-text-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("search.placeholder")}
                className="flex-1 border-none bg-transparent p-0 text-sm text-arena-text shadow-none placeholder:text-arena-text-muted/70 focus-visible:ring-0"
              />
              {search && (
                <Button
                  onClick={() => setSearch("")}
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  className="h-6 w-6 min-h-0 min-w-0 text-arena-text-muted hover:text-arena-text"
                  aria-label="Limpar pesquisa"
                >
                  <X size={14} strokeWidth={2} />
                </Button>
              )}
            </div>

            <ToggleGroup
              type="single"
              value={filter}
              onValueChange={v => v && setFilter(v)}
              className="mt-2.5 grid grid-cols-4 gap-2 pb-1 md:flex md:flex-wrap md:justify-start"
            >
              {FILTERS_DATA.map(f => (
                <ToggleGroupItem
                  key={f.id}
                  value={f.id}
                  className="jb-chip h-11 min-w-0 justify-center px-2 data-[state=on]:border-arena-primary/40 data-[state=on]:bg-arena-primary/8 data-[state=on]:text-arena-primary md:h-auto md:px-3"
                >
                  <f.Icon size={24} className="sm:size-5" />
                  <span className="hidden md:inline">{t(f.label)}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <h1 className="mt-4 inline text-[22px] font-bold tracking-tight text-arena-text md:hidden">
              {t(`filters.${filter}`)}
            </h1>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-[18px] border border-arena-border bg-arena-surface">
                  <Search
                    size={24}
                    className="text-arena-text-muted"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="text-[15px] font-semibold text-arena-text">
                  {t("search.noResults")}
                </div>
                <Button
                  onClick={() => setShowAdd(true)}
                  className="h-[42px] rounded-[12px] bg-arena-primary px-5 text-[13px] font-bold text-arena-bg hover:bg-arena-primary/90"
                  type="button"
                >
                  {t("actions.addPlayer")}
                </Button>
              </div>
            ) : (
              <>
                <div className="jb-section-label">
                  {t("stats.playerCount", { count: filtered.length })}
                </div>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map(p => (
                    <div
                      key={p.id}
                      className="rounded-[14px] border border-arena-border bg-arena-surface px-3 py-3 transition-all hover:border-arena-primary/30 hover:bg-arena-primary/5 sm:px-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <JbAvatar
                          image={p.image}
                          name={p.name}
                          size={40}
                          id={p.id}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex min-w-0 items-center gap-1.5">
                            <Link
                              href={`/arena/squads/player/${p.id}`}
                              className="truncate text-sm font-semibold text-arena-text hover:text-arena-primary"
                            >
                              {p.name}
                            </Link>
                            <VerifiedBadge
                              variant="icon"
                              verified={p.isVerified}
                            />
                          </div>
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="rounded-[5px] border border-arena-border bg-arena-surface-el px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
                              {t(`roles.${p.role.toLowerCase()}`)}
                            </span>
                            <RadialProgressIcon 
                              progress={p.rating * 10} 
                              valueText={p.rating % 1 === 0 ? p.rating.toFixed(0) : p.rating.toFixed(1)} 
                              size={28} 
                              strokeWidth={2}
                            />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            asChild
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="size-8 rounded-[10px] border border-arena-border bg-arena-bg text-arena-text-muted hover:text-arena-primary"
                          >
                            <Link href={`/arena/squads/player/${p.id}/chat`}>
                              <MessageCircle size={14} />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => openEmail(p)}
                            className="size-8 rounded-[10px] border border-arena-border bg-arena-bg text-arena-text-muted hover:text-arena-primary"
                            aria-label={t("email.open")}
                          >
                            <Mail size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex min-w-0 items-center justify-between gap-2 border-arena-border border-t pt-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                            p.isVerified
                              ? "bg-arena-success/10 text-arena-success"
                              : "bg-arena-warning/10 text-arena-warning",
                          )}
                        >
                          {p.isVerified
                            ? t("filters.verified")
                            : t("filters.pending")}
                        </span>
                        {p.email && (
                          <span className="min-w-0 truncate text-[11px] text-arena-text-muted">
                            {p.email}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <Button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-[90px] right-6 z-[100] flex size-[52px] items-center justify-center rounded-full bg-arena-primary text-arena-bg shadow-[0_4px_20px_color-mix(in_srgb,var(--color-arena-primary)_33%,transparent)] hover:bg-arena-primary/90 md:hidden"
          type="button"
          aria-label={t("actions.add")}
        >
          <Plus size={22} strokeWidth={2.5} />
        </Button>
      </div>
    </>
  );
}
