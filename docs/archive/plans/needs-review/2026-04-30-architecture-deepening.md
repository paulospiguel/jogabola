# Architecture Deepening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate 6 friction points — duplicated action boilerplate, scattered session fetching, competing event types, inline DB queries, auth side-effects in config, and client-side data classification — concentrating each concern in one deep module.

**Architecture:** A shared `action-helpers.ts` module owns validation and auth for all server actions. A `db/queries/` layer owns query logic. Types flow from DB schema → single `EventView` → components.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, better-auth, Zod, TypeScript, pnpm

---

## File Map

**Created:**
- `src/lib/action-helpers.ts` — `withAction`, `withAuthAction`, `getAuthUser`, `validationError`
- `src/lib/user-lifecycle.ts` — `onUserCreated(user)` side-effect handler
- `src/db/queries/players.ts` — player lookup queries
- `src/db/queries/events.ts` — event read/write queries
- `src/db/queries/notifications.ts` — notification read/write queries
- `src/types/events.ts` — single `EventView` type

**Modified:**
- `src/actions/teams.actions.ts` — use `withAction`/`withAuthAction`, query layer
- `src/actions/match-sessions.actions.ts` — use `withAction`, query layer
- `src/actions/attendance.actions.ts` — use `withAction`
- `src/actions/payments.actions.ts` — use `withAction`
- `src/actions/payment-verification.actions.ts` — use `withAction`
- `src/actions/profile.actions.ts` — use `withAuthAction`
- `src/actions/notifications.actions.ts` — use `getAuthUser`, query layer
- `src/actions/settings.actions.ts` — use `getAuthUser`
- `src/actions/locale.actions.ts` — use `withAction` pattern (no schema, manual)
- `src/lib/auth.ts` — delegate `databaseHooks.user.create.after` to `onUserCreated`
- `src/hooks/use-events.ts` — remove `EventDisplay`/`EventDetails`, return `EventView`
- `src/app/(protected)/arena/events/page.tsx` — use `EventView`, move upcoming/past split to server
- `src/app/(protected)/arena/events/_components/events-list-client.tsx` — accept pre-split arrays
- `src/app/(protected)/arena/profile/_components/profile-form.tsx` — import `updateUserProfile` (not `updateUserProfileAction`)
- `src/components/language-selector.tsx` — import `setLocale` (not `setLocaleAction`)

---

## Task 1: Create action helpers

**Files:**
- Create: `src/lib/action-helpers.ts`

- [ ] **Step 1: Write the file**

```typescript
// src/lib/action-helpers.ts
import type { ZodTypeAny } from "zod";
import type { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types/common";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export function validationError(
  fieldErrors: Record<string, string[] | undefined>,
): ActionResult<never> {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).filter(([, v]) => v?.length),
      ) as Record<string, string[]>,
    },
  };
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const u = session?.user;
  if (!u?.id) return null;
  return { id: u.id, name: u.name, email: u.email };
}

export function withAction<S extends ZodTypeAny, T>(
  schema: S,
  fn: (data: z.infer<S>) => Promise<ActionResult<T>>,
): (input: unknown) => Promise<ActionResult<T>> {
  return async (input: unknown) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success)
      return validationError(parsed.error.flatten().fieldErrors);
    return fn(parsed.data);
  };
}

export function withAuthAction<S extends ZodTypeAny, T>(
  schema: S,
  fn: (user: AuthUser, data: z.infer<S>) => Promise<ActionResult<T>>,
): (input: unknown) => Promise<ActionResult<T>> {
  return async (input: unknown) => {
    const user = await getAuthUser();
    if (!user) return { success: false, error: { code: "UNAUTHORIZED" } };
    const parsed = schema.safeParse(input);
    if (!parsed.success)
      return validationError(parsed.error.flatten().fieldErrors);
    return fn(user, parsed.data);
  };
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm ts-check
```

Expected: no new errors (file is not yet imported anywhere).

- [ ] **Step 3: Commit**

```bash
git add src/lib/action-helpers.ts
git commit -m "feat: add withAction/withAuthAction/getAuthUser helpers"
```

---

## Task 2: Migrate teams.actions.ts

**Files:**
- Modify: `src/actions/teams.actions.ts`

- [ ] **Step 1: Replace file contents**

```typescript
"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { players, teamMembers, teams } from "@/db/schema";
import {
  addPlayerToRosterSchema,
  addTeamMemberSchema,
  createTeamSchema,
} from "@/schemas/teams.schema";
import { withAction, withAuthAction } from "@/lib/action-helpers";

export const createTeam = withAction(createTeamSchema, async (data) => {
  const [team] = await db.insert(teams).values(data).returning();
  return { success: true, data: team };
});

export const addTeamMember = withAction(addTeamMemberSchema, async (data) => {
  const [member] = await db
    .insert(teamMembers)
    .values(data)
    .onConflictDoUpdate({
      target: [teamMembers.teamId, teamMembers.playerId],
      set: { role: data.role, updatedAt: new Date() },
    })
    .returning();
  return { success: true, data: member };
});

export const addPlayerToRoster = withAuthAction(
  addPlayerToRosterSchema,
  async (user, data) => {
    const email = data.email.toLowerCase().trim();
    const existing = await db
      .select({ id: players.id })
      .from(players)
      .where(eq(players.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: { code: "PLAYER_EMAIL_ALREADY_EXISTS" } };
    }

    const [created] = await db
      .insert(players)
      .values({
        id: crypto.randomUUID(),
        displayName: data.name.trim(),
        email,
        position: data.position || null,
        experience: data.experience,
        invitedByManagerId: user.id,
      })
      .returning({ id: players.id, name: players.displayName });

    return { success: true, data: created };
  },
);
```

- [ ] **Step 2: Type-check**

```bash
pnpm ts-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/actions/teams.actions.ts
git commit -m "refactor: migrate teams actions to withAction/withAuthAction"
```

---

## Task 3: Migrate attendance, payments, payment-verification actions

**Files:**
- Modify: `src/actions/attendance.actions.ts`
- Modify: `src/actions/payments.actions.ts`
- Modify: `src/actions/payment-verification.actions.ts`

- [ ] **Step 1: Replace attendance.actions.ts**

```typescript
"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { attendance } from "@/db/schema";
import { upsertAttendanceSchema } from "@/schemas/attendance.schema";
import { withAction } from "@/lib/action-helpers";

export const upsertAttendance = withAction(
  upsertAttendanceSchema,
  async (data) => {
    const [row] = await db
      .insert(attendance)
      .values({ ...data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [attendance.matchSessionId, attendance.playerId],
        set: { status: data.status, note: data.note, updatedAt: new Date() },
      })
      .returning();
    return { success: true, data: row };
  },
);

export async function getAttendanceForMatchSession(matchSessionId: number) {
  const rows = await db
    .select()
    .from(attendance)
    .where(eq(attendance.matchSessionId, matchSessionId));
  return { success: true as const, data: rows };
}
```

- [ ] **Step 2: Replace payments.actions.ts**

```typescript
"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { paymentProofs, payments } from "@/db/schema";
import {
  createPaymentSchema,
  submitPaymentProofSchema,
} from "@/schemas/payments.schema";
import { withAction } from "@/lib/action-helpers";

export const createPayment = withAction(createPaymentSchema, async (data) => {
  const [payment] = await db
    .insert(payments)
    .values({ ...data, status: "pending" })
    .returning();
  return { success: true, data: payment };
});

export const submitPaymentProof = withAction(
  submitPaymentProofSchema,
  async (data) => {
    const [proof] = await db.insert(paymentProofs).values(data).returning();
    await db
      .update(payments)
      .set({ status: "paid_unverified", updatedAt: new Date() })
      .where(eq(payments.id, data.paymentId));
    return { success: true, data: proof };
  },
);
```

- [ ] **Step 3: Replace payment-verification.actions.ts**

```typescript
"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { paymentPrechecks, paymentProofs, payments } from "@/db/schema";
import { verifyPaymentProofSchema } from "@/schemas/payments.schema";
import { withAction } from "@/lib/action-helpers";

export const verifyPaymentProof = withAction(
  verifyPaymentProofSchema,
  async ({ aiCheck, paymentProofId }) => {
    const [proof] = await db
      .select()
      .from(paymentProofs)
      .where(eq(paymentProofs.id, paymentProofId))
      .limit(1);

    if (!proof) {
      return { success: false, error: { code: "PAYMENT_PROOF_NOT_FOUND" } };
    }

    const nextStatus =
      aiCheck.decision === "likely_valid" && aiCheck.confidence >= 0.85
        ? "paid_unverified"
        : "review_required";

    const [precheck] = await db
      .insert(paymentPrechecks)
      .values({
        paymentProofId,
        decision: aiCheck.decision,
        confidence: Math.round(aiCheck.confidence * 100),
        extractedAmount: aiCheck.extractedAmount
          ? Math.round(aiCheck.extractedAmount * 100)
          : null,
        extractedDate: aiCheck.extractedDate,
        extractedRecipient: aiCheck.extractedRecipient,
        riskFlags: aiCheck.riskFlags,
        rawCheck: aiCheck,
      })
      .returning();

    await db
      .update(payments)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(payments.id, proof.paymentId));

    return { success: true, data: precheck };
  },
);
```

- [ ] **Step 4: Type-check**

```bash
pnpm ts-check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/actions/attendance.actions.ts src/actions/payments.actions.ts src/actions/payment-verification.actions.ts
git commit -m "refactor: migrate attendance/payment actions to withAction"
```

---

## Task 4: Migrate profile.actions.ts and update client import

**Files:**
- Modify: `src/actions/profile.actions.ts`
- Modify: `src/app/(protected)/arena/profile/_components/profile-form.tsx`

- [ ] **Step 1: Replace profile.actions.ts**

```typescript
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { updateProfileSchema } from "@/schemas/profile.schema";
import { withAuthAction } from "@/lib/action-helpers";

export const updateUserProfile = withAuthAction(
  updateProfileSchema,
  async (authUser, data) => {
    try {
      const [profile] = await db
        .update(user)
        .set({ name: data.name, image: data.image || null, updatedAt: new Date() })
        .where(eq(user.id, authUser.id))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
        });

      if (!profile) {
        return { success: false, error: { code: "PROFILE_NOT_FOUND" } };
      }

      revalidatePath("/arena/profile");
      revalidatePath("/arena");

      return { success: true, data: profile };
    } catch {
      return { success: false, error: { code: "PROFILE_UPDATE_FAILED" } };
    }
  },
);
```

- [ ] **Step 2: Update profile-form.tsx import**

In `src/app/(protected)/arena/profile/_components/profile-form.tsx`, find and replace:

```typescript
// Before
import { updateUserProfileAction } from "@/actions/profile.actions";
```

```typescript
// After
import { updateUserProfile } from "@/actions/profile.actions";
```

Then find the call site in the same file and change `updateUserProfileAction(form)` to `updateUserProfile(form)`.

- [ ] **Step 3: Type-check**

```bash
pnpm ts-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/actions/profile.actions.ts src/app/"(protected)"/arena/profile/_components/profile-form.tsx
git commit -m "refactor: migrate profile action to withAuthAction, update import"
```

---

## Task 5: Migrate notifications.actions.ts and settings.actions.ts

**Files:**
- Modify: `src/actions/notifications.actions.ts`
- Modify: `src/actions/settings.actions.ts`

- [ ] **Step 1: Replace notifications.actions.ts**

```typescript
"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { notifications } from "@/db/schema";
import { getAuthUser } from "@/lib/action-helpers";

export async function getNotifications() {
  const user = await getAuthUser();
  if (!user) return { success: false as const, error: { code: "UNAUTHORIZED" } };

  const data = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt));

  return { success: true as const, data };
}

export async function markNotificationAsRead(id: string) {
  const user = await getAuthUser();
  if (!user) return { success: false as const, error: { code: "UNAUTHORIZED" } };

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));

  revalidatePath("/arena/notifications");
  return { success: true as const };
}

export async function markAllAsRead() {
  const user = await getAuthUser();
  if (!user) return { success: false as const, error: { code: "UNAUTHORIZED" } };

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, user.id));

  revalidatePath("/arena/notifications");
  return { success: true as const };
}

export async function sendNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const userResult = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, params.userId),
    columns: { notificationsEnabled: true },
  });

  if (userResult && !userResult.notificationsEnabled) {
    return { success: true as const, skipped: true };
  }

  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    metadata: params.metadata,
  });

  return { success: true as const };
}
```

- [ ] **Step 2: Replace settings.actions.ts**

```typescript
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { getAuthUser } from "@/lib/action-helpers";
import { setLocale } from "./locale.actions";

export async function updateUserSettings(data: {
  locale?: string;
  notificationsEnabled?: boolean;
}) {
  const authUser = await getAuthUser();
  if (!authUser) return { success: false as const, error: { code: "UNAUTHORIZED" } };

  const updateData: Record<string, string | boolean> = {};
  if (data.locale !== undefined) updateData.locale = data.locale;
  if (data.notificationsEnabled !== undefined)
    updateData.notificationsEnabled = data.notificationsEnabled;

  await db.update(user).set(updateData).where(eq(user.id, authUser.id));

  if (data.locale) await setLocale(data.locale);

  revalidatePath("/arena/settings");
  return { success: true as const };
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm ts-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/actions/notifications.actions.ts src/actions/settings.actions.ts
git commit -m "refactor: migrate notifications/settings actions to getAuthUser"
```

---

## Task 6: Migrate locale.actions.ts and update client import

**Files:**
- Modify: `src/actions/locale.actions.ts`
- Modify: `src/components/language-selector.tsx`

- [ ] **Step 1: Replace locale.actions.ts**

Remove the `setLocaleAction` wrapper; keep only `setLocale`.

```typescript
"use server";

import { cookies } from "next/headers";
import { type Locale, locales } from "@/i18n/configs";
import type { ActionResult } from "@/types/common";

export async function setLocale(
  input: unknown,
): Promise<ActionResult<{ locale: Locale }>> {
  if (typeof input !== "string" || !locales.includes(input as Locale)) {
    return { success: false, error: { code: "VALIDATION_INVALID_LOCALE" } };
  }

  const locale = input as Locale;
  const cookieStore = await cookies();

  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31_536_000,
    sameSite: "lax",
  });

  return { success: true, data: { locale } };
}
```

- [ ] **Step 2: Update language-selector.tsx import**

In `src/components/language-selector.tsx`, find and replace:

```typescript
// Before
import { setLocaleAction } from "@/actions/locale.actions";
```

```typescript
// After
import { setLocale } from "@/actions/locale.actions";
```

Then replace the call `setLocaleAction(newLocale)` with `setLocale(newLocale)`.

- [ ] **Step 3: Type-check**

```bash
pnpm ts-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/actions/locale.actions.ts src/components/language-selector.tsx
git commit -m "refactor: remove setLocaleAction wrapper, update import"
```

---

## Task 7: Migrate match-sessions.actions.ts

**Files:**
- Modify: `src/actions/match-sessions.actions.ts`

Note: `createEvent` has no Zod schema in the current code — it accepts a typed object directly. Keep it typed rather than forcing a Zod schema, since the caller is internal.

- [ ] **Step 1: Replace file contents**

```typescript
"use server";

import { and, eq, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { matchReservations, matchSessions } from "@/db/schema";
import {
  createMatchReservationSchema,
  createMatchSessionSchema,
} from "@/schemas/match-sessions.schema";
import { withAction } from "@/lib/action-helpers";

export const createMatchSession = withAction(
  createMatchSessionSchema,
  async (data) => {
    const [matchSession] = await db
      .insert(matchSessions)
      .values(data)
      .returning();
    return { success: true, data: matchSession };
  },
);

export const createMatchReservation = withAction(
  createMatchReservationSchema,
  async (data) => {
    const [reservation] = await db
      .insert(matchReservations)
      .values(data)
      .returning();
    return { success: true, data: reservation };
  },
);

export async function createEvent(input: {
  title: string;
  description?: string;
  type: "game" | "training" | "challenge";
  location: string;
  startDate: Date;
  endDate?: Date;
  maxParticipants?: string;
  isPublic?: boolean;
  organizerId?: string;
}) {
  const [event] = await db
    .insert(matchSessions)
    .values({
      teamId: 1,
      title: input.title,
      location: input.location,
      startsAt: input.startDate,
      endsAt: input.endDate,
      capacity: input.maxParticipants
        ? Number.parseInt(input.maxParticipants, 10)
        : null,
      currency: "EUR",
    })
    .returning();

  revalidatePath("/arena/events");
  return { success: true as const, data: toEventView(event) };
}

export async function getEvent(eventId: number) {
  const [eventData] = await db
    .select()
    .from(matchSessions)
    .where(eq(matchSessions.id, eventId))
    .limit(1);

  if (!eventData) {
    return { success: false as const, error: { code: "EVENT_NOT_FOUND" } };
  }

  return { success: true as const, data: toEventView(eventData) };
}

export async function getEvents(options?: {
  limit?: number;
  organizerId?: string;
  status?: string;
  upcomingOnly?: boolean;
}) {
  const { limit = 10, upcomingOnly = true } = options || {};
  const conditions = [];

  if (upcomingOnly) conditions.push(gte(matchSessions.startsAt, new Date()));

  const events = await db
    .select()
    .from(matchSessions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(matchSessions.startsAt)
    .limit(limit);

  return { success: true as const, data: events.map(toEventView) };
}

function toEventView(event: typeof matchSessions.$inferSelect) {
  return {
    id: event.id,
    title: event.title,
    description: null,
    type: "partida" as const,
    location: event.location,
    city: null,
    country: null,
    startDate: event.startsAt,
    endDate: event.endsAt,
    gameStyle: null,
    experienceLevel: null,
    minAge: null,
    maxAge: null,
    gender: null,
    positionNeeded: null,
    participationCriteria: {} as Record<string, unknown>,
    currentParticipants: "0",
    maxParticipants: event.capacity?.toString() ?? null,
    organizerId: "",
    organizer: null,
    language: null,
    images: [] as string[],
    status: "ativo" as const,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm ts-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/actions/match-sessions.actions.ts
git commit -m "refactor: migrate match-session actions to withAction"
```

---

## Task 8: Consolidate event types

**Files:**
- Create: `src/types/events.ts`
- Modify: `src/hooks/use-events.ts`

- [ ] **Step 1: Create src/types/events.ts**

This type is derived from `toEventView()` in match-sessions.actions. Define it explicitly here as the single source of truth.

```typescript
// src/types/events.ts
export type EventView = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  location: string;
  city: string | null;
  country: string | null;
  startDate: Date;
  endDate: Date | null | undefined;
  gameStyle: string | null;
  experienceLevel: string | null;
  minAge: string | null;
  maxAge: string | null;
  gender: string | null;
  positionNeeded: string | null;
  participationCriteria: Record<string, unknown>;
  currentParticipants: string;
  maxParticipants: string | null;
  organizerId: string;
  organizer: string | null;
  language: string | null;
  images: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
};
```

- [ ] **Step 2: Replace src/hooks/use-events.ts**

Remove `EventDisplay`, `EventDetails`, `DatabaseEvent`, `formatEventForDisplay`, `eventTypeEmojis`. Return `EventView` directly from hooks.

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvent, getEvents } from "@/actions/match-sessions.actions";
import type { EventView } from "@/types/events";

interface UseEventsOptions {
  limit?: number;
  organizerId?: string;
  status?: string;
  upcomingOnly?: boolean;
  enabled?: boolean;
}

export function useEvents(options?: UseEventsOptions) {
  const {
    limit = 10,
    organizerId,
    status,
    upcomingOnly = true,
    enabled = true,
  } = options || {};

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["events", { limit, organizerId, status, upcomingOnly }],
    queryFn: async () => {
      const result = await getEvents({ limit, organizerId, status, upcomingOnly });
      if (!result.success) throw new Error("Failed to fetch events");
      return result.data ?? [];
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    events: data ?? ([] as EventView[]),
    isLoading,
    isRefetching,
    error,
    refetch,
  };
}

export function useEventsList(options?: UseEventsOptions): EventView[] {
  return useEvents(options).events;
}

export function useEvent(eventId: number | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const result = await getEvent(eventId);
      if (!result.success || !result.data) throw new Error("Failed to fetch event");
      return result.data;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
  });

  return { event: data ?? null, isLoading, error, refetch };
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm ts-check
```

Expected: no errors. If any component was using `EventDisplay` or `EventDetails` from `use-events`, those imports will fail here and need fixing (the formatting helpers `formatDate`/`formatTime` are already in `events-list-client.tsx`).

- [ ] **Step 4: Commit**

```bash
git add src/types/events.ts src/hooks/use-events.ts
git commit -m "refactor: consolidate event types into EventView, simplify use-events hooks"
```

---

## Task 9: Move event classification to server, update events page + client

**Files:**
- Modify: `src/app/(protected)/arena/events/page.tsx`
- Modify: `src/app/(protected)/arena/events/_components/events-list-client.tsx`

The server page currently passes all events and the client re-filters by date. Move the upcoming/past split to the server so the client is purely presentational.

- [ ] **Step 1: Update events page.tsx**

```typescript
import { getEvents } from "@/actions/match-sessions.actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventsListClient } from "./_components/events-list-client";
import type { EventView } from "@/types/events";

export default async function ArenaEventsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? "";

  const result = await getEvents({ organizerId: userId, upcomingOnly: false, limit: 50 });
  const events: EventView[] = result.success ? (result.data ?? []) : [];

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startDate) >= now);
  const past = events.filter((e) => new Date(e.startDate) < now);

  return <EventsListClient upcoming={upcoming} past={past} userId={userId} />;
}
```

- [ ] **Step 2: Update events-list-client.tsx props interface**

In `src/app/(protected)/arena/events/_components/events-list-client.tsx`, replace the props interface and remove the `useMemo` date-filtering logic.

Change:
```typescript
interface EventsListClientProps {
  events: EventItem[];
  userId: string;
}
```

To:
```typescript
import type { EventView } from "@/types/events";

interface EventsListClientProps {
  upcoming: EventView[];
  past: EventView[];
  userId: string;
}
```

Remove the `useMemo` block that computed `upcoming` and `past`:
```typescript
// Remove this entire block:
const { upcoming, past } = useMemo(
  () => ({
    upcoming: events.filter(e => isUpcoming(e.startDate)),
    past: events.filter(e => !isUpcoming(e.startDate)),
  }),
  [events],
);
```

And remove the `isUpcoming` helper and `useMemo` import if they become unused.

Update the component signature:
```typescript
export function EventsListClient({ upcoming, past, userId }: EventsListClientProps) {
```

Update the `EventCard` to accept `EventView` instead of `EventItem`:
```typescript
function EventCard({ event }: { event: EventView }) {
```

- [ ] **Step 3: Type-check**

```bash
pnpm ts-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/"(protected)"/arena/events/page.tsx src/app/"(protected)"/arena/events/_components/events-list-client.tsx
git commit -m "refactor: move upcoming/past classification to server, EventsListClient accepts pre-split arrays"
```

---

## Task 10: Extract auth email side-effect

**Files:**
- Create: `src/lib/user-lifecycle.ts`
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Create src/lib/user-lifecycle.ts**

```typescript
// src/lib/user-lifecycle.ts
export async function onUserCreated(user: { name: string; email: string }) {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
    console.info(`[user-lifecycle] skipping welcome email in dev for ${user.email}`);
    return;
  }

  try {
    const { sendEmail } = await import("@/lib/email");
    const { WelcomeEmail } = await import("@/components/emails/welcome-email");
    const React = await import("react");
    await sendEmail({
      to: user.email,
      subject: "Bem-vindo à Jogabola Arena!",
      react: React.createElement(WelcomeEmail, { username: user.name }),
    });
  } catch (error) {
    console.error("[user-lifecycle] Failed to send welcome email:", error);
  }
}
```

- [ ] **Step 2: Update auth.ts databaseHooks**

In `src/lib/auth.ts`, replace the `after` hook body:

```typescript
// Before:
after: async user => {
  try {
    const { sendEmail } = await import("@/lib/email");
    const { WelcomeEmail } = await import("@/components/emails/welcome-email");
    const React = await import("react");
    await sendEmail({
      to: user.email,
      subject: "Bem-vindo à Jogabola Arena!",
      react: React.createElement(WelcomeEmail, { username: user.name }),
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
},
```

```typescript
// After:
after: async user => {
  const { onUserCreated } = await import("@/lib/user-lifecycle");
  await onUserCreated(user);
},
```

Also add the import at the top of `auth.ts` if you prefer static import (optional — dynamic is fine here since it preserves the existing pattern).

- [ ] **Step 3: Type-check**

```bash
pnpm ts-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/user-lifecycle.ts src/lib/auth.ts
git commit -m "refactor: extract user-created email side-effect to user-lifecycle module"
```

---

## Task 11: Create query layer for players and events

**Files:**
- Create: `src/db/queries/players.ts`
- Create: `src/db/queries/events.ts`

This is the minimal query layer — extract the 2 most reused/embedded queries rather than wrapping every single db call.

- [ ] **Step 1: Create src/db/queries/players.ts**

```typescript
// src/db/queries/players.ts
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { players } from "@/db/schema";

export async function findPlayerByEmail(email: string) {
  const [player] = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.email, email))
    .limit(1);
  return player ?? null;
}
```

- [ ] **Step 2: Create src/db/queries/events.ts**

```typescript
// src/db/queries/events.ts
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { matchSessions } from "@/db/schema";

export async function queryEvents(options?: {
  limit?: number;
  upcomingOnly?: boolean;
}) {
  const { limit = 10, upcomingOnly = true } = options ?? {};
  const conditions = [];
  if (upcomingOnly) conditions.push(gte(matchSessions.startsAt, new Date()));

  return db
    .select()
    .from(matchSessions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(matchSessions.startsAt)
    .limit(limit);
}

export async function queryEventById(id: number) {
  const [event] = await db
    .select()
    .from(matchSessions)
    .where(eq(matchSessions.id, id))
    .limit(1);
  return event ?? null;
}
```

- [ ] **Step 3: Update teams.actions.ts to use player query**

In `src/actions/teams.actions.ts`, replace the inline player email lookup with the query layer:

```typescript
// Add import:
import { findPlayerByEmail } from "@/db/queries/players";

// In addPlayerToRoster, replace:
const existing = await db
  .select({ id: players.id })
  .from(players)
  .where(eq(players.email, email))
  .limit(1);
if (existing.length > 0) {
```

```typescript
// With:
const existing = await findPlayerByEmail(email);
if (existing) {
```

Also remove the `eq` import from drizzle-orm if it's no longer used, and remove the `players` schema import if unused (keep if still needed for the insert).

- [ ] **Step 4: Update match-sessions.actions.ts to use event queries**

In `src/actions/match-sessions.actions.ts`, import and use the query layer:

```typescript
// Add import:
import { queryEventById, queryEvents } from "@/db/queries/events";
```

Update `getEvent`:
```typescript
export async function getEvent(eventId: number) {
  const eventData = await queryEventById(eventId);
  if (!eventData) {
    return { success: false as const, error: { code: "EVENT_NOT_FOUND" } };
  }
  return { success: true as const, data: toEventView(eventData) };
}
```

Update `getEvents`:
```typescript
export async function getEvents(options?: {
  limit?: number;
  organizerId?: string;
  status?: string;
  upcomingOnly?: boolean;
}) {
  const { limit = 10, upcomingOnly = true } = options || {};
  const events = await queryEvents({ limit, upcomingOnly });
  return { success: true as const, data: events.map(toEventView) };
}
```

Remove the now-unused `and`, `eq`, `gte` imports from drizzle-orm in match-sessions.actions.ts if no longer needed.

- [ ] **Step 5: Type-check**

```bash
pnpm ts-check
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/db/queries/players.ts src/db/queries/events.ts src/actions/teams.actions.ts src/actions/match-sessions.actions.ts
git commit -m "refactor: add query layer for players/events, update actions to use it"
```

---

## Task 12: Final verification

- [ ] **Step 1: Full type-check**

```bash
pnpm ts-check
```

Expected: zero errors.

- [ ] **Step 2: Lint check**

```bash
pnpm lint
```

Expected: zero errors. Fix any biome issues (`pnpm lint --write` for auto-fix).

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Expected: build succeeds. Note any runtime warnings.

- [ ] **Step 4: Verify no *Action exports remain as pass-through wrappers**

```bash
grep -r "export async function.*Action" src/actions/ --include="*.ts"
```

Expected: zero results (all `*Action` wrapper functions removed).

- [ ] **Step 5: Verify validationError is not duplicated**

```bash
grep -r "function validationError" src/ --include="*.ts"
```

Expected: only one result — `src/lib/action-helpers.ts`.

- [ ] **Step 6: Verify getSession is not duplicated in actions**

```bash
grep -r "auth.api.getSession" src/actions/ --include="*.ts"
```

Expected: zero results (all session fetching goes through `getAuthUser()`).

- [ ] **Step 7: Commit if any lint fixes were made**

```bash
git add -p
git commit -m "fix: lint cleanup after architecture refactor"
```
