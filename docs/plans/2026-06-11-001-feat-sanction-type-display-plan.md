---
title: "feat: Display sanction types on AML result cards and detail view"
date: 2026-06-11
type: feat
depth: lightweight
status: ready
---

# feat: Display sanction types on AML result cards and detail view

## Summary

The backend has added sanction-type classification to the screening contract. This plan consumes the **display** side of that surface only: regenerate the typed API client, show `sanction_types[]` on search result cards, and show each sanction record's `sanction_type` on the entity detail view. The `case_law` topic value flows through to the existing detail-header pills as a side effect of regeneration.

**Explicitly out of scope:** the `sanction_type` query parameter and the `topics` classification filter. No filter controls are built; the search screen keeps passing only `q`. See [Scope Boundaries](#scope-boundaries).

---

## Problem Frame

The backend now exposes sanction classification, but the frontend ignores it. The generated client lacks the new fields entirely (`SanctionType`, `sanction_types`, `sanction_type`), so the data is invisible to users even though the API returns it.

A user scanning search results cannot tell whether a match is a criminal, financial, or political sanction without opening each record. On the detail view, individual sanction entries show program, dates, and remarks but not their classified nature.

The fix is display-only: regenerate the client to expose the fields, then render them in the two places the data appears — result cards (`sanction_types[]`, the distinct types across an entity) and detail records (`sanction_type`, per individual sanction).

---

## Contract Changes (from latest `Specus-Org/backend` `main` spec)

These are the relevant deltas between the current generated `packages/api-client/src/generated/types.gen.ts` and the latest `openapi.gen.yaml`. The full spec is fetched and regenerated in U1; this table is for orientation.

| Schema / surface | Current generated type | Latest spec | Used by |
|---|---|---|---|
| `SanctionType` (new enum) | _absent_ | `'criminal' \| 'financial' \| 'political'` | U2, U3 |
| `ScreeningSearchResult.sanction_types` | _absent_ | `Array<SanctionType>` (optional) — "Distinct sanction types across this entity's sanction records" | U2 (result cards) |
| `EntitySanction.sanction_type` | _absent_ | `SanctionType \| null` (optional, nullable) — "Nature of the sanction; null if unclassified" | U3 (detail records) |
| `EntitySanction.event_type` | `'sanction' \| 'pep' \| 'blacklist'` | `+ 'case_law'` | (type only; not displayed today) |
| `ScreeningEntity.topics` / `ScreeningSearchResult.topics` | `Array<string>` | unchanged shape; description now includes `case_law` | detail header (existing render) |
| `topics` query param enum | `'sanction' \| 'pep' \| 'blacklist'` | `+ 'case_law'` | **out of scope** (no filter UI) |
| `sanction_type` query param (new) | _absent_ | `SanctionType` | **out of scope** (no filter UI) |

Note: `sanction_types` (plural, on the result card) and `sanction_type` (singular, on each detail record) are distinct fields. The card aggregates; the detail record is per-entry.

---

## Key Technical Decisions

**KTD-1 — Reuse `formatLabel` for display strings instead of a new mapping.**
`entity-detail-formatters.ts` already exports `formatLabel`, which converts `snake_case` to Title Case (`character.toUpperCase()` after `_` → space). It produces correct output for every value in scope: `criminal` → "Criminal", `financial` → "Financial", `political` → "Political", and `case_law` → "Case Law". Reusing it avoids a hardcoded enum-to-label map that would drift if the backend adds a fourth type. Rationale: the enum values are already human-derivable; a lookup table adds maintenance cost with no benefit.

**KTD-2 — Render sanction types as `Badge` components, not bespoke `<span>` pills.**
The shared `@specus/ui` `Badge` component (`packages/ui/src/components/badge.tsx`) provides `default | secondary | destructive | outline` variants. Use `secondary` for sanction-type badges on cards to distinguish them visually from the existing red `destructive` "Active" / topics styling, which signals severity. The current detail-header topics pills are hand-rolled `<span>` elements; this plan does not refactor them (see U3 optional touch), but new badges use the shared component for consistency.

**KTD-3 — Treat both new fields as optional and absent-safe.**
`sanction_types` is optional on the result type; `sanction_type` is optional and nullable on the sanction record. Both renders must no-op cleanly when the field is missing, empty, or `null` — no empty containers, no "null" text. This matches the existing defensive pattern in `entity-item.tsx` (`hasSummary` gating) and `listed-in-section.tsx` (conditional row rendering).

---

## Implementation Units

### U1. Regenerate the API client from the latest backend spec

**Goal:** Bring the new `SanctionType` enum and the `sanction_types` / `sanction_type` fields into the generated TypeScript client so the UI units can reference them type-safely.

**Dependencies:** none (foundation).

**Files:**
- `packages/api-client/openapi.yaml` (regenerated — fetched from `Specus-Org/backend` `main`)
- `packages/api-client/src/generated/types.gen.ts` (regenerated)
- `packages/api-client/src/generated/sdk.gen.ts` (regenerated)

**Approach:**
Run the existing pipeline: `pnpm api` (which runs `fetch-openapi.sh` via `gh api`, then `openapi-ts`). Requires `gh auth login` to be active. After regeneration, confirm the diff is limited to the additive contract changes in the table above — no unexpected removals or breaking renames to existing screening types. If the diff includes unrelated backend changes (other endpoints evolved since the last sync), review them but do not act on them in this plan; flag any that break the build.

**Patterns to follow:** the regeneration workflow documented in `plans/setup-openapi-client.md`; the `api` script in `packages/api-client/package.json`.

**Test scenarios:** `Test expectation: none -- generated code; verification is type-check and build success (see Verification).`

**Verification:** `pnpm --filter @specus/api-client generate` completes without error; `SanctionType`, `ScreeningSearchResult.sanction_types`, and `EntitySanction.sanction_type` are present in `types.gen.ts`; the web app type-checks against the regenerated client.

---

### U2. Display `sanction_types[]` on search result cards

**Goal:** Show the distinct sanction types for each entity on its result card, so users can classify a match without opening it.

**Requirements:** "sanction_types on result cards" (origin request).

**Dependencies:** U1.

**Files:**
- `apps/web/components/aml/entity-item.tsx` (modify)
- `apps/web/components/aml/entity-item.test.tsx` (modify — add scenarios)

**Approach:**
Render `entity.sanction_types` as a row of `Badge` (`variant="secondary"`) components below the existing name/nationality/birth-date block, labelled via `formatLabel` (KTD-1). Gate the whole row on a non-empty array (KTD-3) so cards without sanction types are visually unchanged. Keep the row inside the existing `min-w-0` flex column so long type lists wrap rather than overflow, consistent with the card's existing overflow handling. Import `Badge` from `@specus/ui/components/badge` and `formatLabel` from `@/components/aml/entity-detail-formatters`.

**Patterns to follow:** the conditional `hasSummary` rendering already in `entity-item.tsx`; badge usage in shared UI; the existing flex/`truncate` overflow approach in the card summary line.

**Test scenarios:**
- Renders one badge per sanction type with Title Case labels when `sanction_types: ['criminal', 'financial']` is present (asserts "Criminal" and "Financial" appear).
- Renders no sanction-type badges and no empty container when `sanction_types` is `undefined`.
- Renders no badges when `sanction_types` is an empty array `[]`.
- Existing card content (caption, nationality, birth date, image, link target) remains intact when sanction types are added — extend the existing "keeps the original card content" test rather than replacing it.

**Verification:** result cards show readable sanction-type badges for entities that carry them; cards without the field look identical to today; `vitest run` passes for `entity-item.test.tsx`.

---

### U3. Display `sanction_type` per sanction record on the detail view

**Goal:** Show each individual sanction record's classified nature on the entity detail page, hidden when unclassified.

**Requirements:** "Display of sanction_type per record on the detail view" (origin request).

**Dependencies:** U1.

**Files:**
- `apps/web/components/aml/listed-in-section.tsx` (modify)
- `apps/web/components/aml/listed-in-section.test.tsx` (modify — add scenarios)

**Approach:**
In the per-record block of `ListedInSection`, render the record's `sanction_type` as a `Badge` near the existing "Active" indicator, labelled via `formatLabel` (KTD-1). Render only when `item.sanction_type` is a non-null, non-empty string (KTD-3) — the field is nullable and means "unclassified" when absent, so unclassified records show no badge. Choose a badge variant distinct from the red `destructive` "Active" pill so classification reads as metadata rather than a severity warning (`secondary` or `outline`, matching the card choice in KTD-2 where reasonable).

**Optional touch (low priority, include only if trivial):** the detail header (`search-result-header.tsx`) renders `entity.topics` as raw hand-rolled red `<span>` pills, so `case_law` will display as the literal string `case_law` after U1. If addressed, pass those topic strings through `formatLabel` so they render as "Case Law", "Sanction", etc. This is cosmetic and may be deferred — it is not part of the core sanction-type display request. If deferred, leave a note rather than silently skipping.

**Patterns to follow:** the existing conditional "Active" badge and `sanctionRows` rendering in `listed-in-section.tsx`; `formatLabel` and the row-building helpers in `entity-detail-formatters.ts`.

**Test scenarios:**
- Renders a "Criminal" badge for a sanction record with `sanction_type: 'criminal'`.
- Renders no sanction-type badge when `sanction_type` is `null` (unclassified).
- Renders no sanction-type badge when `sanction_type` is `undefined`.
- A record with `sanction_type` set alongside `is_active: true` shows both the classification badge and the "Active" indicator without layout breakage.
- Existing sanction-row rendering (program, designation date, remarks, source link) is unaffected when a sanction type is present.
- (If the optional header touch is implemented) `topics: ['case_law']` renders as "Case Law" rather than the raw `case_law` string in `search-result-header.tsx`.

**Verification:** detail-view sanction records display a readable classification badge when classified and nothing when unclassified; `vitest run` passes for `listed-in-section.test.tsx`; manual check on a known entity with classified sanctions.

---

## Scope Boundaries

**In scope:** API client regeneration; `sanction_types[]` display on result cards; `sanction_type` display per detail record; optional `topics` label formatting on the detail header.

**Out of scope (explicitly dropped per planning discussion):**
- The `sanction_type` query parameter — no single-select control on the search screen.
- The `topics` classification filter — no multi-select control, including no `case_law` filter.
- Any change to the `screeningSearch` call in `aml/search/page.tsx` (it continues passing only `q`).
- URL state encoding for filters, and any filters on the home entry box at `aml/page.tsx`.

### Deferred to Follow-Up Work
- Building the `sanction_type` and `topics` filter controls (the dropped scope above) is a natural follow-up once display is validated. The generated client will already expose the `sanction_type` query param after U1, so a future filter plan starts from a regenerated client.

---

## Verification (whole-plan)

1. `pnpm api` regenerates the client cleanly; new types present (U1).
2. `pnpm --filter @specus/web build` (or the repo's type-check) passes against the regenerated client.
3. `vitest run` passes, including the new scenarios in `entity-item.test.tsx` and `listed-in-section.test.tsx`.
4. Manual: a search returning entities with sanction types shows badges on cards; opening one shows per-record classification badges; an unclassified record shows none.
