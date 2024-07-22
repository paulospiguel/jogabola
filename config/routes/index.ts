import type { ConfigRoutes } from "@/types/routes";

const managerRoutes = ["/create-team", "/manager/team", "/manager/teams", "/manager/feed"];

const playerRoutes = [
  "/player/profile",
  "/player/teams",
  "/player/team",
  "/player/join-team",
];

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
  protectedRoutes: ["/auth/settings", ...managerRoutes, ...playerRoutes],
};
