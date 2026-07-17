import {
  Calendar,
  type LucideIcon,
  Shield,
  User,
  Users,
  Wallet,
} from "lucide-react";

export interface BottomNavItem {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  requiresTeam: boolean;
}

/**
 * The bottom nav is scoped to team-operations destinations only. Cronómetro
 * is intentionally excluded — it's contextual now (event detail action bar,
 * dashboard shortcut when there's an active event), not a persistent slot.
 * Notifications live in the top-bar bell, never in this list.
 */
export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { href: "/arena", icon: Shield, labelKey: "dashboard", requiresTeam: false },
  {
    href: "/arena/squads",
    icon: Users,
    labelKey: "squads",
    requiresTeam: true,
  },
  {
    href: "/arena/events",
    icon: Calendar,
    labelKey: "events",
    requiresTeam: true,
  },
  {
    href: "/arena/payments",
    icon: Wallet,
    labelKey: "payments",
    requiresTeam: true,
  },
  {
    href: "/arena/profile",
    icon: User,
    labelKey: "profile",
    requiresTeam: false,
  },
];

/**
 * A destination is active on an exact match, or on any subroute — except
 * the dashboard ("/arena"), which every other Arena route is nested under
 * and would otherwise always report itself as active.
 */
export function isBottomNavItemActive(href: string, pathname: string) {
  return pathname === href || (href !== "/arena" && pathname.startsWith(href));
}
