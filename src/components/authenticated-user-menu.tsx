"use client";

import { Bell, Home, Settings, User, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { getProfileData } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { resolveProfileImage } from "@/lib/profile-image";
import { cn } from "@/lib/utils";
import type { Experience } from "@/schemas/profile";

type MenuVariant = "compact" | "featured";

type NotificationItem = {
  title: string;
  time: string;
};

type UserMenuProfile = {
  name: string;
  image?: string;
  subtitle?: string;
};

type AuthenticatedUserMenuProps = {
  variant?: MenuVariant;
  className?: string;
  notificationCount?: number;
  notifications?: NotificationItem[];
  profileHref?: string;
  homeHref?: string;
};

function getInitials(name?: string | null) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AuthenticatedUserMenu({
  variant = "compact",
  className,
  notificationCount = 0,
  notifications = [],
  profileHref = "/profile",
  homeHref = "/",
}: AuthenticatedUserMenuProps) {
  const t = useTranslations();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserMenuProfile | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      if (!session?.user?.id) {
        setProfile(null);
        return;
      }

      try {
        const result = await getProfileData(session.user.id);
        if (result.success && result.data) {
          const experience = result.data.experience as Experience | undefined;
          const subtitle = experience
            ? t(`experience.${experience}`)
            : undefined;

          setProfile({
            name: result.data.name || session.user.name || "Jogador",
            image:
              resolveProfileImage(
                result.data.customFields,
                result.data.authImage || session.user.image,
              ) || undefined,
            subtitle: subtitle || session.user.email || undefined,
          });
          return;
        }
      } catch (error) {
        console.error("Error loading user menu profile:", error);
      }

      setProfile({
        name: session.user.name || "Jogador",
        image: resolveProfileImage(undefined, session.user.image),
        subtitle: session.user.email || undefined,
      });
    }

    loadUserProfile();
  }, [
    session?.user?.email,
    session?.user?.id,
    session?.user?.image,
    session?.user?.name,
    t,
  ]);

  const resolvedProfile = useMemo(
    () =>
      profile || {
        name: session?.user?.name || "Jogador",
        image: resolveProfileImage(undefined, session?.user?.image),
        subtitle: session?.user?.email || undefined,
      },
    [profile, session?.user?.email, session?.user?.image, session?.user?.name],
  );

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth");
        },
      },
    });
  };

  const compact = variant === "compact";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={compact ? "icon-sm" : "icon"}
            className={cn(
              "relative rounded-2xl border border-white/8 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white",
              compact ? "h-12 w-12" : "h-14 w-14 rounded-[20px] bg-white/4",
            )}
          >
            <Bell className={cn(compact ? "h-5 w-5" : "h-6 w-6")} />
            {notificationCount > 0 && (
              <span className="absolute top-2 right-2 h-3 w-3 rounded-full border-2 border-[#0a0b1e] bg-[#6fffe9]" />
            )}
            <span className="sr-only">{t("common.notifications")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 border-white/8 bg-[#0b1228]/96 p-2"
        >
          <DropdownMenuLabel className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.26em] text-[#6fffe9]">
            {t("arena.notifications.title")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mx-1 bg-white/8" />
          <div className="space-y-1">
            {notifications.map(item => (
              <DropdownMenuItem
                key={`${item.title}-${item.time}`}
                className="flex min-h-[56px] flex-col items-start gap-1 rounded-2xl px-3 py-3 focus:bg-white/8"
              >
                <span className="text-sm font-semibold text-white">
                  {item.title}
                </span>
                <span className="text-xs text-white/45">{item.time}</span>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {!compact && <div className="h-10 w-px bg-white/10" aria-hidden="true" />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "group flex items-center rounded-[22px] border border-transparent text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6fffe9]/35",
              compact
                ? "h-12 w-12 justify-center bg-white/7 hover:bg-white/10"
                : "gap-4 bg-white/[0.03] px-3 py-2.5 hover:bg-white/[0.05]",
            )}
            aria-label={t("arena.userMenu.myAccount")}
          >
            {!compact && (
              <div className="min-w-0">
                <p className="truncate text-base font-extrabold text-white">
                  {resolvedProfile.name}
                </p>
                <p className="truncate text-sm text-[#7d8fb2]">
                  {resolvedProfile.subtitle || t("common.profile")}
                </p>
              </div>
            )}

            <Avatar
              className={cn(
                "shrink-0 border-2 border-[#c7ff3f] bg-[#1d2334]",
                compact ? "h-12 w-12 border-white/8" : "h-14 w-14",
              )}
            >
              <AvatarImage
                src={resolvedProfile.image}
                alt={resolvedProfile.name}
                className="object-cover"
              />
              <AvatarFallback
                className={cn(
                  "bg-[#1d2334] font-black",
                  compact ? "text-base text-white" : "text-base text-[#f4f7ff]",
                )}
              >
                {compact ? (
                  <UserCircle2 className="h-6 w-6 text-white/80" />
                ) : (
                  getInitials(resolvedProfile.name)
                )}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-60 border-white/8 bg-[#0b1228]/96 p-2"
        >
          <DropdownMenuLabel className="flex items-center gap-3 rounded-2xl px-3 py-3">
            <Avatar className="h-11 w-11 border border-white/10 bg-[#151c33]">
              <AvatarImage
                src={resolvedProfile.image}
                alt={resolvedProfile.name}
              />
              <AvatarFallback className="bg-[#151c33] text-sm font-bold text-white">
                {getInitials(resolvedProfile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {resolvedProfile.name}
              </p>
              <p className="truncate text-xs text-white/45">
                {resolvedProfile.subtitle || t("common.profile")}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mx-1 bg-white/8" />
          <DropdownMenuItem
            onClick={() => router.push(homeHref)}
            className="gap-3 rounded-2xl px-3 py-3 text-sm font-medium focus:bg-white/8"
          >
            <Home className="h-4 w-4 text-white/55" />
            {t("common.home")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(profileHref)}
            className="gap-3 rounded-2xl px-3 py-3 text-sm font-medium focus:bg-white/8"
          >
            <User className="h-4 w-4 text-white/55" />
            {t("common.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-3 rounded-2xl px-3 py-3 text-sm font-medium focus:bg-white/8">
            <Settings className="h-4 w-4 text-white/55" />
            {t("common.settings")}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="mx-1 bg-white/8" />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="rounded-2xl px-3 py-3 text-sm font-semibold text-red-400 focus:bg-red-500/10"
          >
            {t("common.signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function buildDefaultNotifications(
  t: ReturnType<typeof useTranslations>,
) {
  return [
    {
      title: t("arena.notifications.newMatch"),
      time: t("arena.notifications.ago5min"),
    },
    {
      title: t("arena.notifications.teamInvite"),
      time: t("arena.notifications.ago1hour"),
    },
    {
      title: t("arena.notifications.tournamentStarting"),
      time: t("arena.notifications.ago2hours"),
    },
  ];
}
