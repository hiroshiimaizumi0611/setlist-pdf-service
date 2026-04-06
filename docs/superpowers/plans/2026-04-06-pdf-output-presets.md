# PDF Output Presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add free/pro PDF output presets so users choose rendering presets from the PDF preview workspace, with preview and download always using the same selected preset.

**Architecture:** Keep the current HTML-source PDF pipeline and extend it with a code-defined preset layer. Surface preset selection in the preview route, gate paid presets by current plan, and thread the selected preset through both preview rendering and download generation via one shared source of truth.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Better Auth session helpers, existing HTML-source PDF rendering, Vitest

---

## File Map

### Existing files to modify

- `app/(app)/events/[eventId]/pdf/page.tsx`
  - Load current plan/session context and pass preset availability into the preview page.
- `components/pdf-preview-page.tsx`
  - Add the preset selector UI, free/pro gating states, and keep download wired to the active preset.
- `components/pdf-document.tsx`
  - Apply preset-driven presentation changes to the actual rendered document.
- `lib/pdf/build-layout.ts`
  - Thread preset density tuning into layout decisions.
- `lib/pdf/density-presets.ts`
  - Extend or adapt density presets so they can vary by output preset.
- `lib/pdf/generate-pdf-from-document.ts`
  - Ensure selected preset is preserved for actual PDF generation.
- `app/api/events/[eventId]/pdf/route.ts`
  - Accept and validate the preset query value, then render/download with it.
- `tests/components/pdf-preview-page.test.tsx`
  - Lock in selector behavior and plan gating.
- `tests/api/pdf-route.test.ts`
  - Lock in preset propagation to the route.
- `tests/e2e/setlist-flow.spec.ts`
  - Verify preview and download stay aligned through preset selection.

### New files likely to create

- `lib/pdf/output-presets.ts`
  - Code-defined preset catalog, labels, descriptions, plan requirements, and tuning metadata.
- `components/pdf-preset-selector.tsx`
  - Compact preset selector UI for the preview workspace if extracting this keeps `pdf-preview-page.tsx` focused.

Only create the selector component if it materially improves clarity.

### Files to inspect during implementation

- `components/export-pdf-button.tsx`
  - Confirm editor → preview navigation still lands on the default preset correctly.
- `lib/stripe/plans.ts`
  - Reuse existing plan vocabulary for free/pro gating.
- `tests/components/pdf-document.test.tsx`
  - Add preset-specific rendering assertions if the component already has stable hooks.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-06-pdf-output-presets-design.md`
- Preview UI: `components/pdf-preview-page.tsx`
- Actual document: `components/pdf-document.tsx`
- Layout logic: `lib/pdf/build-layout.ts`, `lib/pdf/density-presets.ts`
- Download route: `app/api/events/[eventId]/pdf/route.ts`

## Task 1: Define Preset Domain And Lock It In With Failing Tests

**Files:**
- Create: `lib/pdf/output-presets.ts`
- Modify: `tests/components/pdf-preview-page.test.tsx`

- [ ] **Step 1: Add failing preview-selector expectations**

Extend the preview page test to expect:

- free presets appear
- pro presets appear but are marked/gated for free users
- preset metadata is visible in compact form

Suggested expectations:

```tsx
expect(screen.getByText("Standard Light")).toBeInTheDocument();
expect(screen.getByText("Large Type")).toBeInTheDocument();
expect(screen.getByText("Pro")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused preview test to verify it fails**

Run:

```bash
npm run test -- tests/components/pdf-preview-page.test.tsx
```

Expected: FAIL because no preset selector exists yet.

- [ ] **Step 3: Create the preset catalog**

Add `lib/pdf/output-presets.ts` with code-defined preset metadata:

- id
- label
- description
- requiredPlan
- base theme / compatibility data if needed
- tuning payload for layout/doc rendering

Do not wire it into rendering yet.

- [ ] **Step 4: Re-run the focused preview test**

Run:

```bash
npm run test -- tests/components/pdf-preview-page.test.tsx
```

Expected: still FAIL on UI expectations, but domain definitions exist.

- [ ] **Step 5: Commit**

```bash
git add lib/pdf/output-presets.ts tests/components/pdf-preview-page.test.tsx
git commit -m "test: define pdf output preset expectations"
```

## Task 2: Add Preview-Side Preset Selection And Plan Gating

**Files:**
- Modify: `app/(app)/events/[eventId]/pdf/page.tsx`
- Modify: `components/pdf-preview-page.tsx`
- Optional Create: `components/pdf-preset-selector.tsx`
- Modify: `tests/components/pdf-preview-page.test.tsx`

- [ ] **Step 1: Surface preset selection in the preview workspace**

Add a compact preset selector that shows:

- preset label
- short description
- free / pro marker
- active selection

Keep it visually aligned with the existing preview workspace.

- [ ] **Step 2: Implement free/pro gating**

For free users:

- standard presets are selectable
- pro presets are visible but not activatable as normal
- selecting a pro preset should show upgrade-oriented treatment rather than silently failing

For pro users:

- all presets are selectable

- [ ] **Step 3: Thread preset selection through the preview URL/state**

Use a stable route/query representation so refresh, sharing, and download use the same selection.

- [ ] **Step 4: Run the focused preview test**

Run:

```bash
npm run test -- tests/components/pdf-preview-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/events/[eventId]/pdf/page.tsx components/pdf-preview-page.tsx components/pdf-preset-selector.tsx tests/components/pdf-preview-page.test.tsx
git commit -m "feat: add gated pdf preset selector"
```

If no `components/pdf-preset-selector.tsx` file is created, omit it from the commit.

## Task 3: Apply Presets To Actual Preview And Download Rendering

**Files:**
- Modify: `components/pdf-document.tsx`
- Modify: `lib/pdf/build-layout.ts`
- Modify: `lib/pdf/density-presets.ts`
- Modify: `lib/pdf/generate-pdf-from-document.ts`
- Modify: `app/api/events/[eventId]/pdf/route.ts`
- Modify: `tests/api/pdf-route.test.ts`
- Optional Modify: `tests/components/pdf-document.test.tsx`

- [ ] **Step 1: Add failing route/document expectations**

Before wiring the render path, add tests that prove:

- preset reaches the download route
- route uses the chosen preset
- at least one preset changes rendering behavior from standard

- [ ] **Step 2: Run the focused render tests to verify failure**

Run:

```bash
npm run test -- tests/api/pdf-route.test.ts tests/components/pdf-document.test.tsx
```

Only include the document test if you updated it.

Expected: FAIL on preset propagation or rendering expectations.

- [ ] **Step 3: Thread preset through the rendering pipeline**

Ensure one source of truth feeds both:

- preview document
- actual download route

No preview/download divergence.

- [ ] **Step 4: Keep layout behavior preset-aware**

Use preset data to tune:

- density baseline
- emphasis / spacing choices
- any theme-compatible visual treatment

Do not fork into a separate PDF engine.

- [ ] **Step 5: Re-run the focused render tests**

Run:

```bash
npm run test -- tests/api/pdf-route.test.ts tests/components/pdf-document.test.tsx
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/pdf-document.tsx lib/pdf/build-layout.ts lib/pdf/density-presets.ts lib/pdf/generate-pdf-from-document.ts app/api/events/[eventId]/pdf/route.ts tests/api/pdf-route.test.ts tests/components/pdf-document.test.tsx
git commit -m "feat: render pdf output presets"
```

Omit `tests/components/pdf-document.test.tsx` if it was not changed.

## Task 4: Verify Preview/Download Parity And Regression Safety

**Files:**
- Modify: `tests/e2e/setlist-flow.spec.ts`
- Modify only if regressions appear in related preview/export tests

- [ ] **Step 1: Add E2E coverage for preset selection**

Verify at least:

- preview shows selector
- free/pro gating is correct for the exercised account
- selected preset remains active across preview state
- download request includes the selected preset

- [ ] **Step 2: Run focused preset-flow verification**

Run:

```bash
npm run test -- tests/components/pdf-preview-page.test.tsx tests/api/pdf-route.test.ts
npm run test:e2e -- tests/e2e/setlist-flow.spec.ts
```

Expected: PASS

- [ ] **Step 3: Run broader verification**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: PASS

- [ ] **Step 4: Fix only real regressions**

If preset plumbing breaks related export or preview tests, patch only the affected code and rerun the failing commands.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/setlist-flow.spec.ts tests/components/pdf-preview-page.test.tsx tests/api/pdf-route.test.ts
git commit -m "test: verify pdf output preset flow"
```

Skip this commit if no files changed during Task 4.
