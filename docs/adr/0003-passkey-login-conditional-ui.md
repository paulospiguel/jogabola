# 3. Passkey login uses conditional UI, not an explicit button; upsell modal is capped and dismissible

Date: 2026-07-19

## Status

Accepted

## Context

`/auth` showed a dedicated "Login com Passkey" button (fingerprint icon) above
the email/OTP form, calling `signIn.passkey()` only on click — no WebAuthn
conditional UI (autofill) was wired despite `@better-auth/passkey`'s client
already supporting `autoFill: true`.

Separately, `PasskeyPromptGate` (shown on every arena page load for users
without a passkey) had a live bug: it accepted a `translations.no` prop and
checked a `localStorage` "refused" flag to permanently suppress itself, but
`handleSkip()` only ever wrote to `sessionStorage`. Net effect — the modal
re-fired on every new session, forever, with no real permanent-dismiss path.
For a user registering via email OTP, this meant two modals back-to-back:
the OTP code screen, immediately followed by the passkey upsell on landing
in `/arena`.

True zero-interaction auto-login was also considered and rejected: WebAuthn
mandates a user-verification gesture (biometric/PIN/security key) on every
authentication — no browser will silently authenticate a page without it.
Building around "fully automatic" would mean faking it or violating the spec.

## Decision

- **Login button → conditional UI.** Drop the explicit passkey button. Wire
  `autocomplete="username webauthn"` on the email input and call
  `signIn.passkey({ autoFill: true })` **on `/auth` page mount** (not only on
  input focus), so returning passkey holders see the native suggestion the
  instant the page loads — one tap + biometric, no typing. Keep a small text-
  link fallback for browsers/devices without autofill support.
- **Upsell modal → capped, real dismissal.** Fix the bug: wire an actual
  permanent-dismiss action (`translations.no`) to `localStorage`. Track an
  attempt counter instead of a boolean; stop showing the modal automatically
  after 2–3 attempts and rely on the existing Profile > Security entry point
  from then on. Re-fire only on the next distinct login, not on every page
  load within an already-dismissed session.
- **No fake auto-login.** The conditional-UI mount-time arm above is the
  ceiling of "automatic" we support — it is not a separate feature.

## Consequences

- `/auth` markup simplifies (no button + divider block for passkey).
- Passkey discoverability for first-time users now depends on: (a) the browser
  surfacing the conditional-UI suggestion when relevant, and (b) the
  post-login upsell modal — there's no persistent "try passkey" affordance on
  the login screen itself. If discoverability turns out to be inadequate,
  revisit with a lightweight text link naming the feature (not a full button).
- The upsell attempt counter is new state (`localStorage`, keyed per user);
  needs to survive the boolean → counter migration cleanly for existing users
  who already have a "skipped" session flag.
