"use client";

import { useTranslations } from "next-intl";

/**
 * Generic structural placeholder for arena sub-pages while their server
 * component streams in. Renders inline inside <main> so the sidebar,
 * top bar and bottom nav (rendered by the arena layout) stay mounted.
 */
export function ArenaPageSkeleton() {
  const t = useTranslations("common");

  return (
    <div className="jb-page">
      <output className="sr-only">{t("loading")}</output>
      <div className="jb-page-inner" aria-hidden="true">
        <header className="jb-topbar">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-arena-surface-el" />
            <div className="h-6 w-40 animate-pulse rounded-lg bg-arena-surface-el" />
          </div>
          <div className="size-9 animate-pulse rounded-full bg-arena-surface-el" />
        </header>
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map(index => (
            <div
              key={`arena-skeleton-row-${index}`}
              className="jb-card h-20 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
