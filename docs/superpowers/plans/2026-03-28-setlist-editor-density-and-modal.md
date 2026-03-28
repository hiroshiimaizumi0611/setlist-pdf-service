# Setlist Editor Density And Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the setlist editor list denser and easier to scan by replacing inline row expansion with modal editing, aligning action buttons horizontally, and switching desktop reordering to drag-and-drop.

**Architecture:** Keep server actions as the source of truth for updates, deletes, and ordering, but move row interaction state into a client-side setlist list surface. Split the current oversized row responsibilities into compact row rendering plus a focused edit modal so the list remains stable while editing.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, native HTML drag-and-drop, server actions, Vitest, Playwright

---

## File Map

### Existing files to modify

- `components/setlist-table.tsx`
  - Convert from inline-expanding rows to a dense interactive client list shell or delegate to smaller focused components.
- `components/event-editor-page-content.tsx`
  - Keep the editor composition aligned with the updated setlist list contract.
- `tests/components/event-editor.test.tsx`
  - Update editor assertions for compact rows, modal editing, and action layout.
- `tests/components/event-editor-page-route.test.tsx`
  - Keep route-level rendering assertions aligned if any visible structure or labels change.
- `tests/e2e/setlist-flow.spec.ts`
  - Update the setlist editing flow for modal editing and drag-based ordering if covered there.

### New files likely to create

- `components/setlist-row.tsx`
  - Render a single compact row with drag handle, cue, content, duration, and action cluster.
- `components/setlist-item-edit-modal.tsx`
  - Render the centered modal editing UI for one selected item.
- `components/setlist-table-client.tsx`
  - Hold client-side state for modal open/close and drag interaction, while calling existing server actions.
- `tests/components/setlist-table.test.tsx`
  - Focused coverage for dense row rendering, modal behavior, and row actions if the existing editor test file becomes too broad.

Only create the new files if they make ownership clearer. If a smaller split is enough, keep the footprint tight.

## Reference Material

- Spec: `docs/superpowers/specs/2026-03-28-setlist-editor-density-and-modal-design.md`
- Existing dark editor references:
  - `design/stitch/project-16774743705046066908/screens/37b9f1721b8c43a09f38b1d7915f0243-setlist-editor-dark.html`
  - `design/stitch/project-16774743705046066908/images/37b9f1721b8c43a09f38b1d7915f0243-setlist-editor-dark.png`
- Secondary light reference for regression checks:
  - `design/stitch/project-16774743705046066908/screens/8d426adf04034b19bceac56faa05e789-setlist-editor-light.html`

## Task 1: Lock In Compact Row Expectations With Tests

**Files:**
- Modify: `tests/components/event-editor.test.tsx`
- Optional Create: `tests/components/setlist-table.test.tsx`
- Test: `components/setlist-table.tsx`

- [ ] **Step 1: Write the failing tests for dense rows and stable actions**

Add assertions that expect:

- setlist rows to render without inline `details`
- `編集` and `削除` to appear in one action cluster
- up/down buttons to be absent from the desktop row UI
- drag affordance text or handle markers to be present for desktop rows

Suggested assertions:

```tsx
expect(screen.queryByText("上へ")).not.toBeInTheDocument();
expect(screen.queryByText("下へ")).not.toBeInTheDocument();
expect(screen.getAllByRole("button", { name: /編集/ })).toHaveLength(3);
```

- [ ] **Step 2: Run the focused component tests to verify they fail**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: FAIL because the current list still uses inline row expansion and up/down controls.

- [ ] **Step 3: Implement the minimum row-structure changes**

Reshape the setlist list so rows:

- use a denser grid
- keep actions in a horizontal cluster
- remove inline `details` editing
- expose a drag handle region for desktop

Do not implement the full modal yet beyond the minimum placeholders required by the failing tests.

- [ ] **Step 4: Run the focused component tests to verify they pass**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/components/event-editor.test.tsx components/setlist-table.tsx
# If created in this task, also add:
#   tests/components/setlist-table.test.tsx
git commit -m "refactor: compact setlist editor rows"
```

## Task 2: Replace Inline Editing With A Centered Modal

**Files:**
- Modify: `components/setlist-table.tsx`
- Optional Create: `components/setlist-item-edit-modal.tsx`
- Optional Create: `components/setlist-table-client.tsx`
- Modify: `tests/components/event-editor.test.tsx`

- [ ] **Step 1: Write the failing modal-edit tests**

Add tests that expect:

- clicking `編集` opens a dialog/modal
- the modal is prefilled with the current item values
- closing the modal removes it without changing row height structure

Suggested assertions:

```tsx
await user.click(screen.getByRole("button", { name: /1曲目.*編集/ }));
expect(screen.getByRole("dialog")).toBeInTheDocument();
expect(screen.getByDisplayValue("1曲目")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused modal tests to verify they fail**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: FAIL because editing still happens inline inside each row.

- [ ] **Step 3: Implement the modal editing flow**

Add the smallest complete modal flow that:

- opens from the selected row
- shows the full item edit form
- submits through the existing update action
- closes on cancel without changing the row list structure

Prefer keeping only one item editable at a time.

- [ ] **Step 4: Run the focused modal tests to verify they pass**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/setlist-table.tsx tests/components/event-editor.test.tsx
# If created in this task, also add:
#   components/setlist-item-edit-modal.tsx
#   components/setlist-table-client.tsx
git commit -m "feat: move setlist item editing into modal"
```

## Task 3: Add Desktop Drag-And-Drop Reordering

**Files:**
- Modify: `components/setlist-table.tsx`
- Optional Modify: `components/setlist-row.tsx`
- Modify: `tests/components/event-editor.test.tsx`
- Modify: `tests/e2e/setlist-flow.spec.ts`

- [ ] **Step 1: Write the failing reorder tests**

Add tests that expect:

- draggable rows or drag handles on desktop markup
- reorder submission to call the existing reorder action with new ordered ids

Suggested test shape:

```tsx
expect(screen.getByLabelText("1曲目 をドラッグして並び替え")).toBeInTheDocument();
```

or a direct component-level assertion on drag attributes if that is more stable.

- [ ] **Step 2: Run the focused reorder tests to verify they fail**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: FAIL because the current implementation only supports up/down button forms.

- [ ] **Step 3: Implement native drag-and-drop ordering**

Implement desktop drag-and-drop so:

- rows expose drag handles
- dragging one row over another computes the new order
- dropping submits the new ordered ids through the existing reorder action
- mobile does not expose drag affordances

Keep the implementation lightweight and avoid third-party libraries in this pass.

- [ ] **Step 4: Run the focused reorder tests to verify they pass**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: PASS

- [ ] **Step 5: Update end-to-end flow if it covers reorder behavior**

Run: `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/setlist-table.tsx tests/components/event-editor.test.tsx tests/e2e/setlist-flow.spec.ts
# If created in this task, also add:
#   components/setlist-row.tsx
git commit -m "feat: add drag reorder to setlist editor"
```

## Task 4: Final Layout Polish And Regression Sweep

**Files:**
- Modify: `components/event-editor-page-content.tsx`
- Modify: `tests/components/event-editor-page-route.test.tsx`
- Modify: `tests/components/event-editor.test.tsx`
- Modify: `tests/e2e/setlist-flow.spec.ts`

- [ ] **Step 1: Write the failing regression assertions**

Add assertions that expect:

- the editor still renders the Stitch-like shell around the denser list
- modal-triggered editing remains available for song, MC, and transition rows
- action buttons stay horizontally aligned in the rendered structure

- [ ] **Step 2: Run the focused regression tests to verify they fail**

Run: `npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx`

Expected: FAIL until the surrounding composition reflects the new list contract cleanly.

- [ ] **Step 3: Implement the final alignment polish**

Make the smallest final adjustments needed so:

- row spacing feels clearly denser
- action alignment remains consistent
- modal and drag affordances sit naturally inside the existing dark editor shell
- mobile keeps a clean non-drag presentation

- [ ] **Step 4: Run the focused regression tests to verify they pass**

Run: `npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx`

Expected: PASS

- [ ] **Step 5: Run the full verification suite**

Run:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run test:e2e -- tests/e2e/setlist-flow.spec.ts
```

Expected:

- all Vitest suites PASS
- lint PASS
- typecheck PASS
- build PASS
- targeted E2E PASS

- [ ] **Step 6: Commit**

```bash
git add components/event-editor-page-content.tsx tests/components/event-editor-page-route.test.tsx tests/components/event-editor.test.tsx tests/e2e/setlist-flow.spec.ts
git commit -m "fix: polish dense setlist editor interactions"
```

## Manual Verification Checklist

- Open the event editor in dark theme and confirm more rows are visible above the fold than before.
- Verify `編集` and `削除` stay on one horizontal line at desktop widths.
- Open and close the edit modal for song, MC, and transition rows and confirm row height never changes.
- Reorder multiple rows on desktop via drag-and-drop and confirm the saved order matches the drop result.
- Open the editor on a narrow viewport and confirm there is no broken drag UI, while edit/delete remain accessible.
