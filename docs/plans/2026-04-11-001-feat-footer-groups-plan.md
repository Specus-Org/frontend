---
title: "feat: Render CMS footer groups in web footer"
type: feat
status: completed
date: 2026-04-11
---

# feat: Render CMS footer groups in web footer

## Overview

Extend the web footer so it keeps the current hardcoded `Products` column exactly as-is, then appends CMS-managed footer groups and their links after it using the generated public footer API in `packages/api-client`. The footer must degrade safely to the current static experience if the CMS footer endpoint is unavailable or empty.

## Problem Frame

The backend and generated API client now expose public footer-group data, but `apps/web` still renders a fully hardcoded footer. The requested change is intentionally additive: preserve the existing footer brand, bottom bar, and `Products` links, then render CMS-managed groups after `Products` so editors can manage the rest of the footer without replacing the current product navigation.

## Requirements Trace

- R1. Keep the current footer structure, branding, bottom bar, and hardcoded `Products` column unchanged.
- R2. Fetch public footer groups from the generated API client and render them in the web footer.
- R3. Render CMS groups after the `Products` column, preserving backend-provided group and item ordering.
- R4. Render each CMS item as a footer link using its published `url_path`.
- R5. If the footer API fails or returns no groups, the footer still renders the existing static content without crashing the layout.
- R6. Add regression coverage for the new render order and fallback behavior.

## Scope Boundaries

- No changes to footer copy, brand styling, or bottom bar content.
- No replacement or reordering of the existing hardcoded `Products` links.
- No admin-side or API-client generation changes; this plan only consumes the already-generated public footer client in `apps/web`.
- No footer redesign beyond rendering additional groups in the existing link area.

## Context & Research

### Relevant Code and Patterns

- `apps/web/app/(main)/layout.tsx` places `Footer` in the shared shell for all main pages.
- `apps/web/components/footer.tsx` is the current footer boundary and already composes `FooterBrand`, `FooterLinks`, and `FooterBottom`.
- `apps/web/components/footer/footer-links.tsx` currently owns the `Products` column and is a client component because its hardcoded links call `window.scrollTo(...)`.
- `apps/web/app/(main)/blog/page.tsx`, `apps/web/app/(main)/blog/[slug]/page.tsx`, and `apps/web/app/(main)/[...slug]/page.tsx` show the current `@specus/api-client` server-side fetch pattern in the web app.
- `packages/api-client/src/generated/sdk.gen.ts` exposes `publicGetFooter()`.
- `packages/api-client/src/generated/types.gen.ts` defines `CmsFooterResponse`, `CmsFooterGroupWithItems`, and footer item fields (`id`, `title`, `url_path`, `slug`, `content_type`).

### Institutional Learnings

- No `docs/solutions/` entries exist in this repo, so there are no stored institutional learnings to inherit for this change.

### External References

- None. The repo already has strong local patterns for server-side public API consumption in `apps/web`, and this change is a bounded frontend integration.

## Key Technical Decisions

- **Fetch footer groups at the server boundary**: Make `apps/web/components/footer.tsx` the async integration point so CMS data is resolved before render and not fetched client-side after hydration.
- **Keep `FooterLinks` client-side**: The current `Products` links use `window.scrollTo(...)`, so preserving the existing behavior is simplest if `FooterLinks` stays a client component and receives CMS groups as serializable props.
- **Fail closed to the current footer**: A footer-data failure should not break every page using `(main)/layout.tsx`; swallow API failures at the footer boundary and render only the static content when data is unavailable.
- **Use the generated SDK entry point, not raw request typing**: Although the request referenced `PublicGetFooterData`, the actual web integration should call `publicGetFooter()` from `@specus/api-client`; `PublicGetFooterData` is only the generated request-shape type behind that SDK call.
- **Add minimal app-scoped tests instead of leaving this untested**: `apps/web` currently has no obvious test harness, so the plan should introduce only the smallest amount of tooling needed to protect this footer regression surface.

## Open Questions

### Resolved During Planning

- **Where should footer data load?** At the shared `Footer` server boundary, then flow into `FooterLinks` as props.
- **Should the hardcoded `Products` group move into CMS?** No. It stays hardcoded and renders first.
- **Which API entry point should the implementation use?** `publicGetFooter()` from `@specus/api-client`, backed by the generated footer types in `packages/api-client`.

### Deferred to Implementation

- **Cache posture for CMS footer data**: Decide during implementation whether the footer fetch needs an explicit dynamic/no-store signal to avoid stale CMS-managed groups in the shared layout.
- **Normalization strictness for malformed CMS items**: Final filtering rules for empty `url_path` or blank titles can be decided when the concrete API payload is exercised in code.

## Implementation Units

- [x] **Unit 1: Add server-side footer data fetch and fallback**

**Goal:** Load CMS footer groups at the shared footer boundary without changing the existing static footer experience.

**Requirements:** R1, R2, R5

**Dependencies:** None

**Files:**
- Modify: `apps/web/components/footer.tsx`
- Modify: `apps/web/components/footer/footer-links.tsx`
- Test: `apps/web/components/footer/footer.test.tsx`

**Approach:**
- Convert `Footer` into an async server component that calls `publicGetFooter()` before rendering the footer shell.
- Normalize the API result to `response.data?.groups ?? []`.
- Catch fetch failures and fall back to an empty group list so `FooterBrand`, the hardcoded `Products` column, and `FooterBottom` still render.
- Pass only the CMS group data needed for rendering into `FooterLinks`; keep brand and bottom components unchanged.

**Patterns to follow:**
- `apps/web/app/(main)/blog/page.tsx` for direct server-side `@specus/api-client` usage.
- `apps/web/app/(main)/blog/[slug]/page.tsx` and `apps/web/app/(main)/[...slug]/page.tsx` for request-time public CMS fetches with graceful null handling.
- `apps/web/components/footer.tsx` for existing footer composition.

**Test scenarios:**
- Happy path: `publicGetFooter()` returns multiple groups with items -> the footer still renders brand and bottom sections and forwards CMS groups to the link area.
- Edge case: `publicGetFooter()` returns `undefined` or `groups: []` -> the rendered footer matches the current static experience with only the `Products` column.
- Error path: `publicGetFooter()` throws -> the page shell still renders successfully and the footer falls back to static-only content.

**Verification:**
- Any route under `apps/web/app/(main)` renders successfully with and without footer API data.
- Footer data failures do not surface as page-level crashes.

- [x] **Unit 2: Render CMS groups after the existing Products column**

**Goal:** Extend the footer link column area to show CMS-managed groups and their items after the current hardcoded `Products` group.

**Requirements:** R1, R3, R4, R5

**Dependencies:** Unit 1

**Files:**
- Modify: `apps/web/components/footer/footer-links.tsx`
- Test: `apps/web/components/footer/footer-links.test.tsx`

**Approach:**
- Add a typed `groups` prop to `FooterLinks` using the generated footer-group shape from `@specus/api-client`.
- Keep the existing `Products` markup first and preserve its current link styles and smooth-scroll click handling.
- Render CMS groups immediately after `Products` in the order returned by the backend.
- Render each CMS item as a `next/link` footer link using `url_path` as the destination and `title` as the visible text.
- Skip groups that have no renderable items so the footer does not show empty headings.

**Patterns to follow:**
- `apps/web/components/footer/footer-links.tsx` for spacing, typography, and existing link styling.
- Existing `next/link` usage in `apps/web` for route-aware client navigation.

**Test scenarios:**
- Happy path: a CMS group such as `Company` with two items renders as a new column after `Products`.
- Happy path: multiple CMS groups render in the same order returned by the API, with each group preserving item order.
- Edge case: a CMS group with `items: []` does not render an empty column.
- Edge case: an item with nested `url_path` such as `/about/team` links to that exact path.
- Integration: clicking an existing hardcoded `Products` link still triggers the current smooth-scroll behavior.

**Verification:**
- The first rendered link column remains `Products`.
- CMS groups appear after `Products` on desktop and wrap naturally beneath it on smaller screens without breaking the existing layout.

- [x] **Unit 3: Add minimal footer regression coverage in apps/web**

**Goal:** Introduce the smallest app-scoped test setup needed to protect the new footer behavior.

**Requirements:** R6

**Dependencies:** Units 1 and 2

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/test/setup.ts`
- Create: `apps/web/components/footer/footer.test.tsx`
- Create: `apps/web/components/footer/footer-links.test.tsx`

**Approach:**
- Add a minimal `Vitest` + `React Testing Library` setup scoped to `apps/web` rather than introducing repo-wide testing changes.
- Cover the `Footer` server-boundary fallback behavior with a mocked `publicGetFooter()` response path.
- Cover `FooterLinks` rendering order, CMS group mapping, and empty-group filtering at the component level.
- Keep the test harness focused on this footer surface so the implementation stays bounded.

**Execution note:** Start with failing component tests for Products-first ordering and footer fallback, then implement the UI changes against those expectations.

**Patterns to follow:**
- No established test pattern exists in `apps/web`; keep configuration local and minimal.

**Test scenarios:**
- Happy path: `FooterLinks` renders the static `Products` column plus CMS groups in the expected order.
- Edge case: `FooterLinks` receives no CMS groups -> DOM contains only the current `Products` section.
- Edge case: a group with no items is omitted from the rendered output.
- Error path: mocked `publicGetFooter()` rejection still produces a rendered footer without CMS columns.
- Integration: CMS item links render the expected `href` values from `url_path`.

**Verification:**
- Footer-specific tests can run inside `apps/web` without affecting production runtime behavior.
- The new tests fail if future edits reorder or remove the fallback/static-first footer behavior.

## System-Wide Impact

- **Interaction graph:** `apps/web/app/(main)/layout.tsx` -> `apps/web/components/footer.tsx` -> `publicGetFooter()` -> `apps/web/components/footer/footer-links.tsx`.
- **Error propagation:** Footer API failures should terminate at `Footer` and not propagate into the shared page shell.
- **State lifecycle risks:** Because the footer sits in the shared layout, stale CMS data is the primary lifecycle risk if the fetch is cached too aggressively.
- **Integration coverage:** Verify footer behavior on at least one representative `(main)` route with successful data, empty data, and failed data.
- **Unchanged invariants:** `FooterBrand`, `FooterBottom`, and the existing hardcoded `Products` links remain part of the footer regardless of CMS response state.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Shared-layout footer fetch may cache stale CMS groups | Decide explicit dynamic/no-store posture during implementation if default SDK behavior is not fresh enough |
| CMS returns incomplete footer items (blank title or missing path) | Normalize or skip non-renderable entries before passing data into `FooterLinks` |
| Adding the first web test harness expands scope slightly | Keep tooling scoped to `apps/web` and only large enough to cover the footer regression surface |

## Documentation / Operational Notes

- No user-facing documentation updates are required.
- If editors need immediate visibility of footer updates, document the final cache posture near the footer fetch implementation for future maintainers.

## Sources & References

- Related code: `apps/web/app/(main)/layout.tsx`
- Related code: `apps/web/components/footer.tsx`
- Related code: `apps/web/components/footer/footer-links.tsx`
- Related code: `packages/api-client/src/generated/sdk.gen.ts`
- Related code: `packages/api-client/src/generated/types.gen.ts`
