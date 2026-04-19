---

## title: "feat: Replace auth pages with dialog-based flow"
type: feat
status: active
date: 2026-04-19

# feat: Replace Auth Pages with Dialog-Based Flow

## Overview

Replace all full-page auth routes under `app/(main)/auth/` with a set of 7 shadcn `Dialog` components. Dialogs are orchestrated by URL search param `?modal=<name>`, rendered from the root layout, and wired to existing Server Actions (adapted to return success state instead of redirecting). The profile page becomes a dialog opened from the user menu. No new pages are added — existing auth routes redirect to the home page with the appropriate `?modal` param.

## Problem Frame

Design team requires auth to live in overlaying dialogs rather than dedicated full-page routes. This improves UX continuity (user stays in context), matches modern SaaS patterns, and enables profile management without a full-page profile route.

## Requirements Trace

- R1. Login dialog — title "Get started with Specus", email + password fields, Continue button (bottom-right)
- R2. Register dialog — title "Register", full name + email + password + confirm password fields
- R3. Profile dialog — email section (with Change Email button), password section (with Change Password button), Account section (Delete Account danger link)
- R4. Change Email dialog — email field pre-filled with current email, Update Email button (bottom-right)
- R5. Change Password dialog — old password, new password, confirm password fields, Forgot Password button, Update Password button
- R6. Delete Account dialog — confirmation subtitle with current email, email confirmation field, Cancel + Delete Account buttons
- R7. Check Email dialog — polymorphic confirmation for register / forgot-password / change-email flows
- R8. Dialog navigation — dialogs chain (Login → Register, Login → Forgot Password → Check Email, Profile → Change Email → Check Email, etc.) via URL param transitions
- R9. Auth pages — existing routes (`/auth/signin`, `/auth/register`, `/auth/forgot-password`) redirect to home with `?modal=login` / `?modal=register` / `?modal=forgot` so external links still work

## Scope Boundaries

- Reset password flow (`/auth/reset-password`) remains a full page — it is accessed via email magic link and cannot be a dialog
- Sign-out remains a form POST to `/api/auth/signout` — no dialog needed
- Admin app not touched
- No react-hook-form introduced — retain `useActionState` + Server Action pattern throughout

## Context & Research

### Relevant Code and Patterns

- `apps/web/app/(main)/auth/signin/signin-form.tsx` — `useActionState(signInAction, null)` pattern; fields to port
- `apps/web/app/(main)/auth/register/register-form.tsx` — full name + email + password + confirm; `state?.values` repopulation
- `apps/web/app/(main)/auth/forgot-password/forgot-password-form.tsx` — email only
- `apps/web/app/(main)/auth/signin/action.ts` — `signIn('authentik-credentials', { redirect: false })` + `redirect(callbackUrl)` at end; dialog variant must drop the `redirect()` call and return `{ success: true }`
- `apps/web/app/(main)/auth/auth-submit-button.tsx` — `useFormStatus()` submit button; reusable in dialogs
- `apps/web/app/(main)/auth/form-error-alert.tsx` — reusable error display
- `apps/web/app/(main)/profile/page.tsx` — current profile page; becomes thin redirect wrapper or replaced
- `apps/web/components/navbar/user-menu.tsx` — "Sign in" `<Link>` and "Profile" `<Link>` both become button handlers that push `?modal=`
- `packages/ui/src/components/dialog.tsx` — `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` primitives; imported from `@specus/ui/components/dialog`

### Institutional Learnings

- No `docs/solutions/` directory exists yet in this repo.

### External References

- shadcn/ui Dialog API: `Dialog` + `DialogContent` + `DialogPortal` — ensure z-index layering above Navbar (sticky)

## Key Technical Decisions

- **URL search param `?modal=<key>` as dialog state source of truth**: enables browser back button to close dialogs, shareable links to specific dialogs, and avoids prop-drilling or a separate context store. Param values: `login`, `register`, `forgot`, `profile`, `change-email`, `change-password`, `delete-account`, `check-email` (with secondary `?type=register|forgot|change-email`).
- **Single `AuthDialogManager` in root layout**: one client component reads `useSearchParams()`, renders whichever dialog matches, passes `onClose` / `onNavigate` callbacks that call `router.replace()` to update the param. Placed in `apps/web/app/(main)/layout.tsx` so it is present on every page.
- **Server Actions return `{ success: true }` not `redirect()`**: dialog variants of sign-in, register, forgot-password actions remove the trailing `redirect()`. Client-side, on `state?.success`, the dialog closes (param cleared) and `router.refresh()` is called to hydrate the new session. Profile-mutating actions (change email, change password, delete account) are new server actions that call backend API endpoints.
- **Existing auth pages become redirect shims**: `signin/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx` become minimal server components that do `redirect('/?modal=login')` etc. They do not need forms anymore. This preserves existing external links.
- **Profile page stays but opens dialog**: `/profile/page.tsx` redirects unauthenticated users as before but authenticated users are redirected to `/?modal=profile`. Alternatively keep the page for SSR data load and open the dialog within it — but redirect is simpler given all profile data comes from session.
- `**useActionState` retained**: no react-hook-form; all dialog forms use the same `useActionState(serverAction, null)` pattern as current auth pages.

## Open Questions

### Resolved During Planning

- **Where to colocate new dialog server actions?** — Create `apps/web/app/(main)/auth/actions/` directory. Move existing `signInAction`, `register`, `forgotPassword` into `actions/` and add `changeEmailAction`, `changePasswordAction`, `deleteAccountAction`. Keeps all auth server-side logic in one place.
- **How does `AuthDialogManager` avoid hydration mismatch?** — Wrap in `<Suspense>` since `useSearchParams()` suspends in RSC streaming; this is the Next.js-required pattern.
- **Change email / password / delete — which API endpoints?** — Defer exact endpoint paths to implementation (check backend OpenAPI spec in `packages/api-client/src/generated/`).
- **Profile dialog session data source** — Read from `useSession()` client-side (already available via `SessionProvider` in layout); no extra server fetch needed.

### Deferred to Implementation

- Exact backend REST paths for `PATCH /profile/email`, `PATCH /profile/password`, `DELETE /account` — implementer checks `packages/api-client/src/generated/` or backend team.
- Exact error message strings from backend for change-email/password/delete — wrap generically and surface `body.message`.
- Whether delete-account requires a separate confirmation token flow or just email match — implementer verifies with backend behavior.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
app/(main)/layout.tsx
  └─ <Suspense>
       └─ <AuthDialogManager>          (reads useSearchParams(); renders active dialog)
            ├─ <LoginDialog>            ?modal=login
            ├─ <RegisterDialog>         ?modal=register
            ├─ <ForgotPasswordDialog>   ?modal=forgot  (not in spec but needed for flow)
            ├─ <CheckEmailDialog>       ?modal=check-email&type=register|forgot|change-email
            ├─ <ProfileDialog>          ?modal=profile
            ├─ <ChangeEmailDialog>      ?modal=change-email
            ├─ <ChangePasswordDialog>   ?modal=change-password
            └─ <DeleteAccountDialog>    ?modal=delete-account

Dialog navigation helper (lib/auth-dialog.ts):
  openDialog(router, key, extra?)  → router.push(`?modal=${key}${extra}`)
  closeDialog(router)              → router.push(pathname without ?modal)
  switchDialog(router, key)        → router.replace(`?modal=${key}`)

On sign-in success:
  1. state.success → closeDialog(router)
  2. router.refresh() → session hydrates → UserMenu re-renders authenticated

Dialog chaining:
  Login → "register" link    → switchDialog('register')
  Login → "forgot" link      → switchDialog('forgot')
  Forgot → success           → switchDialog('check-email') + ?type=forgot
  Register → success         → switchDialog('check-email') + ?type=register
  Profile → change email btn → switchDialog('change-email')
  Change Email → success     → switchDialog('check-email') + ?type=change-email
  Profile → change pwd btn   → switchDialog('change-password')
  Profile → delete link      → switchDialog('delete-account')
  Delete → success           → closeDialog + router.push('/') + signout
```

## Implementation Units

- **Unit 1: Dialog navigation helper and AuthDialogManager**
  **Goal:** Central URL-param-based dialog orchestration layer that all dialogs plug into.
  **Requirements:** R8
  **Dependencies:** None
  **Files:**
  - Create: `apps/web/lib/auth-dialog.ts`
  - Create: `apps/web/components/auth/auth-dialog-manager.tsx`
  - Modify: `apps/web/app/(main)/layout.tsx`
  - Test: `apps/web/test/auth-dialog.test.ts`
  **Approach:**
  - `auth-dialog.ts` exports `openDialog`, `switchDialog`, `closeDialog` functions accepting `router` + `pathname` + dialog key
  - `AuthDialogManager` is a `'use client'` component using `useSearchParams()` to read `modal` param, `usePathname()` for close navigation; renders matching dialog or null
  - Wrap `AuthDialogManager` in `<Suspense fallback={null}>` inside `layout.tsx`
  - Pass `onClose` and `onSwitch` callbacks from manager down to each dialog as props
  **Patterns to follow:**
  - `apps/web/components/navbar/user-menu.tsx` — `useSession()` + client component pattern
  - Next.js docs pattern: `useSearchParams()` must be inside `<Suspense>`
  **Test scenarios:**
  - Happy path: `?modal=login` → `AuthDialogManager` renders `LoginDialog`, others null
  - Happy path: `?modal=profile` → renders `ProfileDialog`
  - Happy path: no `?modal` param → renders nothing
  - Edge case: unknown `?modal=garbage` → renders nothing (no crash)
  - Unit: `openDialog` appends `?modal=login` to current URL
  - Unit: `closeDialog` removes `?modal` param from URL
  **Verification:**
  - `AuthDialogManager` renders in layout on every `(main)` route
  - Navigating to `/?modal=login` shows login dialog without a page reload

---

- **Unit 2: Server Actions refactored for dialog use**
  **Goal:** Adapt existing auth server actions so they return `{ success: true }` on success instead of calling `redirect()`, enabling client dialogs to handle post-success navigation.
  **Requirements:** R1, R2, R7
  **Dependencies:** Unit 1 (establishes the pattern dialogs will call)
  **Files:**
  - Create: `apps/web/app/(main)/auth/actions/sign-in-action.ts`
  - Create: `apps/web/app/(main)/auth/actions/register-action.ts`
  - Create: `apps/web/app/(main)/auth/actions/forgot-password-action.ts`
  - Create: `apps/web/app/(main)/auth/actions/change-email-action.ts`
  - Create: `apps/web/app/(main)/auth/actions/change-password-action.ts`
  - Create: `apps/web/app/(main)/auth/actions/delete-account-action.ts`
  - Modify: `apps/web/app/(main)/auth/signin/action.ts` (keep for page compat, re-export or delegate)
  - Test: `apps/web/app/(main)/auth/actions/sign-in-action.test.ts`
    **Approach:**
  - `sign-in-action.ts` — same logic as current `signin/action.ts` but returns `{ success: true }` on success instead of `redirect()`. The page-level `signin/action.ts` can remain unchanged for backward compat until auth pages are retired.
  - `change-email-action.ts` — fetches `PATCH /api/v1/auth/email` (verify endpoint), sends `{ email }` with auth session token from `await auth()`
  - `change-password-action.ts` — fetches `PATCH /api/v1/auth/password`, sends `{ oldPassword, newPassword }`; validates `confirmPassword === newPassword` before fetch
  - `delete-account-action.ts` — validates submitted email matches `session.user.email`, calls `DELETE /api/v1/auth/account`, returns `{ success: true }` or error
  - All actions: `'use server'` directive, `AbortSignal.timeout(10000)`, typed state return object
    **Patterns to follow:**
  - `apps/web/app/(main)/auth/signin/action.ts` — error handling, fetch pattern, state type
  - `apps/web/app/(main)/auth/forgot-password/forgot-password-form.tsx` — `forgotPassword` action shape
    **Test scenarios:**
  - Happy path: valid credentials → `signInAction` returns `{ success: true }`
  - Error path: invalid credentials → returns `{ error: 'Invalid email or password...' }`
  - Error path: network timeout → returns `{ error: 'Something went wrong...' }`
  - Edge case: `deleteAccountAction` with wrong email → returns validation error without hitting API
  - Edge case: `changePasswordAction` with mismatched confirm password → returns validation error
    **Verification:**
  - No `redirect()` calls in dialog-variant actions
  - All actions have typed return state (`{ success?: true; error?: string; values?: ... }`)

---

- **Unit 3: Login Dialog**
  **Goal:** Dialog component matching design spec — title "Get started with Specus", subtitle, email + password fields, Continue button bottom-right.
  **Requirements:** R1, R8
  **Dependencies:** Unit 1 (manager + helper), Unit 2 (sign-in-action)
  **Files:**
  - Create: `apps/web/components/auth/login-dialog.tsx`
  - Test: `apps/web/components/auth/login-dialog.test.tsx`
    **Approach:**
  - `'use client'` component; props: `open: boolean`, `onClose: () => void`, `onSwitch: (key: string) => void`
  - `Dialog open={open} onOpenChange={onClose}`
  - `DialogHeader` → `DialogTitle` "Get started with Specus" + `DialogDescription` "New here? We'll create your account automatically."
  - Form fields: Email, Password (with "Forgot password?" button that calls `onSwitch('forgot')`)
  - `DialogFooter` with Continue button on the right (`AuthSubmitButton` adapted)
  - On `state?.success` in `useEffect` → call `onClose()` + `router.refresh()`
  - "No account?" text + register link calls `onSwitch('register')`
  - Reuse `FormErrorAlert` for error display
    **Patterns to follow:**
  - `apps/web/app/(main)/auth/signin/signin-form.tsx` — field structure, `useActionState` pattern
  - `packages/ui/src/components/dialog.tsx` — Dialog primitives
    **Test scenarios:**
  - Happy path: dialog renders with correct title and subtitle when `open=true`
  - Happy path: "Forgot password?" button calls `onSwitch('forgot')`
  - Happy path: register link calls `onSwitch('register')`
  - Happy path: on `state.success`, `onClose` is called and `router.refresh()` fires
  - Error path: `state.error` renders `FormErrorAlert` with message
  - Edge case: dialog does not render when `open=false`
    **Verification:**
  - Login dialog opens at `/?modal=login`; successful sign-in closes dialog and updates navbar avatar

---

- **Unit 4: Register Dialog**
  **Goal:** Dialog with title "Register", full name + email + password + confirm password fields.
  **Requirements:** R2, R8
  **Dependencies:** Unit 1, Unit 2
  **Files:**
  - Create: `apps/web/components/auth/register-dialog.tsx`
  - Test: `apps/web/components/auth/register-dialog.test.tsx`
    **Approach:**
  - Same structure as Login Dialog
  - Fields: Full name, Email, Password, Confirm Password — mirror `register-form.tsx` field set including `defaultValue={state?.values?.name}` repopulation
  - On `state?.success` → `onSwitch('check-email')` with `type=register` query param
  - "Already have an account?" → `onSwitch('login')`
    **Patterns to follow:**
  - `apps/web/app/(main)/auth/register/register-form.tsx`
    **Test scenarios:**
  - Happy path: all fields render; on success, switches to check-email dialog
  - Error path: error state repopulates name + email fields via `state.values`
  - Edge case: "Already have an account?" calls `onSwitch('login')`
    **Verification:**
  - Successful registration shows Check Email dialog with type=register context

---

- **Unit 5: Forgot Password Dialog and Check Email Dialog**
  **Goal:** Forgot Password dialog (email only) + polymorphic Check Email confirmation dialog for register / forgot / change-email flows.
  **Requirements:** R7, R8
  **Dependencies:** Unit 1, Unit 2
  **Files:**
  - Create: `apps/web/components/auth/forgot-password-dialog.tsx`
  - Create: `apps/web/components/auth/check-email-dialog.tsx`
  - Test: `apps/web/components/auth/check-email-dialog.test.tsx`
    **Approach:**
  - `ForgotPasswordDialog`: email field, on success → `onSwitch('check-email')` + `type=forgot`
  - `CheckEmailDialog`: reads `type` param (`register` | `forgot` | `change-email`) from URL via `useSearchParams()`; renders context-appropriate title and body message ("Check your inbox to confirm your email" etc.)
  - No form in CheckEmailDialog — info only with a Close / Done button
    **Patterns to follow:**
  - `apps/web/app/(main)/auth/forgot-password/forgot-password-form.tsx`
  - `apps/web/app/(main)/auth/register/success/page.tsx` — success message language
    **Test scenarios:**
  - Happy path: `type=register` → renders register-specific message
  - Happy path: `type=forgot` → renders password reset message
  - Happy path: `type=change-email` → renders email update message
  - Edge case: no `type` param → renders generic "Check your email" fallback
    **Verification:**
  - Forgot password flow chains correctly through all three dialog states

---

- **Unit 6: Profile Dialog**
  **Goal:** Profile settings dialog matching design spec — email section with Change Email button, password section with Change Password button, Account section with Delete Account danger link.
  **Requirements:** R3, R8
  **Dependencies:** Unit 1
  **Files:**
  - Create: `apps/web/components/auth/profile-dialog.tsx`
  - Test: `apps/web/components/auth/profile-dialog.test.tsx`
    **Approach:**
  - `'use client'`; reads `useSession()` for `{ email, name }`
  - Layout: two labeled sections (Email, Password) each with title, subtitle, and a Button "Change email" / "Change password"; plus bold "Account" heading and a `<button>` styled as danger text link "Delete Account"
  - Email section subtitle: current `session.user.email`
  - Password section subtitle: "Configured" (static — no way to know if OAuth vs credentials)
  - "Change email" → `onSwitch('change-email')`
  - "Change password" → `onSwitch('change-password')`
  - "Delete Account" → `onSwitch('delete-account')`
  - No form submission in this dialog — it is a navigation hub
    **Patterns to follow:**
  - `apps/web/app/(main)/profile/page.tsx` — session access pattern
  - `apps/web/components/navbar/user-menu.tsx` — `useSession()` client component
    **Test scenarios:**
  - Happy path: dialog renders current user email in email section subtitle
  - Happy path: "Change email" button calls `onSwitch('change-email')`
  - Happy path: "Change password" button calls `onSwitch('change-password')`
  - Happy path: "Delete Account" calls `onSwitch('delete-account')`
  - Edge case: session loading → show skeleton / disabled state
    **Verification:**
  - Profile dialog opens from user menu; all navigation links switch to correct dialogs

---

- **Unit 7: Change Email, Change Password, and Delete Account Dialogs**
  **Goal:** Three account-management dialogs that call the new profile mutation actions.
  **Requirements:** R4, R5, R6
  **Dependencies:** Unit 1, Unit 2 (change-email/password/delete actions), Unit 6 (profile dialog for back nav)
  **Files:**
  - Create: `apps/web/components/auth/change-email-dialog.tsx`
  - Create: `apps/web/components/auth/change-password-dialog.tsx`
  - Create: `apps/web/components/auth/delete-account-dialog.tsx`
  - Test: `apps/web/components/auth/change-email-dialog.test.tsx`
  - Test: `apps/web/components/auth/delete-account-dialog.test.tsx`
    **Approach:**
  - **Change Email**: `DialogTitle` "Email", email input pre-filled with `session.user.email` (editable), "Update Email" button (bottom-right via `DialogFooter`); on success → `onSwitch('check-email')` + `type=change-email`
  - **Change Password**: `DialogTitle` "Password", old password + new password + confirm password fields; "Forgot Password" button (calls `onSwitch('forgot')`); "Update Password" submit button; on success → close dialog
  - **Delete Account**: `DialogTitle` "Delete Account"; subtitle text includes user email dynamically; email input with label "To confirm, type your email below."; Cancel button + destructive "Delete Account" button; on success → sign out and redirect to home
  - All use `useActionState` + `FormErrorAlert` + `AuthSubmitButton` pattern
    **Patterns to follow:**
  - All existing auth form components for `useActionState` pattern
  - `packages/ui/src/components/alert-dialog.tsx` for Delete Account (destructive action styling)
    **Test scenarios:**
  - Change Email happy path: pre-filled email field visible; on success, switches to check-email dialog
  - Change Password happy path: on success, dialog closes
  - Change Password error path: mismatched confirm password shows error
  - Delete Account happy path: correct email submitted → success → signout triggered
  - Delete Account error path: wrong email entered → error message shown without API call
  - Delete Account edge: Cancel button calls `onClose()`
    **Verification:**
  - All three dialogs render without errors; Delete Account requires exact email match before enabling submit

---

- **Unit 8: Navbar and Profile Page Updates**
  **Goal:** Wire `UserMenu` and navbar sign-in button to open dialogs instead of navigating to pages; redirect auth pages to dialog equivalents.
  **Requirements:** R1, R3, R9
  **Dependencies:** Units 1–7 (dialogs must exist)
  **Files:**
  - Modify: `apps/web/components/navbar/user-menu.tsx`
  - Modify: `apps/web/app/(main)/profile/page.tsx`
  - Modify: `apps/web/app/(main)/auth/signin/page.tsx`
  - Modify: `apps/web/app/(main)/auth/register/page.tsx`
  - Modify: `apps/web/app/(main)/auth/forgot-password/page.tsx`
  - Test: `apps/web/components/navbar/user-menu.test.tsx` (update existing)
    **Approach:**
  - `user-menu.tsx`: replace `<Link href="/auth/signin">Sign in</Link>` with a `<Button>` that calls `openDialog(router, 'login')`; replace `<Link href="/profile">Profile</Link>` `DropdownMenuItem` with an `onSelect` handler calling `openDialog(router, 'profile')`
  - `profile/page.tsx`: authenticated users get `redirect('/?modal=profile')` immediately after session check; unauthenticated redirect stays as-is (`/auth/signin?callbackUrl=/profile`)
  - `auth/signin/page.tsx` → `redirect('/?modal=login')`
  - `auth/register/page.tsx` → `redirect('/?modal=register')`
  - `auth/forgot-password/page.tsx` → `redirect('/?modal=forgot')`
  - Auth layout (`auth/layout.tsx`) can be kept or deleted depending on whether any child pages remain active (reset-password stays as a page)
    **Patterns to follow:**
  - `apps/web/components/navbar/user-menu.tsx` — current `onSelect` pattern for signout
  - `apps/web/app/(main)/profile/page.tsx` — `await auth()` + `isAuthenticatedSession` + `redirect()`
    **Test scenarios:**
  - Happy path: unauthenticated user → "Sign in" button in navbar → `?modal=login` appears in URL
  - Happy path: authenticated user → avatar menu → "Profile" item → `?modal=profile` appears in URL
  - Happy path: visiting `/auth/signin` → redirects to `/?modal=login`
  - Happy path: visiting `/profile` while authenticated → redirects to `/?modal=profile`
  - Happy path: visiting `/profile` while unauthenticated → redirects to `/auth/signin?callbackUrl=/profile`
    **Verification:**
  - No broken navigation links remain; browser back button dismisses open dialogs; direct URL `/auth/signin` lands user on home with login dialog

## System-Wide Impact

- **Interaction graph:** `AuthDialogManager` in `(main)/layout.tsx` affects every page under the main layout. `useSearchParams()` inside it must be wrapped in `<Suspense>` or it will break static rendering of layout.
- **Error propagation:** Dialog form errors remain local (returned from Server Action, displayed in `FormErrorAlert`). Network errors are caught and returned as `{ error: 'Something went wrong' }`.
- **State lifecycle risks:** After successful sign-in, `router.refresh()` must be called to invalidate Next.js router cache and re-run Server Components that read session; without it the navbar avatar may not update.
- **API surface parity:** Reset-password page (`/auth/reset-password`) is unchanged — it stays as a full page and its action is unchanged.
- **Integration coverage:** Sign-in dialog → session refresh → user menu update chain must be integration-tested end-to-end (not just unit-tested in isolation).
- **Unchanged invariants:** `/api/auth/[...nextauth]` handler, `/api/auth/signout` route, token refresh logic in `packages/auth/src/auth.config.ts` — none of these change.

## Risks & Dependencies

| Risk                                                                                  | Mitigation                                                                                                                               |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `useSearchParams()` in layout breaks static rendering                                 | Wrap `AuthDialogManager` in `<Suspense fallback={null}>` — required by Next.js                                                           |
| `router.refresh()` after sign-in is too slow → navbar flash                           | Show loading skeleton in `UserMenu` during `status === 'loading'` — already implemented                                                  |
| Backend API endpoints for change-email / change-password / delete-account are unknown | Implementer checks `packages/api-client/src/generated/` or contacts backend team before building Unit 2 actions                          |
| Delete account flow may require OIDC token revocation (not just API call)             | Implementer checks if `/api/auth/signout` must also be called post-delete; if yes, sequence it after the API delete                      |
| Dialog z-index conflicts with Navbar (sticky)                                         | Radix `DialogPortal` renders at `document.body` level — z-index above Navbar is handled by shadcn defaults; verify during implementation |
| Existing `/auth/signin` URL in OAuth redirect_uri config                              | `redirect()` shims in Unit 8 preserve the route so external OIDC redirects still land correctly before being forwarded                   |

## Sources & References

- Related code: `apps/web/app/(main)/auth/`
- Related code: `packages/ui/src/components/dialog.tsx`
- Related code: `apps/web/components/navbar/user-menu.tsx`
- Related code: `apps/web/app/(main)/profile/page.tsx`
- Related commits: `fix(web): stabilize auth flow and AML date rendering` (d6e21b5)
