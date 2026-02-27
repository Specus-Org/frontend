# feat: Setup OpenAPI Client from Private Backend Repository

## Overview

Set up an auto-generated, type-safe API client for the Specus frontend using `@hey-api/openapi-ts` with the Next.js client plugin. The OpenAPI spec is fetched from the private `Specus-Org/backend` GitHub repository (branch `feat/aml-screening-openapi`). The generated client will replace the current hardcoded mock data in the AML pages.

## Problem Statement

The frontend currently has **zero API integration** -- all data is hardcoded in `data/aml-mock.ts`. The backend exposes an OpenAPI 3.0.3 spec with Health, Users, and Screening endpoints. We need a typed client SDK that stays in sync with the spec and integrates cleanly with Next.js App Router (both Server and Client Components).

## API Endpoints (from OpenAPI spec)

| Tag | Operation | Method | Path |
|-----|-----------|--------|------|
| Health | `healthLive` | GET | `/health/live` |
| Health | `healthReady` | GET | `/health/ready` |
| Users | `listUsers` | GET | `/users` |
| Users | `createUser` | POST | `/users` |
| Users | `getUser` | GET | `/users/{id}` |
| Users | `updateUser` | PUT | `/users/{id}` |
| Users | `deleteUser` | DELETE | `/users/{id}` |
| Screening | `screeningSearch` | GET | `/api/v1/screening/search` |
| Screening | `getScreeningEntity` | GET | `/api/v1/screening/entities/{id}` |
| Screening | `listScreeningSources` | GET | `/api/v1/screening/sources` |

## Proposed Solution

Use **@hey-api/openapi-ts** (all-in-one package with bundled `@hey-api/client-next` plugin) to:

1. Fetch the OpenAPI YAML from the private GitHub repo using a shell script + `GITHUB_TOKEN`
2. Generate a typed SDK + TypeScript interfaces into `services/generated/`
3. Configure the client via the `runtimeConfigPath` pattern in `lib/api/client.ts`
4. Integrate with the existing AML pages by replacing mock data with real API calls

### Why @hey-api/openapi-ts?

- Dedicated `@hey-api/client-next` plugin handles Next.js server/client boundary
- Generates named SDK functions (`screeningSearch()` vs `api.GET('/api/v1/screening/search')`)
- Everything bundled in one package since v0.73.0
- Tree-shakeable output, zero unnecessary runtime code
- Used by Vercel, PayPal, OpenCode in production

## Implementation Plan

### Phase 1: Environment & Tooling Setup

#### 1.1 Create `.env.example`

```bash
# .env.example

# ============================================================
# PUBLIC VARIABLES (exposed to the browser -- no secrets here)
# ============================================================

# Base URL for the Specus backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# ============================================================
# SERVER / BUILD-TIME ONLY (never sent to the browser)
# ============================================================

# GitHub PAT for fetching OpenAPI spec from private repo (build-time only)
# Create at: https://github.com/settings/tokens -- scope: Contents (read-only) on Specus-Org/backend
GITHUB_TOKEN=
```

**Files:** `.env.example` (new)

#### 1.2 Update `.gitignore`

Add exceptions so `.env.example` is committed and generated files + downloaded spec are ignored:

```gitignore
# env files
.env*
!.env.example

# OpenAPI generated files (regenerate with `make api`)
openapi.yaml
```

**Files:** `.gitignore` (edit lines 33-34)

#### 1.3 Create Spec Fetch Script

```bash
#!/bin/bash
# scripts/fetch-openapi.sh
set -euo pipefail

GITHUB_TOKEN="${GITHUB_TOKEN:?Error: GITHUB_TOKEN is not set. See .env.example}"

echo "Fetching OpenAPI spec..."
curl -sf \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3.raw" \
  "https://api.github.com/repos/Specus-Org/backend/contents/api/openapi/openapi.yaml?ref=feat/aml-screening-openapi" \
  -o ./openapi.yaml

echo "OpenAPI spec saved to ./openapi.yaml"
```

**Files:** `scripts/fetch-openapi.sh` (new)

#### 1.4 Install Dependencies

```bash
pnpm add @hey-api/openapi-ts -D -E
```

Only one dev dependency needed -- `@hey-api/client-next` is bundled inside it.

**Files:** `package.json` (auto-updated by pnpm)

### Phase 2: Code Generation Configuration

#### 2.1 Create Hey API Config

```typescript
// openapi-ts.config.ts
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.yaml',
  output: {
    path: './services/generated',
    format: 'prettier',
    lint: 'eslint',
  },
  plugins: [
    {
      name: '@hey-api/client-next',
      runtimeConfigPath: './lib/api/client.ts',
    },
    '@hey-api/typescript',
    '@hey-api/sdk',
  ],
});
```

**Files:** `openapi-ts.config.ts` (new)

#### 2.2 Create Client Configuration

```typescript
// lib/api/client.ts
import type { CreateClientConfig } from '@/services/generated/client.gen';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080',
});
```

**Files:** `lib/api/client.ts` (new)

#### 2.3 Add npm Scripts & Makefile Targets

Add to `package.json` scripts:

```json
{
  "scripts": {
    "fetch-openapi": "bash scripts/fetch-openapi.sh",
    "generate-api": "openapi-ts",
    "api": "npm run fetch-openapi && npm run generate-api"
  }
}
```

Add to `Makefile`:

```makefile
# Fetch OpenAPI spec from private backend repo and generate TypeScript client
fetch-openapi:
	bash scripts/fetch-openapi.sh

generate-api: fetch-openapi
	npx openapi-ts

api: generate-api
```

**Files:** `package.json` (edit), `Makefile` (edit)

#### 2.4 Run Generation

```bash
# Set token in .env.local, then:
make api
```

This produces:

```
services/
  generated/
    client/          # HTTP client scaffolding
    core/            # Shared utilities
    client.gen.ts    # Pre-configured client instance
    sdk.gen.ts       # screeningSearch(), getScreeningEntity(), etc.
    types.gen.ts     # ScreeningSearchResponse, ScreeningEntity, etc.
    index.ts         # Barrel re-exports
```

**Files:** `services/generated/` (auto-generated, do not edit)

### Phase 3: Integrate with AML Pages

#### 3.1 Update AML Search Page (`app/aml/page.tsx`)

Pass the search query to the search results page via URL params (currently navigates without a query):

```typescript
// app/aml/page.tsx
onSearch={() => router.push('/aml/search?q=' + encodeURIComponent(query))}
```

**Files:** `app/aml/page.tsx` (edit line 23)

#### 3.2 Update AML Search Results Page (`app/aml/search/page.tsx`)

Replace the hardcoded `bio` import with a real API call using the generated `screeningSearch` SDK function. Use `useSearchParams` to read the `q` query param and call the API.

Key changes:
- Import `screeningSearch` and `getScreeningEntity` from `@/services/generated`
- Read `q` from URL search params
- Call `screeningSearch({ query: { q } })` on mount and on search
- Display real results instead of mock data
- Handle loading and error states

**Files:** `app/aml/search/page.tsx` (edit)

#### 3.3 Keep Mock Data as Fallback (Optional)

The `data/aml-mock.ts` file can remain for now as a reference for the UI shape. It can be removed once the integration is verified working.

## Acceptance Criteria

- [ ] `.env.example` exists with `NEXT_PUBLIC_API_BASE_URL` and `GITHUB_TOKEN` (no actual values)
- [ ] `scripts/fetch-openapi.sh` fetches the spec from the private repo using `GITHUB_TOKEN`
- [ ] `make api` (or `npm run api`) fetches the spec and generates the TypeScript client
- [ ] Generated SDK in `services/generated/` contains typed functions for all 10 endpoints
- [ ] `lib/api/client.ts` configures the base URL from `NEXT_PUBLIC_API_BASE_URL`
- [ ] AML search page passes the query to the search results page
- [ ] AML search results page calls `screeningSearch` with the query parameter
- [ ] No tokens, private URLs, or secrets appear in committed code
- [ ] `openapi.yaml` and `services/generated/` are gitignored (regenerated on demand)
- [ ] Project builds successfully (`make build`)

## Project Structure (After Implementation)

```
specus-frontend/
  app/
    aml/
      page.tsx                  # Uses router.push with query param
      search/
        page.tsx                # Calls screeningSearch() instead of mock
  lib/
    api/
      client.ts                 # Client config (baseUrl from env)
    utils.ts                    # Existing cn() utility
  services/
    generated/                  # AUTO-GENERATED (gitignored)
      client.gen.ts
      sdk.gen.ts
      types.gen.ts
      index.ts
  scripts/
    fetch-openapi.sh            # Fetches spec from private GitHub repo
  openapi-ts.config.ts          # Hey API configuration
  .env.example                  # Template (committed)
  .env.local                    # Actual values (gitignored)
```

## Security Considerations

- `GITHUB_TOKEN` is **build-time only** -- never referenced in application code, never reaches the browser
- `NEXT_PUBLIC_API_BASE_URL` uses `NEXT_PUBLIC_` prefix correctly -- the API base URL is not a secret (visible in browser network requests anyway)
- The fetch script uses the GitHub Contents API (`api.github.com`) -- no raw repo URLs in committed code
- `.env.local` is excluded by the existing `.env*` gitignore pattern
- The OpenAPI spec file (`openapi.yaml`) is gitignored to avoid leaking internal API structure

## References

- [Hey API -- Next.js Client](https://heyapi.dev/openapi-ts/clients/next-js)
- [Hey API -- Get Started](https://heyapi.dev/openapi-ts/get-started)
- [Hey API -- Configuration](https://heyapi.dev/openapi-ts/configuration)
- [Next.js -- Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables)
- Backend OpenAPI spec: `Specus-Org/backend` branch `feat/aml-screening-openapi` at `api/openapi/openapi.yaml`
