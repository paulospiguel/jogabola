import type { ConfigRoutes } from "@/types/routes";

const managerRoutes = [
  "/create-team",
  "/manager/team",
  "/manager/teams",
  "/manager/feed",
  "/invite-player"
];

const playerRoutes = [
  "/player/profile",
  "/player/teams",
  "/player/team",
  "/player/join-team",
];

const settingsRoutes = ["/profile/auth", "/profile/notifications", "/profile/settings"];

export const configRoutes: ConfigRoutes = {
  publicRoutes: [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/change-password",
    "/auth/reset-password",
    "/auth/verify-email",
  ],
  authRoutes: ["/api/auth/signin"],
  apiRoutes: ["/api/protected-api"],
  protectedRoutes: [...managerRoutes, ...playerRoutes, ...settingsRoutes],
};
