# PDF Polish And Dark Editor Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the shared HTML-source PDF so it matches the Stitch dark direction more closely, adds density-aware page fitting, and then align the setlist editor UI with that same dark production-sheet atmosphere.

**Architecture:** Keep the shared PDF layout model as the single source of truth for preview and download. First extend that model with discrete density presets and pagination boundaries, then restyle the PDF document against the Stitch dark references, and finally restyle the editor shell and rows to echo the same visual system without changing behavior.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, shared HTML PDF document route, Playwright, Vitest, Stitch HTML/PNG references

---

## File Map

### Existing files to modify

- `lib/pdf/build-layout.ts`
  - Add density-aware preset selection and expose the document metrics the PDF component needs.
- `components/pdf-document.tsx`
  - Restyle the dark PDF, normalize song rows, fix transition centering, and apply preset-driven spacing/typography.
- `components/pdf-preview-page.tsx`
  - Keep the preview shell aligned with the updated PDF presentation and any preview copy changes.
- `tests/pdf/layout.test.ts`
  - Add coverage for density selection, page fitting, and multi-page fallback.
- `tests/components/pdf-document.test.tsx`
  - Add visual-structure assertions for dark PDF row rhythm and preset-driven rendering.
- `tests/components/pdf-preview-page.test.tsx`
  - Keep preview shell assertions aligned with the updated PDF presentation.
- `tests/e2e/setlist-flow.spec.ts`
  - Preserve preview/download parity assertions after PDF changes.
- `components/dashboard-shell.tsx`
  - Tune dark shell surfaces, spacing, and borders toward the Stitch dark editor.
- `components/event-editor-page-content.tsx`
  - Adjust top-level composition and dark hierarchy against the updated shell and PDF tone.
- `components/event-list.tsx`
  - Tighten left-rail density and current-event emphasis.
- `components/event-metadata-form.tsx`
  - Refine the metadata strip to feel flatter, denser, and more Stitch-like.
- `components/setlist-item-form.tsx`
  - Refine the compact add-item strip to better match the dark production-tool tone.
- `components/setlist-table.tsx`
  - Tune row rhythm, cue treatment, and type differentiation so the editor rows visually echo the PDF.
- `tests/components/event-editor.test.tsx`
  - Update assertions to the tuned dark editor shell and row presentation.
- `tests/components/event-editor-page-route.test.tsx`
  - Keep route-level composition assertions aligned if visible copy or structure changes.

### New files likely to create

- `lib/pdf/density-presets.ts`
  - Optional focused helper for preset thresholds and typography/spacing constants if `build-layout.ts` grows too large.
- `tests/pdf/density-presets.test.ts`
  - Optional focused unit tests if density logic is split into its own module.

Create the optional files only if they keep responsibilities clearer. Do not split solely for style.

## Reference Material

- Spec: `docs/superpowers/specs/2026-03-28-pdf-polish-and-dark-editor-alignment-design.md`
- Stitch dark PDF:
  - `design/stitch/project-16774743705046066908/screens/6421425f53c24fa2bdfb2c429cbb2aa0-pdf-preview-dark.html`
  - `design/stitch/project-16774743705046066908/images/6421425f53c24fa2bdfb2c429cbb2aa0-pdf-preview-dark.png`
- Stitch dark editor:
  - `design/stitch/project-16774743705046066908/screens/37b9f1721b8c43a09f38b1d7915f0243-setlist-editor-dark.html`
  - `design/stitch/project-16774743705046066908/images/37b9f1721b8c43a09f38b1d7915f0243-setlist-editor-dark.png`
- Secondary regression references:
  - `design/stitch/project-16774743705046066908/screens/1a5dd724f19843948b2f6459eb6f2d34-pdf-preview-light.html`
  - `design/stitch/project-16774743705046066908/screens/8d426adf04034b19bceac56faa05e789-setlist-editor-light.html`

## Task 1: Add Density-Aware PDF Layout Presets

**Files:**
- Modify: `lib/pdf/build-layout.ts`
- Test: `tests/pdf/layout.test.ts`
- Optional Create: `lib/pdf/density-presets.ts`
- Optional Test: `tests/pdf/density-presets.test.ts`

- [ ] **Step 1: Write the failing tests for density selection**

Add tests that expect the PDF layout builder to choose:

- a `relaxed`-style result for low row counts
- a `standard` result for medium density
- a `compact` result for high density that still fits on one page
- multiple pages once compact density would no longer be readable

Suggested assertions:

```ts
expect(layout.densityPreset).toBe("relaxed");
expect(layout.pageCount).toBe(1);
```

and

```ts
expect(layout.densityPreset).toBe("compact");
expect(layout.pageCount).toBe(2);
```

- [ ] **Step 2: Run the focused density tests to verify they fail**

Run: `npm run test -- tests/pdf/layout.test.ts`

Expected: FAIL because the current layout builder does not expose or apply density presets yet.

- [ ] **Step 3: Implement the discrete density model**

Add the minimum shared layout changes so the builder:

- counts effective row density across songs, MC, transition, and heading rows
- selects among `relaxed`, `standard`, and `compact`
- paginates when compact density would exceed the readability boundary
- exposes the chosen preset and the resulting page geometry to the PDF component

If the preset tables become noisy, extract constants/helpers into `lib/pdf/density-presets.ts`.

- [ ] **Step 4: Run the focused density tests to verify they pass**

Run: `npm run test -- tests/pdf/layout.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/pdf/build-layout.ts tests/pdf/layout.test.ts lib/pdf/density-presets.ts tests/pdf/density-presets.test.ts
git commit -m "feat: add density-aware pdf layout presets"
```

## Task 2: Restyle the Shared PDF Document Against Stitch Dark

**Files:**
- Modify: `components/pdf-document.tsx`
- Modify: `tests/components/pdf-document.test.tsx`
- Modify: `tests/components/pdf-preview-page.test.tsx`

- [ ] **Step 1: Write the failing tests for row rhythm and centering**

Extend PDF component tests to cover:

- the first song row sharing the same title treatment as later rows
- transition rows using the same centering logic family as MC rows
- heading rows remaining distinct from normal song rows
- dark document structure reacting to the chosen density preset

Suggested test shape:

```tsx
expect(songRows[0]).toHaveAttribute("data-density-preset", "relaxed");
expect(transitionRow).toHaveAttribute("data-row-variant", "transition");
```

- [ ] **Step 2: Run the focused document tests to verify they fail**

Run: `npm run test -- tests/components/pdf-document.test.tsx tests/components/pdf-preview-page.test.tsx`

Expected: FAIL because the current document styling and structure do not yet expose the new rhythm/centering behavior.

- [ ] **Step 3: Implement the dark PDF polish**

Update `components/pdf-document.tsx` to:

- normalize song-row typography so `M01` through later songs share one repeated system
- rebuild transition row spacing so it reads optically centered like MC
- tighten header hierarchy, meta line, cue cells, dividers, and row spacing toward the Stitch dark reference
- apply preset-driven typography/spacing changes for `relaxed`, `standard`, and `compact`
- keep preview and downloaded PDF on the same document source

- [ ] **Step 4: Run the focused document tests to verify they pass**

Run: `npm run test -- tests/components/pdf-document.test.tsx tests/components/pdf-preview-page.test.tsx tests/pdf/layout.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/pdf-document.tsx tests/components/pdf-document.test.tsx tests/components/pdf-preview-page.test.tsx tests/pdf/layout.test.ts
git commit -m "feat: polish stitch dark pdf document"
```

## Task 3: Verify Preview/Download Parity Across Density Cases

**Files:**
- Modify: `tests/e2e/setlist-flow.spec.ts`
- Modify: `tests/components/pdf-preview-page.test.tsx`
- Modify: `components/pdf-preview-page.tsx` only if preview shell copy or framing needs alignment

- [ ] **Step 1: Write the failing parity assertions for density-aware output**

Update tests so they expect:

- preview still embeds the same source document after the density changes
- theme switching keeps preview and download aligned
- the preview shell can tolerate the updated PDF framing and density-dependent page counts

If useful, add one component-level assertion that the preview shell still reflects page count from the layout model.

- [ ] **Step 2: Run the focused parity tests to verify they fail**

Run: `npm run test -- tests/components/pdf-preview-page.test.tsx`

Expected: FAIL if the preview shell assumptions no longer match the PDF model.

- [ ] **Step 3: Implement the minimum preview adjustments**

Update `components/pdf-preview-page.tsx` only as needed so it:

- stays visually aligned with the updated PDF
- keeps the embedded document and download link in sync
- continues to show page/warning metadata from the shared layout model

Do not introduce any second PDF rendering path.

- [ ] **Step 4: Run the focused parity tests to verify they pass**

Run: `npm run test -- tests/components/pdf-preview-page.test.tsx tests/components/pdf-document.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/pdf-preview-page.tsx tests/components/pdf-preview-page.test.tsx tests/components/pdf-document.test.tsx tests/e2e/setlist-flow.spec.ts
git commit -m "test: cover density-aware pdf parity"
```

## Task 4: Push the Editor Shell Toward Stitch Dark

**Files:**
- Modify: `components/dashboard-shell.tsx`
- Modify: `components/event-editor-page-content.tsx`
- Modify: `components/event-list.tsx`
- Modify: `tests/components/event-editor.test.tsx`
- Modify: `tests/components/event-editor-page-route.test.tsx`

- [ ] **Step 1: Write the failing tests for dark shell tone**

Update editor tests so they expect:

- flatter/darker shell treatment
- the left rail and top controls still visible with the current editor flow
- no regression to oversized dashboard-card composition

Suggested assertions:

```tsx
expect(screen.getByRole("navigation", { name: "公演ナビゲーション" })).toBeVisible();
expect(screen.getByRole("link", { name: "PDF出力" })).toBeVisible();
```

- [ ] **Step 2: Run the focused shell tests to verify they fail**

Run: `npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx`

Expected: FAIL because the current shell is still a softer approximation of the Stitch dark editor.

- [ ] **Step 3: Implement the dark shell polish**

Tune the shell and left rail so they feel more like the Stitch dark editor:

- flatter, darker surfaces
- sharper hierarchy
- denser rail rhythm
- stronger current-event emphasis
- tighter connection between top bar, rail, and editor body

Keep all existing event navigation and editor behavior untouched.

- [ ] **Step 4: Run the focused shell tests to verify they pass**

Run: `npm run test -- tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/dashboard-shell.tsx components/event-editor-page-content.tsx components/event-list.tsx tests/components/event-editor.test.tsx tests/components/event-editor-page-route.test.tsx
git commit -m "feat: tune dark editor shell toward stitch"
```

## Task 5: Align Metadata, Add-Item Strip, and Setlist Rows With the PDF Tone

**Files:**
- Modify: `components/event-metadata-form.tsx`
- Modify: `components/setlist-item-form.tsx`
- Modify: `components/setlist-table.tsx`
- Modify: `components/event-editor-page-content.tsx`
- Modify: `tests/components/event-editor.test.tsx`
- Modify: `tests/e2e/setlist-flow.spec.ts`

- [ ] **Step 1: Write the failing tests for row-level visual semantics**

Update tests so they expect:

- metadata strip remains compact and visible
- add-item strip remains compact and immediately actionable
- setlist rows visually preserve cue numbers and controls while reading more like the polished PDF system

Suggested assertions:

```tsx
expect(screen.getByLabelText("Date")).toBeVisible();
expect(screen.getByRole("textbox", { name: "タイトル" })).toBeVisible();
expect(screen.getByText("M01")).toBeVisible();
```

- [ ] **Step 2: Run the focused row tests to verify they fail**

Run: `npm run test -- tests/components/event-editor.test.tsx`

Expected: FAIL because the row-level styling has not yet been tuned to the new PDF tone.

- [ ] **Step 3: Implement the row-level editor polish**

Refine:

- metadata strip spacing and hierarchy
- add-item strip control density
- setlist row cue treatment, title rhythm, and type differentiation

The editor should now feel like the control surface for the same printed sheet.

- [ ] **Step 4: Run the focused row tests to verify they pass**

Run: `npm run test -- tests/components/event-editor.test.tsx tests/e2e/setlist-flow.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/event-metadata-form.tsx components/setlist-item-form.tsx components/setlist-table.tsx components/event-editor-page-content.tsx tests/components/event-editor.test.tsx tests/e2e/setlist-flow.spec.ts
git commit -m "feat: align editor rows with polished pdf tone"
```

## Task 6: Run the Full Regression Suite and Close the Loop

**Files:**
- Modify only what the verification results require

- [ ] **Step 1: Run the full unit/component test suite**

Run: `npm run test`

Expected: PASS

- [ ] **Step 2: Run lint and typecheck**

Run: `npm run lint`

Expected: PASS

Run: `npm run typecheck`

Expected: PASS

- [ ] **Step 3: Run build and end-to-end verification**

Run: `npm run build`

Expected: PASS

Run: `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`

Expected: PASS

- [ ] **Step 4: Run the Cloudflare compatibility check**

Run: `npm run cf:check`

Expected: PASS or only non-blocking dry-run warnings with exit code 0

- [ ] **Step 5: Commit any final fixes**

```bash
git add -A
git commit -m "fix: finalize pdf polish and dark editor alignment"
```
