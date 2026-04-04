# App Global Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared app-level navigation so users can always reach archive, templates, and billing from the authenticated app screens.

**Architecture:** Introduce one small shared `AppGlobalNav` component and thread it through the existing authenticated headers instead of redesigning page layouts. Reuse `DashboardShell` where it already owns the header, and manually mount the same nav in `billing` and `account` so active state and navigation labels stay consistent across the app.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Vitest, Testing Library

---

## File Map

### Existing files to modify

- `components/dashboard-shell.tsx`
  - Add a small integration point for the shared global nav inside the existing app header.
- `app/(app)/settings/billing/page.tsx`
  - Mount the shared nav in the billing top bar and mark `請求` active.
- `app/(app)/account/page.tsx`
  - Mount the shared nav in the account top bar with no forced active item.
- `tests/components/event-editor.test.tsx`
  - Assert the shared nav appears in dashboard-shell based screens.
- `tests/components/billing-page.test.tsx`
  - Assert templates/archive links are available in billing and current active state remains sensible.
- `tests/app/account-page.test.tsx`
  - Add or update expectations for the new shared nav on `/account`.

### New files to create

- `components/app-global-nav.tsx`
  - Shared archive/templates/billing navigation with active state styling and href ownership in one place.

### Files to inspect during implementation

- `components/performance-archive-page-content.tsx`
  - DashboardShell consumer representing archive active state.
- `components/event-editor-page-content.tsx`
  - DashboardShell consumer representing archive active state from the editor.
- `app/(app)/templates/page.tsx`
  - Confirm the templates route automatically picks up the nav through `DashboardShell` usage or note if it still needs a local insertion later.
- `components/user-menu.tsx`
  - Keep user actions separate from navigation; do not overload this menu.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-05-app-global-navigation-design.md`
- Shared shell: `components/dashboard-shell.tsx`
- Billing header: `app/(app)/settings/billing/page.tsx`
- Account header: `app/(app)/account/page.tsx`

## Task 1: Lock In Shared Navigation Expectations With Failing Tests

**Files:**
- Create: `tests/app/account-page.test.tsx` or modify if it already exists later in the repo
- Modify: `tests/components/event-editor.test.tsx`
- Modify: `tests/components/billing-page.test.tsx`

- [ ] **Step 1: Add route/component expectations for the new shared nav**

Cover these expectations without overfitting classes:

- archive/editor headers expose links for `アーカイブ`, `テンプレート`, `請求`
- billing exposes links back to archive and templates
- account exposes the same nav
- active state is asserted via `aria-current="page"` where applicable

Suggested checks:

```tsx
expect(screen.getByRole("link", { name: "テンプレート" })).toHaveAttribute("href", "/templates");
expect(screen.getByRole("link", { name: "請求" })).toHaveAttribute("href", "/settings/billing");
expect(screen.getByRole("link", { name: "アーカイブ" })).toHaveAttribute("href", "/events");
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test -- tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
```

Expected: FAIL because the shared navigation does not exist yet.

- [ ] **Step 3: Tighten any weak expectations**

Make sure the tests prove cross-page navigation behavior, not incidental layout details.

- [ ] **Step 4: Re-run the focused tests**

Run:

```bash
npm run test -- tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
```

Expected: still FAIL, but only for the missing nav behavior.

- [ ] **Step 5: Commit**

```bash
git add tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
git commit -m "test: define app global navigation expectations"
```

## Task 2: Build The Shared App Navigation Component

**Files:**
- Create: `components/app-global-nav.tsx`

- [ ] **Step 1: Implement the shared nav component with a single source of truth**

Create a focused component that owns:

- labels
- hrefs
- optional `activeItem`
- active/inactive styles

Keep the API small, for example:

```tsx
type AppGlobalNavItem = "archive" | "templates" | "billing" | null;
```

- [ ] **Step 2: Make active state accessible**

Set `aria-current="page"` only for the active item. Do not add click handlers or client-only state if plain links suffice.

- [ ] **Step 3: Keep the visual weight below primary action buttons**

Use compact nav pills/tabs so the nav reads as movement between pages, not a competing CTA cluster.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
npm run test -- tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
```

Expected: still FAIL because the component is not mounted yet.

- [ ] **Step 5: Commit**

```bash
git add components/app-global-nav.tsx
git commit -m "feat: add shared app global nav"
```

## Task 3: Integrate The Shared Nav Into DashboardShell Screens

**Files:**
- Modify: `components/dashboard-shell.tsx`
- Inspect: `components/performance-archive-page-content.tsx`
- Inspect: `components/event-editor-page-content.tsx`

- [ ] **Step 1: Add a minimal integration point to DashboardShell**

Thread an optional active nav prop or nav node into the header without disturbing existing page-specific actions.

Keep the brand block, current-show meta, and action area intact.

- [ ] **Step 2: Mount the shared nav in dashboard-based screens**

Make archive and editor screens surface the shared nav with `アーカイブ` active.

- [ ] **Step 3: Confirm templates screen receives the nav through the same shell path, or explicitly note if it still does not use DashboardShell**

If `/templates` does not use `DashboardShell`, do not force a large refactor here. Leave it for Task 4's page-level integration.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
npm run test -- tests/components/event-editor.test.tsx
```

Expected: event/editor navigation expectations PASS; billing/account expectations may still fail.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard-shell.tsx components/performance-archive-page-content.tsx components/event-editor-page-content.tsx
git commit -m "feat: wire shared nav into dashboard shell"
```

## Task 4: Integrate The Shared Nav Into Billing And Account Headers

**Files:**
- Modify: `app/(app)/settings/billing/page.tsx`
- Modify: `app/(app)/account/page.tsx`

- [ ] **Step 1: Mount the nav into the billing header**

Place it between the left-side title block and the right-side user area, keeping `請求` active.

- [ ] **Step 2: Mount the nav into the account header**

Expose the same links without forcing an active state. Preserve the existing `UserMenu`.

- [ ] **Step 3: Keep guest billing behavior safe**

If billing is rendered for an anonymous viewer in tests, the nav can still be visible, but it must not break the existing login CTA behavior in the header.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
npm run test -- tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/settings/billing/page.tsx app/(app)/account/page.tsx tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
git commit -m "feat: add shared nav to billing and account"
```

## Task 5: Integrate The Shared Nav Into Templates And Finalize Active States

**Files:**
- Modify: `app/(app)/templates/page.tsx`
- Modify: `tests/components/templates-page.test.tsx`

- [ ] **Step 1: Add the shared nav to `/templates`**

Because `/templates` currently owns its own header, mount the nav there directly and mark `テンプレート` active.

- [ ] **Step 2: Keep page-specific actions intact**

Do not regress:

- `TemplateSaveButton`
- `UserMenu`
- page title and section structure

- [ ] **Step 3: Assert templates now links back to archive and billing**

Add route-level checks for:

```tsx
expect(screen.getByRole("link", { name: "アーカイブ" })).toHaveAttribute("href", "/events");
expect(screen.getByRole("link", { name: "請求" })).toHaveAttribute("href", "/settings/billing");
expect(screen.getByRole("link", { name: "テンプレート" })).toHaveAttribute("aria-current", "page");
```

- [ ] **Step 4: Run the focused templates test**

Run:

```bash
npm run test -- tests/components/templates-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/templates/page.tsx tests/components/templates-page.test.tsx
git commit -m "feat: add shared nav to templates"
```

## Task 6: Final Regression Sweep

**Files:**
- Modify only if regressions appear

- [ ] **Step 1: Run the relevant focused suite**

Run:

```bash
npm run test -- tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/components/templates-page.test.tsx tests/app/account-page.test.tsx
```

Expected: PASS

- [ ] **Step 2: Run full verification**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: all PASS

- [ ] **Step 3: Review for navigation regressions**

Manually inspect or test that:

- `UserMenu` still works
- page-specific primary actions still fit in header rows
- no page loses its existing title/context block

- [ ] **Step 4: Request code review if the workflow requires it**

Focus review on:

- incorrect active states
- guest billing behavior
- templates/account header regressions

- [ ] **Step 5: Commit final polish if needed**

```bash
git add components app tests
git commit -m "fix: polish app global navigation"
```
