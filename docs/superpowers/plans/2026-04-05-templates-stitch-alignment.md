# Templates Stitch Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose `/templates` into a Stitch-style template operations workspace that keeps the existing two-part flow: save from existing events on top and reuse saved templates below.

**Architecture:** Keep data loading and server actions in the route, but move presentation toward compact row-based sections instead of large cards. Reuse the existing template save and instantiate actions, while reshaping `TemplateList` and the source-event save surface into denser `panel + rows` UI that matches the rest of the dark production workspace.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Better Auth session helpers, Vitest

---

## File Map

### Existing files to modify

- `app/(app)/templates/page.tsx`
  - Recompose the full templates workspace into a Stitch-style layout with a denser top save section and a row-based lower asset list.
- `components/template-list.tsx`
  - Replace the current card-like list with table-like row surfaces and preserve instantiate wiring.
- `tests/components/templates-page.test.tsx`
  - Update route-level expectations to match the new upper/lower section structure and row-based actions.

### New files likely to create

- `components/template-source-event-list.tsx`
  - Present the top `save from existing event` rows cleanly if extracting this meaningfully simplifies `page.tsx`.
- `components/template-row.tsx`
  - Optional presentational row component for the saved template list if `template-list.tsx` grows unwieldy.

Only create these if they materially clarify responsibilities. Prefer the smallest clear split.

### Files to inspect during implementation

- `components/template-save-button.tsx`
  - Ensure page header CTA remains aligned with the new workspace layout.
- `components/form-pending-button.tsx`
  - Reuse pending labels/buttons for row actions.
- `components/dashboard-shell.tsx`
  - Use as tone reference only; do not force `/templates` into it unless it genuinely fits.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-05-templates-stitch-alignment-design.md`
- Current route: `app/(app)/templates/page.tsx`
- Current lower list: `components/template-list.tsx`
- Current route test: `tests/components/templates-page.test.tsx`
- Stitch asset reference:
  - `design/stitch/project-16774743705046066908/images/d3b1a1a962e147dda2f9b80987b98788-templates.png`

## Task 1: Lock In The New Templates Workspace Expectations With Failing Tests

**Files:**
- Modify: `tests/components/templates-page.test.tsx`

- [ ] **Step 1: Add structural expectations for the Stitch-style two-part workspace**

Extend the route test to expect:

- the page title/header still renders
- the top section reads as a save workspace rather than a single empty card
- the saved templates section exists as a separate lower region
- row-oriented actions remain present

Suggested expectations:

```tsx
expect(screen.getByText("既存の公演からテンプレートを保存")).toBeInTheDocument();
expect(screen.getByText("保存済みテンプレート")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "この公演から保存" })).toBeInTheDocument();
expect(screen.getByRole("button", { name: "このテンプレートで公演作成" })).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused templates route test to verify it fails**

Run:

```bash
npm run test -- tests/components/templates-page.test.tsx
```

Expected: FAIL on the new structural expectations because the current page is still closer to large card sections.

- [ ] **Step 3: Tighten the expectations so they assert structure, not incidental styling**

Do not overfit to class names or exact card geometry. The test should prove the two-part operations workspace exists.

- [ ] **Step 4: Re-run the focused templates test**

Run:

```bash
npm run test -- tests/components/templates-page.test.tsx
```

Expected: FAIL only on the new shape expectations.

- [ ] **Step 5: Commit**

```bash
git add tests/components/templates-page.test.tsx
git commit -m "test: define templates workspace expectations"
```

## Task 2: Recompose The Upper Save-From-Event Section

**Files:**
- Modify: `app/(app)/templates/page.tsx`
- Optional Create: `components/template-source-event-list.tsx`

- [ ] **Step 1: Convert the top save section into compact event rows**

Replace the large event cards with denser rows that still include:

- event title
- venue/date meta
- item count
- template name field
- optional memo field
- save action

Keep the empty state meaningful and action-oriented.

- [ ] **Step 2: Keep the header actions intact while improving hierarchy**

Preserve:

- `TemplateSaveButton`
- `UserMenu`

But tighten the page hierarchy so the top workspace feels like a single operations surface rather than stacked cards.

- [ ] **Step 3: Run the focused templates test**

Run:

```bash
npm run test -- tests/components/templates-page.test.tsx
```

Expected: some new upper-section expectations pass; lower-section expectations may still fail.

- [ ] **Step 4: Keep save wiring untouched**

Do not change:

- `saveTemplateFromEventFormAction`
- required field behavior
- Pro gating semantics

- [ ] **Step 5: Commit**

```bash
git add app/(app)/templates/page.tsx components/template-source-event-list.tsx tests/components/templates-page.test.tsx
git commit -m "style: reshape template save workspace"
```

## Task 3: Rebuild The Saved Templates List As Row-Based Assets

**Files:**
- Modify: `components/template-list.tsx`
- Optional Create: `components/template-row.tsx`
- Modify: `tests/components/templates-page.test.tsx`

- [ ] **Step 1: Convert the lower template list into row-based surfaces**

Each saved template entry should read like an asset row:

- name
- item count
- optional description
- instantiate CTA

Aim for `table-like rows`, not large cards.

- [ ] **Step 2: Improve the lower-section heading and empty state**

Make the lower section clearly distinct as `保存済みテンプレート`.

If no templates exist:

- show a purposeful empty state
- keep the message about reusable saved structure
- avoid ad-like overstatement

- [ ] **Step 3: Run the focused templates test**

Run:

```bash
npm run test -- tests/components/templates-page.test.tsx
```

Expected: PASS

- [ ] **Step 4: Keep instantiate behavior unchanged**

Do not alter:

- `instantiateAction`
- hidden `templateId`, `title`, `theme` inputs
- pending label semantics

- [ ] **Step 5: Commit**

```bash
git add components/template-list.tsx components/template-row.tsx tests/components/templates-page.test.tsx
git commit -m "style: align saved templates list with stitch"
```

## Task 4: Final Regression Sweep

**Files:**
- Modify only if legitimate regressions appear:
  - `app/(app)/templates/loading.tsx`
  - `tests/components/billing-page.test.tsx`
  - `tests/components/performance-archive-page.test.tsx`

- [ ] **Step 1: Run focused route/component checks**

Run:

```bash
npm run test -- tests/components/templates-page.test.tsx
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

If templates changes affect nearby page tests or empty-state text, update only the tests that encode old wording/structure.

- [ ] **Step 4: Re-run minimal failing commands if needed**

Run only the commands required to confirm any regression fix.

- [ ] **Step 5: Commit**

```bash
git add app/(app)/templates/page.tsx components/template-list.tsx components/template-source-event-list.tsx components/template-row.tsx tests/components/templates-page.test.tsx
git commit -m "test: verify templates stitch workspace"
```
