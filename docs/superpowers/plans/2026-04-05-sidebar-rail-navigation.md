# Sidebar Rail Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move shared app navigation into a Stitch-style left rail with icons, collapse support, and a footer logout action across the authenticated app screens.

**Architecture:** Replace the new header-level shared nav with a sidebar rail model that combines app-wide navigation, page-specific sidebar content, and a footer utility area. Keep `DashboardShell` server-side, and host the collapse state inside a new client `SidebarRail` wrapper so server-rendered page composition does not regress. Align `/templates`, `/settings/billing`, and `/account` around that same shared rail wrapper so navigation placement, collapse behavior, and footer utilities stay consistent across bespoke page bodies.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Vitest, Testing Library

---

## File Map

### Existing files to modify

- `components/app-global-nav.tsx`
  - Rework from header pills into a left-rail navigation with icons, collapsed rendering, and `account` support.
- `components/dashboard-shell.tsx`
  - Move global nav out of the header and into the left rail; pass page-specific sidebar content and a footer utility slot into a client rail wrapper without converting the shell itself to a client component.
- `components/event-editor-page-content.tsx`
  - Pass the correct active rail item and keep event-specific sidebar content in the page-specific slot.
- `components/performance-archive-page-content.tsx`
  - Same as editor: use rail nav instead of header nav, preserve archive-specific content.
- `app/(app)/templates/page.tsx`
  - Reshape to use the shared left rail instead of a local top header nav.
- `app/(app)/settings/billing/page.tsx`
  - Replace header-level shared nav with the shared left rail layout while preserving the billing page body.
- `app/(app)/account/page.tsx`
  - Same as billing, with `マイページ` active.
- `components/logout-button.tsx`
  - Confirm it works visually and semantically in a left-rail footer position.
- `components/authenticated-app-frame.tsx`
  - Shared non-dashboard wrapper for templates, billing, and account so they reuse the same rail/header structure instead of drifting.
- `tests/components/event-editor.test.tsx`
  - Update expectations from header nav to left-rail nav.
- `tests/components/event-editor-page-route.test.tsx`
  - Avoid confusing the app rail nav with the event sidebar nav.
- `tests/components/performance-archive-page.test.tsx`
  - Assert shared navigation appears in the left rail on archive.
- `tests/components/templates-page.test.tsx`
  - Assert the left rail exists and `テンプレート` is active.
- `tests/components/billing-page.test.tsx`
  - Assert the left rail layout and billing active state.
- `tests/app/account-page.test.tsx`
  - Assert the left rail layout and `マイページ` active state.

### New files to create

- `components/sidebar-rail.tsx`
  - Shared layout wrapper for brand, collapse toggle, global nav, page-specific content slot, and footer utility slot.

### Files to inspect during implementation

- `components/user-menu.tsx`
  - Keep user info actions in the header while removing navigation responsibilities.
- `components/event-list.tsx`
  - Ensure page-specific event navigation still works when the left rail also contains app-wide navigation.
- `components/settings-sidebar.tsx`
  - Decide whether to keep or slim this content once the app-wide rail sits above it.
- `app/(app)/settings/billing/page.tsx`
  - Preserve the guest login CTA path while ensuring no logout footer renders for anonymous billing.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-05-sidebar-rail-navigation-design.md`
- Previous global-nav work: `docs/superpowers/specs/2026-04-05-app-global-navigation-design.md`
- Shared shell: `components/dashboard-shell.tsx`
- New shared nav baseline: `components/app-global-nav.tsx`

## Task 1: Lock In Left-Rail Navigation Expectations With Failing Tests

**Files:**
- Modify: `tests/components/event-editor.test.tsx`
- Modify: `tests/components/event-editor-page-route.test.tsx`
- Modify: `tests/components/performance-archive-page.test.tsx`
- Modify: `tests/components/templates-page.test.tsx`
- Modify: `tests/components/billing-page.test.tsx`
- Modify: `tests/app/account-page.test.tsx`

- [ ] **Step 1: Rewrite shared-nav expectations around a left rail**

Update tests to assert:

- the app-wide nav is in the left rail, not the top header
- links exist for `アーカイブ`, `テンプレート`, `請求`, `マイページ`
- `aria-current="page"` is set for the correct item on each route
- `ログアウト` is reachable from the left rail footer
- the collapse toggle exists and can switch the rail into icon-only mode
- icon-only nav items still expose accessible names
- page-specific sidebar content hides or compacts as intended in collapsed mode

Example checks:

```tsx
const appNavigation = within(screen.getByRole("complementary")).getByRole("navigation", {
  name: "アプリ全体ナビゲーション",
});
expect(within(appNavigation).getByRole("link", { name: "テンプレート" })).toHaveAttribute(
  "href",
  "/templates",
);
await user.click(screen.getByRole("button", { name: "サイドバーを縮小" }));
expect(within(appNavigation).getByRole("link", { name: "請求" })).toHaveAttribute(
  "aria-current",
  "page",
);
```

- [ ] **Step 2: Keep page-specific sidebar assertions separate**

Make sure event-list and settings-sidebar tests still target their own navigation landmarks so they do not accidentally pass against the new app rail.

- [ ] **Step 2.5: Cover the anonymous billing branch explicitly**

Add an assertion that guest billing still shows the login CTA and does **not** render the footer logout control.

- [ ] **Step 3: Run the focused tests to verify they fail**

Run:

```bash
npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx tests/components/performance-archive-page.test.tsx tests/components/templates-page.test.tsx tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
```

Expected: FAIL because the rail layout and footer logout do not exist yet.

- [ ] **Step 4: Tighten weak selectors before implementation**

Prefer scoped `within()` checks against the rail container over brittle class assertions.

- [ ] **Step 5: Commit**

```bash
git add tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx tests/components/performance-archive-page.test.tsx tests/components/templates-page.test.tsx tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
git commit -m "test: define sidebar rail navigation expectations"
```

## Task 2: Build The Shared Sidebar Rail Components

**Files:**
- Create: `components/sidebar-rail.tsx`
- Create: `components/authenticated-app-frame.tsx`
- Modify: `components/app-global-nav.tsx`
- Modify: `components/logout-button.tsx`

- [ ] **Step 1: Create a focused `SidebarRail` component**

It should own:

- brand area
- collapse toggle
- app-wide nav slot
- page-specific content slot
- footer slot
- authenticated/guest-aware utility region

Keep the API small:

```tsx
type SidebarRailProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  navigation: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};
```

- [ ] **Step 2: Rework `AppGlobalNav` for rail usage**

Add:

- icons for `archive / templates / billing / account`
- `collapsed` prop
- active/inactive styling that still works without labels
- accessible names via visible text or `aria-label`

- [ ] **Step 3: Build a shared `AuthenticatedAppFrame` for non-dashboard pages**

This wrapper should compose:

- the same `SidebarRail`
- a consistent top header container for page title + actions + `UserMenu`
- a main content slot

This makes `/templates`, `/settings/billing`, and `/account` consume one rail/header API instead of hand-rolling the structure three times.

- [ ] **Step 4: Adapt `LogoutButton` for the rail footer**

Do not change sign-out behavior. Only make sure it can render naturally in a rail footer when the rail is collapsed or expanded.

- [ ] **Step 5: Run the focused tests**

Run:

```bash
npm run test -- tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
```

Expected: still FAIL because the new rail is not mounted yet.

- [ ] **Step 6: Commit**

```bash
git add components/sidebar-rail.tsx components/authenticated-app-frame.tsx components/app-global-nav.tsx components/logout-button.tsx
git commit -m "feat: build shared sidebar rail components"
```

## Task 3: Move DashboardShell Screens To The Sidebar Rail

**Files:**
- Modify: `components/dashboard-shell.tsx`
- Modify: `components/event-editor-page-content.tsx`
- Modify: `components/performance-archive-page-content.tsx`

- [ ] **Step 1: Move shared app navigation out of the header**

Refactor `DashboardShell` so:

- the header keeps brand meta, page actions, and `UserMenu`
- the left rail renders client `SidebarRail`
- page-specific sidebar content still renders below the app nav
- footer utility comes from a shared authenticated pattern

- [ ] **Step 2: Add client-side collapse state**

Host this state inside `SidebarRail` (or a small client child directly above it), not in `DashboardShell`, so `DashboardShell` remains server-rendered. Do not add persistence unless it falls out cleanly.

- [ ] **Step 3: Mount the app rail on archive/editor**

Use:

- `activeItem="archive"` for `/events`
- `activeItem="archive"` for `/events/[eventId]`

Keep event list and archive-specific content visible in expanded mode.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx tests/components/performance-archive-page.test.tsx
```

Expected: PASS for archive/editor left-rail expectations; templates/billing/account may still fail.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard-shell.tsx components/event-editor-page-content.tsx components/performance-archive-page-content.tsx tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx tests/components/performance-archive-page.test.tsx
git commit -m "feat: move dashboard screens to sidebar rail nav"
```

## Task 4: Apply The Sidebar Rail To Templates

**Files:**
- Modify: `app/(app)/templates/page.tsx`
- Modify: `tests/components/templates-page.test.tsx`

- [ ] **Step 1: Replace the local top-nav layout with the shared left rail**

The page should show:

- app rail on the left with `テンプレート` active
- existing template content on the right
- `UserMenu` remaining in the top header area
- the shared `AuthenticatedAppFrame` instead of bespoke rail/header markup

- [ ] **Step 2: Preserve the two-section templates workflow**

Do not regress:

- upper `既存公演から保存`
- lower `保存済みテンプレート一覧`
- `TemplateSaveButton`
- template creation actions

- [ ] **Step 3: Run the focused templates test**

Run:

```bash
npm run test -- tests/components/templates-page.test.tsx
```

Expected: PASS

- [ ] **Step 4: Manually check collapsed layout assumptions in code**

Make sure templates page copy does not rely on the full-width header nav being present.

- [ ] **Step 5: Commit**

```bash
git add app/(app)/templates/page.tsx tests/components/templates-page.test.tsx
git commit -m "feat: move templates to sidebar rail nav"
```

## Task 5: Apply The Sidebar Rail To Billing And Account

**Files:**
- Modify: `app/(app)/settings/billing/page.tsx`
- Modify: `app/(app)/account/page.tsx`
- Modify: `tests/components/billing-page.test.tsx`
- Modify: `tests/app/account-page.test.tsx`

- [ ] **Step 1: Replace the shared top-nav usage with the left rail**

Billing should mark `請求` active. Account should mark `マイページ` active.

- [ ] **Step 2: Keep user actions visible**

Preserve:

- `UserMenu`
- billing CTA behavior
- guest login CTA behavior on billing

- [ ] **Step 3: Move logout responsibility to the rail footer**

Make the left rail footer the single obvious place for sign-out on authenticated pages by having `DashboardShell` and `AuthenticatedAppFrame` always mount `LogoutButton` there for signed-in users. Guests on billing should not receive a logout footer.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
npm run test -- tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/settings/billing/page.tsx app/(app)/account/page.tsx tests/components/billing-page.test.tsx tests/app/account-page.test.tsx
git commit -m "feat: apply sidebar rail nav to billing and account"
```

## Task 6: Final Regression, Accessibility, And Cleanup

**Files:**
- Inspect/modify as needed:
  - `components/sidebar-rail.tsx`
  - `components/app-global-nav.tsx`
  - `components/dashboard-shell.tsx`
  - route/component tests listed above

- [ ] **Step 1: Verify collapsed rail accessibility**

Confirm that:

- icon-only items still expose names
- active state is still discoverable
- collapse toggle has a meaningful accessible name
- page-specific sidebar content follows the intended collapsed behavior

- [ ] **Step 2: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS

- [ ] **Step 3: Run static verification**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: all PASS

- [ ] **Step 4: Do a brief UI review for obvious regressions**

Manually inspect:

- archive
- editor
- templates
- billing
- account

Pay special attention to:

- page-specific sidebar content visibility
- collapse toggle placement
- footer logout visibility

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "fix: polish sidebar rail navigation"
```
