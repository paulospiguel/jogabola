<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the JogaBola Next.js App Router project (Next.js 16.2.6). PostHog is now initialized via `instrumentation-client.ts` (the correct pattern for Next.js 15.3+), user identification is wired to the auth session, a reverse proxy is configured for EU data residency, and 12 business-critical events are captured across both client and server (Server Actions).

## Changes made

| File | Change |
|---|---|
| `instrumentation-client.ts` (new) | PostHog client-side initialization for Next.js 15.3+ |
| `next.config.ts` | Added EU PostHog ingest rewrites + `skipTrailingSlashRedirect` |
| `src/providers/posthog-provider.tsx` | Removed legacy `useEffect` init; added user identification via `useSession` |
| `src/lib/posthog-server.ts` | Added `flushAt: 1, flushInterval: 0` for reliable serverless delivery |
| `.env.local` | Set `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` |

## Events instrumented

| Event | Description | File |
|---|---|---|
| `login_completed` | User successfully signs in (email OTP, Google, or Passkey) | `src/app/(mobile)/auth/page.tsx` |
| `onboarding_role_selected` | User selects their role (captain) during onboarding | `src/app/(mobile)/(protected)/onboarding/_components/onboarding-client.tsx` |
| `team_created` | Captain successfully creates a new team | `src/actions/teams.actions.ts` |
| `player_invited` | Manager adds a player (registered or new invite) to the roster | `src/actions/teams.actions.ts` |
| `team_switched` | User switches their active team context | `src/actions/teams.actions.ts` |
| `event_created` | Manager creates a match or training event | `src/actions/match-sessions.actions.ts` |
| `attendance_confirmed` | Registered player confirms attendance for an event | `src/actions/attendance.actions.ts` |
| `attendance_cancelled` | Player cancels attendance (tracks late cancellations) | `src/actions/attendance.actions.ts` |
| `payment_submitted` | Athlete submits payment or payment proof | `src/actions/payments.actions.ts` |
| `payment_approved` | Manager approves an athlete payment | `src/actions/payments.actions.ts` |
| `guest_rsvp_completed` | Guest (no account) confirms attendance via OTP | `src/actions/guest-rsvp.actions.ts` |
| `waitlist_joined` | Visitor joins the public waitlist | `src/actions/waitlist.actions.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/716205)
- [Logins over time](/insights/PJINjdJq) — daily login completions + unique users
- [Teams created](/insights/ZURvpl4t) — activation metric (bold number)
- [Onboarding funnel](/insights/bL5obOJQ) — login → role selection → team creation
- [Event attendance trend](/insights/guSEAIsr) — confirmations vs cancellations
- [Payment conversion funnel](/insights/zGhHbL95) — attendance → payment submitted → approved

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
