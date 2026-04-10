# Loading Text Shimmer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ログイン中や読み込み中の文言に共通の text shimmer を入れて、pending / loading 状態がより自然に伝わるようにする。

**Architecture:** 小さな `AnimatedLoadingText` コンポーネントを新設し、pending / loading 文言の表示責務だけを共通化する。`FormPendingButton` は `pendingLabel: string` のまま内部で shimmer 化し、`DashboardShell` は `title` と `description` を `ReactNode` 対応にして loading shell 側から shimmer を直接渡す。`prefers-reduced-motion` では通常テキストへ落とす。

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, existing loading shells and pending controls, Vitest, Testing Library

---

## File Map

### New files to create

- `components/animated-loading-text.tsx`
  - shimmer text の見た目専用コンポーネント。文字列と className を受け、text shimmer と reduced-motion fallback を提供する。
- `tests/components/form-pending-button.test.tsx`
  - `FormPendingButton` が pending 時に shimmer text を内部利用することを直接固定する。

### Existing files to modify

- `components/form-pending-button.tsx`
  - `pendingLabel` は string のまま維持し、pending 時だけ `AnimatedLoadingText` で包む。
- `components/auth-form.tsx`
  - `ログイン中...` / `アカウントを作成中...` を shimmer 表示へ切り替える。
- `components/loading-shells.tsx`
  - `読み込み中...` / `PDFプレビューを準備中...` を shimmer 表示へ変える。
- `components/upgrade-card.tsx`
  - `チェックアウトを準備中...` を shimmer 表示へ変える。
- `components/export-pdf-button.tsx`
  - overlay の `PDFプレビューを準備中...` を shimmer 表示へ変える。
- `components/dashboard-shell.tsx`
  - `title` / `description` を `ReactNode` 対応に広げる。
- `tests/components/auth-form.test.tsx`
  - auth pending 文言が shimmer component を使うことを固定する。
- `tests/components/editor-loading-shell.test.tsx`
  - `DashboardShell` 経由の loading title shimmer を固定する。
- `tests/components/templates-loading-shell.test.tsx`
  - templates loading の shimmer title を固定する。
- `tests/components/pdf-export-loading.test.tsx`
  - PDF overlay / preview loading の shimmer 文言を固定する。
- `tests/components/billing-page.test.tsx`
  - upgrade pending shimmer を固定する。

### Files to inspect during implementation

- `components/dashboard-shell.tsx`
  - title / description が 2 箇所でどう使われているかの確認。
- `components/form-pending-button.tsx`
  - API を広げずに済む差し込み位置の確認。
- `components/loading-shells.tsx`
  - shimmer を見出しだけにとどめるか、他文言へ広げないかの境界確認。

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-10-loading-text-shimmer-design.md`
- Existing loading / pending UI:
  - `components/form-pending-button.tsx`
  - `components/auth-form.tsx`
  - `components/loading-shells.tsx`
  - `components/upgrade-card.tsx`
  - `components/export-pdf-button.tsx`

## Task 1: Create Shared Animated Loading Text Primitive

**Files:**
- Create: `components/animated-loading-text.tsx`
- Modify: `tests/components/auth-form.test.tsx`

- [ ] **Step 1: Write the failing reduced-motion-friendly shimmer test**

Add a focused test that renders the new component and asserts:

- the text content is unchanged
- shimmer-specific class hooks exist
- reduced-motion fallback hooks exist

Suggested assertions:

```tsx
expect(screen.getByText("ログイン中...")).toBeInTheDocument();
expect(element.className).toContain("motion-safe:");
expect(element.className).toContain("motion-reduce:");
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test -- tests/components/auth-form.test.tsx
```

Expected: FAIL because there is no shared shimmer component yet.

- [ ] **Step 3: Implement `AnimatedLoadingText`**

Create the component so it:

- renders the same text content
- applies a subtle text shimmer effect
- respects reduced-motion
- works in inline and block contexts

- [ ] **Step 4: Re-run the focused test**

Run:

```bash
npm run test -- tests/components/auth-form.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/animated-loading-text.tsx tests/components/auth-form.test.tsx
git commit -m "feat: add animated loading text primitive"
```

## Task 2: Apply Shimmer To Pending Controls

**Files:**
- Modify: `components/form-pending-button.tsx`
- Modify: `components/auth-form.tsx`
- Modify: `components/upgrade-card.tsx`
- Create: `tests/components/form-pending-button.test.tsx`
- Modify: `tests/components/auth-form.test.tsx`
- Modify: `tests/components/billing-page.test.tsx`

- [ ] **Step 1: Write the failing pending-state tests**

Add tests proving:

- `AuthForm` shows shimmer text while pending
- `FormPendingButton` wraps pending labels internally without widening `pendingLabel` beyond string
- `UpgradeCard` shows shimmer text during checkout preparation

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test -- tests/components/form-pending-button.test.tsx tests/components/auth-form.test.tsx tests/components/billing-page.test.tsx
```

Expected: FAIL because the pending states are still plain text.

- [ ] **Step 3: Implement shimmer in pending controls**

Update:

- `FormPendingButton`
- `AuthForm`
- `UpgradeCard`

so their pending copy uses `AnimatedLoadingText` while keeping existing button widths and semantics stable.

- [ ] **Step 4: Re-run the focused tests**

Run:

```bash
npm run test -- tests/components/form-pending-button.test.tsx tests/components/auth-form.test.tsx tests/components/billing-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/form-pending-button.tsx components/auth-form.tsx components/upgrade-card.tsx tests/components/form-pending-button.test.tsx tests/components/auth-form.test.tsx tests/components/billing-page.test.tsx
git commit -m "feat: shimmer pending text across auth and billing"
```

## Task 3: Apply Shimmer To Loading Shells And PDF Overlay

**Files:**
- Modify: `components/dashboard-shell.tsx`
- Modify: `components/loading-shells.tsx`
- Modify: `components/export-pdf-button.tsx`
- Modify: `tests/components/editor-loading-shell.test.tsx`
- Modify: `tests/components/templates-loading-shell.test.tsx`
- Modify: `tests/components/pdf-export-loading.test.tsx`

- [ ] **Step 1: Write the failing loading-state tests**

Add tests proving:

- `EditorLoadingShell` title shimmer works through `DashboardShell`
- `TemplatesLoadingShell` title shimmer renders
- `PdfPreviewLoadingShell` title shimmer renders
- `ExportPdfButton` overlay title shimmer renders

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test -- tests/components/editor-loading-shell.test.tsx tests/components/templates-loading-shell.test.tsx tests/components/pdf-export-loading.test.tsx
```

Expected: FAIL because these texts are still plain strings.

- [ ] **Step 3: Implement shimmer in loading shells**

Update:

- `DashboardShell` to accept `ReactNode` for `title` / `description`
- `loading-shells.tsx`
- `export-pdf-button.tsx`

so loading headings use `AnimatedLoadingText` without changing layout or status semantics.

- [ ] **Step 4: Re-run the focused tests**

Run:

```bash
npm run test -- tests/components/editor-loading-shell.test.tsx tests/components/templates-loading-shell.test.tsx tests/components/pdf-export-loading.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/dashboard-shell.tsx components/loading-shells.tsx components/export-pdf-button.tsx tests/components/editor-loading-shell.test.tsx tests/components/templates-loading-shell.test.tsx tests/components/pdf-export-loading.test.tsx
git commit -m "feat: shimmer loading shell text"
```

## Task 4: Final Verification

**Files:**
- Inspect only: `components/animated-loading-text.tsx`
- Inspect only: `components/form-pending-button.tsx`
- Inspect only: `components/auth-form.tsx`
- Inspect only: `components/loading-shells.tsx`
- Inspect only: `components/upgrade-card.tsx`
- Inspect only: `components/export-pdf-button.tsx`
- Inspect only: related tests

- [ ] **Step 1: Run the focused component tests**

Run:

```bash
npm run test -- tests/components/form-pending-button.test.tsx tests/components/auth-form.test.tsx tests/components/billing-page.test.tsx tests/components/editor-loading-shell.test.tsx tests/components/templates-loading-shell.test.tsx tests/components/pdf-export-loading.test.tsx
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

- [ ] **Step 4: Commit follow-up fixes if needed**

If verification required final touch-ups:

```bash
git add components/animated-loading-text.tsx components/form-pending-button.tsx components/auth-form.tsx components/dashboard-shell.tsx components/loading-shells.tsx components/upgrade-card.tsx components/export-pdf-button.tsx tests/components/form-pending-button.test.tsx tests/components/auth-form.test.tsx tests/components/billing-page.test.tsx tests/components/editor-loading-shell.test.tsx tests/components/templates-loading-shell.test.tsx tests/components/pdf-export-loading.test.tsx
git commit -m "chore: finalize loading shimmer states"
```

If no follow-up edits were needed, skip this commit.
