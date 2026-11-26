"use client";

import { useMutation } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/types/common";
import { useInvalidateClub } from "../_hooks/use-club-calendar";
import { useClubMessages } from "../_hooks/use-club-messages";
import { clubErrorCode, unwrapClubResult } from "../_utils/club-action-error";
import {
  CLUB_LINK_BUTTON_CLASS,
  CLUB_STAGGER,
  ClubQueryProblem,
  ClubSkeletonRows,
} from "./club-ui";
import { ConfirmSheet } from "./confirm-sheet";

export interface CatalogItem {
  id: number;
  name: string;
  sub?: string;
}

interface CatalogPanelProps {
  /** Translation namespace under `arenaClubCalendar`. */
  kind: "seasons" | "opponents";
  clubId: number;
  icon: React.ElementType;
  items: CatalogItem[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
  canManage: boolean;
  onCreate: () => void;
  onEdit: (id: number) => void;
  deleteItem: (id: number) => Promise<ActionResult<{ id: number }>>;
  /** Error code returned when the item still has fixtures (ON DELETE RESTRICT). */
  inUseCode: string;
  className?: string;
}

const ICON_BUTTON =
  "btn-press grid size-11 place-items-center rounded-[10px] text-arena-text-muted transition-[transform,color,background-color] active:scale-[0.94] hover:bg-arena-surface-el focus-visible:outline-2 focus-visible:outline-arena-primary md:size-9";

export function CatalogPanel({
  kind,
  clubId,
  icon,
  items,
  isLoading,
  isFetching,
  error,
  onRetry,
  canManage,
  onCreate,
  onEdit,
  deleteItem,
  inUseCode,
  className,
}: CatalogPanelProps) {
  const t = useTranslations(`arenaClubCalendar.${kind}`);
  const tCommon = useTranslations("arenaClubCalendar.catalog");
  const messages = useClubMessages();
  const invalidate = useInvalidateClub();
  const reduceMotion = useReducedMotion();
  const [deleting, setDeleting] = useState<CatalogItem | null>(null);
  const [inUse, setInUse] = useState<Set<number>>(() => new Set());
  const headingId = `club-${kind}-heading`;

  const removal = useMutation({
    mutationFn: async (id: number) => unwrapClubResult(await deleteItem(id)),
    onSuccess: async () => {
      await invalidate(clubId);
      setDeleting(null);
    },
    onError: (err, id) => {
      if (clubErrorCode(err) === inUseCode) {
        setInUse(current => new Set(current).add(id));
      }
    },
  });

  let body: React.ReactNode;
  if (isLoading) {
    body = <ClubSkeletonRows rows={3} />;
  } else if (error && !items) {
    body = (
      <ClubQueryProblem
        code={clubErrorCode(error)}
        onRetry={onRetry}
        isRetrying={isFetching}
      />
    );
  } else if (!items?.length) {
    body = (
      <ArenaEmptyState
        icon={icon}
        title={t("emptyTitle")}
        description={canManage ? t("emptyDescription") : t("emptyReadOnly")}
        action={
          canManage ? (
            <button
              type="button"
              onClick={onCreate}
              className={cn(
                CLUB_LINK_BUTTON_CLASS,
                "h-9 rounded-[10px] bg-arena-primary px-4 text-xs text-arena-bg hover:bg-arena-primary/90",
              )}
            >
              <Plus size={14} strokeWidth={2.4} aria-hidden="true" />
              {t("create")}
            </button>
          ) : undefined
        }
      />
    );
  } else {
    body = (
      <motion.ul
        className="jb-stack"
        variants={CLUB_STAGGER.container}
        initial={reduceMotion ? false : "initial"}
        animate="animate"
      >
        {items.map(item => (
          <motion.li
            key={item.id}
            variants={CLUB_STAGGER.item}
            className="jb-card flex min-h-14 items-center gap-2 py-1.5 pr-1.5 pl-3.5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-arena-text">
                  {item.name}
                </span>
                {inUse.has(item.id) && (
                  <span className="shrink-0 rounded-[4px] border border-arena-warning/35 bg-arena-warning/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.5px] text-arena-warning">
                    {tCommon("inUse")}
                  </span>
                )}
              </div>
              {item.sub && (
                <div className="truncate text-[11px] text-arena-text-muted">
                  {item.sub}
                </div>
              )}
            </div>
            {canManage && (
              <>
                <button
                  type="button"
                  className={cn(ICON_BUTTON, "hover:text-arena-text")}
                  aria-label={tCommon("edit", { name: item.name })}
                  onClick={() => onEdit(item.id)}
                >
                  <Pencil size={15} strokeWidth={1.9} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={cn(ICON_BUTTON, "hover:text-arena-danger")}
                  aria-label={tCommon("delete", { name: item.name })}
                  onClick={() => {
                    removal.reset();
                    setDeleting(item);
                  }}
                >
                  <Trash2 size={15} strokeWidth={1.9} aria-hidden="true" />
                </button>
              </>
            )}
          </motion.li>
        ))}
      </motion.ul>
    );
  }

  return (
    <section aria-labelledby={headingId} className={cn("min-w-0", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 id={headingId} className="jb-section-label py-0">
          {t("title")}
          {items ? ` · ${items.length}` : ""}
        </h2>
        {canManage && Boolean(items?.length) && (
          <button
            type="button"
            onClick={onCreate}
            className={cn(
              CLUB_LINK_BUTTON_CLASS,
              "h-9 rounded-[10px] border border-arena-primary/30 bg-arena-primary/5 px-3 text-xs text-arena-primary hover:border-arena-primary/50",
            )}
          >
            <Plus size={14} strokeWidth={2.4} aria-hidden="true" />
            {t("create")}
          </button>
        )}
      </div>
      <div aria-live="polite">{body}</div>

      {deleting && (
        <ConfirmSheet
          title={t("deleteTitle")}
          description={t("deleteDescription", { name: deleting.name })}
          confirmLabel={tCommon("deleteConfirm")}
          pendingLabel={tCommon("deleting")}
          cancelLabel={tCommon("cancel")}
          isPending={removal.isPending}
          errorMessage={
            removal.error ? messages.error(clubErrorCode(removal.error)) : ""
          }
          onConfirm={() => removal.mutate(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
