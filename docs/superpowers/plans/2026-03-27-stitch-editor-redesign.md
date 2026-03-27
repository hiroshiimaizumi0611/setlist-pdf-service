# Stitch Editor Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/events` and `/events/[eventId]` so the event editor matches the Stitch Setlist Editor screens structurally and visually, while preserving existing event-editing behavior.

**Architecture:** Keep the existing services, server actions, and route structure, but replace the current card-based editor shell with a Stitch-style fixed top bar, fixed left rail, compact metadata strip, horizontal add-item strip, and row-based setlist list. Implement the dark theme first as the primary visual reference, then map the same structure to the light theme so both modes share layout and behavior.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Better Auth, Drizzle/libSQL, Vitest, Playwright, Stitch HTML/PNG references

---

## File Map

### Existing files to modify

- `components/dashboard-shell.tsx`
  - Replace the current dashboard-like shell with a fixed top bar + fixed left rail shell that matches the Stitch editor layout.
- `components/event-list.tsx`
  - Rework the event rail into a Stitch-style backstage list with stronger selection state and denser layout.
- `components/event-metadata-form.tsx`
  - Convert the stacked metadata card into a horizontal strip with four visible primary fields.
- `components/setlist-item-form.tsx`
  - Replace the taller form block with a Stitch-style single-line production item input strip.
- `components/setlist-table.tsx`
  - Replace the table presentation with a row-based production list while keeping reorder, update, and delete behavior.
- `components/theme-toggle.tsx`
  - Restyle to match Stitch controls and top-bar semantics.
- `components/export-pdf-button.tsx`
  - Restyle to match the strong primary CTA in the Stitch top bar.
- `components/event-editor-page-content.tsx`
  - Recompose the editor screen using the new shell and rebuilt subcomponents.
- `app/(app)/events/page.tsx`
  - Ensure empty-state editor route uses the new shell composition cleanly.
- `app/(app)/events/[eventId]/page.tsx`
  - Ensure populated editor route uses the new Stitch-based composition cleanly.
- `tests/components/event-editor.test.tsx`
  - Update expectations to the new visual/structural UI semantics.
- `tests/components/event-editor-page-route.test.tsx`
  - Update route-level expectations if composition or visible labels change.
- `tests/e2e/setlist-flow.spec.ts`
  - Adjust selectors only where needed to reflect the new Stitch-based editor UI.

### New files likely to create

- `components/editor-top-bar.tsx`
  - Own the fixed production top bar and action cluster.
- `components/editor-left-rail.tsx`
  - If `event-list.tsx` becomes too overloaded, split out the rail framing from the event entries.
- `components/editor-metadata-strip.tsx`
  - If `event-metadata-form.tsx` needs separation between layout and server action plumbing.
- `components/editor-add-item-strip.tsx`
  - If `setlist-item-form.tsx` benefits from a cleaner Stitch-specific implementation split.
- `components/editor-setlist-rows.tsx`
  - If `setlist-table.tsx` becomes easier to replace than mutate in place.
- `tests/components/editor-top-bar.test.tsx`
  - Focused test coverage for top-bar actions and visible controls if a new component is created.

Create the new files only if they simplify the rewrite. Avoid splitting just for aesthetics.

## Reference Material

- Spec: `docs/superpowers/specs/2026-03-27-stitch-editor-redesign-design.md`
- Stitch dark editor:
  - `design/stitch/project-16774743705046066908/screens/37b9f1721b8c43a09f38b1d7915f0243-setlist-editor-dark.html`
  - `design/stitch/project-16774743705046066908/images/37b9f1721b8c43a09f38b1d7915f0243-setlist-editor-dark.png`
- Stitch light editor:
  - `design/stitch/project-16774743705046066908/screens/8d426adf04034b19bceac56faa05e789-setlist-editor-light.html`
  - `design/stitch/project-16774743705046066908/images/8d426adf04034b19bceac56faa05e789-setlist-editor-light.png`

## Task 1: Rebuild the Shared Editor Shell

**Files:**
- Modify: `components/dashboard-shell.tsx`
- Modify: `components/theme-toggle.tsx`
- Modify: `components/export-pdf-button.tsx`
- Modify: `components/event-editor-page-content.tsx`
- Test: `tests/components/event-editor.test.tsx`

- [ ] **Step 1: Write the failing test for top-level Stitch shell semantics**

Add or update a component test that asserts the editor renders:

- a fixed-feeling top action area with the PDF CTA visible
- a left rail with event navigation still present
- no oversized hero-style empty dashboard heading dominating the populated event route

Suggested test target:

```tsx
it("renders the populated editor in a Stitch-style shell with top actions and rail", async () => {
  render(<EventEditorPageContent ... />);

  expect(screen.getByRole("link", { name: "PDFを書き出し" })).toBeVisible();
  expect(screen.getByRole("navigation", { name: "公演ナビゲーション" })).toBeVisible();
  expect(screen.queryByText("公演を作成してセットリスト編集を開始")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: FAIL because the current shell still reflects the old dashboard/card hierarchy or missing new semantic structure.

- [ ] **Step 3: Rewrite the shared shell to match Stitch structure**

Implement the minimum layout changes to make the test pass:

- replace the oversized page header composition
- add a fixed top bar region
- add a denser left rail treatment
- position theme toggle and PDF button in the top control cluster

Keep business logic untouched.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/dashboard-shell.tsx components/theme-toggle.tsx components/export-pdf-button.tsx components/event-editor-page-content.tsx tests/components/event-editor.test.tsx
git commit -m "feat: rebuild stitch editor shell"
```

## Task 2: Convert the Event Rail and Metadata Area to Stitch Layout

**Files:**
- Modify: `components/event-list.tsx`
- Modify: `components/event-metadata-form.tsx`
- Modify: `components/event-editor-page-content.tsx`
- Test: `tests/components/event-editor.test.tsx`
- Test: `tests/components/event-editor-page-route.test.tsx`

- [ ] **Step 1: Write the failing tests for rail density and metadata strip**

Add or update tests asserting:

- the event rail keeps duplicate/create affordances in the left rail
- metadata fields are visible in one compact primary strip
- labels like `Date`, `Venue`, `Show Title`, and theme selection remain visible or mapped to equivalent Japanese labels in one row-oriented section

Suggested test shape:

```tsx
expect(screen.getByRole("button", { name: "新規公演を作成" })).toBeVisible();
expect(screen.getByLabelText("公演名")).toBeVisible();
expect(screen.getByLabelText("会場")).toBeVisible();
expect(screen.getByLabelText("公演日")).toBeVisible();
```

Also assert the route still renders for `/events/[eventId]`.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx`

Expected: FAIL because the current metadata form is still card-based and the rail is not Stitch-like enough.

- [ ] **Step 3: Implement the rail and metadata strip redesign**

Minimum implementation:

- event rail uses denser list styling and stronger current-event emphasis
- metadata form becomes a compact horizontal strip
- preserve duplicate/create actions and metadata save behavior
- keep lower-priority notes accessible without letting them dominate the first screenful

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/event-list.tsx components/event-metadata-form.tsx components/event-editor-page-content.tsx tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx
git commit -m "feat: align editor rail and metadata strip with stitch"
```

## Task 3: Replace the Add-Item Block with a Stitch Production Input Strip

**Files:**
- Modify: `components/setlist-item-form.tsx`
- Modify: `components/event-editor-page-content.tsx`
- Test: `tests/components/event-editor.test.tsx`

- [ ] **Step 1: Write the failing test for the compact add-item strip**

Add or update a test asserting:

- item-type controls are visible in a compact strip
- the primary title input remains present
- the add button remains immediately visible
- optional fields do not force the primary input row to become the dominant section

Suggested assertions:

```tsx
expect(screen.getByRole("combobox", { name: "項目種別" })).toBeVisible();
expect(screen.getByRole("textbox", { name: "タイトル" })).toBeVisible();
expect(screen.getByRole("button", { name: "項目を追加" })).toBeVisible();
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: FAIL because the current add-item block still reads as a full card form instead of a flat production strip.

- [ ] **Step 3: Implement the compact add-item strip**

Minimum implementation:

- restyle the type selector cluster
- compress the primary input row to match Stitch structure
- demote secondary inputs such as notes/duration so the first row stays visually dominant
- preserve add-item server-action behavior

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/setlist-item-form.tsx components/event-editor-page-content.tsx tests/components/event-editor.test.tsx
git commit -m "feat: rebuild stitch add-item strip"
```

## Task 4: Replace the Table with Stitch-Style Setlist Rows

**Files:**
- Modify: `components/setlist-table.tsx`
- Modify: `components/event-editor-page-content.tsx`
- Test: `tests/components/event-editor.test.tsx`
- Test: `tests/e2e/setlist-flow.spec.ts`

- [ ] **Step 1: Write the failing test for row-based production list behavior**

Add or update tests asserting:

- cue numbers remain visible
- row controls remain available for reorder/delete
- rows are rendered as list-like production items rather than relying on table headers for meaning

Suggested assertions:

```tsx
expect(screen.getByText("M01")).toBeVisible();
expect(screen.getByRole("button", { name: /を上へ移動/ })).toBeVisible();
expect(screen.getByText("セットリスト")).toBeVisible();
```

For E2E, be ready to update selectors if row controls move or become icon-based.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: FAIL because the existing implementation still renders a conventional table.

- [ ] **Step 3: Implement the Stitch-style setlist rows**

Minimum implementation:

- replace the table structure with row strips
- preserve cue numbering rules
- preserve reorder and delete actions
- keep editing affordances available, but visually secondary
- style MC / transition / heading rows distinctly

- [ ] **Step 4: Run component and E2E checks**

Run:

- `npm run test -- tests/components/event-editor.test.tsx`
- `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/setlist-table.tsx components/event-editor-page-content.tsx tests/components/event-editor.test.tsx tests/e2e/setlist-flow.spec.ts
git commit -m "feat: replace editor table with stitch setlist rows"
```

## Task 5: Tune Dark Theme to Stitch and Port the Structure to Light Theme

**Files:**
- Modify: `components/dashboard-shell.tsx`
- Modify: `components/event-list.tsx`
- Modify: `components/event-metadata-form.tsx`
- Modify: `components/setlist-item-form.tsx`
- Modify: `components/setlist-table.tsx`
- Modify: `components/theme-toggle.tsx`
- Modify: `components/export-pdf-button.tsx`
- Test: `tests/components/event-editor.test.tsx`
- Test: `tests/e2e/setlist-flow.spec.ts`

- [ ] **Step 1: Write or update assertions that cover both themes**

Add test coverage ensuring:

- light and dark theme toggles still switch routes correctly
- both themes keep the same editor structure
- top actions and rail remain visible in both themes

Suggested assertions:

```tsx
expect(screen.getByRole("link", { name: "ライトテーマ" })).toHaveAttribute("href", expect.stringContaining("theme=light"));
expect(screen.getByRole("link", { name: "ダークテーマ" })).toHaveAttribute("href", expect.stringContaining("theme=dark"));
```

- [ ] **Step 2: Run the focused tests to verify expected failures**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: FAIL or incomplete coverage until the final color/border hierarchy is applied consistently.

- [ ] **Step 3: Tune the visual system**

Apply the final Stitch-oriented tuning:

- dark theme first against the dark Stitch editor image
- then light theme using the exact same structure
- reduce dashboard feel by removing leftover card styling, oversized copy blocks, and mismatched spacing

- [ ] **Step 4: Run regression checks**

Run:

- `npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx`
- `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`
- `npm run lint`
- `npm run typecheck`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/dashboard-shell.tsx components/event-list.tsx components/event-metadata-form.tsx components/setlist-item-form.tsx components/setlist-table.tsx components/theme-toggle.tsx components/export-pdf-button.tsx tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx tests/e2e/setlist-flow.spec.ts
git commit -m "feat: finish stitch-aligned event editor themes"
```

## Task 6: Final Verification and Documentation

**Files:**
- Modify: `README.md` (only if route descriptions or editor screenshots/notes need updates)
- Test: `tests/components/event-editor.test.tsx`
- Test: `tests/components/event-editor-page-route.test.tsx`
- Test: `tests/e2e/setlist-flow.spec.ts`

- [ ] **Step 1: Capture final verification checklist**

Confirm manually against the Stitch references:

- top bar hierarchy matches
- left rail density matches
- metadata strip reads as one operational band
- add-item strip reads as one operational band
- setlist rows feel flat and dense
- dark theme is the primary visual match
- light theme reads as the manuscript variant

- [ ] **Step 2: Run the full project checks**

Run:

- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`

Expected: PASS

- [ ] **Step 3: Update docs if needed**

If the editor layout or screenshots in docs are now misleading, update `README.md` minimally so it no longer describes the old dashboard-like experience.

- [ ] **Step 4: Commit**

```bash
git add README.md tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx tests/e2e/setlist-flow.spec.ts
git commit -m "chore: verify stitch editor redesign"
```

## Notes for the Implementer

- Treat the Stitch dark editor as the primary visual source.
- Do not settle for "same color, different layout." Layout and density matter more than palette alone.
- Keep server actions intact unless a UI structure issue makes a small extraction necessary.
- If `setlist-table.tsx` becomes too hard to mutate cleanly, replace it with a new row-based component instead of forcing the old table abstraction to survive.
- Prefer one focused commit per task. This redesign is large enough that small checkpoints will help.
