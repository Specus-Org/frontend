---
title: 'feat: Build Specus marketing landing page'
type: feat
status: completed
date: 2026-04-13
---

# feat: Build Specus marketing landing page

## Overview

Replace the placeholder homepage at `apps/web/app/(main)/page.tsx` with a polished marketing landing page that introduces Specus, explains its procurement intelligence value proposition, builds trust through product proof points and data-source credibility, and drives visitors toward contact and sales conversion. The page should feel bespoke to the current Specus brand system rather than like a generic SaaS template, while staying inside the existing `(main)` web shell with the current navbar and footer.

## Problem Frame

The public homepage is still a minimal "Under Development" placeholder, which leaves the product without a credible first impression despite the rest of the web app already having a real navigation shell, metadata, and product routes such as `/aml`, `/resources`, and CMS-backed pages. The requested change is not just to fill space, but to establish a strong landing experience that clearly communicates:

- What Specus does
- Why procurement and compliance teams should trust it
- How the platform works in practice
- Which concrete capabilities and coverage areas differentiate it
- How interested buyers should take the next step

Because there is no upstream brainstorm document, this plan uses the user-supplied brand, mission, principles, solutions, workflow, roadmap, and contact data as the source of truth for the landing page content architecture.

## Requirements Trace

- R1. Replace the placeholder homepage with a fully designed landing page for Specus.
- R2. Present Specus as a procurement intelligence and compliance platform with a strong trust-oriented narrative.
- R3. Incorporate the provided mission, vision, principles, solutions, workflow, data sources, roadmap, slogan, and contact information into clear page sections.
- R4. Highlight the strongest proof points prominently: `200+` countries covered, `3` integrated data sources, and `<5s` screening speed.
- R5. Showcase the six solution pillars: Sanction Screening, AML Compliance, Procurement Intelligence, Risk Analytics, Compliance Reporting, and Global Coverage.
- R6. Explain the user journey from vendor input to automated searching to actionable intelligence.
- R7. Present the 2026 roadmap in a way that supports credibility without overpowering the core conversion story.
- R8. Preserve responsive behavior and accessibility across mobile and desktop.
- R9. Fit the implementation into the existing Next.js app structure, design tokens, navbar, and footer.
- R10. Add regression coverage for the landing-page content structure and key calls to action.

## Scope Boundaries

- No CMS-driven homepage migration in this pass; `/` remains a bespoke app route, not a resolved CMS page.
- No navbar or footer redesign beyond any small adjustments needed for homepage visual cohesion.
- No new backend endpoints, analytics wiring, form submission backend, or CRM integration.
- No new animation library; motion should use existing CSS/Tailwind capabilities unless implementation discovers a compelling lightweight need.
- No attempt to reconcile all product naming ambiguities in code beyond safe copy assumptions documented below.

## Context & Research

### Relevant Code and Patterns

- `apps/web/app/(main)/page.tsx` is the current homepage route and already isolates the exact surface to replace.
- `apps/web/app/(main)/layout.tsx` wraps the homepage with `Navbar` and `Footer`, so the landing page should treat those as fixed shell boundaries.
- `apps/web/app/(main)/aml/page.tsx` shows an existing large-format hero pattern with centered messaging and a product-first tone.
- `apps/web/app/(main)/resources/page.tsx` shows the current page container rhythm (`max-w-7xl`, `px-4`, `md:px-8`) used across the web app.
- `apps/web/components/navbar.tsx` and `apps/web/components/footer.tsx` confirm that the homepage sits inside a lightweight shared shell and should not duplicate primary navigation or footer CTA content.
- `packages/ui/src/components/button.tsx`, `card.tsx`, `badge.tsx`, and related UI exports provide existing primitives that should anchor the landing page instead of introducing ad hoc button/card variants.
- `apps/web/components/footer/footer.test.tsx` and `apps/web/components/footer/footer-links.test.tsx` establish the current Vitest + React Testing Library pattern in `apps/web`.

### Institutional Learnings

- No `docs/solutions/` entries exist in this repo, so there are no stored institutional learnings to inherit for this page.

### External References

- None. This work is primarily about fitting user-provided marketing content into the repo's existing frontend architecture and design system. The codebase already provides adequate structural patterns for a bounded landing-page build.

## Key Technical Decisions

- **Keep the landing page as a server-rendered homepage route**: Continue using `apps/web/app/(main)/page.tsx` as the entry point so the page stays SEO-friendly and consistent with the current App Router structure.
- **Break the page into landing-specific components**: Create a small set of `apps/web/components/landing/*` sections so the homepage remains readable and future edits to messaging do not turn `page.tsx` into a monolith.
- **Use content constants rather than hardcoding long copy inline**: Centralize metrics, solution cards, principles, workflow steps, roadmap entries, and contact links in a landing-page content module so copy changes do not require hunting through JSX.
- **Design within the existing token system, but elevate the composition**: Reuse the established Tailwind 4 tokens from `packages/ui/styles/globals.css`, while introducing a more premium visual hierarchy through layout, section backgrounds, stat framing, and typography cadence.
- **Use primary CTA links, not a net-new contact form**: With no backend/contact automation in scope, CTAs should route to stable destinations such as `mailto:hello@specus.org`, the external website, or relevant internal product pages.
- **Treat `Specus` as the primary brand in page-level copy**: The provided copy references both `Specus` and `Procure Lens`; for this implementation plan, the page should center `Specus` as the product brand and treat other naming as supporting language only if it can be done cleanly without confusing visitors.

## Open Questions

### Resolved During Planning

- **Should the homepage be CMS-driven now?** No. Keep `/` bespoke and route-owned in `apps/web/app/(main)/page.tsx`.
- **Should the landing page include a live product workflow?** Yes, but as explanatory content and CTA links, not a full interactive demo.
- **Should the implementation introduce new UI primitives?** No. Prefer composition with existing `@specus/ui` building blocks and Tailwind utilities.
- **How should the brand inconsistency be handled?** Use `Specus` as the primary product name and keep any `Procure Lens` reference secondary so implementation does not ship contradictory hero copy.

### Deferred to Implementation

- **Exact CTA targets in the navbar and hero**: Final link destinations can be refined once implementation sees the current live routes and decides whether `/aml`, external website links, or email CTAs create the clearest path.
- **Whether the homepage needs small navbar visual tweaks**: Implementation may discover that the landing-page hero needs a transparent, sticky, or more spacious navbar treatment; keep such changes minimal and scoped to homepage cohesion.
- **Final motion intensity**: The exact reveal and hover treatments should be tuned during implementation after the composed page is visible in-browser.

## High-Level Technical Design

> _This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce._

```text
apps/web/app/(main)/page.tsx
  -> imports landing content + landing section components
  -> renders sections in narrative order:
     1. Hero
     2. Trust / proof metrics strip
     3. Mission + principles
     4. Solutions grid
     5. How it works
     6. Data sources / global coverage
     7. Roadmap
     8. Closing CTA / contact

apps/web/components/landing/
  landing-hero.tsx
  trust-strip.tsx
  principles-section.tsx
  solutions-grid.tsx
  workflow-section.tsx
  roadmap-section.tsx
  contact-cta.tsx

apps/web/lib/
  landing-content.ts
```

## Implementation Units

- [x] **Unit 1: Establish landing-page content contract and page shell**

**Goal:** Replace the placeholder homepage with a structured landing-page entry point and a reusable content source for all major sections.

**Requirements:** R1, R2, R3, R4, R9

**Dependencies:** None

**Files:**

- Modify: `apps/web/app/(main)/page.tsx`
- Create: `apps/web/lib/landing-content.ts`
- Test: `apps/web/app/(main)/page.test.tsx`

**Approach:**

- Replace the current placeholder JSX with a homepage composition that imports landing content and section components.
- Create a typed content module holding the hero copy, primary metrics, principles, solution definitions, workflow steps, roadmap milestones, trusted data sources, and contact links.
- Keep `page.tsx` responsible for section order and metadata-friendly composition, while pushing large copy arrays and structured content into the content module.
- Ensure the top of the page immediately communicates the product category, proof metrics, and primary CTA rather than burying the core value proposition below the fold.

**Patterns to follow:**

- `apps/web/app/(main)/aml/page.tsx` for hero-scale typography and centered opening composition.
- `apps/web/app/(main)/resources/page.tsx` for spacing and container usage.
- `apps/web/app/layout.tsx` for current metadata posture and product naming.

**Test scenarios:**

- Happy path: homepage render includes the primary `Specus` brand heading, main value proposition, and at least one primary CTA.
- Happy path: homepage render includes the three proof metrics `200+`, `3`, and `<5s` in visible landing content.
- Edge case: content module arrays are iterated safely and do not break render order when optional descriptive copy is absent.
- Integration: page composition renders inside the existing `(main)` layout without duplicating navbar or footer content in the page body.

**Verification:**

- The homepage route no longer shows placeholder copy.
- The page source has a clean, section-based structure that future contributors can edit without unpacking a single large component.
- [x] **Unit 2: Build the hero, trust, and brand-foundation sections**

**Goal:** Create the top-of-page experience that sells the product quickly and establishes credibility before visitors scroll into deeper feature detail.

**Requirements:** R2, R3, R4, R8, R9

**Dependencies:** Unit 1

**Files:**

- Create: `apps/web/components/landing/landing-hero.tsx`
- Create: `apps/web/components/landing/trust-strip.tsx`
- Create: `apps/web/components/landing/principles-section.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/(main)/page.tsx`
- Test: `apps/web/components/landing/landing-hero.test.tsx`

**Approach:**

- Design a strong hero with layered background treatment, concise tagline, supporting paragraph, primary CTA, and secondary CTA.
- Pair the hero with a trust strip or stat row that foregrounds the strongest proof points and trusted data-source references.
- Introduce a compact mission/vision bridge near the top of the page so the user-provided purpose statements anchor the rest of the landing narrative.
- Add a principles section that translates Integrity, Collaboration, Innovation, and Vigilance into short, scannable cards or columns.
- Use the existing design tokens but add landing-page-specific utility classes or CSS variables where needed for richer section backgrounds, gradients, and spacing rhythm.
- Ensure the first screen works on mobile without collapsing into an unreadable text wall or forcing all trust signals below the fold.

**Technical design:** _(directional guidance, not implementation specification)_

- Hero should prioritize a left-aligned or split-layout composition on desktop, with proof metrics either embedded beneath the headline or immediately below as a trust strip.
- The principles section should read as brand foundation, not feature list repetition.

**Patterns to follow:**

- `apps/web/app/(main)/aml/page.tsx` for large-format product messaging.
- `packages/ui/src/components/button.tsx` and `badge.tsx` for CTA and micro-label styling.
- `packages/ui/styles/globals.css` for token usage instead of introducing arbitrary color values everywhere.

**Test scenarios:**

- Happy path: hero renders primary and secondary CTAs with accessible names and valid destinations.
- Happy path: the principles section renders all four principle cards in the intended order.
- Edge case: hero supporting copy wraps cleanly for narrow mobile widths without hiding the CTAs.
- Integration: trust strip content remains visible and semantically associated with the page opening rather than drifting below unrelated sections.

**Verification:**

- The top of the homepage clearly communicates product, credibility, and next action in one glance on desktop and mobile.
- The design feels intentionally branded rather than like a reused placeholder card stack.
- [x] **Unit 3: Implement solutions, workflow, coverage, and roadmap storytelling**

**Goal:** Translate the user's product detail into mid-page sections that explain what Specus offers, how it works, and why teams can rely on it over time.

**Requirements:** R3, R5, R6, R7, R8, R9

**Dependencies:** Units 1 and 2

**Files:**

- Create: `apps/web/components/landing/solutions-grid.tsx`
- Create: `apps/web/components/landing/workflow-section.tsx`
- Create: `apps/web/components/landing/coverage-section.tsx`
- Create: `apps/web/components/landing/roadmap-section.tsx`
- Modify: `apps/web/app/(main)/page.tsx`
- Test: `apps/web/components/landing/solutions-grid.test.tsx`
- Test: `apps/web/components/landing/storytelling-sections.test.tsx`

**Approach:**

- Present the six solution pillars as a structured feature grid with short benefit-focused descriptions and bullet-level capability detail.
- Build a "How it works" section that maps cleanly to the three provided workflow stages: upload/search vendor details, automated multi-source search, actionable intelligence output.
- Add a coverage/data-source section to reinforce the `360-degree` narrative, tying together Keyping, Lexicon, E-PMS, global coverage, and continuous monitoring.
- Represent the roadmap as a clear quarterly timeline or milestone grid that communicates momentum without feeling like an investor deck dropped into the middle of the page.
- Maintain narrative pacing so feature detail, workflow explanation, and roadmap credibility each have a distinct role instead of repeating similar cards with different labels.

**Patterns to follow:**

- `apps/web/app/(main)/resources/page.tsx` for repeatable grid composition and empty-state spacing rhythm.
- `packages/ui/src/components/card.tsx` for feature/roadmap card foundations.
- Existing web-app typography and spacing conventions for readable section rhythm.

**Test scenarios:**

- Happy path: all six solution categories render with their section titles and supporting capability bullets.
- Happy path: workflow section renders the three-step process in the intended sequence.
- Happy path: roadmap section renders Q1 through Q4 milestones with each quarter's listed initiatives.
- Edge case: long solution bullet text wraps without collapsing card alignment or truncating critical content.
- Integration: coverage/data-source messaging includes Keyping, Lexicon, and E-PMS alongside global coverage and continuous monitoring claims.

**Verification:**

- A first-time visitor can understand the product capabilities, operating model, and maturity trajectory without leaving the homepage.
- Mid-page sections feel cohesive and progressively informative rather than like disconnected marketing blocks.
- [x] **Unit 4: Finish the closing conversion section, responsive polish, and regression coverage**

**Goal:** Land the page with a strong contact-oriented close, verify responsive behavior, and protect the new homepage structure with focused tests.

**Requirements:** R8, R9, R10

**Dependencies:** Units 1, 2, and 3

**Files:**

- Create: `apps/web/components/landing/contact-cta.tsx`
- Create: `apps/web/components/landing/contact-cta.test.tsx`
- Modify: `apps/web/app/(main)/page.tsx`
- Test: `apps/web/app/(main)/page.test.tsx`

**Approach:**

- Add a closing CTA section that uses the slogan, direct contact routes, and a compact restatement of the platform promise.
- Use stable CTA endpoints that fit current scope: `mailto:hello@specus.org`, external site link to `https://specus.biz`, and a placeholder LinkedIn destination that is easy to replace later.
- Confirm spacing, stacking, and section transitions across mobile and desktop, including the visual handoff into the existing footer.
- Reuse the existing `apps/web` Vitest setup to cover homepage render structure, CTA presence, and key content groups without overbuilding snapshot-heavy tests.
- Keep test coverage focused on stable content landmarks and semantic roles so future copy edits do not create noisy failures.

**Execution note:** Start with a failing homepage render test that asserts the new content landmarks and CTA links, then implement the closing conversion section and final page composition against those expectations.

**Patterns to follow:**

- `apps/web/components/footer/footer.test.tsx` and `apps/web/components/footer/footer-links.test.tsx` for current test style.
- `apps/web/components/footer.tsx` for page-to-footer spacing expectations at the end of a public route.

**Test scenarios:**

- Happy path: closing CTA section renders the contact email and external site link with accessible names and valid `href` values.
- Happy path: homepage render includes mission-aligned headline copy plus a closing conversion section near the footer boundary.
- Edge case: external links render safely and do not replace the internal navigation shell.
- Edge case: placeholder LinkedIn link can be rendered in a way that is clearly temporary without breaking layout or accessibility.
- Integration: the homepage retains the shared navbar and footer while rendering all major landing sections in sequence.

**Verification:**

- The landing page ends with a clear next step instead of an abrupt drop into the footer.
- Focused tests protect the main homepage landmarks, metrics, and CTA destinations.

## System-Wide Impact

- **Interaction graph:** `apps/web/app/(main)/layout.tsx` continues to own shell composition, while `apps/web/app/(main)/page.tsx` becomes an orchestrator for landing-specific section components and static content data.
- **Error propagation:** This page is primarily static composition, so the main risks are render-time copy/data mistakes rather than runtime service failures.
- **State lifecycle risks:** There is little live state, but responsive layout regressions and CTA-link drift are the main maintenance risks as content evolves.
- **API surface parity:** No new public API surface is introduced; the landing page should continue to coexist cleanly with `/aml`, `/resources`, auth routes, and CMS routes.
- **Integration coverage:** Verify the homepage in the context of the existing navbar and footer, not just as isolated section components.
- **Unchanged invariants:** Existing shared layout ownership, footer CMS behavior, navbar structure, and other explicit routes remain unchanged.

## Risks & Dependencies

| Risk                                                                              | Mitigation                                                                                                                                          |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Landing page drifts into generic SaaS-template design                             | Anchor the implementation in the provided mission, principles, data-source trust signals, and existing brand tokens rather than generic filler copy |
| Long supplied content overwhelms the page and hurts scanability                   | Normalize content into concise cards, metrics, and section summaries inside `apps/web/lib/landing-content.ts`                                       |
| Brand-name inconsistency (`Specus` vs `Procure Lens`) creates confusing hero copy | Treat `Specus` as primary brand and keep other naming secondary until the product language is clarified                                             |
| Homepage-specific styling leaks into other pages                                  | Scope any new CSS helpers to landing-page classes or page-local composition patterns                                                                |
| Tests become too brittle for future copy refinement                               | Assert section landmarks, key proof points, and CTA destinations rather than exact paragraph text everywhere                                        |

## Documentation / Operational Notes

- No backend rollout or operational work is required.
- If implementation settles on a final content source or brand-language convention, add a short note near `apps/web/lib/landing-content.ts` so future homepage edits follow the same structure.
- If the dummy LinkedIn link remains in implementation, leave a clear TODO or content comment so it can be replaced before broader marketing use.

## Sources & References

- Related code: `apps/web/app/(main)/page.tsx`
- Related code: `apps/web/app/(main)/layout.tsx`
- Related code: `apps/web/app/(main)/aml/page.tsx`
- Related code: `apps/web/app/(main)/resources/page.tsx`
- Related code: `apps/web/components/navbar.tsx`
- Related code: `apps/web/components/footer.tsx`
- Related code: `apps/web/components/footer/footer.test.tsx`
- Related code: `packages/ui/src/components/button.tsx`
- Related code: `packages/ui/src/components/card.tsx`
- Related code: `packages/ui/styles/globals.css`
