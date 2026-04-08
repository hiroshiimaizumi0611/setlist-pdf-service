# PDF Preset Preview Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Free ユーザーでも Pro 向け PDF プリセットの preview は確認できるようにしつつ、出力時だけ modal で gate して Pro 価値を自然に伝える。

**Architecture:** 既存の PDF preview route を `requestedPresetId` 主体に切り替え、preview/document は requested preset をそのまま使う。download だけは UI modal 経由で最終 preset を確定させ、server-side でも free による Pro preset 直接出力を拒否する。

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Better Auth session helpers, existing HTML-source PDF rendering, Vitest, Playwright

---

## File Map

### Existing files to modify

- `components/pdf-preset-selector.tsx`
  - Free でも Pro preset を selectable にし、blocked 表現を preview-aware に置き換える。
- `components/pdf-preview-page.tsx`
  - preview 中の notice と export modal state を持ち、download action を modal 分岐へ変える。
- `components/export-pdf-button.tsx`
  - 既存の button 実装パターンを流用できるか確認し、必要なら modal 起動導線の見た目を揃える。
- `app/(app)/events/[eventId]/pdf/page.tsx`
  - preview route で `requestedPresetId / previewPresetId / downloadPresetId` を整理して `PdfPreviewPage` へ渡す。
- `app/api/events/[eventId]/pdf/route.ts`
  - free による Pro preset 直接 download を拒否または free preset のみ許可する現在契約に合わせて最終防衛線を維持する。
- `lib/pdf/output-presets.ts`
  - requested / preview / download の selection helper を整理し、preview-side と download-side の責務を分ける。
- `tests/components/pdf-preview-page.test.tsx`
  - preview selectable / modal gating / CTA 分岐を固定する。
- `tests/components/pdf-preview-page-route.test.tsx`
  - route が preview 用 preset と download 用 preset を意図どおり計算していることを固定する。
- `tests/api/pdf-route.test.ts`
  - free の direct download bypass 防止を固定する。
- `tests/e2e/setlist-flow.spec.ts`
  - free/pro の preset flow を end-to-end で確認する。

### New files likely to create

- `components/pdf-export-gate-modal.tsx`
  - modal を切り出して `標準プリセットで出力 / Pro にアップグレード / キャンセル` を責務分離する。

この modal が `pdf-preview-page.tsx` を肥大化させないなら新規作成する。小さく収まるなら既存ファイル内でもよい。

### Files to inspect during implementation

- `components/billing-payment-section.tsx`
  - upgrade CTA 文言やボタンの tone を合わせる参考。
- `components/form-pending-button.tsx`
  - pending / disabled の UI パターンが使えるか確認。
- `tests/components/export-pdf-button.test.tsx`
  - button interaction の既存テストパターンを参照。

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-08-pdf-preset-preview-gating-design.md`
- Existing preset feature:
  - `docs/superpowers/specs/2026-04-06-pdf-output-presets-design.md`
  - `components/pdf-preview-page.tsx`
  - `components/pdf-preset-selector.tsx`
  - `lib/pdf/output-presets.ts`

## Task 1: Make Pro Presets Preview-Selectable For Free Users

**Files:**
- Modify: `components/pdf-preset-selector.tsx`
- Modify: `tests/components/pdf-preview-page.test.tsx`

- [ ] **Step 1: Write failing selector expectations**

Extend the component test so a free user:

- can activate `Large Type`
- sees it as the current preview selection
- no longer sees the old blocked-only interaction contract

Suggested assertions:

```tsx
expect(screen.getByRole("link", { name: "Large Type" })).toHaveAttribute(
  "aria-current",
  "page",
);
expect(screen.queryByText(/standard preset を維持/)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test -- tests/components/pdf-preview-page.test.tsx
```

Expected: FAIL because free users are still preview-blocked today.

- [ ] **Step 3: Update the selector behavior**

Change `PdfPresetSelector` so:

- free users can click Pro presets
- requested preset becomes active in preview UI
- copy changes to `preview available / export requires Pro`
- old blocked banner contract is removed

- [ ] **Step 4: Re-run the focused test**

Run:

```bash
npm run test -- tests/components/pdf-preview-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/pdf-preset-selector.tsx tests/components/pdf-preview-page.test.tsx
git commit -m "feat: allow previewing pro pdf presets"
```

## Task 2: Add Export Gate Modal In The Preview Workspace

**Files:**
- Create or Modify: `components/pdf-export-gate-modal.tsx`
- Modify: `components/pdf-preview-page.tsx`
- Modify: `tests/components/pdf-preview-page.test.tsx`

- [ ] **Step 1: Write failing modal expectations**

Add tests proving that when a free user is previewing a Pro preset and presses `PDF出力`:

- a modal appears
- the modal shows:
  - `このプリセットで出力するにはProが必要です`
  - `標準プリセットで出力`
  - `Proにアップグレード`
  - `キャンセル`

- [ ] **Step 2: Run the focused test to verify failure**

Run:

```bash
npm run test -- tests/components/pdf-preview-page.test.tsx
```

Expected: FAIL because export still behaves as a direct link today.

- [ ] **Step 3: Implement the modal flow**

Implement minimal behavior:

- free + Pro preset preview:
  - `PDF出力` opens modal
- `標準プリセットで出力`
  - starts download with the current theme’s free standard preset
- `Proにアップグレード`
  - links to `/settings/billing`
- `キャンセル`
  - closes modal
- pro user:
  - export still proceeds directly

- [ ] **Step 4: Re-run the focused test**

Run:

```bash
npm run test -- tests/components/pdf-preview-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/pdf-preview-page.tsx components/pdf-export-gate-modal.tsx tests/components/pdf-preview-page.test.tsx
git commit -m "feat: gate pro preset export behind modal"
```

If no separate modal file was created, omit it from the commit.

## Task 3: Separate Preview Selection From Download Selection In Route Logic

**Files:**
- Modify: `app/(app)/events/[eventId]/pdf/page.tsx`
- Modify: `app/(app)/events/[eventId]/pdf/document/page.tsx`
- Modify: `lib/pdf/output-presets.ts`
- Modify: `tests/components/pdf-preview-page-route.test.tsx`
- Modify: `tests/components/pdf-document-route.test.tsx`

- [ ] **Step 1: Write failing route expectations**

Add route tests that prove:

- free + `preset=large-type`
  - preview/requested preset stays `large-type`
  - download preset resolves to `standard-dark` or `standard-light` by theme
- free + `preset=large-type` on the document route
  - preview document continues to render the requested preset
  - only the download preset is separated
- pro users still get the same preset for both preview and download

- [ ] **Step 2: Run the focused route test to verify failure**

Run:

```bash
npm run test -- tests/components/pdf-preview-page-route.test.tsx
```

Expected: FAIL because the route currently couples preview and blocked fallback behavior.

- [ ] **Step 3: Refactor selection helpers**

In `lib/pdf/output-presets.ts`, introduce or reshape helpers so the route can clearly derive:

- `requestedPresetId`
- `previewPresetId`
- `downloadPresetId`
- whether export should be gated

Keep naming explicit and avoid hidden fallback behavior.

- [ ] **Step 4: Update the preview route**

Make `app/(app)/events/[eventId]/pdf/page.tsx` and `app/(app)/events/[eventId]/pdf/document/page.tsx` pass:

- requested preset for active selector state
- preview preset for iframe layout/document
- download preset for modal fallback/direct export
- export gate metadata for the UI

- [ ] **Step 5: Re-run the focused route test**

Run:

```bash
npm run test -- tests/components/pdf-preview-page-route.test.tsx
npm run test -- tests/components/pdf-document-route.test.tsx
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/(app)/events/[eventId]/pdf/page.tsx app/(app)/events/[eventId]/pdf/document/page.tsx lib/pdf/output-presets.ts tests/components/pdf-preview-page-route.test.tsx tests/components/pdf-document-route.test.tsx
git commit -m "refactor: separate pdf preview and download preset state"
```

## Task 4: Keep Server-Side Download Access Control Intact

**Files:**
- Modify: `app/api/events/[eventId]/pdf/route.ts`
- Modify: `tests/api/pdf-route.test.ts`

- [ ] **Step 1: Write failing route tests for direct download access**

Add assertions that:

- free user requesting `preset=large-type` cannot get Pro output directly
- route only permits free-standard export unless the modal-confirmed request uses that fallback preset
- pro user can still request Pro preset download directly

- [ ] **Step 2: Run the focused API test to verify failure**

Run:

```bash
npm run test -- tests/api/pdf-route.test.ts
```

Expected: FAIL if current server behavior still allows the wrong preset path.

- [ ] **Step 3: Implement minimal server-side guard**

Ensure the API route:

- never returns Pro preset rendering to free users
- accepts modal-confirmed free-standard export
- preserves current authenticated ownership checks

Do not move modal behavior into the server route. The route is only the final guard.

- [ ] **Step 4: Re-run the focused API test**

Run:

```bash
npm run test -- tests/api/pdf-route.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/events/[eventId]/pdf/route.ts tests/api/pdf-route.test.ts
git commit -m "fix: enforce pdf preset export gating"
```

## Task 5: Verify End-To-End Preset Preview And Export Flow

**Files:**
- Modify: `tests/e2e/setlist-flow.spec.ts`
- Modify only if regressions appear in related preview tests

- [ ] **Step 1: Add failing E2E coverage**

Extend the Playwright flow to verify:

- free user can preview `Large Type`
- preview remains active after reload / theme switch
- free user pressing export sees the modal
- `標準プリセットで出力` triggers a free-standard download request
- `Proにアップグレード` goes to billing
- pro user can still preview and export `Large Type` directly

- [ ] **Step 2: Run the E2E slice to verify the current failure**

Run:

```bash
npm run test:e2e -- tests/e2e/setlist-flow.spec.ts
```

Expected: FAIL until the modal/export split is fully wired.

- [ ] **Step 3: Update tests and fix only real regressions**

If the E2E slice exposes missing route/UI plumbing, patch only the affected code and keep the flow aligned with the spec.

- [ ] **Step 4: Re-run the E2E slice**

Run:

```bash
npm run test:e2e -- tests/e2e/setlist-flow.spec.ts
```

Expected: PASS

- [ ] **Step 5: Run broader verification**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/setlist-flow.spec.ts tests/components/pdf-preview-page.test.tsx tests/components/pdf-preview-page-route.test.tsx tests/api/pdf-route.test.ts
git commit -m "test: verify pdf preset preview gating flow"
```

Include any additional touched files if regressions required code fixes.
