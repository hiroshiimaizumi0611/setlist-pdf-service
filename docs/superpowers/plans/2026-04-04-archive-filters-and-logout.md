# Archive Filters And Logout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the archive filters on `/events` fully functional and add a shared logout action across the authenticated app shell.

**Architecture:** Keep archive filtering entirely client-side inside `PerformanceArchivePageContent`, extending the existing `useMemo` filtering pass with venue, saved event theme, and date-range state. Add logout as a small reusable client component that plugs into header action groups without rewriting page ownership boundaries, then wire it into archive, editor, templates, and billing surfaces.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Better Auth client, Vitest, Playwright

---

## File Map

### Existing files to modify

- `components/performance-archive-page-content.tsx`
  - Owns archive filter state, derived options, filtered counts, and archive shell composition.
- `components/performance-archive-filters.tsx`
  - Convert from disabled placeholder controls into a pure presentational filter form with real props.
- `components/dashboard-shell.tsx`
  - Keep shell contract stable, but ensure common app-shell action composition remains clean after adding logout.
- `components/event-editor-page-content.tsx`
  - Add logout into both editor header-action compositions without disturbing theme toggle / PDF actions.
- `app/(app)/templates/page.tsx`
  - Introduce authenticated-shell-style header actions including logout.
- `app/(app)/settings/billing/page.tsx`
  - Introduce authenticated-shell-style header actions including logout.
- `tests/components/performance-archive-page.test.tsx`
  - Add filter behavior and route-regression assertions.
- `tests/components/event-editor.test.tsx`
  - Add logout presence checks for editor variants if needed.
- `tests/components/billing-page.test.tsx`
  - Add logout/header-action coverage for billing.
- `tests/components/templates-page.test.tsx`
  - Add logout/header-action coverage for templates.
- `tests/app-page.test.tsx` or related route tests only if shared wording shifts
  - Update only if shell text changes ripple outward.
- `tests/e2e/setlist-flow.spec.ts`
  - Add or update flow coverage if logout or filter expectations need end-to-end confirmation.

### New files likely to create

- `components/logout-button.tsx`
  - Small client component that calls `authClient.signOut()` and returns the user to `/login`.
- `tests/components/logout-button.test.tsx`
  - Focused client-component coverage for sign-out behavior.

Keep the archive-specific logic in archive files. Do not move filter state into the route file or global store.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-04-archive-filters-and-logout-design.md`
- Current archive implementation:
  - `components/performance-archive-page-content.tsx`
  - `components/performance-archive-filters.tsx`
- Current shared shell:
  - `components/dashboard-shell.tsx`
- Auth client:
  - `lib/auth-client.ts`

## Task 1: Lock In Filter Semantics With Failing Archive Tests

**Files:**
- Modify: `tests/components/performance-archive-page.test.tsx`
- Test target: `components/performance-archive-page-content.tsx`

- [ ] **Step 1: Write the failing tests for real archive filters**

Add focused tests that expect:

- `Venue` narrows rows to a specific venue and `未設定`
- `Event Theme` filters rows by saved row theme, not page theme
- `Date Range` supports `Last 30 Days`, `Earlier This Year`, and `Previous Years`
- date bucketing is interpreted on `Asia/Tokyo` day boundaries, not host-local midnight
- `RESET FILTERS` clears search and every select
- total-count UI stays on archive total while visible-count UI changes

Suggested assertions:

```tsx
fireEvent.change(screen.getByLabelText("Venue"), { target: { value: "RADHALL" } });
expect(screen.getByText("2026.03.28 名古屋 RADHALL")).toBeInTheDocument();
expect(screen.queryByText("2025.11.26 Spotify O-WEST")).not.toBeInTheDocument();
expect(screen.getByText("2公演")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused archive test to verify it fails**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx`

Expected: FAIL because only text search exists and the three select controls are disabled placeholders.

- [ ] **Step 3: Implement the minimal archive filter behavior**

In `components/performance-archive-page-content.tsx`:

- add `selectedVenue`, `selectedTheme`, `selectedDateRange` state
- derive `venueOptions` from event summaries
- bucket archive dates using `Asia/Tokyo` day semantics before applying date-range presets
- extend `filteredEvents` to AND together:
  - title/venue text search
  - venue exact match
  - saved row theme exact match
  - date-range bucket
- keep `totalArchiveCountLabel` independent from filtered counts
- keep filtered count display only in overview

In `components/performance-archive-filters.tsx`:

- remove `disabled`
- accept explicit value/change props
- rename visible label to `Event Theme` or equivalent copy that distinguishes it from page theme
- make `RESET FILTERS` clear everything, not just search

- [ ] **Step 4: Run the focused archive test to verify it passes**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/performance-archive-page-content.tsx components/performance-archive-filters.tsx tests/components/performance-archive-page.test.tsx
git commit -m "feat: add functional archive filters"
```

## Task 2: Add A Reusable Logout Button With Failing Client Tests

**Files:**
- Create: `components/logout-button.tsx`
- Create: `tests/components/logout-button.test.tsx`
- Optional Modify: `lib/auth-client.ts` only if testability requires a tiny extraction

- [ ] **Step 1: Write the failing logout-button test**

Add tests that expect:

- clicking the button calls `authClient.signOut()`
- after success, the user is routed to `/login`
- while pending, the button becomes disabled and shows a pending label

Suggested assertions:

```tsx
await user.click(screen.getByRole("button", { name: "ログアウト" }));
expect(signOutMock).toHaveBeenCalled();
expect(routerPushMock).toHaveBeenCalledWith("/login");
```

- [ ] **Step 2: Run the focused logout-button test to verify it fails**

Run: `npm run test -- tests/components/logout-button.test.tsx`

Expected: FAIL because the component does not exist yet.

- [ ] **Step 3: Implement the minimal reusable logout button**

Create `components/logout-button.tsx` as a client component that:

- uses `authClient.signOut()`
- uses Next navigation client routing or a safe `window.location.assign("/login")` fallback
- exposes `currentTheme` or `className` props only if needed to match the dark shell actions
- uses the same dense secondary-button look as other shell actions

Keep it intentionally small; do not create a broader auth menu.

- [ ] **Step 4: Run the focused logout-button test to verify it passes**

Run: `npm run test -- tests/components/logout-button.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/logout-button.tsx tests/components/logout-button.test.tsx
git commit -m "feat: add shared logout button"
```

## Task 3: Wire Logout Through Archive, Editor, Templates, And Billing

**Files:**
- Modify: `components/performance-archive-page-content.tsx`
- Modify: `components/event-editor-page-content.tsx`
- Modify: `app/(app)/templates/page.tsx`
- Modify: `app/(app)/settings/billing/page.tsx`
- Modify: `tests/components/event-editor.test.tsx`
- Modify: `tests/components/billing-page.test.tsx`
- Modify: `tests/components/templates-page.test.tsx`
- Modify: `tests/components/performance-archive-page.test.tsx`

- [ ] **Step 1: Write the failing route/component assertions for shared logout**

Add tests that expect:

- archive header actions include logout
- editor header actions include logout in both empty and active-event states
- templates page and billing page render a logout control in their top action area
- archive still shows page theme toggle separately from event-theme filter

Suggested assertions:

```tsx
expect(screen.getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
expect(screen.getByRole("link", { name: "DARK" })).toBeInTheDocument();
expect(screen.getByLabelText("Event Theme")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused shared-shell tests to verify they fail**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx`

Run: `npm run test -- tests/components/templates-page.test.tsx`

Expected: FAIL because logout is not wired into these page compositions yet.

- [ ] **Step 3: Implement the smallest shared wiring**

Update the authenticated surfaces so they all compose logout consistently:

- archive: append logout next to `ThemeToggle`
- editor: append logout next to `ThemeToggle` / `ExportPdfButton`
- templates: add a compact action row in the existing header and include logout
- billing: add a compact action row in the existing header and include logout

Do not refactor these pages into `DashboardShell` unless absolutely required. Stay within the current page structures.

- [ ] **Step 4: Run the focused shared-shell tests to verify they pass**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/components/templates-page.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/performance-archive-page-content.tsx components/event-editor-page-content.tsx app/(app)/templates/page.tsx app/(app)/settings/billing/page.tsx tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/billing-page.test.tsx tests/components/templates-page.test.tsx
git commit -m "feat: wire logout across authenticated screens"
```

## Task 4: Final Regression Sweep For Archive And Authenticated Shell

**Files:**
- Modify: `tests/e2e/setlist-flow.spec.ts` only if needed
- Optional Modify: `components/loading-shells.tsx` only if new header actions affect loading layout

- [ ] **Step 1: Add or update final regression assertions**

Confirm:

- archive filters behave together without collapsing total-count UI
- page theme toggle and event theme filter are distinct affordances
- logout appears only on authenticated app-shell pages

If E2E coverage adds value, keep it minimal: do not try to validate every filter in the browser if component tests already pin the behavior.

- [ ] **Step 2: Run the focused regression commands**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/logout-button.test.tsx tests/components/billing-page.test.tsx`

Run: `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`

Expected: PASS, or targeted failures that reveal wording/wiring mismatches.

- [ ] **Step 3: Implement only the remaining polish needed**

Fix any last issues discovered by regression without expanding scope into server-side filtering or auth menus.

- [ ] **Step 4: Run the full verification sweep**

Run: `npm run test`
Expected: PASS

Run: `npm run lint`
Expected: PASS

Run: `npm run typecheck`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/setlist-flow.spec.ts tests/components/performance-archive-page.test.tsx tests/components/event-editor.test.tsx tests/components/logout-button.test.tsx tests/components/billing-page.test.tsx
git commit -m "feat: finish archive filters and shared logout"
```

## Notes For The Implementer

- Treat `currentTheme` and `selectedTheme` as different concepts at every step.
- Keep date-range buckets disjoint:
  - `Last 30 Days`
  - `Earlier This Year`
  - `Previous Years`
- Preserve existing archive total-count surfaces even while filtering.
- Do not introduce URL query syncing or server-side filtering in this pass.
- Keep logout available only inside authenticated app routes.
