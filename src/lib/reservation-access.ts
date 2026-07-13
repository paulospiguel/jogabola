import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { matchReservations } from "@/db/schema";
import { getAuthUser } from "@/lib/action-helpers";

export async function canActOnReservation(
  matchReservationId: number,
  guestAccessToken?: string,
): Promise<boolean> {
  const reservation = await db.query.matchReservations.findFirst({
    columns: { playerId: true, guestAccessToken: true },
    where: eq(matchReservations.id, matchReservationId),
  });
  if (!reservation) return false;

  const user = await getAuthUser();
  if (user?.id === reservation.playerId) return true;

  if (!guestAccessToken || !reservation.guestAccessToken) return false;
  const provided = Buffer.from(guestAccessToken);
  const expected = Buffer.from(reservation.guestAccessToken);
  return (
    provided.length === expected.length && timingSafeEqual(provided, expected)
  );
}
