---
title: "feat: Admin Dashboard with Auth, Sidebar Layout, and CMS Management"
type: feat
status: completed
date: 2026-04-06
deepened: 2026-04-06
---

# feat: Admin Dashboard with Auth, Sidebar Layout, and CMS Management

## Overview

Build the Specus admin dashboard from its current skeleton state into a fully functional admin panel. The dashboard provides CMS content management (blog posts, static pages, flexible pages with draft/scheduled/published workflows), author/category/tag management, file uploads, system health monitoring, and AML screening source oversight — all behind backend-proxied Authentik authentication. Uses a sidebar-based layout with dark/light theme support, built entirely on the shared `@specus/ui` design system.

## Problem Frame

The admin app at `apps/admin/` is a bare skeleton (placeholder page, no layout, no auth, no navigation). Specus needs an internal admin tool for managing CMS content and monitoring the platform. The backend already provides a complete set of admin APIs (`/api/v1/admin/cms/*`) and backend-proxied auth endpoints (`/api/v1/auth/*`) — but the frontend has no generated client for these APIs and no UI to consume them. The generated `@specus/api-client` is out-of-date: it only covers the screening endpoints from `openapi.yaml` and stale User endpoints from a deleted branch. The auth and CMS admin specs (`auth.yaml`, `cms-admin.yaml`) need to be integrated into the code generation pipeline.

## Requirements Trace

- R1. Authenticate admins via backend-proxied Authentik endpoints (email/password login, token refresh, logout)
- R2. Protect all dashboard routes — unauthenticated users redirected to login
- R3. Sidebar-based navigation layout with collapsible state (icon mode)
- R4. Dark/light theme toggle with persistent preference
- R5. Dashboard overview page with available metrics (sources count, content counts, system health)
- R6. CMS content management — list, create, edit, delete with status workflows (draft → published → scheduled)
- R7. CMS taxonomy management — authors, categories, tags, page types
- R8. File upload management via presigned URLs
- R9. Responsive design — desktop-first, sidebar collapses to hamburger on mobile
- R10. All UI components from shared `@specus/ui` package, matching the design system tokens
- R11. Proper loading states, error boundaries, and empty states across all pages

## Scope Boundaries

- **No AML screening pages** — deferred to a future plan per user decision
- **No role-based access control (RBAC)** — all authenticated admins have full access for now
- **No real-time/websocket features** — health monitoring uses polling
- **No changes to the backend API** — work within existing endpoints only
- **No changes to the web app** (`apps/web`) — admin is fully independent
- **No user registration or password recovery** — admin auth has no register/forgot-password/reset-password endpoints. Admin accounts are provisioned directly in Authentik
- **CMS content editor is basic** — plain text/markdown body field, no rich text/WYSIWYG editor in this plan (can be added later)

## Context & Research

### Backend API Surface (from OpenAPI specs on main branch)

**Admin Auth** (from `internal/handler/admin_auth.go`) — Backend-proxied Authentik authentication for admins:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/admin/auth/login` | POST | Admin email/password login → `TokenPair` (access_token 15min, refresh_token 30d, id_token) |
| `/api/v1/admin/auth/refresh` | POST | Refresh token → new `TokenPair` (token rotation) |
| `/api/v1/admin/auth/logout` | POST | Revoke refresh token (always returns 204) |

Key details:
- *"the frontend never calls Authentik directly"* — the backend proxies all Authentik Flow Executor calls
- Admin auth is **separate from customer auth** (`/api/v1/auth/*`). Admin auth has **no registration, forgot-password, or reset-password** — admin accounts are managed directly in Authentik
- Request/response types match customer auth: `LoginRequest` (`{email, password}`), `TokenPair` (`{access_token, refresh_token, id_token}`)
- **RBAC roles** in backend: `super-admin`, `admin-site`, `blog-author`. CMS admin endpoints are protected by `RequireRoles` middleware — the JWT access token contains role claims
- Admin auth OpenAPI spec may not exist yet as a separate file — the handler exists in Go code but needs to be added to the spec bundle for SDK generation (or the admin can call these endpoints manually via the base API client)

**`cms-admin.yaml`** — Full CMS Admin API:
| Resource | Endpoints | Pagination | Notes |
|----------|-----------|------------|-------|
| Contents | CRUD + list | Cursor-based (page_size 1-100, default 20) | Filterable by content_type, status, tag, category, page_type. Types: `static_page`, `blog_post`, `flexible_page`. Statuses: `draft`, `published`, `scheduled` |
| Authors | CRUD + list | None (flat array) | Has bio, avatar_url, social_links |
| Categories | CUD + list | None | Has name, slug, description |
| Tags | Create (get-or-create) + list + delete | None | name + slug |
| Page Types | Create + list + delete | None | name + slug |
| Uploads | Presign + confirm + list + delete | None | Two-phase: presign URL → upload to storage → confirm. Types: image (10MB), document (50MB) |
| Page Reorder | PUT reorder | N/A | Reorder sibling static pages |

**`openapi.yaml`** — Core API (screening + health):
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health/live` | GET | Liveness probe |
| `/health/ready` | GET | Readiness probe with component checks |
| `/api/v1/screening/sources` | GET | List sanctions sources |
| `/api/v1/screening/search` | GET | Search screening entities |
| `/api/v1/screening/entities/{id}` | GET | Get entity detail |

**Note:** The `listUsers`, `createUser`, `getUser`, `updateUser`, `deleteUser` functions in the current generated SDK are stale — they came from a now-deleted branch (`feat/aml-screening-openapi`). The main branch has no `/users` endpoints. The API client must be regenerated from the current specs.

### Relevant Code and Patterns

- `apps/web/app/layout.tsx` — Root layout pattern with ThemeProvider, font loading, Suspense
- `apps/web/components/theme-provider.tsx` — next-themes wrapper (reusable pattern)
- `apps/web/components/navbar/nav-items.ts` — Config-driven navigation data pattern
- `apps/web/app/aml/search/page.tsx` — API-integrated page with loading/error states using `useEffect`
- `packages/ui/src/components/button.tsx` — Canonical component pattern (CVA, data-slot, cn utility, React 19 style)
- `packages/ui/styles/globals.css` — Complete design tokens including sidebar and chart tokens (light + dark)
- `packages/api-client/scripts/fetch-openapi.sh` — OpenAPI fetch script (currently only fetches `openapi.yaml`)
- `packages/api-client/openapi-ts.config.ts` — Hey API code generation config

### Design System Tokens Already Available

The shared `globals.css` already defines sidebar-specific tokens (`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`) and chart tokens (`--chart-1` through `--chart-5`) in both light and dark modes. Mapped to Tailwind utilities via `@theme inline`. No new CSS variables needed.

### External References

- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar) — SidebarProvider, collapsible icon mode, SidebarInset layout
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table) — TanStack Table integration pattern
- [Next.js 16 App Router](https://nextjs.org/docs) — Route groups, layouts, loading/error conventions

## Key Technical Decisions

- **No Auth.js / NextAuth** — the backend provides a complete admin auth API at `/api/v1/admin/auth/*` with simple REST endpoints. The frontend just POSTs email/password and manages tokens. Auth.js adds unnecessary complexity when the backend already handles the Authentik proxy, token issuance, and refresh. A lightweight custom auth layer (httpOnly cookies via API routes + middleware) is simpler and more appropriate.
- **Token management via Next.js API routes**: Login/refresh/logout go through Next.js API routes (`/api/auth/*`) that set httpOnly secure cookies on the response. The access token (15min) and refresh token (30 days, rotated) are stored as httpOnly cookies — never accessible to client-side JavaScript. The middleware reads the access token cookie to protect routes. When the access token expires, the middleware or API client automatically calls `/api/v1/admin/auth/refresh` to rotate tokens. The JWT access token contains RBAC role claims (`super-admin`, `admin-site`, `blog-author`) for future permission gating.
- **API client regeneration as Unit 0**: The fetch script and generation config must be updated to include `cms-admin.yaml` (and admin auth spec if available) before any feature work begins. The admin auth endpoints may need to be added to the OpenAPI spec bundle or called manually via the base API client if no spec exists yet. This unblocks all other units.
- **Route group separation `(auth)` vs `(dashboard)`**: Login page uses a centered layout without sidebar. Dashboard routes share the sidebar shell. Both live under the same `apps/admin/app/` with no URL impact.
- **SidebarProvider in dashboard layout, not root**: Prevents sidebar from rendering on auth pages. Sidebar state persists across dashboard route navigations because the layout doesn't re-mount.
- **Sidebar collapsible mode: `icon`**: Collapses to icon-only rail on desktop (Cmd+B toggle). Renders as Sheet overlay on mobile. Best balance of screen space and navigation access for admin use.
- **All new UI components installed into `@specus/ui`**: Keeps the shared package as the single component source. The sidebar component's `use-mobile` hook goes into `@specus/ui/src/hooks/` with a new export pattern.
- **TanStack Table for content listing**: Standard choice for sortable/filterable data tables with shadcn. Column definitions and DataTable wrapper stay in the admin app — no premature abstraction into `@specus/ui`.
- **Cursor-based pagination for contents, flat lists for taxonomy**: Contents use `CMSPaginationMeta` (cursor + has_more). Authors, categories, tags, page types return flat arrays — no pagination needed.
- **Client-side data fetching with `useEffect`**: All data fetching follows the existing web app pattern (`useEffect` + `useState`). Route-level `loading.tsx` files provide skeleton UI during initial navigation.
- **ThemeProvider shared via `@specus/ui`**: Move the existing `apps/web/components/theme-provider.tsx` into `packages/ui/src/components/theme-provider.tsx`. Both apps import from the shared package.
- **Toast notifications via sonner**: For mutation feedback (success/error). The `<Toaster />` is mounted in the root layout.
- **Health polling at 30-second interval**: Balance between freshness and API load. Distinct UI states for healthy, degraded, and unreachable.
- **CMS content editor uses plain textarea**: No rich text editor in this plan. The `body` field is stored as text — a WYSIWYG/markdown editor can be layered on in a future plan.

## Open Questions

### Resolved During Planning

- **Dark mode?** Yes — dark/light toggle supported. ThemeProvider configured without `forcedTheme`.
- **AML screening in admin?** No — deferred to a future plan.
- **User management?** No `/users` endpoints exist on the backend main branch. CMS management is the primary admin feature.
- **Auth approach?** Backend-proxied auth via REST endpoints. No Auth.js needed.
- **UI component location?** Shared `@specus/ui` package for all new components.
- **Mobile support?** Desktop-first. Sidebar collapses to hamburger. Tables have horizontal scroll on small screens.

### Deferred to Implementation

- **Exact token cookie names and options**: Implementation will determine cookie naming (e.g., `specus_access_token`, `specus_refresh_token`), SameSite policy, and secure flag based on deployment environment.
- **Content body editor format**: Plain textarea for now. Whether body content is plain text, markdown, or HTML depends on what the backend stores — determine during implementation.
- **Upload file type validation**: The presign endpoint accepts `image` and `document` types with size limits. Exact allowed MIME types and client-side validation rules to be confirmed during implementation.
- **Static page hierarchy depth**: Contents support `parent_id` for page nesting. The admin UI will show parent selection in the form, but tree visualization depth is deferred.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
app/
  layout.tsx                          ← Root: html, body, ThemeProvider, TooltipProvider, Toaster
  (auth)/
    layout.tsx                        ← Centered card layout, no sidebar
    login/page.tsx                    ← Email/password form → POST /api/v1/admin/auth/login
  (dashboard)/
    layout.tsx                        ← SidebarProvider + AppSidebar + SidebarInset + header
    page.tsx                          ← Overview: metrics cards + health summary
    contents/
      page.tsx                        ← Content data table with status filters
      new/page.tsx                    ← Create content form
      [id]/
        page.tsx                      ← Edit content form
    authors/page.tsx                  ← Authors list + CRUD dialogs
    categories/page.tsx               ← Categories list + CRUD dialogs
    tags/page.tsx                     ← Tags list + CRUD dialogs
    uploads/page.tsx                  ← Uploads list + upload dialog
    health/page.tsx                   ← Detailed health monitoring
    loading.tsx                       ← Shared dashboard loading skeleton
    error.tsx                         ← Shared dashboard error boundary
  api/auth/
    login/route.ts                    ← POST: proxy to backend /auth/login, set httpOnly cookies
    refresh/route.ts                  ← POST: proxy to backend /auth/refresh, rotate cookies
    logout/route.ts                   ← POST: proxy to backend /auth/logout, clear cookies
    me/route.ts                       ← GET: decode id_token to return user profile
middleware.ts                         ← Route protection: check access_token cookie, auto-refresh

components/
  app-sidebar.tsx                     ← Sidebar with nav config, user menu footer
  dashboard-breadcrumb.tsx            ← Dynamic breadcrumb from pathname
  metric-card.tsx                     ← Reusable KPI card
  empty-state.tsx                     ← Reusable empty state
  contents/                           ← Content management components
  authors/                            ← Author management components
  health/                             ← Health monitoring components

lib/
  auth.ts                             ← Token cookie helpers (get/set/clear tokens)
  api-client.ts                       ← Authenticated fetch wrapper (reads access_token cookie)
  navigation.ts                       ← Sidebar nav config data
```

## Implementation Units

- [ ] **Unit 0: API Client Regeneration — Include Auth and CMS Admin Specs**

  **Goal:** Update the OpenAPI client generation pipeline to include `auth.yaml` and `cms-admin.yaml` so the admin app has typed SDK functions for all backend endpoints.

  **Requirements:** Prerequisite for all other units

  **Dependencies:** None

  **Files:**
  - Modify: `packages/api-client/scripts/fetch-openapi.sh` (fetch all 3 specs)
  - Modify: `packages/api-client/openapi-ts.config.ts` (generate from merged/multiple inputs)
  - Modify: `packages/api-client/src/generated/` (regenerated output)
  - Modify: `packages/api-client/package.json` (update scripts if needed)

  **Approach:**
  - Update `fetch-openapi.sh` to download specs: `openapi.yaml`, `auth.yaml`, `cms-admin.yaml`, `cms-public.yaml` from the backend repo's main branch
  - Note: admin auth endpoints (`/api/v1/admin/auth/*`) exist in Go code (`internal/handler/admin_auth.go`) but may not have a dedicated OpenAPI spec yet. If no admin auth spec exists, either: (a) create a minimal `admin-auth.yaml` spec in the frontend repo matching the Go handler signatures, or (b) manually type the 3 admin auth endpoints using the same `LoginRequest`/`TokenPair` types from `auth.yaml`
  - Update the Hey API `openapi-ts.config.ts` to generate from multiple input files (Hey API supports array inputs or merged specs)
  - If Hey API doesn't support multi-file input natively, merge the YAML files into a single spec before generation (use a simple script or `@redocly/cli bundle`)
  - Run generation and verify all new SDK functions exist: `AdminListContents`, `AdminCreateContent`, `AdminUpdateContent`, `AdminDeleteContent`, `AdminListAuthors`, `AdminCreateAuthor`, etc.
  - For admin auth: if an admin auth OpenAPI spec exists or is added, generate `adminAuthLogin`, `adminAuthRefresh`, `adminAuthLogout`. If not, the admin auth endpoints can be called via the base API client manually (same `LoginRequest`/`TokenPair` types as customer auth)
  - Remove stale User endpoints from generated output (they were from a deleted branch)

  **Patterns to follow:**
  - `packages/api-client/openapi-ts.config.ts` — Existing Hey API config
  - `packages/api-client/scripts/fetch-openapi.sh` — Existing fetch pattern

  **Test expectation:** none — infrastructure change. Verified by successful generation and `pnpm build`.

  **Verification:**
  - `pnpm run api` (in api-client package) completes successfully
  - Generated `sdk.gen.ts` contains all auth and CMS admin operations
  - Generated `types.gen.ts` contains `LoginRequest`, `TokenPair`, `CMSContent`, `CMSAuthor`, etc.
  - `pnpm build` succeeds across the monorepo

---

- [ ] **Unit 1: UI Foundation — Install Components and Configure Admin App**

  **Goal:** Set up all required shadcn/ui components in the shared package and configure the admin app for development.

  **Requirements:** R10

  **Dependencies:** None (can run in parallel with Unit 0)

  **Files:**
  - Create: `apps/admin/components.json`
  - Modify: `packages/ui/src/components/` (new component files)
  - Create: `packages/ui/src/hooks/use-mobile.tsx` (sidebar dependency)
  - Modify: `packages/ui/package.json` (add hooks export: `"./hooks/*": "./src/hooks/*.tsx"`)
  - Modify: `apps/admin/package.json` (new dependencies)
  - Modify: `turbo.json` (add auth env vars to globalEnv)
  - Move: `apps/web/components/theme-provider.tsx` → `packages/ui/src/components/theme-provider.tsx`
  - Modify: `apps/web` imports to use `@specus/ui/components/theme-provider`

  **Approach:**
  - Create `components.json` for admin app mirroring web app's config
  - Install shadcn components into `packages/ui`: sidebar, table, dropdown-menu, avatar, separator, skeleton, tooltip, breadcrumb, checkbox, collapsible, alert-dialog, sonner (toast), tabs, select, textarea (already exists but verify)
  - Note: `collapsible` is a transitive dependency of the sidebar component; `tabs` needed for content form sections; `select` for status/type dropdowns
  - Add `@tanstack/react-table`, `react-hook-form`, `@hookform/resolvers`, `zod` to `apps/admin/package.json`
  - Place sidebar's `use-mobile` hook in `packages/ui/src/hooks/use-mobile.tsx`
  - Move ThemeProvider to shared package
  - Add `AUTH_SECRET` to `turbo.json` `globalEnv` for build cache correctness
  - `packages/ui/package.json` uses wildcard exports — no per-component updates needed

  **Patterns to follow:**
  - `packages/ui/src/components/button.tsx` — CVA, data-slot, cn utility pattern
  - `apps/web/components.json` — shadcn CLI configuration

  **Test expectation:** none — pure scaffolding. Verified by `pnpm build`.

  **Verification:**
  - `pnpm build` succeeds across the monorepo
  - All new components importable via `@specus/ui/components/<name>`
  - Web app still builds with the moved ThemeProvider import

---

- [ ] **Unit 2: Authentication — Backend-Proxied Login with Token Management**

  **Goal:** Implement authentication using the backend's auth endpoints. Login page with email/password form, httpOnly cookie token storage via API routes, middleware route protection, and automatic token refresh.

  **Requirements:** R1, R2

  **Dependencies:** Unit 0 (needs generated auth SDK functions), Unit 1 (UI components)

  **Files:**
  - Create: `apps/admin/lib/auth.ts` (token cookie helpers)
  - Create: `apps/admin/lib/api-client.ts` (authenticated fetch wrapper)
  - Create: `apps/admin/app/api/auth/login/route.ts`
  - Create: `apps/admin/app/api/auth/refresh/route.ts`
  - Create: `apps/admin/app/api/auth/logout/route.ts`
  - Create: `apps/admin/app/api/auth/me/route.ts`
  - Create: `apps/admin/middleware.ts`
  - Create: `apps/admin/app/(auth)/layout.tsx`
  - Create: `apps/admin/app/(auth)/login/page.tsx`
  - Modify: `apps/admin/app/layout.tsx`
  - Create: `apps/admin/.env.example`

  **Approach:**

  **Token flow:**
  1. Login form POSTs email/password to Next.js API route `/api/auth/login`
  2. API route calls backend `POST /api/v1/admin/auth/login` with `{ email, password }`, gets `TokenPair`
  3. API route sets `access_token` and `refresh_token` as httpOnly secure cookies, returns user profile from `id_token` decode
  4. Subsequent API calls: the authenticated fetch wrapper (`lib/api-client.ts`) reads the access token from the cookie and sets the `Authorization: Bearer` header
  5. Middleware reads the access token cookie on every request; if missing or expired, attempts silent refresh via `/api/auth/refresh`; if refresh fails, redirects to `/login`

  **API routes (not direct backend calls from browser):**
  - `POST /api/auth/login` — accepts `{ email, password }`, calls backend, sets httpOnly cookies, returns user profile
  - `POST /api/auth/refresh` — reads refresh_token cookie, calls backend `/auth/refresh`, rotates cookies
  - `POST /api/auth/logout` — calls backend `/auth/logout`, clears cookies
  - `GET /api/auth/me` — decodes the id_token to return user profile (name, email) for sidebar display

  **Login page:** Branded card with email + password fields, zod validation, submit button with loading state. Error messages mapped from `AuthError.code`: `INVALID_CREDENTIALS` → "Invalid email or password", `ACCOUNT_NOT_VERIFIED` → "Please verify your email first", `AUTH_SERVICE_UNAVAILABLE` → "Authentication service is temporarily unavailable"

  **Patterns to follow:**
  - `apps/web/app/aml/search/page.tsx` — Client-side form submission pattern
  - `packages/api-client/src/client.ts` — API client configuration

  **Test scenarios:**
  - Happy path: Enter valid email/password → backend returns TokenPair → cookies set → redirect to dashboard
  - Happy path: Authenticated admin navigates to `/login` → redirected to dashboard
  - Error path: Invalid credentials → backend returns 401 with `INVALID_CREDENTIALS` → inline error message
  - Error path: Account not verified → 403 with `ACCOUNT_NOT_VERIFIED` → specific error message
  - Error path: Backend auth service down → 502 with `AUTH_SERVICE_UNAVAILABLE` → error message
  - Edge case: Access token expires → middleware calls refresh → new tokens set → request proceeds
  - Edge case: Refresh token also expired → redirect to login with callback URL preserved
  - Edge case: Direct URL access to `/contents` without session → redirected to `/login`
  - Integration: After login, `/api/auth/me` returns user profile; sidebar displays user's name

  **Verification:**
  - Login form authenticates successfully against the backend
  - Tokens stored as httpOnly cookies (not accessible via `document.cookie`)
  - Protected routes redirect to login when unauthenticated
  - Token refresh works transparently
  - Logout clears cookies and redirects to login

---

- [ ] **Unit 3: Dashboard Shell — Sidebar Layout, Theme, and Navigation**

  **Goal:** Build the core dashboard layout with collapsible sidebar, header with breadcrumbs, dark/light theme toggle, and responsive behavior.

  **Requirements:** R3, R4, R9, R10

  **Dependencies:** Unit 1 (UI components), Unit 2 (auth session for user menu)

  **Files:**
  - Modify: `apps/admin/app/layout.tsx` (ThemeProvider, TooltipProvider, Toaster, font)
  - Create: `apps/admin/app/(dashboard)/layout.tsx`
  - Create: `apps/admin/components/app-sidebar.tsx`
  - Create: `apps/admin/components/dashboard-breadcrumb.tsx`
  - Create: `apps/admin/components/theme-toggle.tsx`
  - Create: `apps/admin/lib/navigation.ts`

  **Approach:**
  - Root layout: wrap body in `ThemeProvider` (from `@specus/ui/components/theme-provider`, defaultTheme="system", no forcedTheme), `TooltipProvider`, and `<Toaster />` from sonner. Load Rethink Sans font.
  - Dashboard layout: `SidebarProvider` (collapsible="icon") → `AppSidebar` + `SidebarInset` with sticky header containing `SidebarTrigger`, breadcrumb, and theme toggle
  - App sidebar structure: SidebarHeader (Specus logo/brand), SidebarContent (nav groups), SidebarFooter (user menu with name, email from `/api/auth/me`, sign-out action)
  - Navigation groups: "Overview" (Dashboard), "Content" (Contents, Authors, Categories, Tags, Uploads), "System" (Health)
  - Active route detection via `usePathname()`
  - Breadcrumb dynamically generated from pathname segments

  **Execution note:** Use the `frontend-design` skill during implementation to ensure the sidebar, header, and overall shell have polished, professional UX matching the Specus brand.

  **Patterns to follow:**
  - `packages/ui/src/components/theme-provider.tsx` — Shared ThemeProvider
  - `apps/web/components/navbar/nav-items.ts` — Config-driven navigation data
  - `packages/ui/styles/globals.css` — Sidebar CSS tokens (lines 39-47, 192-199)

  **Test scenarios:**
  - Happy path: Sidebar renders expanded with all nav groups and icons
  - Happy path: SidebarTrigger (or Cmd+B) collapses to icon-only mode; tooltips appear on hover
  - Happy path: Theme toggle cycles light → dark → system; preference persists
  - Happy path: Breadcrumb updates when navigating between pages
  - Edge case: Mobile viewport → sidebar as Sheet overlay
  - Edge case: Sidebar collapsed state persists via cookie across sessions
  - Integration: User menu shows authenticated user's name/email; "Sign out" triggers logout

  **Verification:**
  - Dashboard pages render inside the sidebar + header shell
  - Navigation links route correctly
  - Theme persists across reloads
  - Mobile responsive behavior works

---

- [ ] **Unit 4: Dashboard Overview Page**

  **Goal:** Build the main dashboard landing page with available metrics and quick navigation.

  **Requirements:** R5, R11

  **Dependencies:** Unit 3 (dashboard shell), Unit 0 (generated SDK)

  **Files:**
  - Create: `apps/admin/app/(dashboard)/page.tsx`
  - Create: `apps/admin/app/(dashboard)/loading.tsx`
  - Create: `apps/admin/app/(dashboard)/error.tsx`
  - Create: `apps/admin/components/metric-card.tsx`

  **Approach:**
  - Welcome message with user's name from session
  - Metric cards grid: sanctions sources count (`listScreeningSources`), system health summary (`healthLive`/`healthReady`), content counts (fetch contents list with `page_size=1` for each status to get `has_more` — or fetch first page and count visible items as an approximation)
  - Quick action cards: "Manage Content", "View Authors", "System Health" — prominent navigation aids
  - Health summary: color-coded badge (green/yellow/red) with "View Details" link to `/health`
  - Data fetching: `useEffect` + `useState`. Each card manages own loading/error state independently
  - `loading.tsx` with skeleton cards; `error.tsx` with retry

  **Execution note:** Use the `frontend-design` skill for a visually compelling command center.

  **Patterns to follow:**
  - `apps/web/app/aml/search/page.tsx` — Data fetching pattern
  - `packages/ui/src/components/card.tsx` — Card compound component

  **Test scenarios:**
  - Happy path: Dashboard loads with real metrics from API
  - Happy path: Quick action cards navigate to correct pages
  - Error path: API unreachable → individual card error states, not full page crash
  - Edge case: Sources list empty → card shows "0"
  - Edge case: Health degraded → yellow badge with "View Details" link

  **Verification:**
  - Metrics display correct data from API
  - Loading skeletons show during fetch
  - Error states recoverable via retry

---

- [ ] **Unit 5: CMS Content Management — List and Data Table**

  **Goal:** Build the content listing page with filterable, paginated data table showing all CMS content with status badges.

  **Requirements:** R6, R11

  **Dependencies:** Unit 3 (dashboard shell), Unit 0 (CMS SDK functions)

  **Files:**
  - Create: `apps/admin/app/(dashboard)/contents/page.tsx`
  - Create: `apps/admin/app/(dashboard)/contents/loading.tsx`
  - Create: `apps/admin/app/(dashboard)/contents/error.tsx`
  - Create: `apps/admin/components/contents/columns.tsx`
  - Create: `apps/admin/components/contents/data-table.tsx`
  - Create: `apps/admin/components/contents/data-table-row-actions.tsx`
  - Create: `apps/admin/components/contents/status-badge.tsx`
  - Create: `apps/admin/components/empty-state.tsx`

  **Approach:**
  - Page header: "Content" title with "New Content" primary button
  - Filter toolbar: content_type dropdown (static_page/blog_post/flexible_page), status dropdown (draft/published/scheduled), text search (client-side filter on title)
  - Columns: title (link to edit), content_type badge, status badge (color-coded: draft=secondary, published=green, scheduled=yellow), author name, published_at/updated_at, actions dropdown
  - Cursor-based pagination: "Load More" button when `has_more` is true. Cursor token tracked in state
  - Status badge component with consistent colors across the app
  - Empty state: "No content yet. Create your first page or blog post."
  - Row actions: Edit (navigates to `/contents/[id]`), Delete (confirmation dialog)

  **Patterns to follow:**
  - shadcn/ui Data Table documentation pattern
  - `apps/web/app/aml/search/page.tsx` — Data fetching with cursor pagination

  **Test scenarios:**
  - Happy path: Content table loads with correct columns and status badges
  - Happy path: Filter by content_type → table updates to show only matching items
  - Happy path: Filter by status → table shows only draft/published/scheduled items
  - Happy path: "Load More" fetches next page and appends results
  - Edge case: No content exists → empty state with "New Content" CTA
  - Edge case: Filter returns no results → inline "No results" message with "Clear filters"
  - Edge case: Last page (has_more=false) → "Load More" button hidden
  - Error path: API call fails → error boundary with retry

  **Verification:**
  - Content table renders with real CMS data
  - Status badges display correctly per status
  - Filtering and pagination work
  - Row actions trigger correct navigation/dialogs

---

- [ ] **Unit 6: CMS Content Management — Create and Edit Forms**

  **Goal:** Build content create and edit pages with form fields for all content properties, status management, and taxonomy assignment.

  **Requirements:** R6, R11

  **Dependencies:** Unit 5 (content list provides navigation context)

  **Files:**
  - Create: `apps/admin/app/(dashboard)/contents/new/page.tsx`
  - Create: `apps/admin/app/(dashboard)/contents/[id]/page.tsx`
  - Create: `apps/admin/components/contents/content-form.tsx` (shared form component)
  - Create: `apps/admin/components/contents/delete-content-dialog.tsx`

  **Approach:**
  - Shared `ContentForm` component used by both create and edit pages
  - Form fields: title (required), slug (auto-generated from title, editable), content_type (select, required on create, read-only on edit), body (textarea), excerpt (textarea), status (select: draft/published/scheduled), publish_at (date picker, shown when status=scheduled), parent_id (select, for static_page type), sort_order (number), author_id (select from authors list), page_type_id (select, for flexible_page type), meta_title, meta_description, og_image_url, tag_ids (multi-select), category_ids (multi-select)
  - Edit page: fetch content via `AdminGetContent`, pre-fill form. Handle 404 (content deleted)
  - Create page: empty form with defaults (status=draft, sort_order=0)
  - On submit: call `AdminCreateContent` or `AdminUpdateContent`. Show toast on success, navigate back to list
  - Delete: AlertDialog confirmation from the edit page. Handle 409 (content has child pages)
  - Client-side validation with zod: title min 1 char, slug format validation
  - Form uses `react-hook-form` for state management

  **Patterns to follow:**
  - `packages/ui/src/components/dialog.tsx` — Dialog/AlertDialog patterns
  - `packages/ui/src/components/input.tsx` — Form field pattern

  **Test scenarios:**
  - Happy path: Create → fill required fields → submit → 201 → toast, navigate to list
  - Happy path: Edit → loads existing content → change title → submit → 200 → toast, navigate to list
  - Happy path: Change status to "scheduled" → publish_at date picker appears → set date → submit
  - Happy path: Delete from edit page → AlertDialog → confirm → 204 → toast, navigate to list
  - Error path: Create with empty title → zod validation error inline
  - Error path: Create returns 400 → inline error message
  - Error path: Edit content that was deleted → AdminGetContent 404 → error page
  - Error path: Delete content with children → 409 → toast "Content has child pages and cannot be deleted"
  - Edge case: Auto-generate slug from title as user types (slugify function)
  - Edge case: Taxonomy selects load authors/categories/tags on form mount
  - Integration: After create/edit, content list reflects the change

  **Verification:**
  - Create and edit forms work end-to-end against the API
  - Status workflow (draft → published → scheduled) functions correctly
  - Taxonomy assignment (authors, categories, tags) works
  - Validation prevents invalid submissions
  - Delete handles both success and 409 conflict

---

- [ ] **Unit 7: CMS Taxonomy Management — Authors, Categories, Tags**

  **Goal:** Build management pages for authors, categories, tags, and page types with inline CRUD via dialogs.

  **Requirements:** R7, R11

  **Dependencies:** Unit 3 (dashboard shell), Unit 0 (CMS SDK)

  **Files:**
  - Create: `apps/admin/app/(dashboard)/authors/page.tsx`
  - Create: `apps/admin/app/(dashboard)/categories/page.tsx`
  - Create: `apps/admin/app/(dashboard)/tags/page.tsx`
  - Create: `apps/admin/components/authors/` (author list, create/edit dialog)
  - Create: `apps/admin/components/categories/` (category list, create/edit dialog)
  - Create: `apps/admin/components/tags/` (tag list, create/delete)

  **Approach:**
  - Each taxonomy page: header with "Add" button, data table or card list, CRUD dialogs
  - **Authors**: Table with name, slug, bio excerpt, avatar. Create/edit dialog with name (required), slug (required, auto-from-name), bio (textarea), avatar_url, social_links (JSON). Delete with 409 handling (author referenced by content)
  - **Categories**: Table with name, slug, description. Create/edit dialog. Delete with 409 handling
  - **Tags**: Simpler list with name, slug. Create dialog (get-or-create semantics). Delete only (no edit — tags are simple). Delete with 404 handling
  - **Page Types**: Included on a separate section or tab. Simple name/slug CRUD. Delete with 409 handling
  - All taxonomy endpoints return flat arrays — no pagination needed
  - Dialog-based CRUD (not full pages) since these forms are small (2-4 fields)

  **Patterns to follow:**
  - `packages/ui/src/components/dialog.tsx` — Dialog composition

  **Test scenarios:**
  - Happy path: Authors page lists all authors; create dialog adds new author with slug auto-generation
  - Happy path: Edit author → dialog pre-fills → update → 200 → list refreshes
  - Happy path: Delete category → AlertDialog → 204 → removed from list
  - Error path: Delete author with content → 409 → toast "Author is referenced by content"
  - Error path: Create tag with existing slug → get-or-create returns existing tag (not an error)
  - Edge case: Empty lists → appropriate empty state per taxonomy type
  - Integration: Newly created authors/categories/tags appear in content form dropdowns

  **Verification:**
  - All taxonomy CRUD operations work against the API
  - 409 conflict errors handled gracefully
  - Empty states display correctly
  - Lists refresh after mutations

---

- [ ] **Unit 8: File Upload Management**

  **Goal:** Build the uploads management page with presigned URL upload flow and file listing.

  **Requirements:** R8, R11

  **Dependencies:** Unit 3 (dashboard shell), Unit 0 (upload SDK)

  **Files:**
  - Create: `apps/admin/app/(dashboard)/uploads/page.tsx`
  - Create: `apps/admin/components/uploads/upload-dialog.tsx`
  - Create: `apps/admin/components/uploads/upload-list.tsx`

  **Approach:**
  - Page: header with "Upload File" button, list/grid of uploaded files
  - Upload flow (two-phase presigned URL):
    1. User selects file in dialog → client reads file metadata (name, content_type, size, upload_type)
    2. Call `AdminPresignUpload` → get `upload_id`, `upload_url`, `public_url`, `expires_at`
    3. PUT file directly to `upload_url` (presigned S3/storage URL)
    4. Call `AdminConfirmUpload({ path: { id: upload_id } })` → get confirmed `CMSUpload`
    5. Show success toast, refresh list
  - Upload dialog: file input with drag-and-drop zone, upload_type selector (image/document), progress indicator
  - Upload list: grid for images (with thumbnails via public_url), list for documents. Shows filename, type, size, status, created_at
  - Delete upload: confirmation dialog
  - Client-side validation: image max 10MB, document max 50MB (matching backend limits)

  **Patterns to follow:**
  - `packages/ui/src/components/dialog.tsx` — Dialog pattern

  **Test scenarios:**
  - Happy path: Select image file → presign → upload to storage → confirm → appears in list with thumbnail
  - Happy path: Upload document → same flow → appears in list
  - Error path: File exceeds size limit → client-side validation error before any API call
  - Error path: Presign returns 400 (invalid content type) → error message
  - Error path: Upload to storage fails → error toast, no confirm call
  - Error path: Confirm returns 400 (file too large on server check) → error with cleanup guidance
  - Edge case: Upload expires before completion → presign again
  - Edge case: Delete upload → 204 → removed from list

  **Verification:**
  - Full upload flow (presign → upload → confirm) works end-to-end
  - Files appear in list after successful upload
  - Size/type validation works client-side
  - Delete removes uploads

---

- [ ] **Unit 9: Health Monitoring Page**

  **Goal:** Build a dedicated health monitoring page with polling that shows detailed system status.

  **Requirements:** R5, R11

  **Dependencies:** Unit 3 (dashboard shell)

  **Files:**
  - Create: `apps/admin/app/(dashboard)/health/page.tsx`
  - Create: `apps/admin/app/(dashboard)/health/loading.tsx`
  - Create: `apps/admin/components/health/health-detail-card.tsx`
  - Create: `apps/admin/components/health/health-check-item.tsx`

  **Approach:**
  - Page header: "System Health" with last-checked timestamp and manual refresh button
  - Two main cards: "Liveness" (`healthLive`) and "Readiness" (`healthReady`)
  - Each card: status badge (Healthy/Degraded/Unreachable), response timestamp. Readiness card shows `checks` map as individual status rows
  - Auto-poll every 30 seconds. Clear interval on unmount
  - Three states per endpoint: **Healthy** (200, green-4), **Degraded** (503, yellow-4, show failing checks), **Unreachable** (network error, red-4)

  **Patterns to follow:**
  - `packages/ui/src/components/card.tsx` — Card compound component
  - `packages/ui/src/components/badge.tsx` — Status badge variants

  **Test scenarios:**
  - Happy path: Both endpoints 200 → green "Healthy" cards
  - Happy path: Auto-refresh every 30s → status updates
  - Happy path: Manual refresh → immediate re-fetch
  - Error path: healthReady 503 with checks → "Degraded" badge, individual check items
  - Error path: API unreachable → "Unreachable" red badge
  - Edge case: Network recovers → next poll shows "Healthy"
  - Edge case: Navigate away and back → polling restarts cleanly

  **Verification:**
  - Health page displays real API status
  - Polling updates every 30 seconds
  - All three states render with correct colors

## System-Wide Impact

- **Interaction graph:** Middleware intercepts all route navigations for auth. SidebarProvider wraps all dashboard pages. Toast provider (Sonner) wraps root layout. ThemeProvider wraps entire app. API client wrapper injects Bearer token on every backend call.
- **Error propagation:** API errors caught per-component and displayed inline or via toast. Auth errors (401) trigger automatic token refresh; if refresh fails, redirect to login. Uncaught errors caught by nearest `error.tsx` boundary.
- **State lifecycle risks:** Token cookies managed via httpOnly with automatic refresh — no risk of client-side token leakage. Sidebar state persisted via cookie. Theme preference in localStorage. Content form state ephemeral (warn on unsaved changes via `beforeunload`).
- **API surface parity:** Admin app is the sole consumer of CMS Admin endpoints and auth endpoints. Shares screening sources and health endpoints with the web app (read-only).
- **Unchanged invariants:** Web app not modified (except ThemeProvider import path). Existing `@specus/api-client` generated code updated but backwards-compatible (new functions added, stale User functions removed). Backend API not modified.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Hey API may not support multiple OpenAPI input files | Fall back to merging YAML files with Redocly CLI before generation. Test in Unit 0 before other units begin |
| Stale User endpoints in generated SDK may be imported by web app | Check web app imports before removing. If used, keep as deprecated or update web app |
| Backend auth endpoints may not be deployed yet | Check with backend team. All specs are on main branch, which is a strong signal they're implemented. Test against running backend early |
| httpOnly cookie token storage adds complexity vs localStorage | httpOnly is more secure (no XSS token theft). The complexity is contained in 4 API routes and middleware — worth the security benefit for an admin panel |
| Presigned upload flow has multiple failure points | Client-side validation catches most issues before API calls. Upload dialog shows clear progress and error states at each phase |
| Content form is complex (many fields, taxonomy relations) | Use react-hook-form for state management. Group related fields with tabs or sections. Start with essential fields visible, advanced fields in collapsible sections |
| Cookie-based sidebar state + server-side reading may cause Next.js 16 issues | If `await cookies()` causes blocking data warnings, fall back to `defaultOpen={true}` or wrap in Suspense |

## Sources & References

- Related code: `apps/admin/` (skeleton), `apps/web/` (reference patterns), `packages/ui/` (design system)
- Related PRs: #2 (Turborepo monorepo migration)
- Backend specs: `Specus-Org/backend` — `api/openapi/auth.yaml`, `api/openapi/cms-admin.yaml`, `api/openapi/openapi.yaml`
- External docs: [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar), [Hey API](https://heyapi.dev/), [Next.js 16 App Router](https://nextjs.org/docs)
