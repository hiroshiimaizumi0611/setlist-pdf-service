# Billing Stitch Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose `/settings/billing` into a Stitch-style subscription management screen with a settings sidebar, top bar, current-plan hero, comparison table, and payment/history blocks, without changing billing logic.

**Architecture:** Keep all billing behavior in `BillingPageContent` and the existing upgrade / portal actions, but split presentation into smaller billing-specific layout components. The page should behave like a settings subsection rather than a standalone card. Reuse existing CTA logic from `UpgradeCard` only where it still fits; otherwise pull the relevant behavior into page-owned sections and reduce `UpgradeCard` responsibility accordingly.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Better Auth client, Vitest

---

## File Map

### Existing files to modify

- `app/(app)/settings/billing/page.tsx`
  - Recompose the page into Stitch-style settings layout and preserve billing actions.
- `components/upgrade-card.tsx`
  - Reduce or reshape responsibility if the page absorbs the current-plan hero / CTA area.
- `tests/components/billing-page.test.tsx`
  - Update expectations from simple card layout to full subscription-management screen structure.

### New files likely to create

- `components/settings-sidebar.tsx`
  - Shared dark settings nav visual component for the billing screen.
- `components/billing-comparison-table.tsx`
  - Presentational comparison table for free vs pro features.
- `components/billing-payment-section.tsx`
  - Payment method block and billing history block, including empty states.

If the page stays clearer without extracting all of these, keep extraction minimal. Prefer only the pieces that materially simplify `BillingPageContent`.

### Files to leave unchanged unless a test proves otherwise

- `components/logout-button.tsx`
- `lib/subscription.ts`
- `lib/auth.ts`
- Stripe plan constants / billing actions

Do not implement the future user menu in this task. Only leave the top-right area compatible with it.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-04-billing-stitch-alignment-design.md`
- Current billing page: `app/(app)/settings/billing/page.tsx`
- Current CTA logic: `components/upgrade-card.tsx`
- Existing billing tests: `tests/components/billing-page.test.tsx`
- Stitch reference assets:
  - `design/stitch/project-16774743705046066908/images/2ec7bfe4a9ed497490730d2dd7c562e8-billing-plan.png`
  - `design/stitch/project-16774743705046066908/screens/2ec7bfe4a9ed497490730d2dd7c562e8-billing-plan.html`

## Task 1: Lock In Stitch Billing Layout Expectations With Failing Tests

**Files:**
- Modify: `tests/components/billing-page.test.tsx`

- [ ] **Step 1: Write failing billing layout assertions**

Extend the billing page tests so they expect:

- a settings sidebar with navigation labels such as `Account`, `Billing`, `Subscription`
- a top bar label such as `Subscription Management`
- a current-plan hero block
- a comparison section (`プラン比較`)
- payment method and billing history sections
- logout still exists in the top-right action area

Suggested assertions:

```tsx
expect(screen.getByText("Subscription Management")).toBeInTheDocument();
expect(screen.getByRole("navigation", { name: "設定ナビゲーション" })).toBeInTheDocument();
expect(screen.getByText("プラン比較")).toBeInTheDocument();
expect(screen.getByText("お支払い方法")).toBeInTheDocument();
expect(screen.getByText("請求履歴")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused billing test to verify it fails**

Run:

```bash
npm run test -- tests/components/billing-page.test.tsx
```

Expected: FAIL because the current billing page is still a simpler two-column card layout.

- [ ] **Step 3: Tighten the assertions**

Remove any expectation that hardcodes every row of the comparison table. Keep only the structural signals that prove the Stitch composition exists.

- [ ] **Step 4: Re-run the focused billing test**

Run:

```bash
npm run test -- tests/components/billing-page.test.tsx
```

Expected: FAIL only on the new structural expectations.

- [ ] **Step 5: Commit**

```bash
git add tests/components/billing-page.test.tsx
git commit -m "test: define stitch billing layout expectations"
```

## Task 2: Build The Settings Shell And Subscription Hero

**Files:**
- Modify: `app/(app)/settings/billing/page.tsx`
- Create: `components/settings-sidebar.tsx` (if extraction helps)
- Optional Modify: `components/upgrade-card.tsx`

- [ ] **Step 1: Implement the settings sidebar and top bar**

Create the Stitch-style left sidebar and top bar:

- sidebar with settings nav items and active `Subscription`
- top bar with `Subscription Management`
- right-side action area that still contains logout and can later host a user menu

- [ ] **Step 2: Recompose the current-plan hero**

Move the current-plan emphasis into a large hero row:

- current plan label
- plan name
- current badges/status
- CTA on the right

Preserve all current upgrade / billing portal behavior.

- [ ] **Step 3: Run the focused billing test**

Run:

```bash
npm run test -- tests/components/billing-page.test.tsx
```

Expected: shell/top-area assertions pass; comparison/payment/history assertions may still fail.

- [ ] **Step 4: Keep the logic boundary clean**

If `UpgradeCard` no longer matches the new layout, either:

- shrink it to only the CTA logic/pending/error surface
- or absorb its behavior into the billing page and remove duplication

Choose the smaller, clearer option.

- [ ] **Step 5: Commit**

```bash
git add app/(app)/settings/billing/page.tsx components/settings-sidebar.tsx components/upgrade-card.tsx tests/components/billing-page.test.tsx
git commit -m "feat: add stitch subscription shell"
```

## Task 3: Add Comparison Table And Payment Blocks

**Files:**
- Modify: `app/(app)/settings/billing/page.tsx`
- Create or Modify:
  - `components/billing-comparison-table.tsx`
  - `components/billing-payment-section.tsx`
- Modify: `tests/components/billing-page.test.tsx`

- [ ] **Step 1: Implement the comparison section**

Render the Stitch-style comparison area with:

- `プラン比較` heading
- feature labels
- free and pro columns
- subtle pro emphasis

Keep feature copy within the current product scope.

- [ ] **Step 2: Implement payment method and billing history sections**

Render:

- payment method block
- update-payment CTA or safe placeholder
- billing history block with empty state when no data exists

Do not invent real billing-history backend data. Empty state is enough.

- [ ] **Step 3: Run the focused billing test**

Run:

```bash
npm run test -- tests/components/billing-page.test.tsx
```

Expected: PASS

- [ ] **Step 4: Add one minimal assertion if needed**

If the new sections are under-covered, add a small assertion for the empty-state copy or payment block label without over-constraining styling.

- [ ] **Step 5: Commit**

```bash
git add app/(app)/settings/billing/page.tsx components/billing-comparison-table.tsx components/billing-payment-section.tsx tests/components/billing-page.test.tsx
git commit -m "style: align billing page with stitch"
```

## Task 4: Final Regression Sweep

**Files:**
- Modify only if regressions require it:
  - `tests/components/logout-button.test.tsx`
  - `tests/components/templates-page.test.tsx`

- [ ] **Step 1: Run focused billing regression**

Run:

```bash
npm run test -- tests/components/billing-page.test.tsx tests/components/logout-button.test.tsx
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

- [ ] **Step 3: Update only legitimate regressions**

If billing composition changes surface wording intentionally, update only the tests that encode the old wording.

- [ ] **Step 4: Re-run minimal changed tests if needed**

Run:

```bash
npm run test -- tests/components/billing-page.test.tsx tests/components/logout-button.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/settings/billing/page.tsx components/settings-sidebar.tsx components/billing-comparison-table.tsx components/billing-payment-section.tsx components/upgrade-card.tsx tests/components/billing-page.test.tsx tests/components/logout-button.test.tsx
git commit -m "style: polish stitch billing management screen"
```
