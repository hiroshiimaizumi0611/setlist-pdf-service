# Performance Archive Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/events` into a dedicated Stitch-aligned performance archive screen while keeping `/events/[eventId]` focused on detailed setlist editing.

**Architecture:** Split archive and editor responsibilities instead of continuing to branch inside one oversized page composition. Reuse the existing event actions and summaries data, but introduce archive-specific UI components for the searchable header, filter band, and dense technical table. Keep dark mode as the primary target and preserve the existing editor route contract.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, server actions, Vitest, Playwright

---

## File Map

### Existing files to modify

- `app/(app)/events/page.tsx`
  - Replace the current editor-placeholder composition with archive-specific page wiring.
- `components/event-list.tsx`
  - Reduce responsibilities if needed so it remains editor-rail specific, not archive-table specific.
- `tests/components/event-editor-page-route.test.tsx`
  - Update route-level expectations if `/events` no longer renders the editor placeholder.
- `tests/components/event-editor.test.tsx`
  - Remove or narrow `/events`-specific assumptions if they only belong to the editor route.
- `tests/e2e/setlist-flow.spec.ts`
  - Update any assumptions about `/events` being an editor shell before entering `/events/[eventId]`.

### New files likely to create

- `components/performance-archive-page-content.tsx`
  - Archive-first page composition for `/events`.
- `components/performance-archive-table.tsx`
  - Dense technical table for event summaries and action controls.
- `components/performance-archive-filters.tsx`
  - Search and filter band for the archive screen.
- `tests/components/performance-archive-page.test.tsx`
  - Focused component coverage for archive-specific layout, rows, empty states, and filters.

Only create the new files if they clarify boundaries. Keep the editor route components intact unless a very small extraction is needed.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-03-performance-archive-alignment-design.md`
- Stitch archive reference:
  - `design/stitch/project-16774743705046066908/screens/7cbd0f3666a54ca684dcfe5d23ba1ef0-performance-archive.html`
  - `design/stitch/project-16774743705046066908/images/7cbd0f3666a54ca684dcfe5d23ba1ef0-performance-archive.png`
- Current editor shell reference to preserve:
  - `components/event-editor-page-content.tsx`
  - `components/dashboard-shell.tsx`

## Task 1: Lock In Archive Route Expectations With Failing Tests

**Files:**
- Create: `tests/components/performance-archive-page.test.tsx`
- Modify: `tests/components/event-editor-page-route.test.tsx`
- Test: `app/(app)/events/page.tsx`

- [ ] **Step 1: Write the failing tests for archive-first `/events`**

Add tests that expect:

- `/events` renders an archive heading like `公演アーカイブ`
- archive metadata like total show count or archive subtitle is visible
- the page no longer renders the editor-placeholder copy for `event === null`
- rows are represented as a table or table-like technical list, not the rail card stack

Suggested assertions:

```tsx
expect(screen.getByRole("heading", { name: "公演アーカイブ" })).toBeInTheDocument();
expect(screen.queryByText("公演を作成してセットリスト編集を開始")).not.toBeInTheDocument();
expect(screen.getByRole("table")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx tests/components/event-editor-page-route.test.tsx`

Expected: FAIL because `/events` still renders the editor shell placeholder and no archive table exists yet.

- [ ] **Step 3: Implement the smallest route split needed**

Create the archive-specific page composition and switch `app/(app)/events/page.tsx` to use it, while leaving `/events/[eventId]` on `EventEditorPageContent`.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx tests/components/event-editor-page-route.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/events/page.tsx tests/components/performance-archive-page.test.tsx tests/components/event-editor-page-route.test.tsx
# If created in this task, also add:
#   components/performance-archive-page-content.tsx
git commit -m "feat: split archive route from editor shell"
```

## Task 2: Build The Archive Header, Filters, And Empty State

**Files:**
- Modify: `components/performance-archive-page-content.tsx`
- Optional Create: `components/performance-archive-filters.tsx`
- Modify: `tests/components/performance-archive-page.test.tsx`

- [ ] **Step 1: Write the failing tests for archive controls**

Add tests that expect:

- search input is visible in the archive header area
- a filter band exposes date range, venue, theme, and reset affordances
- empty archive state uses archive-oriented copy, not editor-oriented copy

Suggested assertions:

```tsx
expect(screen.getByPlaceholderText("ARCHIVE SEARCH...")).toBeInTheDocument();
expect(screen.getByText("Date Range")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "RESET FILTERS" })).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx`

Expected: FAIL because the Stitch-style archive controls do not exist yet.

- [ ] **Step 3: Implement the archive header and filter band**

Add the dark Stitch-aligned archive top area:

- archive title and subtitle
- compact system metadata strip
- search field
- filter controls
- archive-specific empty state copy

Keep first-pass behavior modest if needed, but the UI should be real and coherent.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/performance-archive-page-content.tsx tests/components/performance-archive-page.test.tsx
# If created in this task, also add:
#   components/performance-archive-filters.tsx
git commit -m "feat: add archive header and filter band"
```

## Task 3: Replace Archive Cards With A Dense Technical Table

**Files:**
- Modify: `components/performance-archive-page-content.tsx`
- Create: `components/performance-archive-table.tsx`
- Modify: `tests/components/performance-archive-page.test.tsx`
- Modify: `tests/components/event-list.test.tsx`

- [ ] **Step 1: Write the failing table tests**

Add tests that expect:

- archive rows render `Date`, `Venue`, `Show Title`, `Theme`, `Last Update`, and `Actions`
- `編集`, `複製`, and `削除` are available from the row action area
- current archive entries no longer render as the old stacked rail cards on `/events`

Suggested assertions:

```tsx
expect(screen.getByRole("columnheader", { name: "Date" })).toBeInTheDocument();
expect(screen.getByRole("columnheader", { name: "Show Title" })).toBeInTheDocument();
expect(screen.getAllByRole("button", { name: "複製" }).length).toBeGreaterThan(0);
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx tests/components/event-list.test.tsx`

Expected: FAIL because `/events` still does not render the Stitch-style archive table.

- [ ] **Step 3: Implement the archive table**

Build the dense technical table and wire it to existing actions:

- row click or edit affordance links to `/events/[eventId]`
- duplicate uses the existing duplicate form action
- delete uses the existing confirmation flow
- theme and last update values are rendered from summary data with sane fallbacks

If `EventList` remains used only by the editor route, trim its responsibilities so it no longer has to support archive behavior.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx tests/components/event-list.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/performance-archive-page-content.tsx components/performance-archive-table.tsx tests/components/performance-archive-page.test.tsx tests/components/event-list.test.tsx
git commit -m "feat: add stitch-style archive table"
```

## Task 4: Add First-Pass Client Search And Zero-Match State

**Files:**
- Modify: `components/performance-archive-page-content.tsx`
- Optional Modify: `components/performance-archive-filters.tsx`
- Modify: `tests/components/performance-archive-page.test.tsx`

- [ ] **Step 1: Write the failing search/filter tests**

Add tests that expect:

- entering a query narrows the visible archive rows by title or venue
- zero matches show a filtered empty state instead of a blank table
- reset restores the full list

Suggested assertions:

```tsx
await user.type(screen.getByPlaceholderText("ARCHIVE SEARCH..."), "RADHALL");
expect(screen.getByText("名古屋 RADHALL")).toBeInTheDocument();
expect(screen.queryByText("渋谷 QUATTRO")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx`

Expected: FAIL because the first-pass client filtering does not exist yet.

- [ ] **Step 3: Implement minimal real search/filter behavior**

Implement client-side filtering that:

- searches title and venue
- resets cleanly
- renders a clear filtered empty state

Do not add server-side filtering, URL state syncing, or analytics yet.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/performance-archive-page-content.tsx tests/components/performance-archive-page.test.tsx
# If modified in this task, also add:
#   components/performance-archive-filters.tsx
git commit -m "feat: add archive search and filtered empty state"
```

## Task 5: Final Regression Sweep And End-To-End Flow

**Files:**
- Modify: `tests/components/event-editor-page-route.test.tsx`
- Modify: `tests/components/performance-archive-page.test.tsx`
- Modify: `tests/e2e/setlist-flow.spec.ts`
- Optional Modify: `components/loading-shells.tsx`

- [ ] **Step 1: Write or update the final regression assertions**

Add or update assertions that confirm:

- `/events` and `/events/[eventId]` now have clearly different responsibilities
- `新規公演作成` from the archive page still lands in the editor route
- archive loading/empty states still fit the dark backstage tone

- [ ] **Step 2: Run the regression-focused test suite**

Run: `npm run test -- tests/components/performance-archive-page.test.tsx tests/components/event-editor-page-route.test.tsx tests/e2e/setlist-flow.spec.ts`

Expected: FAIL until any remaining wording, wiring, or route assumptions are corrected.

- [ ] **Step 3: Implement the smallest final polish and wiring fixes**

Resolve remaining mismatches without pulling editor-only concerns back into the archive route.

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
git add tests/components/performance-archive-page.test.tsx tests/components/event-editor-page-route.test.tsx tests/e2e/setlist-flow.spec.ts
# Add any final polish files touched in this task
git commit -m "feat: align performance archive with stitch"
```

## Notes For The Implementer

- Keep `EventEditorPageContent` focused on `/events/[eventId]`; resist re-introducing archive branching there.
- Prefer archive-specific files over growing `EventList` into a second UI mode.
- Dark mode fidelity matters more than light mode polish in this pass.
- Preserve existing create, duplicate, and delete actions rather than forking workflow logic.
