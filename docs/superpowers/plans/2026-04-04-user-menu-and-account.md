# User Menu And Account Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared avatar-triggered user menu to the app header and a lightweight `/account` page that shows name, email, and current plan.

**Architecture:** Replace page-local `LogoutButton` usage with a shared `UserMenu` client component that receives server-fetched session identity and plan metadata from each route. Keep `DashboardShell` as the shared header container, add a small account summary page under the app section, and preserve existing logout and billing navigation behavior.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Better Auth, Vitest

---

## File Map

### Existing files to modify

- `components/dashboard-shell.tsx`
  - Keep the shared app header structure stable while making room for a shared user menu in `headerActions`.
- `components/logout-button.tsx`
  - Reuse the logout behavior internally or shrink it into a lower-level action helper if the user menu becomes the main surface.
- `components/performance-archive-page-content.tsx`
  - Replace the standalone logout button in the archive header with the shared user menu.
- `components/event-editor-page-content.tsx`
  - Replace standalone logout button usage in editor header actions.
- `app/(app)/events/page.tsx`
  - Pass session identity and current plan data to the archive page composition.
- `app/(app)/events/[eventId]/page.tsx`
  - Pass session identity and current plan data to the editor page composition.
- `app/(app)/templates/page.tsx`
  - Replace logout button with user menu and pass identity/plan props.
- `app/(app)/settings/billing/page.tsx`
  - Replace logout button with user menu and keep `プラン管理` routing consistent.
- `tests/components/event-editor.test.tsx`
  - Update header expectations from standalone logout button to user menu trigger.
- `tests/components/performance-archive-page.test.tsx`
  - Update archive header assertions to look for user menu trigger.
- `tests/components/billing-page.test.tsx`
  - Update billing page top-bar assertions to match the user menu.
- `tests/components/templates-page.test.tsx`
  - Update template page assertions for the shared menu.

### New files likely to create

- `components/user-menu.tsx`
  - Shared avatar trigger + dropdown menu + logout action.
- `app/(app)/account/page.tsx`
  - Lightweight account summary page.
- `tests/components/user-menu.test.tsx`
  - Interaction coverage for open/close/navigation/logout states.
- `tests/app/account-page.test.tsx`
  - Render coverage for the new account page.

### Files to inspect during implementation

- `lib/auth.ts`
  - Session types and server session helpers.
- `lib/subscription.ts`
  - Current plan lookup for the account page and header identity.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-04-user-menu-and-account-design.md`
- Shared shell: `components/dashboard-shell.tsx`
- Existing logout action: `components/logout-button.tsx`
- Current app routes:
  - `app/(app)/events/page.tsx`
  - `app/(app)/events/[eventId]/page.tsx`
  - `app/(app)/templates/page.tsx`
  - `app/(app)/settings/billing/page.tsx`

## Task 1: Lock In Shared User Menu Expectations With Failing Tests

**Files:**
- Create: `tests/components/user-menu.test.tsx`
- Modify:
  - `tests/components/performance-archive-page.test.tsx`
  - `tests/components/event-editor.test.tsx`
  - `tests/components/billing-page.test.tsx`
  - `tests/components/templates-page.test.tsx`

- [ ] **Step 1: Write focused user-menu interaction tests**

Add tests that expect:

- an avatar trigger button in the header
- the menu to reveal identity info
- menu items `マイページ`, `プラン管理`, `ログアウト`
- the menu to close on outside click or `Esc` if practical in the existing test harness

Suggested assertions:

```tsx
expect(screen.getByRole("button", { name: "ユーザーメニューを開く" })).toBeInTheDocument();
await user.click(screen.getByRole("button", { name: "ユーザーメニューを開く" }));
expect(screen.getByText("マイページ")).toBeInTheDocument();
expect(screen.getByText("プラン管理")).toBeInTheDocument();
expect(screen.getByText("ログアウト")).toBeInTheDocument();
```

- [ ] **Step 2: Update route-level tests to expect a menu trigger instead of a standalone logout button**

Adjust the archive/editor/templates/billing tests so they assert the shared account entry point exists in the header without over-constraining exact styling.

- [ ] **Step 3: Run the focused user-menu related tests to verify they fail**

Run:

```bash
npm run test -- tests/components/user-menu.test.tsx tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/components/templates-page.test.tsx
```

Expected: FAIL because the app still renders `LogoutButton` directly and no `/account` navigation exists.

- [ ] **Step 4: Tighten only structural expectations**

Keep these tests focused on menu behavior and route wiring. Do not lock in dropdown spacing or exact class names.

- [ ] **Step 5: Commit**

```bash
git add tests/components/user-menu.test.tsx tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/components/templates-page.test.tsx
git commit -m "test: define shared user menu behavior"
```

## Task 2: Build The Shared User Menu Component

**Files:**
- Create: `components/user-menu.tsx`
- Modify:
  - `components/logout-button.tsx`
  - `components/dashboard-shell.tsx`

- [ ] **Step 1: Implement the avatar trigger and menu state**

Build `UserMenu` as a client component that accepts:

- display name
- email
- current plan
- current theme or theme style hooks if needed

The trigger should render a circular initial and an accessible label such as `ユーザーメニューを開く`.

- [ ] **Step 2: Wire dropdown content and navigation**

Render three sections:

- identity block with display name, email, plan pill
- navigation items for `/account` and `/settings/billing`
- logout action

Prefer `next/link` for navigation items and reuse existing logout behavior through either:

- composition around `LogoutButton`, or
- a shared logout action extracted from it

Choose the simpler option that avoids duplicating sign-out logic.

- [ ] **Step 3: Add close behavior**

Support:

- trigger toggle
- outside click close
- `Esc` close

Keep implementation small and reliable rather than building a full menu framework.

- [ ] **Step 4: Run the focused user-menu tests**

Run:

```bash
npm run test -- tests/components/user-menu.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/user-menu.tsx components/logout-button.tsx components/dashboard-shell.tsx tests/components/user-menu.test.tsx
git commit -m "feat: add shared app user menu"
```

## Task 3: Replace Standalone Logout Buttons Across App Screens

**Files:**
- Modify:
  - `components/performance-archive-page-content.tsx`
  - `components/event-editor-page-content.tsx`
  - `app/(app)/events/page.tsx`
  - `app/(app)/events/[eventId]/page.tsx`
  - `app/(app)/templates/page.tsx`
  - `app/(app)/settings/billing/page.tsx`

- [ ] **Step 1: Pass session identity and plan data into each page composition**

From each server route, pass the minimum data needed by `UserMenu`:

- display name fallback order: `user.name`, then local part of email, then email
- email
- current plan

Keep server/client boundaries explicit.

- [ ] **Step 2: Swap header actions to use `UserMenu`**

Replace all direct `LogoutButton` header usage with `UserMenu`, while preserving:

- theme toggle placement
- current CTA group order
- billing top bar composition

- [ ] **Step 3: Run the affected route/component tests**

Run:

```bash
npm run test -- tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/components/templates-page.test.tsx
```

Expected: PASS

- [ ] **Step 4: Keep layout regressions contained**

If a header becomes too crowded, adjust only the header action wrapping or avatar sizing. Do not redesign unrelated panels in this task.

- [ ] **Step 5: Commit**

```bash
git add components/performance-archive-page-content.tsx components/event-editor-page-content.tsx app/(app)/events/page.tsx app/(app)/events/[eventId]/page.tsx app/(app)/templates/page.tsx app/(app)/settings/billing/page.tsx tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/components/templates-page.test.tsx
git commit -m "feat: use shared user menu in app headers"
```

## Task 4: Add The Lightweight Account Page

**Files:**
- Create: `app/(app)/account/page.tsx`
- Create: `tests/app/account-page.test.tsx`
- Modify only if necessary:
  - `components/dashboard-shell.tsx`

- [ ] **Step 1: Write the failing account page test**

Cover:

- redirect to `/login` when unauthenticated
- page heading
- visible name/email
- current plan summary
- link to `/settings/billing`

Suggested assertions:

```tsx
expect(screen.getByRole("heading", { name: "マイページ" })).toBeInTheDocument();
expect(screen.getByText("現在のプラン")).toBeInTheDocument();
expect(screen.getByRole("link", { name: "プラン管理へ" })).toHaveAttribute("href", "/settings/billing");
```

- [ ] **Step 2: Run the focused account-page test to verify it fails**

Run:

```bash
npm run test -- tests/app/account-page.test.tsx
```

Expected: FAIL because `/account` does not exist yet.

- [ ] **Step 3: Implement the minimal account summary page**

Use the existing dark app family styling. Show:

- page title
- identity summary card
- plan summary card
- link/button to billing

Do not add editing forms.

- [ ] **Step 4: Re-run the focused account-page test**

Run:

```bash
npm run test -- tests/app/account-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/account/page.tsx tests/app/account-page.test.tsx
git commit -m "feat: add lightweight account page"
```

## Task 5: Final Regression Sweep

**Files:**
- Modify only if regressions require it:
  - `tests/components/logout-button.test.tsx`
  - `tests/app/auth-pages.test.tsx`
  - `tests/app-page.test.tsx`

- [ ] **Step 1: Run the new focused regression bundle**

Run:

```bash
npm run test -- tests/components/user-menu.test.tsx tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/components/templates-page.test.tsx tests/app/account-page.test.tsx
```

Expected: PASS

- [ ] **Step 2: Run the full verification suite**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: PASS

- [ ] **Step 3: Fix only legitimate regressions**

If the shared user menu changes wording intentionally, update only the tests or labels that depended on the old standalone logout button.

- [ ] **Step 4: Re-run the minimal failing commands if needed**

Run only the commands required to confirm the regression fix.

- [ ] **Step 5: Commit**

```bash
git add components/user-menu.tsx components/logout-button.tsx components/dashboard-shell.tsx app/(app)/account/page.tsx app/(app)/events/page.tsx app/(app)/events/[eventId]/page.tsx app/(app)/templates/page.tsx app/(app)/settings/billing/page.tsx components/performance-archive-page-content.tsx components/event-editor-page-content.tsx tests/components/user-menu.test.tsx tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/components/templates-page.test.tsx tests/app/account-page.test.tsx
git commit -m "test: verify user menu and account flows"
```
