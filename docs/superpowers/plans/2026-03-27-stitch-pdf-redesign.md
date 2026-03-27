# Stitch PDF Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace direct PDF download with a Stitch-aligned preview-first flow, and redesign the rendered PDF itself to match the approved Stitch preview references.

**Architecture:** Keep a single shared PDF presentation model as the source of truth for pagination, row semantics, display text, and warnings. Build a new authenticated preview route that renders React/Tailwind sheets from that model, while the existing PDF API route keeps using the same model through `pdf-lib` so preview and downloaded PDF stay in sync.

**Tech Stack:** Next.js App Router, React Server Components, Tailwind CSS, pdf-lib, Vitest, Playwright

---

## File Map

### Existing files to modify

- `components/export-pdf-button.tsx`
  - Change the editor CTA from direct download to preview-page navigation.
- `app/api/events/[eventId]/pdf/route.ts`
  - Keep binary PDF delivery, but align query handling with preview routing and shared model usage.
- `lib/pdf/build-layout.ts`
  - Expand from basic row positioning into the authoritative presentation model for preview + PDF.
- `lib/pdf/render-setlist-pdf.ts`
  - Redraw the PDF using the Stitch-aligned paper rules and the shared presentation model.
- `tests/pdf/layout.test.ts`
  - Add parity- and warning-focused layout assertions.
- `tests/pdf/render-setlist-pdf.test.ts`
  - Verify redesigned PDF buffers still render successfully.
- `tests/api/pdf-route.test.ts`
  - Cover download behavior with preview-style theme query flow.
- `tests/e2e/setlist-flow.spec.ts`
  - Update the editor-to-preview-to-download flow.

### New files to create

- `app/(app)/events/[eventId]/pdf/page.tsx`
  - Authenticated preview route for a single event’s PDF.
- `components/pdf-preview-page.tsx`
  - Top-level preview screen shell and data wiring.
- `components/pdf-sheet-preview.tsx`
  - Left-column rendered page stack based on the shared layout model.
- `components/pdf-preview-inspector.tsx`
  - Right-column panel for theme switching and layout warnings.
- `tests/components/pdf-preview-page.test.tsx`
  - Component coverage for preview rendering, theme switching, and warnings.
- `tests/components/pdf-preview-page-route.test.tsx`
  - Route-level wiring coverage for auth, event lookup, and theme resolution.

## Task 1: Expand the shared PDF presentation model

**Files:**
- Modify: `lib/pdf/build-layout.ts`
- Test: `tests/pdf/layout.test.ts`

- [ ] **Step 1: Write failing layout tests for parity-oriented data**

Add tests that expect `buildSetlistPdfLayout()` to return:
- multi-page layouts with stable page arrays
- per-row display semantics for `song`, `mc`, `transition`, and `heading`
- warnings for overlong titles
- display text / page count data suitable for both preview and PDF

- [ ] **Step 2: Run the failing layout tests**

Run: `npm run test -- tests/pdf/layout.test.ts`
Expected: FAIL because the current layout builder does not expose the richer model yet.

- [ ] **Step 3: Implement the minimal shared model changes**

Update `lib/pdf/build-layout.ts` so it becomes the only source of truth for:
- pagination
- row display labels and display text
- heading / MC / transition variants
- warning generation for long titles
- page metadata used by both preview and renderer

Keep the API surface focused. If the file gets unwieldy, split small helper functions within the same module only if necessary.

- [ ] **Step 4: Run the focused layout tests**

Run: `npm run test -- tests/pdf/layout.test.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 1**

```bash
git add tests/pdf/layout.test.ts lib/pdf/build-layout.ts
git commit -m "feat: expand shared pdf layout model"
```

## Task 2: Redesign the PDF renderer to match the Stitch paper rules

**Files:**
- Modify: `lib/pdf/render-setlist-pdf.ts`
- Modify: `tests/pdf/render-setlist-pdf.test.ts`

- [ ] **Step 1: Write failing renderer assertions for the redesigned layout**

Extend the renderer test so it still verifies a valid PDF buffer, and add at least one assertion path that exercises the new layout shape from Task 1.

- [ ] **Step 2: Run the failing renderer test**

Run: `npm run test -- tests/pdf/render-setlist-pdf.test.ts`
Expected: FAIL because the renderer still draws the old boxed layout.

- [ ] **Step 3: Implement the Stitch-aligned PDF drawing**

Update `lib/pdf/render-setlist-pdf.ts` to draw:
- stronger title band/header
- large left cue column
- song rows with large titles
- `[ MC ]` rows
- centered transition separators
- section-break heading rows
- simplified practical footer with update time / page number only

Do not reintroduce decorative fake metadata like `CONFIDENTIAL` or MD5-like copy.

- [ ] **Step 4: Run focused renderer tests**

Run: `npm run test -- tests/pdf/render-setlist-pdf.test.ts tests/pdf/layout.test.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 2**

```bash
git add lib/pdf/render-setlist-pdf.ts tests/pdf/render-setlist-pdf.test.ts tests/pdf/layout.test.ts
git commit -m "feat: restyle rendered setlist pdf"
```

## Task 3: Add the authenticated preview route and page shell

**Files:**
- Create: `app/(app)/events/[eventId]/pdf/page.tsx`
- Create: `components/pdf-preview-page.tsx`
- Create: `tests/components/pdf-preview-page-route.test.tsx`

- [ ] **Step 1: Write failing route wiring tests**

Add route tests that cover:
- authenticated event loading
- theme query resolution with `light` fallback
- 404 / redirect behavior following existing app conventions
- passing shared layout data into the preview page component

- [ ] **Step 2: Run the failing route tests**

Run: `npm run test -- tests/components/pdf-preview-page-route.test.tsx`
Expected: FAIL because the route does not exist yet.

- [ ] **Step 3: Implement the preview page route and shell**

Create:
- `app/(app)/events/[eventId]/pdf/page.tsx`
- `components/pdf-preview-page.tsx`

The route should:
- require auth
- fetch the event by owner
- resolve `theme` from query params
- build the shared layout model
- render the preview page shell

The page shell can be structural first. Detailed sheet rendering and inspector content arrive in the next task.

- [ ] **Step 4: Run focused route tests**

Run: `npm run test -- tests/components/pdf-preview-page-route.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit Task 3**

```bash
git add app/'(app)'/events/'[eventId]'/pdf/page.tsx components/pdf-preview-page.tsx tests/components/pdf-preview-page-route.test.tsx
git commit -m "feat: add pdf preview route"
```

## Task 4: Build the Stitch-style preview sheet stack and inspector

**Files:**
- Create: `components/pdf-sheet-preview.tsx`
- Create: `components/pdf-preview-inspector.tsx`
- Modify: `components/pdf-preview-page.tsx`
- Create: `tests/components/pdf-preview-page.test.tsx`

- [ ] **Step 1: Write failing component tests for preview behavior**

Add component tests that cover:
- rendering all pages from the shared layout model
- theme-aware sheet rendering
- download link theme parity
- warning display only when the layout model includes warnings

- [ ] **Step 2: Run the failing component tests**

Run: `npm run test -- tests/components/pdf-preview-page.test.tsx`
Expected: FAIL because the detailed preview components do not exist yet.

- [ ] **Step 3: Implement the preview sheet and inspector**

Create and wire:
- `components/pdf-sheet-preview.tsx`
- `components/pdf-preview-inspector.tsx`

Requirements:
- left side renders every page returned by the layout builder
- right side exposes only theme switching and layout warnings
- left sheet omits decorative fake metadata just like the real PDF
- theme switching updates preview + download target

- [ ] **Step 4: Run focused preview tests**

Run: `npm run test -- tests/components/pdf-preview-page.test.tsx tests/components/pdf-preview-page-route.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit Task 4**

```bash
git add components/pdf-sheet-preview.tsx components/pdf-preview-inspector.tsx components/pdf-preview-page.tsx tests/components/pdf-preview-page.test.tsx tests/components/pdf-preview-page-route.test.tsx
git commit -m "feat: add stitch pdf preview screen"
```

## Task 5: Rewire the editor export CTA and keep API/download behavior aligned

**Files:**
- Modify: `components/export-pdf-button.tsx`
- Modify: `app/api/events/[eventId]/pdf/route.ts`
- Modify: `tests/api/pdf-route.test.ts`
- Modify: `tests/components/event-editor.test.tsx`

- [ ] **Step 1: Write failing tests for preview-first export**

Update tests so they expect:
- editor `PDF出力` points to the preview route, not the binary API route
- API route still returns downloadable PDF bytes
- theme query remains respected for downloads

- [ ] **Step 2: Run the failing tests**

Run: `npm run test -- tests/components/event-editor.test.tsx tests/api/pdf-route.test.ts`
Expected: FAIL because the editor CTA still targets the old API path.

- [ ] **Step 3: Implement the entrypoint change**

Update:
- `components/export-pdf-button.tsx` to link to `/events/[eventId]/pdf?theme=...`
- `app/api/events/[eventId]/pdf/route.ts` only as needed to keep preview/download parity and preserve auth + attachment behavior

- [ ] **Step 4: Run focused export tests**

Run: `npm run test -- tests/components/event-editor.test.tsx tests/api/pdf-route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 5**

```bash
git add components/export-pdf-button.tsx app/api/events/'[eventId]'/pdf/route.ts tests/components/event-editor.test.tsx tests/api/pdf-route.test.ts
git commit -m "feat: route pdf export through preview"
```

## Task 6: Validate the full preview-to-download flow

**Files:**
- Modify: `tests/e2e/setlist-flow.spec.ts`

- [ ] **Step 1: Write failing E2E expectations for the new flow**

Update the existing flow so it expects:
- editor `PDF出力` opens the preview page
- preview page shows the Stitch-style canvas and inspector
- download still returns a PDF response

- [ ] **Step 2: Run the failing E2E spec**

Run: `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`
Expected: FAIL because the test still assumes direct binary export from the editor.

- [ ] **Step 3: Implement any minimal fixes needed for E2E parity**

Adjust selectors or minor flow details only if necessary. Avoid broad UI churn outside the approved scope.

- [ ] **Step 4: Run the E2E flow again**

Run: `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 6**

```bash
git add tests/e2e/setlist-flow.spec.ts
git commit -m "test: cover pdf preview workflow"
```

## Task 7: Final verification and cleanup

**Files:**
- Review only; modify files only if verification exposes a real issue

- [ ] **Step 1: Run the unit and integration suite**

Run: `npm run test`
Expected: PASS

- [ ] **Step 2: Run lint and typecheck**

Run: `npm run lint`
Expected: PASS

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Run the PDF E2E workflow one final time**

Run: `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit any final fixes**

If verification required code changes:

```bash
git add <files>
git commit -m "fix: polish stitch pdf preview flow"
```

If no changes were needed, note that no final commit was required.
