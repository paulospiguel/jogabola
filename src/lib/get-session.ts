import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";

/**
 * Per-request memoized session lookup. Layouts and pages in the same RSC
 * render tree all call this; only the first call hits the auth backend.
 */
export const getCachedSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
