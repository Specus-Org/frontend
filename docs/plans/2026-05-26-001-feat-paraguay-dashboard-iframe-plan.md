---
title: 'feat: Paraguay dashboard iframe embed'
type: feat
status: completed
date: 2026-05-26
---

# feat: Paraguay dashboard iframe embed

## Overview

Add `/paraguay` route to the web app. Page embeds an externally-hosted Apache Superset dashboard via iframe. The dashboard is owned by another team — our scope is presentation only, no data fetching, no auth bridging.

Reference iframe markup provided:

```html
<iframe src="https://superset.specus.biz/superset/dashboard/p/d2LVMwArQKZ/?standalone=2"
        height="100%" width="100%"
        title="Paraguay Procurement Analysis SPECUS Dashboard"></iframe>
```

## Problem Frame

Nav and footer already link to `/paraguay` (`apps/web/components/navbar/nav-items.ts:19-21`, `apps/web/components/footer/footer-links.tsx:41-45`), but the route does not exist — clicking the link 404s. Product needs the Superset dashboard surfaced to public users under the existing site chrome.

## Requirements Trace

- R1. Public visitors can navigate to `/paraguay` without authentication.
- R2. Page renders the Superset dashboard via iframe filling the main content area.
- R3. Navbar and footer remain visible (consistent with other `(main)` group routes like `/aml`).
- R4. Dashboard URL is configurable per environment via env var (no hardcoded URL in component).
- R5. Iframe has accessible `title` attribute for screen readers.

## Scope Boundaries

- No SSO/auth integration with Superset — relies on Superset's own public/anonymous access config.
- No custom filtering, postMessage bridge, or data passthrough between host page and dashboard.
- No analytics instrumentation on iframe interactions (cross-origin DOM is inaccessible anyway).
- No fallback/loading skeleton beyond what the browser provides natively (can be added later if UX requires).
- No mobile-specific dashboard alternative — Superset standalone mode is responsive enough for v1.

## Context & Research

### Relevant Code and Patterns

- `apps/web/app/(main)/layout.tsx` — main group layout already wraps children with Navbar + Footer; `<main>` uses `flex-1` and `rounded-t-xl rounded-b-xl border-y`. New page becomes a child of this layout automatically.
- `apps/web/app/(main)/aml/page.tsx` — sibling page demonstrating the `(main)` route convention: `'use client'` directive, default export named function, returns JSX inside a top-level `<div>`.
- `apps/web/components/navbar/nav-items.ts:19-21` and `apps/web/components/footer/footer-links.tsx:41-45` — existing `/paraguay` links that will start resolving once the route exists. No changes needed to these files.
- `.env.example` — existing convention: `NEXT_PUBLIC_*` for browser-exposed vars. New `NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL` follows that pattern.

### Institutional Learnings

- No prior `docs/solutions/` entry on iframe embedding in this repo.

### External References

- Superset `standalone=2` mode strips Superset chrome (top nav, filters bar collapsed) — already configured in provided URL.
- Iframe cross-origin policy: page cannot read or script the embedded Superset DOM; only `src`, sizing, and `title` are under our control.

## Key Technical Decisions

- **Server component, no `'use client'`.** Page is static markup reading a public env var. No hooks needed; avoids unnecessary client bundle. (Diverges from `/aml` which uses state — fine, the divergence is justified by no interactivity.)
- **Env var read at module scope.** `NEXT_PUBLIC_*` is inlined at build time by Next.js, so referencing `process.env.NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL` directly in the component is correct.
- **Flex-column main, page fills available height.** Refactor `(main)/layout.tsx` `<main>` from `flex-1` to `flex flex-1 flex-col`. The `/paraguay` page root then uses `flex-1 overflow-hidden` and the iframe uses `h-full w-full`. No `100vh` math, no magic rem constants, survives navbar/footer height changes at any breakpoint.
- **Container respects layout border-radius.** Wrapping `<div>` includes `overflow-hidden` so the iframe does not paint over the main element's `rounded-t-xl rounded-b-xl border-y` chrome.
- **`sandbox` with narrowed permissions.** Use `sandbox="allow-scripts allow-forms allow-same-origin"`. Grants Superset what it needs (JS execution, filter forms, same-origin XHR within superset.specus.biz) while blocking `allow-top-navigation` (prevents `window.top.location = 'attacker'` exploit from any compromised dependency in the Superset bundle) and `allow-popups`. If Superset surface breaks during smoke test, widen one permission at a time and document why.
- **`referrerpolicy="no-referrer"` on the iframe.** Prevents the share-link token in the Superset URL from leaking via `Referer` header to any third-party scripts/CDNs the dashboard loads.
- **`X-Frame-Options: SAMEORIGIN` on `/paraguay` response.** Prevents third parties from embedding our `/paraguay` page in their own iframe (clickjacking). Set via `next.config` `headers()` entry scoped to the route, or via middleware.
- **`title` attribute mandatory** for a11y (axe-core flags untitled iframes). Hardcoded title string in component is fine.
- **Server component reads `process.env` at request/build time on the server.** Next.js inlines `NEXT_PUBLIC_*` into client bundles; in a server component the value is read on the server. Either way, the env-var indirection works as intended — but the rationale here is server-side env access, not client inlining.

## Open Questions

### Resolved During Planning

- Auth gate? → Public. Matches nav-items intent and existing `(main)` group pattern.
- Layout? → Inside `(main)` layout with navbar + footer.
- Config? → Env var `NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL`.

### Deferred to Implementation

- Loading state — accepted as v1: bare iframe + browser default. Revisit only if Superset cold-boot is visibly jarring during smoke test.
- Mobile/responsive — accepted as v1: Superset standalone min-width (~800px) may cause horizontal scroll on narrow viewports. Defer until real usage data shows it matters.
- `sandbox` widening — if smoke test reveals Superset breaks with the proposed permission set, widen one permission at a time (likely `allow-popups` for filter dropdowns) and document each addition.
- CSP / `frame-src` — verify during implementation; only adds work if a CSP already exists in middleware/`next.config`. No proactive CSP rollout in this plan.

## Implementation Units

- [ ] **Unit 1: Add env var configuration**

**Goal:** Declare `NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL` so the page has a configurable source.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `.env.example` (committed; developers copy to `.env.local` themselves — `.env.local` is gitignored and not a plan deliverable)

**Approach:**
- Append a `# Paraguay dashboard (Superset)` section under the PUBLIC VARIABLES block in `.env.example`.
- Default value in `.env.example`: `NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL=https://superset.specus.biz/superset/dashboard/p/d2LVMwArQKZ/?standalone=2`
- Implementer (and other devs) mirror to their own `.env.local` locally after pulling.

**Patterns to follow:**
- Existing `NEXT_PUBLIC_API_BASE_URL` entry in `.env.example`.

**Test scenarios:**
- Test expectation: none — config-only change with no behavioral surface to assert.

**Verification:**
- `grep NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL .env.example` returns the new line.
- After `pnpm dev`, `process.env.NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL` resolves in the web app build.

---

- [ ] **Unit 2: Refactor `(main)` layout to flex column**

**Goal:** Make the `(main)` group `<main>` element a flex column so child pages can fill remaining height without `100vh` math.

**Requirements:** R2, R3

**Dependencies:** None

**Files:**
- Modify: `apps/web/app/(main)/layout.tsx`

**Approach:**
- Change `<main className="flex-1 rounded-t-xl rounded-b-xl border-y">` to `<main className="flex flex-1 flex-col rounded-t-xl rounded-b-xl border-y">`.
- Additive change: existing children that already lay out internally are unaffected (block-level children inside a flex column behave the same as inside a block container for default cases).
- Verify visually: `/aml`, `/`, `/blog`, `/profile`, `/resources` unchanged.

**Patterns to follow:**
- Existing layout file structure — no new components, just className edit.

**Test scenarios:**
- Test expectation: none — pure CSS refactor with visual smoke test instead.

**Verification:**
- After change, sibling routes (`/`, `/aml`, `/blog`) render identically (no visual regression).
- Inspect `<main>` in devtools: computed `display: flex`, `flex-direction: column`.

---

- [ ] **Unit 3: Create `/paraguay` page**

**Goal:** Add the route that renders the Superset dashboard inside the `(main)` layout, filling the available height via flex.

**Requirements:** R1, R2, R3, R5

**Dependencies:** Unit 1, Unit 2

**Files:**
- Create: `apps/web/app/(main)/paraguay/page.tsx`
- Create: `apps/web/app/(main)/paraguay/page.test.tsx`

**Approach:**
- Server component (no `'use client'`).
- Read `process.env.NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL` at module scope.
- Root element uses `flex-1 overflow-hidden` so it fills the flex column from Unit 2 and clips to the layout's rounded border.
- Single `<iframe>` inside:
  - `src` = the env var value
  - `title="Paraguay Procurement Analysis SPECUS Dashboard"`
  - `referrerpolicy="no-referrer"` — prevents share-link token leakage via `Referer` header to third-party scripts loaded inside the iframe.
  - `sandbox="allow-scripts allow-forms allow-same-origin"` — blocks top-frame navigation exploit while preserving Superset functionality.
  - `className="h-full w-full border-0"`
- If env var is missing at request time, call `notFound()` from `next/navigation`. Next.js renders the existing `apps/web/app/(main)/not-found.tsx` page (consistent with how `/[...slug]` and `/blog/[slug]` handle missing content).
- Export `metadata: Metadata` with `title: 'Paraguay'` and `description: 'Paraguay procurement analysis dashboard.'`, matching the pattern in `apps/web/app/(main)/resources/page.tsx:10-13`.

**Technical design:** *(directional, not implementation specification)*

```tsx
// apps/web/app/(main)/paraguay/page.tsx (sketch)
import { notFound } from 'next/navigation';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL;

export default function ParaguayPage() {
  if (!DASHBOARD_URL) notFound();
  return (
    <div className="flex-1 overflow-hidden">
      <iframe
        src={DASHBOARD_URL}
        title="Paraguay Procurement Analysis SPECUS Dashboard"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-forms allow-same-origin"
        className="h-full w-full border-0"
      />
    </div>
  );
}
```

**Patterns to follow:**
- File location and route group: `apps/web/app/(main)/aml/page.tsx`.
- Test file co-location: `apps/web/app/(main)/page.test.tsx`.

**Test scenarios:**
- Happy path: page renders an `<iframe>` whose `src` matches the configured env var. Use React Testing Library; query by `title`.
- Happy path: iframe `title` attribute equals `"Paraguay Procurement Analysis SPECUS Dashboard"` (a11y assertion).
- Happy path: iframe has `sandbox="allow-scripts allow-forms allow-same-origin"` and `referrerpolicy="no-referrer"` attributes (security regression assertions).
- Edge case: when `NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL` is `undefined` at render time, page triggers `notFound()` (Next.js renders the `(main)` group's `not-found.tsx`) and does NOT render an iframe.

**Verification:**
- `pnpm --filter web dev` then visit `http://localhost:3000/paraguay` — navbar visible above, footer below, dashboard fills remaining height inside rounded layout border.
- Inspect element: iframe has expected `src`, `title`, `sandbox`, `referrerpolicy`.
- Nav link `Paraguay` in navbar routes correctly (no 404).
- Lighthouse/axe in browser devtools: no "frame has no title" violation.
- Smoke-test Superset interactivity: filters open, charts render, no console errors from `sandbox` restrictions. If broken, widen sandbox per "Deferred to Implementation".

---

- [ ] **Unit 4: Security headers + CSP verification**

**Goal:** Set `X-Frame-Options: SAMEORIGIN` for `/paraguay` (clickjacking defense), verify no existing CSP blocks the embed.

**Requirements:** R2

**Dependencies:** Unit 3

**Files:**
- Modify: `apps/web/next.config.*` (or `apps/web/middleware.ts` if headers already live there)

**Approach:**
- Add a `headers()` entry in `next.config` scoped to `source: '/paraguay'`:
  - `X-Frame-Options: SAMEORIGIN`
  - `Content-Security-Policy: frame-ancestors 'self'` (modern equivalent; both for browser coverage)
- Grep for existing `Content-Security-Policy`, `frame-src` in `apps/web/`. If a CSP exists, extend `frame-src` to include `https://superset.specus.biz`. If not, do NOT introduce one in this plan.

**Test scenarios:**
- Verification step: curl `http://localhost:3000/paraguay -I` — response includes `X-Frame-Options: SAMEORIGIN`.
- Manual attempt: load `/paraguay` inside a test iframe on a different origin (e.g., `data:text/html,<iframe src='http://localhost:3000/paraguay'>`). Browser should refuse to render.

**Verification:**
- Headers present on response.
- Browser devtools console shows no `Refused to frame ... violates CSP` errors on `/paraguay`.

---

- [ ] **Unit 5: Token scope + data-classification sign-off (non-code)**

**Goal:** Document who approved public exposure of the procurement dashboard and what the share-link token authorizes.

**Requirements:** R1

**Dependencies:** None (can run in parallel)

**Files:**
- Update: this plan's "Documentation / Operational Notes" section with the answers.
- Optionally: append note near iframe component referencing the sign-off record.

**Approach:**
- Ping dashboard team (Slack / direct) with two questions:
  1. What does the `/p/d2LVMwArQKZ/` share token authorize — read-only anonymous view, or anything broader (write, filter mutation, data export)?
  2. Who reviewed the dashboard contents for public exposure (procurement contract values, vendor identities, etc.) and on what date?
- Paste their reply into this plan and the PR description.
- If the token grants more than read-only anonymous access, halt — token must NOT live in a `NEXT_PUBLIC_*` env var.

**Test scenarios:**
- Test expectation: none — process/governance unit.

**Verification:**
- Plan and PR description contain dashboard team's confirmation.
- No further action if token is read-only anonymous as expected.

## System-Wide Impact

- **Interaction graph:** Existing navbar/footer links to `/paraguay` start resolving instead of 404ing. No other code paths affected.
- **Error propagation:** None — page is static. Iframe load failures are surfaced by the browser, not by us.
- **State lifecycle risks:** None.
- **API surface parity:** None.
- **Integration coverage:** Manual smoke test that the externally-hosted dashboard renders inside the iframe is the only meaningful integration assertion; cross-origin restrictions prevent automated assertions on dashboard internals.
- **Unchanged invariants:** Nav-items config (`apps/web/components/navbar/nav-items.ts`) and footer links (`apps/web/components/footer/footer-links.tsx`) are untouched — this plan deliberately does not modify them.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Superset URL or share token rotates | URL lives in env var; ops can swap without code change. |
| `standalone=2` mode changes in Superset upgrade | Out of our team's control; coordinate with dashboard team if regression observed. |
| CSP added later breaks the embed | Unit 4 documents the `frame-src` directive needed; add a comment near the iframe component noting the dependency. |
| Mobile viewport too narrow for Superset | Accepted for v1 (procurement dashboard is desktop-analyst content); revisit if usage data shows mobile traffic. |
| Anonymous Superset access disabled by other team | Page renders Superset's own login/error UI inside the iframe — acceptable for v1; product can revisit if it becomes a blocker. |
| Sandbox breaks Superset interactivity | Smoke-tested in Unit 3 verification; if broken, widen one permission at a time per "Deferred to Implementation". |
| Token grants broader-than-read access | Mitigated by Unit 5 sign-off — halt if token is not read-only anonymous. |
| Layout refactor regresses sibling pages | Additive className change only; visual smoke test in Unit 2 verification covers `/aml`, `/`, `/blog`, `/profile`, `/resources`. |

## Documentation / Operational Notes

- Add `NEXT_PUBLIC_PARAGUAY_DASHBOARD_URL` to any deployment env config (Vercel/infra). Coordinate with ops before merging.
- Mention the new env var in PR description so reviewers know to set it in preview/prod environments.

## Sources & References

- Existing route pattern: `apps/web/app/(main)/aml/page.tsx`
- Main layout: `apps/web/app/(main)/layout.tsx`
- Nav reference: `apps/web/components/navbar/nav-items.ts:19-21`
- Footer reference: `apps/web/components/footer/footer-links.tsx:41-45`
- Env conventions: `.env.example`
