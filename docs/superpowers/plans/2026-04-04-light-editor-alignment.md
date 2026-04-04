# Light Editor Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the light-theme setlist editor closer to the Stitch light editor while keeping the current dark editor structure and behaviors intact.

**Architecture:** Keep the editor DOM and interaction model shared between themes, and move the light-theme improvement into styling boundaries: dashboard theme tokens, light-specific row tones, and light modal/panel treatment. Avoid route-level branching or separate light-only components; instead, refine the existing editor shell and editor subcomponents so `theme=light` feels like a printed production sheet rather than a dark UI inversion.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Vitest

---

## File Map

### Existing files to modify

- `components/dashboard-shell.tsx`
  - Refine light dashboard theme tokens for header, rail, paper surfaces, accents, and button/input states.
- `components/event-editor-page-content.tsx`
  - Adjust shell-level light presentation only where component composition needs tighter light-specific spacing or copy alignment.
- `components/event-list.tsx`
  - Tune light archive/current-event cards in the editor rail so they match the paper-tone direction.
- `components/event-metadata-form.tsx`
  - Refine light metadata strip treatment to read as structured production fields instead of generic cards.
- `components/setlist-item-form.tsx`
  - Refine light add-item strip tabs, fields, and CTA hierarchy.
- `components/setlist-table.tsx`
  - Rework light row tone map for song / mc / transition / heading while preserving compact rhythm and drag/edit behavior.
- `components/setlist-item-edit-modal.tsx`
  - Bring the light modal surface, borders, and button hierarchy in line with the paper-sheet direction.
- `tests/components/event-editor.test.tsx`
  - Add or tighten light-theme rendering assertions.

### Files to leave unchanged unless a test proves otherwise

- `components/export-pdf-button.tsx`
- `components/logout-button.tsx`
- `components/theme-toggle.tsx`
- route files under `app/(app)/events`

Keep all changes local to the editor presentation layer. Do not create a separate `LightDashboardShell`.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-04-light-editor-alignment-design.md`
- Editor shell and token source: `components/dashboard-shell.tsx`
- Editor composition: `components/event-editor-page-content.tsx`
- Dense row behavior: `components/setlist-table.tsx`
- Existing editor regression coverage: `tests/components/event-editor.test.tsx`

## Task 1: Lock In Light-Theme Expectations With Failing Editor Tests

**Files:**
- Modify: `tests/components/event-editor.test.tsx`
- Test target: `components/dashboard-shell.tsx`
- Test target: `components/setlist-table.tsx`

- [ ] **Step 1: Write failing light-theme assertions**

Add focused assertions for the existing light editor render that capture the intended direction:

- light header still renders `BACKSTAGE PRO` but no longer looks like a dark-shell inversion in class selection
- metadata strip and add-item strip expose light-friendly surface classes
- setlist rows in light theme use differentiated paper-tone variants for song / mc / transition
- light modal uses light surface classes when opened

Suggested assertion shape:

```tsx
const shell = screen.getByRole("main");
expect(shell.className).toContain("bg-[#fffdf8]");

const firstSongRow = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
expect(firstSongRow?.querySelector('[data-row-variant="song"]')).toHaveClass("bg-[#fffef8]");
```

- [ ] **Step 2: Run the focused editor test to verify it fails**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: FAIL because the current light theme still uses the older generic light token set.

- [ ] **Step 3: Keep the failing assertions tight**

Before implementation, trim any assertion that over-specifies unrelated classes. Keep only signals that prove:

- paper-tone shell
- stronger light row differentiation
- light modal treatment

- [ ] **Step 4: Re-run the focused editor test to confirm the failure is still meaningful**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: FAIL in the same targeted places.

- [ ] **Step 5: Commit the failing-test checkpoint**

```bash
git add tests/components/event-editor.test.tsx
git commit -m "test: define light editor alignment expectations"
```

## Task 2: Rebuild The Light Dashboard Shell Tokens

**Files:**
- Modify: `components/dashboard-shell.tsx`
- Optional Modify: `components/event-editor-page-content.tsx`

- [ ] **Step 1: Implement the minimal light token adjustments**

Update the `light` entry in `DASHBOARD_THEME_STYLES` so it reads as a printed production sheet:

- warmer page background with subtle paper gradient
- lighter header shell with ink-colored text
- softer rail tone distinct from content panels
- refined border, muted text, pill, button, and input colors
- current-show emphasis through text/accent treatment rather than heavy filled surfaces

Keep the dark token object untouched.

- [ ] **Step 2: Run the focused editor test to verify the shell assertions pass**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: shell-related failures disappear; row/modal failures may remain.

- [ ] **Step 3: Adjust light-only spacing if the shell still feels heavy**

Only if needed, make minimal spacing/class changes in `EventEditorPageContent` to keep the light header and section intro aligned with the new token balance.

- [ ] **Step 4: Re-run the focused editor test**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: PASS for shell-level expectations.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard-shell.tsx components/event-editor-page-content.tsx tests/components/event-editor.test.tsx
git commit -m "style: refine light editor shell tokens"
```

## Task 3: Refine Light Metadata Strip And Add-Item Strip

**Files:**
- Modify: `components/event-metadata-form.tsx`
- Modify: `components/setlist-item-form.tsx`
- Test: `tests/components/event-editor.test.tsx`

- [ ] **Step 1: Update metadata strip styling for light mode**

In `EventMetadataForm`:

- make the light mode feel like labeled production fields, not generic cards
- use stronger field borders and quieter fills
- preserve all labels, button text, and form behavior

- [ ] **Step 2: Update add-item strip styling for light mode**

In `SetlistItemForm`:

- make selected item-type tabs clearer in light mode
- keep secondary controls calmer than the main `ADD TO SET` CTA
- keep compact layout and current field set unchanged

- [ ] **Step 3: Run the focused editor test**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: light strip assertions pass.

- [ ] **Step 4: Add one more assertion if needed**

If the new strip treatment is not directly covered, add a small assertion for the updated light classes or layout affordance without over-specifying unrelated markup.

- [ ] **Step 5: Commit**

```bash
git add components/event-metadata-form.tsx components/setlist-item-form.tsx tests/components/event-editor.test.tsx
git commit -m "style: align light editor strips with stitch"
```

## Task 4: Rework Light Setlist Rows And Modal

**Files:**
- Modify: `components/setlist-table.tsx`
- Modify: `components/setlist-item-edit-modal.tsx`
- Optional Modify: `components/event-list.tsx`
- Test: `tests/components/event-editor.test.tsx`

- [ ] **Step 1: Implement light row tone map updates**

In `SetlistTable` light mode:

- song rows become clean white/paper rows
- mc rows use a subtle alternate paper tone
- transition rows rely more on dividers/spacing than filled slabs
- heading rows feel like section markers rather than dark-theme leftovers
- action buttons and drag handles stay compact and readable

Do not change drag-and-drop logic or row data attributes.

- [ ] **Step 2: Implement light modal treatment**

In `SetlistItemEditModal`:

- use a warm white panel with ink-colored borders/text
- keep destructive affordances clearly distinct
- preserve focus handling and form behavior

- [ ] **Step 3: Tune editor rail cards only if they now look mismatched**

If the left rail still feels too dark or too flat after the row/panel changes, make minimal light-mode updates in `EventList` so the current event state matches the new paper-tone system.

- [ ] **Step 4: Run the focused editor test**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/setlist-table.tsx components/setlist-item-edit-modal.tsx components/event-list.tsx tests/components/event-editor.test.tsx
git commit -m "style: polish light setlist rows and modal"
```

## Task 5: Final Regression Sweep

**Files:**
- Modify only if regressions require it:
  - `tests/components/event-editor-page-route.test.tsx`
  - `tests/e2e/setlist-flow.spec.ts`

- [ ] **Step 1: Run focused regression commands**

Run:

```bash
npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx
```

Expected: PASS

- [ ] **Step 2: Run broader verification**

Run:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

Expected: PASS across the full suite.

- [ ] **Step 3: Update any brittle tests only if the visual refactor changed intended class expectations**

Avoid rewriting behavior tests. Only adjust tests that directly encode the old light appearance.

- [ ] **Step 4: Re-run the minimal changed regression command if any test files moved**

Run:

```bash
npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/dashboard-shell.tsx components/event-editor-page-content.tsx components/event-list.tsx components/event-metadata-form.tsx components/setlist-item-form.tsx components/setlist-table.tsx components/setlist-item-edit-modal.tsx tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx tests/e2e/setlist-flow.spec.ts
git commit -m "style: align light editor with stitch"
```
