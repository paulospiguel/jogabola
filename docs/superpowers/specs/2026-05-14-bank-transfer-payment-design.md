# Bank Transfer (IBAN) Payment Method

**Date:** 2026-05-14
**Status:** Approved
**Approach:** Extend existing payment method system (Approach A)

---

## Summary

Add "Transferência Bancária" as a fourth payment method alongside Stripe, MBWay, and Cash. Each team configures one IBAN + holder name. Proof submission vs. manual confirmation is configured per event.

---

## Database

### Migration 1 — `team_payment_settings`

Add 3 columns:

| Column | Type | Default | Notes |
|---|---|---|---|
| `transfer_enabled` | `boolean NOT NULL` | `false` | Gates all transfer UI |
| `transfer_iban` | `text` | `null` | IBAN string (any country) |
| `transfer_name` | `text` | `null` | Account holder name |

### Migration 2 — `match_sessions`

Add 1 column:

| Column | Type | Default | Notes |
|---|---|---|---|
| `transfer_requires_proof` | `boolean NOT NULL` | `true` | `true` = athlete uploads proof + AI check; `false` = manager confirms manually |

The column is irrelevant when `transfer_enabled = false` for the team; the UI hides it.

---

## Types & Schema

### `/src/types/payments.ts`

```ts
export type PaymentMethod = "stripe" | "mbway" | "cash" | "transfer";

export interface TeamPaymentConfig {
  // ... existing ...
  transfer: {
    enabled: boolean;
    iban?: string;
    name?: string;
  };
}

export const DEFAULT_PAYMENT_CONFIG: TeamPaymentConfig = {
  // ... existing ...
  transfer: { enabled: false },
};
```

### `/src/schemas/payments.schema.ts`

```ts
export const PAYMENT_METHODS = ["stripe", "mbway", "cash", "transfer"] as const;

// upsertTeamPaymentSettingsSchema additions:
transferEnabled: z.boolean().default(false),
transferIban: z
  .string()
  .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/, "IBAN inválido")
  .optional()
  .or(z.literal("")),
transferName: z.string().max(80).optional(),
```

### Event schema

`createMatchSessionSchema` and `updateMatchSessionSchema` gain:

```ts
transferRequiresProof: z.boolean().default(true),
```

---

## Server Actions

### `resolveTeamPaymentConfig`
Add transfer block:
```ts
transfer: {
  enabled: settings?.transferEnabled ?? false,
  iban: settings?.transferIban ?? undefined,
  name: settings?.transferName ?? undefined,
},
```

### `upsertTeamPaymentSettings`
Persist `transferEnabled`, `transferIban`, `transferName` — same pattern as mbway fields.

### `createMatchSession` / `updateMatchSession`
Persist `transferRequiresProof` — only stored, not enforced server-side beyond schema validation.

---

## UI

### Settings panel (manager configures)

**`payment-method-list.tsx`**
- Add `transfer` to `meta` record
- Icon: `Building2` (lucide), color: `#0EA5E9`
- Follows identical card pattern as MBWay/Cash

**`payment-method-detail-sheet.tsx`**
- `type === "transfer"` renders two fields:
  - IBAN (required) — `placeholder="PT50 0010 0001 2345 6789 1"` 
  - Nome titular (optional)
- Validation error shown if IBAN invalid on save

**`payments/page.tsx`**
- Add "Transferência Bancária" block to the active methods grid (same pattern as MBWay block)

### Event create/edit (manager)

**`create-event-sheet.tsx` / `edit-event-sheet.tsx`**
- When `paymentRequired = true` AND team has `transferEnabled = true`:
  - Show toggle: "Exigir comprovativo de transferência" (default ON)
  - Maps to `transferRequiresProof`

### Athlete payment flow

**`payment-method-card.tsx`**
- Add `transfer` card showing:
  - IBAN formatted in groups of 4
  - Holder name
  - "Já transferi" button (same press style)
- On press:
  - If `transferRequiresProof = true` → opens proof upload sheet (identical to MBWay flow, AI check applies)
  - If `transferRequiresProof = false` → creates payment with status `paid_unverified`, manager confirms manually

### Payment list / badges

**`payment-status-badge.tsx`** — `METHOD_ICONS.transfer = Building2`
**`payments/page.tsx` `MethodBadge`** — add `transfer` entry with `Building2`, color `#0EA5E9`

---

## i18n

Add keys in all 4 locales (`pt`, `en`, `es`, `fr`) under:

```json
"arenaPayments": {
  "settings": {
    "transfer": {
      "title": "Transferência Bancária",
      "description": "Pagamento via transferência IBAN"
    }
  },
  "methods": {
    "transfer": "Transferência"
  }
},
"athleteRsvp": {
  "paymentMethodCard": {
    "methods": {
      "transfer": {
        "label": "Transferência Bancária",
        "desc": "Transferência via IBAN",
        "ibanLabel": "IBAN",
        "nameLabel": "Titular",
        "sent": "Já transferi",
        "waitingMsg": "A aguardar confirmação do gestor",
        "proofMsg": "Envia comprovativo da transferência"
      }
    }
  }
}
```

```json
"arenaEvents": {
  "form": {
    "transferRequiresProof": "Exigir comprovativo de transferência",
    "transferRequiresProofSub": "O jogador terá de enviar screenshot da transferência"
  }
}
```

---

## Payment Method Detail Sheet — IBAN validation

On save, validate IBAN client-side with the regex and show inline error if invalid. Server-side Zod schema provides a second layer.

IBAN is stored as raw string (no spaces). Display layer formats with spaces every 4 chars.

---

## Out of Scope

- BIC/SWIFT fields
- Multiple IBANs per team
- IBAN ownership verification
- Stripe integration (already marked "em breve")
