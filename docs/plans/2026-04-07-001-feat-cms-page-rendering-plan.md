---
title: "feat: CMS page rendering on web frontend"
type: feat
status: completed
date: 2026-04-07
---

# feat: CMS page rendering on web frontend

## Overview

Add public CMS page rendering to the web app (`apps/web`). Static pages resolve dynamically via a catch-all `[...slug]` route backed by the backend's `publicResolvePagePath` API. Blog posts get a dedicated listing at `/blog` and detail pages at `/blog/[slug]`. All pages are server-rendered for SEO with `generateMetadata()`. Body content renders as plain text for now (Editor.js planned separately).

## Problem Frame

The admin dashboard can create and publish CMS content (static pages, blog posts), but the web frontend has no way to display it. Published content is served by the backend's public CMS API (`/api/v1/cms/*`) which requires no authentication. The web app needs routes that resolve URLs to CMS content and render them with proper SEO metadata.

## Requirements Trace

- R1. Static pages accessible via their slug path (e.g., `/about`, `/team`) using catch-all route resolution
- R2. Blog listing page at `/blog` with cursor-based pagination
- R3. Blog detail page at `/blog/[slug]` with full content
- R4. SEO metadata (`generateMetadata`) using CMS content's `meta_title`, `meta_description`, `og_image_url`
- R5. Proper 404 handling when content doesn't exist or isn't published
- R6. Server-side rendering (RSC) for all CMS pages — no client-side data fetching
- R7. Match existing web app design patterns (container widths, typography, navbar/footer shell)

## Scope Boundaries

- **No rich text / Editor.js rendering** — body renders as plain text with whitespace preservation. Editor.js integration is a separate future plan
- **No flexible_page rendering** — only `static_page` and `blog_post` content types. Flexible pages can be added later when page type templates are defined
- **No category/tag filtering on blog** — initial blog listing shows all published posts. Filtering can be added later
- **No navbar integration** — static pages are accessible by URL but not automatically added to the navbar. Nav items remain hardcoded for now

## Context & Research

### Relevant Code and Patterns

- `apps/web/app/(main)/layout.tsx` — navbar + `<main>` + footer shell. All CMS pages go inside `(main)/`
- `apps/web/app/(main)/profile/page.tsx` — server component pattern to follow (direct SDK call, no useEffect)
- `apps/web/app/(main)/not-found.tsx` — 404 page pattern (client component with back button)
- `apps/web/app/(main)/auth/layout.tsx` — metadata template pattern (`title.template: '%s - Specus'`)
- `apps/web/app/(main)/aml/search/page.tsx` — container width pattern (`max-w-7xl mx-auto px-4 md:px-8`)
- `apps/web/components/aml/` — feature component organization pattern

### Public CMS API Surface

| Function | URL | Params | Returns |
|----------|-----|--------|---------|
| `publicResolvePagePath` | `GET /api/v1/cms/pages/resolve?path=` | `path` (e.g., `/about/team`) | `CmsContent` (full with body) |
| `publicGetContentByTypeAndSlug` | `GET /api/v1/cms/contents/{content_type}/{slug}` | `content_type`, `slug` | `CmsContent` |
| `publicListContents` | `GET /api/v1/cms/contents` | `content_type?`, `cursor?`, `page_size?` | `CmsContentListResponse` |
| `publicGetAuthorBySlug` | `GET /api/v1/cms/authors/{slug}` | `slug` | `CmsAuthor` |

Key types: `CmsContent` has `title`, `slug`, `body?`, `excerpt?`, `author?`, `categories?`, `tags?`, `meta_title?`, `meta_description?`, `og_image_url?`, `published_at?`

## Key Technical Decisions

- **Server components (RSC) for all CMS pages**: CMS content is public, cacheable, and SEO-critical. Server components allow `generateMetadata()` and avoid client-side loading spinners. The SDK works server-side since `NEXT_PUBLIC_API_BASE_URL` is available at build time.
- **Catch-all `[...slug]` for static pages**: The backend's `publicResolvePagePath` resolves any URL path to a content item. This means pages created in the admin are instantly accessible without frontend code changes. The catch-all route sits at `app/(main)/[...slug]/page.tsx`.
- **Separate `/blog` route (not catch-all)**: Blog posts have different layout needs (listing page, author attribution, date display) and shouldn't conflict with the catch-all static page resolution. Explicit `/blog` and `/blog/[slug]` routes handle this cleanly.
- **Plain text body rendering**: The body field will eventually use Editor.js blocks. For now, render as `<pre className="whitespace-pre-wrap">` to preserve formatting without introducing a temporary markdown dependency.
- **Route priority**: Next.js resolves explicit routes before catch-all routes. So `/blog`, `/aml`, `/auth/*`, `/profile` all take precedence over `[...slug]`. Only unmatched paths fall through to the CMS catch-all.

## Open Questions

### Resolved During Planning

- **Body rendering?** Plain text for now. Editor.js planned separately.
- **Static page routing?** Catch-all `[...slug]` with backend resolution.
- **Auth needed?** No — public CMS API requires no authentication.
- **Navbar changes?** No — nav items stay hardcoded.

### Deferred to Implementation

- **Cache/revalidation strategy**: Whether to use `revalidate` or `force-dynamic`. Determine based on testing. Start with no caching (dynamic) and add ISR later if needed.
- **Catch-all conflict with existing routes**: Verify that `/aml`, `/auth/*`, `/profile` don't accidentally match the catch-all. Next.js should handle this via route priority, but test during implementation.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification.*

```
app/(main)/
  [...slug]/
    page.tsx              ← Catch-all: resolves path via publicResolvePagePath
    not-found.tsx         ← 404 for unresolved paths
  blog/
    page.tsx              ← Blog listing with pagination
    [slug]/
      page.tsx            ← Single blog post
      not-found.tsx       ← 404 for missing posts

components/
  cms/
    content-body.tsx      ← Renders body text (plain text for now, swap for Editor.js later)
    blog-card.tsx         ← Card for blog listing items
    content-header.tsx    ← Title, author, date, categories/tags
```

## Implementation Units

- [ ] **Unit 1: Static page catch-all route**

  **Goal:** Render CMS static pages at any URL path via backend resolution.

  **Requirements:** R1, R4, R5, R6, R7

  **Dependencies:** None

  **Files:**
  - Create: `apps/web/app/(main)/[...slug]/page.tsx`
  - Create: `apps/web/app/(main)/[...slug]/not-found.tsx`
  - Create: `apps/web/components/cms/content-body.tsx`
  - Create: `apps/web/components/cms/content-header.tsx`

  **Approach:**
  - Server component that joins the `slug` segments into a path string (`/about/team`)
  - Calls `publicResolvePagePath({ query: { path } })` server-side
  - If the API returns 404 or no data, call `notFound()` from `next/navigation`
  - `generateMetadata()` uses `meta_title` → title, `meta_description` → description, `og_image_url` → openGraph images. Falls back to `title` and `excerpt` if meta fields are empty
  - Layout: `max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-12` (narrower than full-width for readability)
  - `ContentHeader`: renders title (h1), published date, author name if present
  - `ContentBody`: renders `body` in a `<div className="prose">` or plain `whitespace-pre-wrap` container. This component is the future swap point for Editor.js
  - The not-found page follows the existing `apps/web/app/(main)/not-found.tsx` pattern

  **Patterns to follow:**
  - `apps/web/app/(main)/profile/page.tsx` — server component with direct SDK call
  - `apps/web/app/(main)/not-found.tsx` — 404 page styling
  - `apps/web/app/(main)/auth/layout.tsx` — `generateMetadata` pattern

  **Test scenarios:**
  - Happy path: Navigate to `/about` → backend resolves to published static_page → renders title + body
  - Happy path: Navigate to `/about/team` (nested path) → resolves correctly
  - Happy path: Page has meta_title and og_image_url → metadata uses CMS values
  - Edge case: Page has no meta_title → falls back to content title
  - Error path: Navigate to `/nonexistent-page` → backend returns 404 → Next.js not-found page shown
  - Edge case: Navigate to `/aml` → does NOT hit catch-all (explicit route takes priority)

  **Verification:**
  - Static pages created in admin are accessible on the web frontend by their slug path
  - SEO metadata renders correctly (check page source)
  - Non-existent paths show the 404 page

---

- [ ] **Unit 2: Blog listing page**

  **Goal:** Show a paginated list of published blog posts at `/blog`.

  **Requirements:** R2, R4, R6, R7

  **Dependencies:** None (can be parallel with Unit 1)

  **Files:**
  - Create: `apps/web/app/(main)/blog/page.tsx`
  - Create: `apps/web/components/cms/blog-card.tsx`

  **Approach:**
  - Server component that calls `publicListContents({ query: { content_type: 'blog_post', page_size: 12 } })`
  - Static metadata: `title: 'Blog'`, `description: 'Latest articles and updates'`
  - Blog card: shows title, excerpt (truncated), author name, published date, categories as badges
  - Card links to `/blog/{slug}`
  - Responsive grid: 1 col mobile, 2 cols md, 3 cols lg
  - Empty state if no blog posts exist
  - Cursor pagination: "Load More" button at bottom (client component island for the button + fetch-more logic, page itself stays RSC for initial load)

  **Patterns to follow:**
  - `apps/web/app/(main)/aml/search/page.tsx` — container width, grid layout
  - `apps/web/components/aml/entity-item.tsx` — card item pattern

  **Test scenarios:**
  - Happy path: Blog listing loads with published posts in a grid
  - Happy path: Each card shows title, excerpt, author, date
  - Edge case: No blog posts → empty state message
  - Edge case: "Load More" fetches next page and appends
  - Edge case: Last page (has_more=false) → "Load More" hidden

  **Verification:**
  - `/blog` shows published blog posts in a responsive grid
  - Cards link to individual post pages

---

- [ ] **Unit 3: Blog detail page**

  **Goal:** Render a single blog post with full content at `/blog/[slug]`.

  **Requirements:** R3, R4, R5, R6, R7

  **Dependencies:** Unit 1 (reuses `ContentBody` and `ContentHeader` components)

  **Files:**
  - Create: `apps/web/app/(main)/blog/[slug]/page.tsx`
  - Create: `apps/web/app/(main)/blog/[slug]/not-found.tsx`

  **Approach:**
  - Server component that calls `publicGetContentByTypeAndSlug({ path: { content_type: 'blog_post', slug } })`
  - `generateMetadata()` with CMS meta fields, same pattern as Unit 1
  - Layout: `max-w-3xl mx-auto px-4 py-8 md:px-8 md:py-12` (article-width for readability)
  - Reuses `ContentHeader` (title, author, date, categories/tags) and `ContentBody` from Unit 1
  - Back link to `/blog` at top
  - If API returns 404 → `notFound()`

  **Patterns to follow:**
  - Unit 1's `[...slug]/page.tsx` — same server component + generateMetadata pattern
  - `apps/web/app/(main)/not-found.tsx` — 404 styling

  **Test scenarios:**
  - Happy path: Navigate to `/blog/my-post` → renders full blog post with title, author, body
  - Happy path: Metadata includes post's meta_title and og_image_url
  - Error path: Navigate to `/blog/nonexistent` → 404 page
  - Edge case: Post has no author → author section not shown
  - Edge case: Post has categories and tags → rendered as badges below title

  **Verification:**
  - Individual blog posts render with full content
  - SEO metadata is correct per post
  - Non-existent slugs show 404

## System-Wide Impact

- **Interaction graph:** The catch-all `[...slug]` route intercepts any unmatched path under `(main)/`. Existing explicit routes (`/aml`, `/auth/*`, `/profile`, `/blog`) take priority per Next.js route resolution. No middleware changes needed — CMS pages are public.
- **Error propagation:** API errors in server components (backend unreachable) will trigger the nearest `error.tsx` boundary. Currently no `error.tsx` exists in `(main)/` — the catch-all and blog routes should handle errors gracefully with try/catch + `notFound()` rather than throwing.
- **Unchanged invariants:** Navbar, footer, auth, AML pages — none are modified. The web app's root layout, middleware, and existing routes are untouched.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Catch-all route accidentally matches existing paths like `/aml` or `/profile` | Next.js resolves explicit routes before catch-all. Test during implementation to confirm |
| Backend `publicResolvePagePath` not deployed yet | Test against running backend early. If not available, the catch-all route gracefully 404s |
| Body content looks bad as plain text | This is intentional — Editor.js rendering planned separately. Plain text is a placeholder |

## Sources & References

- Related code: `apps/web/app/(main)/` (route patterns), `packages/api-client/src/generated/` (CMS SDK)
- Backend specs: `publicResolvePagePath`, `publicGetContentByTypeAndSlug`, `publicListContents`
