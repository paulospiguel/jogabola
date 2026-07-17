"use client";

import { useTranslations } from "next-intl";

/**
 * Structural loading placeholder for the Arena dashboard's first paint.
 * Mirrors the real layout (topbar, next-action/event hero, squad list) so
 * content doesn't jump once data arrives, using the same layout classes as
 * `ArenaDashboard`. Deliberately does not use `h-screen` or fixed/full-page
 * positioning — it renders inline inside `<main>`, so the sidebar, mobile
 * topbar and bottom nav (all rendered by the Arena layout, outside this
 * component) stay mounted and visible while this shows.
 */
export function DashboardSkeleton() {
  const t = useTranslations("arenaDashboard");

  return (
    <div className="jb-page">
      <output className="sr-only">{t("loadingArena")}</output>
      <div className="jb-page-inner" aria-hidden="true">
        <header className="jb-topbar">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-20 animate-pulse rounded-full bg-arena-surface-el" />
            <div className="flex items-center gap-2">
              <div className="size-6 animate-pulse rounded-full bg-arena-surface-el" />
              <div className="h-5 w-32 animate-pulse rounded-lg bg-arena-surface-el" />
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <div className="h-9 w-28 animate-pulse rounded-xl bg-arena-surface-el" />
            <div className="h-9 w-28 animate-pulse rounded-xl bg-arena-surface-el" />
          </div>
        </header>

        <div className="jb-dashboard-grid">
          <section className="jb-stack">
            <div className="jb-hero-card">
              <div className="mb-3 h-4 w-24 animate-pulse rounded-full bg-arena-surface-el" />
              <div className="mb-3 h-5 w-2/3 animate-pulse rounded-lg bg-arena-surface-el" />
              <div className="flex flex-wrap gap-3">
                <div className="h-3 w-16 animate-pulse rounded-full bg-arena-surface-el" />
                <div className="h-3 w-16 animate-pulse rounded-full bg-arena-surface-el" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-arena-surface-el" />
              </div>
            </div>

            <div className="jb-stat-grid">
              {[0, 1, 2].map(i => (
                <div
                  className="jb-card h-16 animate-pulse"
                  key={`hero-stat-${i}`}
                />
              ))}
            </div>
          </section>

          <aside className="jb-stack">
            <section>
              <div className="mb-2 h-3 w-24 animate-pulse rounded-full bg-arena-surface-el" />
              <div className="jb-stack">
                {[0, 1].map(i => (
                  <div
                    className="jb-card h-14 animate-pulse"
                    key={`week-row-${i}`}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2 h-3 w-16 animate-pulse rounded-full bg-arena-surface-el" />
              <div className="jb-stack">
                {[0, 1, 2].map(i => (
                  <div
                    className="jb-card h-14 animate-pulse"
                    key={`squad-row-${i}`}
                  />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
