---
title: "feat: Formalize Corpus Design System token layer and adopt tokens across the codebase"
date: 2026-06-24
sequence: "001"
type: feat
depth: Standard
status: draft
---

# feat: Formalize Corpus Design System token layer and adopt tokens across the codebase

## Summary

The `@specus/ui` package already carries a partial design system named "Corpus Design System" in
`globals.css`. The color palette (extended and semantic) is well-defined. What is missing is a
typography scale, shadow/elevation tokens, a semantic token for the teal accent color used
throughout the landing section, and consistent adoption of tokens in components (several components
use hardcoded hex values). This plan formalizes the token layer and enforces adoption across
`packages/ui` and `apps/web`.

---

## Problem Frame

The codebase has a partial design system defined as CSS custom properties in
`packages/ui/styles/globals.css`. The following gaps exist:

1. **Missing token categories**: typography scale (font sizes, weights, line heights), shadow/
   elevation tokens. Tailwind v4 with CSS variables is already in use, making it straightforward to
   add these.
2. **Hardcoded hex values in components**: `#00adb2` appears in six landing components
   (`solutions-grid`, `vision-mission-section`, `coverage-section`, `workflow-section`). This teal
   value does not match any existing token exactly (it sits between `--teal-6` and `--teal-7`).
   `#003F87` appears in `country-flag.tsx`. These bypass the token system entirely.
3. **`--brand` vs `--primary` ambiguity**: `bg-brand` (`#192e49`, dark navy) and `bg-primary`
   (`#033d8b`, brand blue) coexist. The distinction is intentional (CTA brand color vs. interactive
   primary) but undocumented.
4. **Missing `--color-*` Tailwind bridge** for new tokens: existing tokens have bridge variables
   (`--color-primary: var(--primary)`) so Tailwind utilities work. New tokens must follow the same
   pattern.

---

## Requirements

- **R1**: All design token categories — color, typography, radius, shadow — are defined as CSS
  custom properties in `packages/ui/styles/globals.css`.
- **R2**: A semantic `--feature` color token captures the `#00adb2` teal accent so landing
  components can reference it by name, not by hex.
- **R3**: All hardcoded hex values in `apps/web/components/` are replaced with token-based
  Tailwind classes.
- **R4**: `bg-brand` vs `bg-primary` usage follows a documented convention (brand for primary CTA
  surfaces, primary for interactive elements).
- **R5**: New tokens follow the `--color-*` bridge convention so Tailwind utility classes work
  (`text-feature`, `bg-feature/10`, etc.).
- **R6**: Light and dark mode values are provided for every new semantic token.

---

## Key Technical Decisions

**KTD-1: Add `--feature` as a semantic token rather than fixing the teal scale.**
`#00adb2` is used consistently across six landing components for feature icons and accent labels.
Adding a semantic token (`--feature`) is preferable to adjusting the extended teal palette, because
the usage pattern is semantic (a distinct accent role in the product UI), not a palette step.
The token is light-mode `#00adb2` / dark-mode `#2fe0e1` (teal-4, a lighter teal readable on dark
backgrounds).

**KTD-2: Typography tokens as CSS custom properties, not a separate token file.**
Since the project is CSS-variable-first (Tailwind v4, no tailwind.config.js), typography scale
tokens live in `globals.css` alongside color tokens. No `design-tokens.json` or separate package
is needed.

**KTD-3: Shadow tokens follow the semantic naming already used by Tailwind's shadow utilities.**
Add `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` as CSS custom properties mirroring
the values Tailwind ships, exposing them as design tokens for reference.

**KTD-4: `#003F87` in `country-flag.tsx` maps to `--blue-8`.**
`#003F87` (R=0, G=63, B=135) is closest to `--blue-8`. The component uses it as a fallback
background when no flag image is available. Replace with `bg-blue-8` (token-bridged).

---

## Scope Boundaries

### In scope
- `packages/ui/styles/globals.css` — add typography, shadow, feature token definitions.
- `apps/web/components/landing/**` — replace hardcoded `#00adb2` with `text-feature` / `bg-feature`.
- `apps/web/components/aml/country-flag.tsx` — replace `#003F87` with `bg-blue-8`.
- Dark mode values for every new semantic token.

### Deferred to Follow-Up Work
- Admin app (`apps/admin`) token audit — same methodology applies but is a separate engagement.
- Figma token sync or `design-tokens.json` export.
- Spacing scale tokens (Tailwind's default spacing scale is sufficient for now; no custom spacing
  has been defined in the app).
- New component additions or variant changes — this plan does not add or modify component APIs.

### Outside scope
- Redesigning any existing component or layout.
- Adding a documentation app (Storybook, custom Next.js, or otherwise).
- Changing the component library (shadcn/ui stays).

---

## High-Level Technical Design

### Token layer structure (after this plan)

```
packages/ui/styles/globals.css
├── @import tailwindcss / tw-animate-css
├── :root (light mode)
│   ├── Semantic colors          (existing: --primary, --background, etc.)
│   ├── --feature: #00adb2      (NEW — teal accent for feature icons/labels)
│   ├── Typography scale         (NEW — --font-size-*, --font-weight-*, --line-height-*)
│   ├── Shadow tokens            (NEW — --shadow-sm / md / lg / xl)
│   ├── Extended color palette   (existing: --blue-0…9, --teal-0…9, etc.)
│   └── --radius + variants      (existing)
├── .dark
│   ├── Semantic color overrides (existing)
│   └── --feature: #2fe0e1      (NEW — dark mode override, teal-4)
└── @theme inline
    ├── Color bridges            (existing + NEW --color-feature)
    ├── Typography bridges       (NEW — --font-size-*, etc.)
    └── Shadow bridges           (NEW)
```

### Token adoption change surface

```
apps/web/components/
├── landing/
│   ├── solutions-grid.tsx       bg-[#00adb2]/10  →  bg-feature/10
│   │                            text-[#00adb2]   →  text-feature
│   ├── vision-mission-section.tsx  text-[#00adb2]  →  text-feature
│   ├── coverage-section.tsx     bg/text-[#00adb2]  →  bg/text-feature
│   └── workflow-section.tsx     text-[#00adb2]   →  text-feature
└── aml/
    └── country-flag.tsx         bg-[#003F87]     →  bg-blue-8
```

---

## Implementation Units

### U1. Add typography scale tokens

**Goal:** Define a complete typography scale as CSS custom properties in `globals.css`, with
Tailwind bridge variables so utilities like `text-sm` stay functional while custom scale tokens
are also available.

**Requirements:** R1, R5

**Dependencies:** None

**Files:**
- `packages/ui/styles/globals.css`

**Approach:** Add the following token groups under `:root` in the "Corpus Design System" block:

Typography sizes derived from the type scale already in use across `apps/web` components
(`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`):

```
--font-size-xs:   0.75rem   /* 12px */
--font-size-sm:   0.875rem  /* 14px */
--font-size-base: 1rem      /* 16px */
--font-size-lg:   1.125rem  /* 18px */
--font-size-xl:   1.25rem   /* 20px */
--font-size-2xl:  1.5rem    /* 24px */
--font-size-3xl:  1.875rem  /* 30px */
--font-size-4xl:  2.25rem   /* 36px */
--font-size-5xl:  3rem      /* 48px */
```

Font weights in use (normal, semibold, bold observed in components):
```
--font-weight-normal:   400
--font-weight-medium:   500
--font-weight-semibold: 600
--font-weight-bold:     700
```

Line heights observed:
```
--line-height-tight:   1.25
--line-height-snug:    1.375
--line-height-normal:  1.5
--line-height-relaxed: 1.625
```

Add `@theme inline` bridge entries (`--font-size-sm: var(--font-size-sm)` etc.) so Tailwind
utility generation continues to work. Typography tokens do not need dark mode overrides.

**Patterns to follow:** Existing `--color-*` bridge pattern in `globals.css` `@theme inline` block.

**Test scenarios:**
- Test expectation: none — this unit is pure CSS token additions with no behavioral change.
  Visual verification: the existing landing page renders identically before and after (tokens are
  additive, not replacing existing Tailwind utilities).

**Verification:** Run `pnpm build` from repo root; zero TypeScript or build errors. Visual spot-
check of the web app confirms no regressions.

---

### U2. Add shadow and `--feature` semantic tokens

**Goal:** Add shadow/elevation tokens and the `--feature` teal semantic token (light and dark mode)
with Tailwind bridge variables.

**Requirements:** R1, R2, R5, R6

**Dependencies:** U1 (same file edit; sequence to avoid conflicts)

**Files:**
- `packages/ui/styles/globals.css`

**Approach:**

Shadow tokens under `:root`:
```
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

Feature semantic token:
```css
/* :root */
--feature: #00adb2;

/* .dark */
--feature: #2fe0e1;  /* teal-4 — readable on dark backgrounds */
```

`@theme inline` bridge:
```
--color-feature: var(--feature);
--shadow-sm: var(--shadow-sm);
/* … etc */
```

This makes `text-feature`, `bg-feature`, `bg-feature/10`, `shadow-sm` etc. work as Tailwind
classes.

**Patterns to follow:** `--color-primary: var(--primary)` bridge pattern in `@theme inline`.

**Test scenarios:**
- Test expectation: none — additive CSS only. Verify with visual spot-check and `pnpm build`.
- Dark mode: toggle dark class on `<html>` and confirm `--feature` resolves to `#2fe0e1`.

**Verification:** `pnpm build` passes. Browser devtools confirm `--feature` and `--color-feature`
resolve correctly in both light and dark mode.

---

### U3. Replace hardcoded hex values with token-based classes

**Goal:** Replace all hardcoded hex color values in `apps/web/components/` with Tailwind classes
backed by design tokens.

**Requirements:** R3, R4

**Dependencies:** U2 (the `--feature` and `--blue-*` tokens must exist before this compiles)

**Files:**
- `apps/web/components/landing/solutions-grid.tsx`
- `apps/web/components/landing/vision-mission-section.tsx`
- `apps/web/components/landing/coverage-section.tsx`
- `apps/web/components/landing/workflow-section.tsx`
- `apps/web/components/aml/country-flag.tsx`

**Approach:**

| File | Old class | New class |
|---|---|---|
| `solutions-grid.tsx` | `bg-[#00adb2]/10` | `bg-feature/10` |
| `solutions-grid.tsx` | `text-[#00adb2]` | `text-feature` |
| `vision-mission-section.tsx` | `text-[#00adb2]` | `text-feature` |
| `coverage-section.tsx` | `bg-[#00adb2]/10` | `bg-feature/10` |
| `coverage-section.tsx` | `text-[#00adb2]` | `text-feature` |
| `workflow-section.tsx` | `text-[#00adb2]` | `text-feature` |
| `country-flag.tsx` | `bg-[#003F87]` | `bg-blue-8` |

No logic changes — only className string replacements.

**Patterns to follow:** Existing uses of `text-muted-foreground`, `bg-primary`, `text-feature` are
the model for semantic token class usage.

**Test scenarios:**
- Landing page: all feature icon containers render with the same teal background and icon color as
  before.
- Vision-mission, coverage, workflow sections: label text is the same teal tone in light mode.
- Dark mode: feature icon color and label color switch to `#2fe0e1` (teal-4) — visually lighter
  than the light-mode value.
- AML country-flag: the no-image fallback container renders the correct deep blue background.
- Run existing visual/component tests: `pnpm test --filter=@specus/web` — zero regressions.

**Verification:** `pnpm build` passes. Manual visual check of `/` and `/aml` routes confirms
rendering matches the previous appearance in light mode. Dark mode toggle shows correct feature
color change.

---

## Risks and Dependencies

| Risk | Likelihood | Mitigation |
|---|---|---|
| Tailwind v4 bridge syntax differs from v3 — `@theme inline` variable forwarding may need adjustment | Low | `globals.css` already uses this pattern for existing color tokens; follow exact same syntax |
| `#00adb2` shade differs visually from `--feature: #00adb2` after token round-trip | Very low | Exact same hex value; no conversion |
| Dark mode `--feature: #2fe0e1` is too bright on some dark backgrounds | Low | Teal-4 is the standard accessible light teal in the palette; adjust to teal-3 if review shows oversaturation |
| Admin app has its own globals.css that does not inherit these additions | Note | Admin uses `@specus/ui/styles/globals.css` via import (same file), so changes apply automatically |

---

## Open Questions

- **`border-secondary` on landing cards**: `solutions-grid.tsx` uses `border-secondary` which maps
  to `#f1f5f9` (very light gray). This appears intentional but produces a nearly invisible border
  in light mode. Deferred — outside this plan's scope.
- **`p-[17px]` arbitrary spacing**: several landing cards use `p-[17px]`. Once spacing tokens are
  added in a follow-up, these should map to the nearest spacing step.

---

## Sources and Research

- `packages/ui/styles/globals.css` — existing token definitions
- `apps/web/components/landing/*.tsx` — hardcoded color audit
- `apps/web/components/aml/country-flag.tsx` — hardcoded color audit
- Tailwind CSS v4 docs (CSS-first configuration with `@theme inline`)
