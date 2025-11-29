import { Role } from "@/schemas/profile";

export const JOURNEY_ROUTES: Record<Role, string> = {
  PLAYER: "/playzone",
  MANAGER: "/arena",
  FAN: "/fan-zone",
  ORGANIZER: "/organizer",
};
