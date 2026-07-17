# 2. Ably for real-time event chat on serverless

Date: 2026-05-28

## Status

Accepted

## Context

The event-detail chat tab was mock-only. We want real-time delivery: a message
sent by one participant should appear for others without a manual refresh.

Constraints:

- Prod runs on a **serverless (Vercel-style)** runtime. Functions time out and
  cannot hold a long-lived connection, so **SSE + Postgres `LISTEN/NOTIFY`** (the
  natural fit for our `postgres-js` client) is **not viable** — the listener
  connection can't persist.
- The DB client is configured `max: 1, ssl: "require"` (hosted serverless Postgres),
  reinforcing that a dedicated long-lived `LISTEN` connection is the wrong tool.
- No realtime infrastructure exists in the repo today.

Options considered: SSE+LISTEN (rejected — serverless), React Query polling
(serverless-safe but not true push), managed realtime (Pusher / Ably / Supabase
Realtime).

## Decision

Use **Ably** for real-time event chat.

- New `event_messages` table is the source of truth (`matchSessionId`, `authorId`,
  `text`, `createdAt`).
- `sendEventMessage` server action: authorises (confirmed participant or captain),
  inserts the row, then publishes to Ably channel `event-chat-{eventId}`.
- The Ably API key stays **server-side**; the browser authenticates via a token
  endpoint (`/api/ably/token`) that issues a capability scoped to the event channel.
- Initial history loads via a `getEventMessages` query action; the client subscribes
  to the channel for subsequent messages.
- Access: only confirmed participants (and the captain) may read or post.

## Consequences

- New runtime dependency (`ably`) and new env keys (`ABLY_API_KEY`,
  `NEXT_PUBLIC_*` as needed). Free tier covers amateur-app scale.
- Realtime no longer coupled to DB connection lifetime — works on serverless.
- The data layer (`event_messages` + actions) is transport-agnostic: if Ably is
  ever swapped (e.g. for Supabase Realtime), only the publish/subscribe edges change.
- Token endpoint required so the secret key is never shipped to the client.
