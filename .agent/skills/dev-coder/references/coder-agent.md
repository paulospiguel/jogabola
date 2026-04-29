---
trigger: supporting_reference
---

# Coder Agent - JogaBola MVP

Use this reference for architecture, coding, and validation decisions.

## Priority Order

1. Preserve existing behavior.
2. Keep security boundaries server-side.
3. Match local patterns.
4. Improve structure only where it supports the current task.
5. Validate touched code.

## Implementation Flow

1. Inspect files with `rg`/focused reads.
2. Identify current pattern: route, component, action, schema, tokens.
3. Make small changes.
4. Run focused formatter/lint/typecheck.
5. Compile route or run local smoke check when UI changed.

## File Ownership

### Route Files

`src/app/**/page.tsx` should:

- Load session/auth on server.
- Fetch server data.
- Normalize minimal props for client components.
- Avoid large JSX and local browser state.

### Client Components

Use `"use client"` only when needed for:

- state
- events
- browser APIs
- wallet/auth client hooks
- animation libraries

Keep client components thin. Extract subcomponents when JSX grows or repeated
patterns appear.

### Server Actions

Server action template:

```ts
"use server";

const inputSchema = z.object({ ... });

export async function doThing(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Validation error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // service/db call
  revalidatePath("/arena");
  return { success: true, data };
}
```

Never trust `userId`, `managerId`, `organizerId`, or role sent from client.

## TypeScript Rules

- Interfaces for props and object contracts.
- Literal unions for finite states.
- `unknown` at unsafe boundaries, parse before use.
- Avoid `any`; if forced by external API, isolate one line and explain.
- Mappers convert DB/API objects to ViewModels.

## React Rules

- No data fetching in `useEffect`.
- No derived state in `useEffect`.
- Use `useMemo` only for meaningful expensive or referentially important values.
- Use `useTransition` for non-urgent UI updates when needed.
- Avoid inline component definitions inside components.
- Keep handlers named `handleX`.

## Styling Rules

- Tailwind first.
- `cn()` for conditional classes.
- Static styles go in className.
- Runtime-calculated styles may stay inline.
- Use Arena tokens for Arena UI.

## Refactor Triggers

Refactor during the task when:

- UI file > 220 lines and current change adds more complexity.
- Logic/action file > 160 lines.
- Component has > 8 props.
- More than 3 responsibilities in one file.
- Same UI pattern repeated 3+ times.

Refactor path:

1. Extract presentational child component.
2. Extract hook for local UI state if reused/complex.
3. Extract mapper/formatter for pure transforms.
4. Extract service/use-case for domain rules.
5. Move feature-specific files near route or `features/<feature>`.

## Deletion / Cleanup

Before deleting:

```sh
rg "ComponentOrFunctionName|path/to/file" src
```

Delete only if no active imports/usages remain. Do not delete unrelated user
work.

## Validation Commands

Use focused checks first:

```sh
pnpm exec biome check --write <touched-files>
pnpm exec tsc --noEmit --pretty false 2>&1 | rg "<touched-path>|symbol"
curl -I http://127.0.0.1:3000/<route>
```

Run full `pnpm ts-check` when scope is broad. If it fails from unrelated code,
report exact path and line.

## Final Response

Keep final response short:

- What changed.
- Main files.
- Validation run.
- Known unrelated failures or caveats.
