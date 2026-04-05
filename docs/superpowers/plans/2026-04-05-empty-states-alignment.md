# Empty States Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the app’s real empty and loading states with the Stitch empty-state language across archive, templates, billing, and the shared loading shells.

**Architecture:** Keep routing and business logic unchanged, and treat this as a presentation-focused pass. Add a small shared status-panel primitive only if it clearly reduces duplication; otherwise, update each surface in place while preserving existing actions and copy intent.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Vitest

---

## File Map

### Existing files to modify

- `components/performance-archive-page-content.tsx`
  - Replace archive empty text blocks with action-oriented Stitch-style status panels for `no events` and `no filtered results`.
- `components/template-list.tsx`
  - Replace the saved-templates empty state with a stronger status panel.
- `app/(app)/templates/page.tsx`
  - Replace the source-events empty state with a matching status panel and route-aware CTA.
- `components/billing-payment-section.tsx`
  - Restyle the `no payment method` and `no billing history` states to match the new family.
- `components/loading-shells.tsx`
  - Tighten and align the editor, templates, and PDF preview loading shells.
- `tests/components/performance-archive-page.test.tsx`
  - Lock in the new archive empty-state and no-results expectations.
- `tests/components/templates-page.test.tsx`
  - Lock in the templates upper/lower empty-state expectations.
- `tests/components/billing-page.test.tsx`
  - Lock in the billing empty-state expectations.
- `tests/components/pdf-export-loading.test.tsx`
  - Update if the PDF preview loading copy or structure changes.

### New files that may be created

- `components/status-panel.tsx`
  - Optional shared presentational primitive for empty states if repeated markup becomes noisy.

Only create this if it reduces duplication across at least archive, templates, and billing.

### Files to inspect during implementation

- `components/form-pending-button.tsx`
  - Reuse for meaningful empty-state CTAs where form actions already exist.
- `components/dashboard-shell.tsx`
  - Match the current dark workspace tone and spacing.
- `components/loading-shells.tsx`
  - Keep loading states recognizable and not over-designed.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-05-empty-states-alignment-design.md`
- Archive UI: `components/performance-archive-page-content.tsx`
- Templates UI: `app/(app)/templates/page.tsx`, `components/template-list.tsx`
- Billing UI: `components/billing-payment-section.tsx`
- Loading UI: `components/loading-shells.tsx`

## Task 1: Lock In Archive Empty-State Behavior With Failing Tests

**Files:**
- Modify: `tests/components/performance-archive-page.test.tsx`

- [ ] **Step 1: Add failing expectations for both archive empty modes**

Cover:

- no saved events
- filtered no-results state

Suggested expectations:

```tsx
expect(screen.getByText("まだ保存済みの公演がない")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "新規公演作成" })).toBeInTheDocument();
expect(screen.getByText("条件に一致する公演がない")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "フィルタをリセット" })).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused archive test to verify it fails**

Run:

```bash
npm run test -- tests/components/performance-archive-page.test.tsx
```

Expected: FAIL because the current archive empty states are still plain text blocks.

- [ ] **Step 3: Keep the test structural**

Avoid snapshotting or brittle class assertions. Prove the new empty-state intent, headline, and CTA only.

- [ ] **Step 4: Re-run the focused archive test**

Run:

```bash
npm run test -- tests/components/performance-archive-page.test.tsx
```

Expected: FAIL only on the new expectations.

- [ ] **Step 5: Commit**

```bash
git add tests/components/performance-archive-page.test.tsx
git commit -m "test: define archive empty state expectations"
```

## Task 2: Align Archive And Templates Empty States

**Files:**
- Modify: `components/performance-archive-page-content.tsx`
- Modify: `app/(app)/templates/page.tsx`
- Modify: `components/template-list.tsx`
- Optional Create: `components/status-panel.tsx`
- Modify: `tests/components/performance-archive-page.test.tsx`
- Modify: `tests/components/templates-page.test.tsx`

- [ ] **Step 1: Implement Stitch-style archive status panels**

Replace the current archive empty blocks with compact status panels that include:

- small mono label
- clear headline
- supporting copy
- next action

Keep the existing create-event and reset-filter behaviors intact.

- [ ] **Step 2: Add failing templates expectations before changing templates UI**

Extend `tests/components/templates-page.test.tsx` to expect:

- a source-events empty panel with an archive-oriented CTA
- a saved-templates empty panel with reusable-asset framing

Run:

```bash
npm run test -- tests/components/templates-page.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Implement templates upper/lower empty states**

Update:

- the upper `no source events` state in `app/(app)/templates/page.tsx`
- the lower `no saved templates` state in `components/template-list.tsx`

Preserve existing data loading and actions. Do not add new business logic.

- [ ] **Step 4: Run the focused archive and templates tests**

Run:

```bash
npm run test -- tests/components/performance-archive-page.test.tsx tests/components/templates-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/performance-archive-page-content.tsx app/(app)/templates/page.tsx components/template-list.tsx tests/components/performance-archive-page.test.tsx tests/components/templates-page.test.tsx
git commit -m "style: align archive and templates empty states"
```

## Task 3: Align Billing Empty States

**Files:**
- Modify: `components/billing-payment-section.tsx`
- Modify: `tests/components/billing-page.test.tsx`

- [ ] **Step 1: Add failing billing expectations**

Extend `tests/components/billing-page.test.tsx` to assert the new status-style copy for:

- no payment method
- no billing history

Suggested expectations:

```tsx
expect(screen.getByText("支払い方法はまだ登録されていない")).toBeInTheDocument();
expect(screen.getByText("請求履歴はまだない")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused billing test to verify it fails**

Run:

```bash
npm run test -- tests/components/billing-page.test.tsx
```

Expected: FAIL on the new wording/structure expectations.

- [ ] **Step 3: Implement the billing status panels**

Rework the two empty billing surfaces so they read like formal settings states, not placeholders. Keep plan logic and CTA behavior untouched.

- [ ] **Step 4: Re-run the focused billing test**

Run:

```bash
npm run test -- tests/components/billing-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/billing-payment-section.tsx tests/components/billing-page.test.tsx
git commit -m "style: align billing empty states"
```

## Task 4: Align Shared Loading Shells

**Files:**
- Modify: `components/loading-shells.tsx`
- Modify: `tests/components/pdf-export-loading.test.tsx`
- Optional Modify:
  - `tests/components/editor-loading-shell.test.tsx`
  - `tests/components/templates-loading-shell.test.tsx`
  - `tests/components/performance-archive-page.test.tsx`
  - `tests/components/templates-page.test.tsx`
  - route/component tests that assert loading copy

- [ ] **Step 1: Add failing expectations for all three loading shells**

Pin:

- editor loading
- templates loading
- PDF preview loading

Suggested expectations:

```tsx
expect(screen.getByText("読み込み中...")).toBeInTheDocument();
expect(screen.getByText("公演情報とセットリストを読み込んでいます。")).toBeInTheDocument();
expect(screen.getByText("テンプレート管理を読み込んでいます。")).toBeInTheDocument();
expect(screen.getByText("PDFプレビューを準備中...")).toBeInTheDocument();
```

- [ ] **Step 2: Implement the shared loading polish**

Update `components/loading-shells.tsx` so the shells share the same visual family as the new empty states:

- tighter spacing
- stronger headings
- recognizable section skeletons
- no extra motion or decorative clutter

- [ ] **Step 3: Run focused loading-related tests**

Run:

```bash
npm run test -- tests/components/pdf-export-loading.test.tsx
```

If loading expectations are split across files, include them explicitly, for example:

```bash
npm run test -- tests/components/pdf-export-loading.test.tsx tests/components/editor-loading-shell.test.tsx tests/components/templates-loading-shell.test.tsx
```

Expected: PASS

- [ ] **Step 4: Preserve route semantics**

Do not alter:

- loading route filenames
- editor/pdf navigation flow
- accessibility roles already used by tests

- [ ] **Step 5: Commit**

```bash
git add components/loading-shells.tsx tests/components/pdf-export-loading.test.tsx tests/components/editor-loading-shell.test.tsx tests/components/templates-loading-shell.test.tsx
git commit -m "style: align loading shells with empty states"
```

If a shared `components/status-panel.tsx` helper is introduced while doing this task or Task 2, include it in the same commit.

## Task 5: Final Regression Sweep

**Files:**
- Modify only if legitimate regressions appear

- [ ] **Step 1: Run the focused empty/loading suite**

Run:

```bash
npm run test -- tests/components/performance-archive-page.test.tsx tests/components/templates-page.test.tsx tests/components/billing-page.test.tsx tests/components/pdf-export-loading.test.tsx
```

Expected: PASS

- [ ] **Step 2: Run broader verification**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: PASS

- [ ] **Step 3: Fix only real regressions**

If wording or structure updates cause failures in nearby route tests, update them narrowly.

- [ ] **Step 4: Re-run only the failing commands after fixes**

Do not rerun unrelated commands unless the fix touched shared infrastructure.

- [ ] **Step 5: Commit**

```bash
git add components/performance-archive-page-content.tsx app/(app)/templates/page.tsx components/template-list.tsx components/billing-payment-section.tsx components/loading-shells.tsx tests/components/performance-archive-page.test.tsx tests/components/templates-page.test.tsx tests/components/billing-page.test.tsx tests/components/pdf-export-loading.test.tsx
git commit -m "test: verify empty states alignment"
```

If `components/status-panel.tsx` exists by the end of implementation, add it to this final regression commit as well.
