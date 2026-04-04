# Login Stitch Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/login` into a Stitch-style backstage auth screen and make `/register` share the same auth shell while preserving the existing Better Auth flows.

**Architecture:** Split the auth experience into a shared outer shell and a focused form body. The pages under `app/(auth)` should own the shell layout and page copy, while `AuthForm` becomes the right-column form panel that switches behavior by mode. Keep all sign-in/sign-up logic intact and treat this as a layout/component refactor rather than a flow rewrite.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Better Auth client, Vitest

---

## File Map

### Existing files to modify

- `app/(auth)/login/page.tsx`
  - Replace the single-card page with the new Stitch-style auth shell composition for login mode.
- `app/(auth)/register/page.tsx`
  - Reuse the same auth shell composition for register mode with adjusted copy.
- `components/auth-form.tsx`
  - Narrow responsibility to the right-side form panel and restyle fields, CTA, and alternate action to fit the new shell.
- `tests/components/auth-form.test.tsx`
  - Keep behavior coverage for login/register logic and extend assertions that match the new panel structure/copy.

### New files likely to create

- `components/auth-shell.tsx`
  - Shared auth layout with top bar, left value panel, right panel slot, and bottom feature cards.
- `tests/components/auth-shell.test.tsx` or `tests/app/auth-pages.test.tsx`
  - Coverage for login/register layout composition if needed.

### Files to leave unchanged unless a regression proves otherwise

- `lib/auth-client.ts`
- `app/page.tsx`
- authenticated app pages under `app/(app)`

Do not duplicate shell markup between login and register if a shared component can keep it readable.

## Reference Material

- Spec: `docs/superpowers/specs/2026-04-04-login-stitch-alignment-design.md`
- Current login page: `app/(auth)/login/page.tsx`
- Current register page: `app/(auth)/register/page.tsx`
- Current auth logic: `components/auth-form.tsx`
- Existing auth behavior tests: `tests/components/auth-form.test.tsx`
- Stitch reference assets:
  - `design/stitch/project-16774743705046066908/images/f9c3eee4339c46049b5b1af0d940d935-login-signup.png`
  - `design/stitch/project-16774743705046066908/screens/f9c3eee4339c46049b5b1af0d940d935-login-signup.html`

## Task 1: Lock In Stitch-Style Auth Layout Expectations With Failing Tests

**Files:**
- Modify: `tests/components/auth-form.test.tsx`
- Create or Modify: `tests/app/auth-pages.test.tsx` (or similar focused auth-page test file)

- [ ] **Step 1: Write failing layout-level assertions**

Add targeted tests that expect:

- `/login` renders a top-level backstage shell rather than only a centered card
- the page shows a left-side value message and a right-side login panel
- `/register` uses the same shell family while switching the form mode
- `AuthForm` still exposes register-only `名前` and correct alternate links by mode

Suggested assertions:

```tsx
expect(screen.getByText("SHOWRUNNER")).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "現場のためのセットリスト作成。" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "ログイン" })).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused auth tests to verify they fail**

Run:

```bash
npm run test -- tests/components/auth-form.test.tsx tests/app/auth-pages.test.tsx
```

Expected: FAIL because the current auth pages still render a single centered card and there is no shared auth shell.

- [ ] **Step 3: Trim any brittle assertion**

Keep the failing tests focused on:

- shell presence
- key Stitch-inspired copy blocks
- mode-specific form behavior

Avoid locking in every decorative detail.

- [ ] **Step 4: Re-run the focused auth tests**

Run:

```bash
npm run test -- tests/components/auth-form.test.tsx tests/app/auth-pages.test.tsx
```

Expected: targeted failures only.

- [ ] **Step 5: Commit**

```bash
git add tests/components/auth-form.test.tsx tests/app/auth-pages.test.tsx
git commit -m "test: define stitch auth layout expectations"
```

## Task 2: Build A Shared Auth Shell

**Files:**
- Create: `components/auth-shell.tsx`
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Implement the shared shell component**

Create `AuthShell` to own:

- top bar with `SHOWRUNNER`
- centered max-width auth stage
- left marketing/value panel
- right content slot
- bottom feature cards

The shell should accept mode-aware copy or slots rather than hardcoding everything to login-only text.

- [ ] **Step 2: Wire `/login` and `/register` through the shell**

Update both route files so:

- `/login` passes login-specific headings and labels
- `/register` passes register-specific headings where needed
- both pages render `AuthForm` inside the right panel

- [ ] **Step 3: Run the focused auth tests**

Run:

```bash
npm run test -- tests/components/auth-form.test.tsx tests/app/auth-pages.test.tsx
```

Expected: shell-level assertions begin passing, while form-panel styling assertions may still fail.

- [ ] **Step 4: Keep layout semantics simple**

If the shell starts to duplicate content between login and register, extract small copy props instead of branching deeply in the JSX.

- [ ] **Step 5: Commit**

```bash
git add components/auth-shell.tsx app/(auth)/login/page.tsx app/(auth)/register/page.tsx tests/app/auth-pages.test.tsx
git commit -m "feat: add stitch-inspired auth shell"
```

## Task 3: Restyle AuthForm As The Right-Side Operator Panel

**Files:**
- Modify: `components/auth-form.tsx`
- Modify: `tests/components/auth-form.test.tsx`

- [ ] **Step 1: Refine the form panel structure**

Update `AuthForm` so it feels like the right-side panel from Stitch:

- uppercase/system-style overline
- mode-aware heading
- compact helper copy
- underlined or bottom-bordered inputs instead of rounded standalone card fields
- strong yellow primary CTA
- secondary alternate action as a bordered block or lower-emphasis panel action
- small status/meta row if it fits naturally

Preserve:

- submit handlers
- pending labels
- error rendering
- alternate navigation

- [ ] **Step 2: Keep register-only field behavior intact**

Ensure:

- `名前` only appears in register mode
- callback URLs stay `/events`
- router push/refresh remain unchanged

- [ ] **Step 3: Run the focused auth tests**

Run:

```bash
npm run test -- tests/components/auth-form.test.tsx tests/app/auth-pages.test.tsx
```

Expected: PASS

- [ ] **Step 4: Add one more assertion only if needed**

If the new panel structure is not yet covered, add a single assertion for the new operator-panel heading/copy without over-constraining styles.

- [ ] **Step 5: Commit**

```bash
git add components/auth-form.tsx tests/components/auth-form.test.tsx tests/app/auth-pages.test.tsx
git commit -m "style: align auth form with stitch login"
```

## Task 4: Final Regression Sweep

**Files:**
- Modify only if regressions require it:
  - `tests/app-page.test.tsx`

- [ ] **Step 1: Run focused auth regression**

Run:

```bash
npm run test -- tests/components/auth-form.test.tsx tests/app/auth-pages.test.tsx tests/app-page.test.tsx
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

- [ ] **Step 3: Update only legitimate regression tests**

If the home page or auth wording changed intentionally, update those expectations. Do not rewrite unrelated tests.

- [ ] **Step 4: Re-run the minimal changed tests if needed**

Run:

```bash
npm run test -- tests/components/auth-form.test.tsx tests/app/auth-pages.test.tsx tests/app-page.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/auth-shell.tsx components/auth-form.tsx app/(auth)/login/page.tsx app/(auth)/register/page.tsx tests/components/auth-form.test.tsx tests/app/auth-pages.test.tsx tests/app-page.test.tsx
git commit -m "style: align login pages with stitch auth layout"
```
