"use client";

import { Plus, Search, Users2, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AddPlayerSheet } from "@/components/arena/add-player-sheet";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBadge } from "@/components/arena/jb-badge";
import { JbUserMenu } from "@/components/arena/jb-user-menu";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSquad } from "@/hooks/use-squad";

const FILTERS_DATA = [
  { id: "all", l: "filters.all" },
  { id: "confirmed", l: "filters.confirmed" },
  { id: "reserve", l: "filters.reserves" },
  { id: "pending", l: "filters.pending" },
];

export function SquadClient({ userId }: { userId: string }) {
  const t = useTranslations("arenaSquad");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const { players, activeTeamId, isLoading } = useSquad();

  const filtered = players.filter(p => {
    const ms =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "all" || p.status === filter;
    return ms && mf;
  });

  if (isLoading) {
    return <div className="jb-page flex items-center justify-center">
      <Loading text={t("loading")} />
    </div>;
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

      <div className="jb-page">
        <div className="jb-page-inner">
          <header className="jb-topbar">
            <div>
              <div className="jb-kicker">{t("kicker")}</div>
              <div className="flex items-center gap-2">
                <Users2 className="text-arena-primary" />
                <h1 className="jb-title">{t("title")}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="jb-action jb-action-primary hidden md:inline-flex"
                onClick={() => setShowAdd(true)}
                type="button"
                variant="ghost"
                size="sm"
              >
                <Plus size={15} strokeWidth={2.5} />
                {t("actions.add")}
              </Button>
              <JbUserMenu onlyAvatar />
            </div>
          </header>

          <div>
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
              className="jb-toolbar mt-2.5 pb-1 justify-start"
            >
              {FILTERS_DATA.map(f => (
                <ToggleGroupItem
                  key={f.id}
                  value={f.id}
                  className="jb-chip h-auto data-[state=on]:border-arena-primary/40 data-[state=on]:bg-arena-primary/8 data-[state=on]:text-arena-primary"
                >
                  {t(f.l)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

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
                  <Link
                    key={p.id}
                    href={`/arena/squads/player/${p.id}`}
                    className="flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-3.5 py-3 transition-all hover:border-arena-primary/30 hover:bg-arena-primary/5 active:scale-[0.98]"
                  >
                    <JbAvatar
                      image={p.image}
                      name={p.name}
                      size={40}
                      id={p.id}
                    />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-arena-text">
                          {p.name}
                        </span>
                        <VerifiedBadge variant="icon" verified={p.isVerified} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-[5px] border border-arena-border bg-arena-surface-el px-1.5 py-0.5 text-[10px] font-bold text-arena-text-muted">
                          {p.role}
                        </span>
                        <span className="text-[11px] text-arena-text-muted">
                          ⭐ {p.rating}
                        </span>
                      </div>
                    </div>
                    <JbBadge status={p.status} />
                  </Link>
                ))}
              </div>
            </>
          )}
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
