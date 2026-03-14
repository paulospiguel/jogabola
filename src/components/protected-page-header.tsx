"use client";

import { useTranslations } from "next-intl";
import {
  AuthenticatedUserMenu,
  buildDefaultNotifications,
} from "@/components/authenticated-user-menu";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

type ProtectedPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  showLogo?: boolean;
};

export function ProtectedPageHeader({
  eyebrow,
  title,
  description,
  className,
  contentClassName,
  showLogo = false,
}: ProtectedPageHeaderProps) {
  const t = useTranslations();
  const notifications = buildDefaultNotifications(t);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/8 bg-[#050312]/88 backdrop-blur-xl",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-6",
          contentClassName,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {showLogo && <Logo size="small" className="h-12 w-20 shrink-0" />}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-white/45 uppercase">
              {eyebrow}
            </p>
            <h1 className="truncate font-heading text-2xl tracking-[0.08em] text-white">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 truncate text-sm text-white/52">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <AuthenticatedUserMenu
          variant="compact"
          notificationCount={notifications.length}
          notifications={notifications}
        />
      </div>
    </header>
  );
}
