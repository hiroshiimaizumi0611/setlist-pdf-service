# Setlist Reorder Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** セットリスト編集画面のドラッグ並び替えを、既存の native DnD と compact row layout を保ったまま、より滑らかで気持ちいい体感へ改善する。

**Architecture:** `SetlistTable` 内で `canonical items` と `optimistic items` を分け、drop 直後に見た目だけ先に入れ替える。drag source / drag target / saving 状態は table ローカル state で管理し、視覚的な持ち上がり・挿入ライン・保存中表示を Tailwind class と data attribute で付与する。失敗時は props 由来の並びへ安全に巻き戻す。

**Tech Stack:** Next.js App Router, React 19 client components, Tailwind CSS v4, native HTML5 drag and drop, server actions, Vitest, Testing Library

---

## File Map

### Existing files to modify

- `components/setlist-table.tsx`
  - optimistic reorder state、drag cleanup、saving state、lift / insertion-line visual state を実装する中心。
- `tests/components/event-editor.test.tsx`
  - 既存の integration coverage を維持しつつ、必要なら selector 変更や状態表示の追従を入れる。

### New files to create

- `tests/components/setlist-table.test.tsx`
  - reorder 体感改善を table 単体で固定する focused test file。optimistic reorder、rollback、drag state、indicator cleanup をここに集約する。

### Files to inspect during implementation

- `components/setlist-item-edit-modal.tsx`
  - saving 状態や modal との共存で巻き込みがないか確認する。
- `components/loading-shells.tsx`
  - `並び順を更新中...` の小さな status 表示の tone 参考。
- `docs/superpowers/specs/2026-04-09-setlist-reorder-motion-design.md`
  - visual / state / non-goals の最終参照。

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-09-setlist-reorder-motion-design.md`
- Existing editor behavior:
  - `components/setlist-table.tsx`
  - `tests/components/event-editor.test.tsx`

## Task 1: Add Focused Reorder Motion Tests

**Files:**
- Create: `tests/components/setlist-table.test.tsx`
- Modify: `components/setlist-table.tsx` (only if test helper exports are needed)

- [ ] **Step 1: Write the failing optimistic reorder test**

Create a focused test that renders `SetlistTable` with three song rows and a mocked `reorderItemsAction`. Simulate:

- `dragStart` on row A
- `dragOver` and `drop` on row C

Assert immediately after `drop` that the DOM order is already updated before the action promise resolves.

Suggested assertions:

```tsx
expect(getTitles()).toEqual(["2曲目", "1曲目", "3曲目"]);
expect(screen.getByText("並び順を更新中...")).toBeInTheDocument();
```

In the same file, add one focused case for the `heading` row branch so the specialized render path is held to the same reorder contract.

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test -- tests/components/setlist-table.test.tsx
```

Expected: FAIL because the current table waits for server-side revalidation and has no local optimistic state.

- [ ] **Step 3: Add minimal optimistic order state**

In `components/setlist-table.tsx`, introduce:

- local `optimisticItems`
- local `isSavingOrder`
- synchronization from `items` props when not dragging

and update drop handling so the local order changes immediately before awaiting the async action.

- [ ] **Step 4: Re-run the focused test**

Run:

```bash
npm run test -- tests/components/setlist-table.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/setlist-table.tsx tests/components/setlist-table.test.tsx
git commit -m "feat: add optimistic setlist reorder state"
```

## Task 2: Add Drag Lift And Insertion-Line Visual States

**Files:**
- Modify: `components/setlist-table.tsx`
- Modify: `tests/components/setlist-table.test.tsx`

- [ ] **Step 1: Write the failing visual state tests**

Extend the table test to assert:

- drag source row receives a dedicated data attribute or class hook such as `data-row-dragging="true"`
- drag target row receives an insertion indicator hook such as `data-row-drop-target="true"`
- the previous `full-row ring only` contract is replaced by a top-line indicator element or data marker

Suggested assertions:

```tsx
expect(sourceRow).toHaveAttribute("data-row-dragging", "true");
expect(targetRow).toHaveAttribute("data-row-drop-target", "true");
expect(within(targetRow).getByTestId("drop-indicator")).toBeInTheDocument();
expect(within(sourceRow).queryByTestId("drop-indicator")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test -- tests/components/setlist-table.test.tsx
```

Expected: FAIL because current drag state only toggles ids and row-wide ring classes.

- [ ] **Step 3: Implement the motion styling hooks**

Update `components/setlist-table.tsx` so:

- the dragging row gets lift styling
- the target row renders a top insertion line
- row transitions use short `transform / border / background / opacity` transitions
- handle styling clearly communicates `grab / grabbing`

Keep row height and current content density unchanged.

- [ ] **Step 4: Re-run the focused test**

Run:

```bash
npm run test -- tests/components/setlist-table.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/setlist-table.tsx tests/components/setlist-table.test.tsx
git commit -m "feat: add smoother setlist drag states"
```

## Task 3: Handle Save Completion, Failure Rollback, And Drag Cleanup

**Files:**
- Modify: `components/setlist-table.tsx`
- Modify: `tests/components/setlist-table.test.tsx`
- Modify: `tests/components/event-editor.test.tsx`

- [ ] **Step 1: Write the failing cleanup and rollback tests**

Add tests proving that:

- if `reorderItemsAction` rejects, the DOM order returns to the original props order
- if `items` props change externally after save, local optimistic state re-syncs to the new canonical order
- `dragLeave` or invalid drop clears the target indicator
- dropping outside a valid row does not call `reorderItemsAction`
- save success clears the `並び順を更新中...` status
- existing editor integration still submits the correct payload order

Suggested assertions:

```tsx
await waitFor(() => expect(getTitles()).toEqual(["1曲目", "2曲目", "3曲目"]));
rerender(<SetlistTable {...nextPropsWithDifferentOrder} />);
expect(getTitles()).toEqual(["3曲目", "1曲目", "2曲目"]);
expect(screen.queryByText("並び順を更新中...")).not.toBeInTheDocument();
expect(targetRow).toHaveAttribute("data-row-drop-target", "false");
expect(reorderItemsAction).not.toHaveBeenCalled();
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test -- tests/components/setlist-table.test.tsx tests/components/event-editor.test.tsx
```

Expected: FAIL because the current implementation has no rollback path and limited drag cleanup.

- [ ] **Step 3: Implement failure-safe reorder lifecycle**

Update `components/setlist-table.tsx` so:

- `reorderItemsAction` is awaited inside a guarded async path
- failure restores `optimisticItems` from canonical props order
- `dragLeave`, `dragEnd`, and invalid drop clear stale hover state
- invalid drop exits without dispatching the reorder action
- heading rows and standard rows share the same drag state contract
- saving status appears only while the action is in flight

Do not add a new toast system.

- [ ] **Step 4: Re-run the focused tests**

Run:

```bash
npm run test -- tests/components/setlist-table.test.tsx tests/components/event-editor.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/setlist-table.tsx tests/components/setlist-table.test.tsx tests/components/event-editor.test.tsx
git commit -m "fix: harden setlist reorder lifecycle"
```

## Task 4: Verify Full Editor Coverage And Reduced-Motion Safety

**Files:**
- Modify: `components/setlist-table.tsx`
- Modify: `tests/components/setlist-table.test.tsx`

- [ ] **Step 1: Write the failing reduced-motion / non-regression checks**

Add tests that confirm:

- reduced-motion users still get state hooks without transform-heavy assumptions
- rows remain compact and edit/delete affordances still render
- non-reorder mode (`reorderItemsAction` absent) does not expose draggable behavior

- [ ] **Step 1a: Pin reduced-motion through class-hook assertions**

In jsdom, do not depend on real animation playback. Assert that the rendered rows/indicators use explicit `motion-safe:` / `motion-reduce:` utility hooks or equivalent class names rather than mocking browser animation behavior.

- [ ] **Step 2: Run the focused tests to verify failure**

Run:

```bash
npm run test -- tests/components/setlist-table.test.tsx
```

Expected: FAIL if the implementation assumes drag-only styling or exposes handles incorrectly.

- [ ] **Step 3: Implement the minimal accessibility and fallback polish**

In `components/setlist-table.tsx`:

- gate drag-specific affordances on `reorderItemsAction`
- keep `aria-label` coverage on handles
- use motion-safe / motion-reduce utilities where appropriate
- expose stable class hooks that tests can assert in jsdom

- [ ] **Step 4: Re-run the focused tests**

Run:

```bash
npm run test -- tests/components/setlist-table.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/setlist-table.tsx tests/components/setlist-table.test.tsx
git commit -m "test: cover setlist reorder motion regressions"
```

## Task 5: Final Verification

**Files:**
- Inspect only: `components/setlist-table.tsx`
- Inspect only: `tests/components/setlist-table.test.tsx`
- Inspect only: `tests/components/event-editor.test.tsx`

- [ ] **Step 1: Run targeted component tests**

Run:

```bash
npm run test -- tests/components/setlist-table.test.tsx tests/components/event-editor.test.tsx
```

Expected: PASS

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

- [ ] **Step 4: Commit final verification if needed**

If implementation required any last follow-up edits during verification:

```bash
git add components/setlist-table.tsx tests/components/setlist-table.test.tsx tests/components/event-editor.test.tsx
git commit -m "chore: finalize setlist reorder motion polish"
```

If no follow-up edits were needed, skip this commit.
