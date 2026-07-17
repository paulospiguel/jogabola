import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ProtectedDashboardShellProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

type ProtectedHeroCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

type ProtectedStatGridProps = {
  children: ReactNode;
  className?: string;
};

type ProtectedStatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent?: "mint" | "blue" | "amber" | "rose";
  className?: string;
};

type ProtectedSectionCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: {
    href: string;
    label: string;
  };
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

type ProtectedEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

const accentClasses = {
  mint: "text-neon-primary border-neon-primary/15 bg-neon-primary/10",
  blue: "text-accent-blue border-accent-blue/15 bg-accent-blue/10",
  amber: "text-amber-300 border-amber-300/15 bg-amber-300/10",
  rose: "text-rose-300 border-rose-300/15 bg-rose-300/10",
} as const;

export function ProtectedDashboardShell({
  children,
  className,
  contentClassName,
}: ProtectedDashboardShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[radial-gradient(circle_at_top,rgba(2,167,255,0.14),transparent_28%),linear-gradient(180deg,#050312_0%,#080a25_42%,#050312_100%)] text-white",
        className,
      )}
    >
      <main
        className={cn(
          "mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10",
          contentClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}

export function ProtectedHeroCard({
  eyebrow,
  title,
  description,
  actions,
  aside,
  className,
}: ProtectedHeroCardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,255,233,0.12),transparent_34%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-white/45 uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-heading text-3xl tracking-[0.08em] text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            {description}
          </p>
        </div>
        {aside || actions ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {aside}
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ProtectedStatGrid({
  children,
  className,
}: ProtectedStatGridProps) {
  return (
    <section
      className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}
    >
      {children}
    </section>
  );
}

export function ProtectedStatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "mint",
  className,
}: ProtectedStatCardProps) {
  return (
    <article
      className={cn(
        "rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-white/45 uppercase">
            {label}
          </p>
          <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl border",
            accentClasses[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-white/58">{detail}</p>
    </article>
  );
}

export function ProtectedSectionCard({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: ProtectedSectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex flex-col gap-4 border-b border-white/8 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-[11px] font-semibold tracking-[0.24em] text-white/45 uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-white/58">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-neon-primary transition-colors hover:text-white"
          >
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div className={cn("px-6 py-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function ProtectedEmptyState({
  title,
  description,
  action,
  className,
}: ProtectedEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-dashed border-white/12 bg-white/4 px-5 py-8 text-center",
        className,
      )}
    >
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/55">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
