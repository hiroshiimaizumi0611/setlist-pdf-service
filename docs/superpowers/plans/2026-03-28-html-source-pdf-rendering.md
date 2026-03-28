# HTML Source PDF Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the previewed setlist paper and the downloaded PDF come from the exact same HTML/CSS document so they no longer drift.

**Architecture:** Replace the current dual-renderer setup with a single print-document route that renders the real paper in React/Tailwind. The preview page embeds that route directly, and the download API generates PDF bytes from the same route through a runtime facade that uses Cloudflare Browser Rendering in production and Playwright/Chromium locally.

**Tech Stack:** Next.js App Router, React Server Components, Tailwind CSS, Cloudflare Browser Rendering, Playwright, Vitest, Playwright E2E

---

## File Map

### Existing files to modify

- `app/(app)/events/[eventId]/pdf/page.tsx`
  - Keep the authenticated preview shell route, but stop building a fake paper preview and instead pass a real document URL into the page.
- `app/api/events/[eventId]/pdf/route.ts`
  - Replace `pdf-lib` rendering with HTML-source PDF generation through the shared document URL.
- `components/pdf-preview-page.tsx`
  - Replace the left-column React paper reconstruction with an embedded document viewport.
- `components/pdf-preview-inspector.tsx`
  - Keep the inspector shell, but make it coordinate theme switching with the embedded document and download URL.
- `lib/pdf/build-layout.ts`
  - Continue to build warnings and page-grouped presentation data, but shape it for the print document instead of a `pdf-lib` renderer.
- `lib/env.ts`
  - Expose any runtime flags needed to select Browser Rendering vs local fallback without breaking local/test defaults.
- `wrangler.jsonc`
  - Register the Browser Rendering binding for Cloudflare production.
- `package.json`
  - Keep scripts aligned with the new PDF stack and remove legacy PDF renderer dependencies once no longer used.
- `package-lock.json`
  - Capture dependency changes after removing `pdf-lib` / `fontkit` or adding anything required for the new runtime.
- `README.md`
  - Update local/prod PDF behavior and Cloudflare deployment notes.
- `tests/pdf/layout.test.ts`
  - Keep layout assertions focused on the shared document model and warnings.
- `tests/components/pdf-preview-page.test.tsx`
  - Assert iframe/object embedding, theme parity, and inspector behavior.
- `tests/components/pdf-preview-page-route.test.tsx`
  - Assert the preview route passes the real document URL and shared layout data.
- `tests/api/pdf-route.test.ts`
  - Assert the API signs a document URL and delegates PDF generation through the new facade.
- `tests/e2e/setlist-flow.spec.ts`
  - Verify the editor -> preview -> document -> download flow still works end-to-end.
- `tests/env/env.test.ts`
  - Cover any new env branching required by Browser Rendering/local fallback.

### New files to create

- `app/(app)/events/[eventId]/pdf/document/page.tsx`
  - Server route that returns only the print document markup and authorizes access via session or short-lived token.
- `components/pdf-document.tsx`
  - The single source of truth for the printable setlist document, including print CSS and page markup.
- `lib/pdf/document-token.ts`
  - Sign and verify short-lived internal document-access tokens tied to `eventId`, `theme`, and expiry.
- `lib/pdf/document-url.ts`
  - Build canonical absolute URLs for the document route so preview, download, and local fallback all hit the same HTML source.
- `lib/pdf/generate-pdf-from-document.ts`
  - Runtime facade that opens the document URL and returns PDF bytes through Browser Rendering or local Playwright.
- `tests/pdf/document-token.test.ts`
  - Unit tests for token signing, expiry, theme claims, and tamper detection.
- `tests/pdf/document-url.test.ts`
  - Unit tests for canonical document URL construction.
- `tests/components/pdf-document.test.tsx`
  - Component tests for the printable paper markup itself.
- `tests/components/pdf-document-route.test.tsx`
  - Route-level tests for session auth, token auth, theme fallback, and rejection behavior.
- `tests/pdf/generate-pdf-from-document.test.ts`
  - Unit tests for runtime selection and PDF-generation delegation.

### Files expected to be deleted

- `components/pdf-sheet-preview.tsx`
  - No longer needed once the preview page embeds the real document route.
- `lib/pdf/render-setlist-pdf.ts`
  - Obsolete after HTML-source PDF generation replaces `pdf-lib`.
- `lib/pdf/load-font.ts`
  - Obsolete after font handling moves to browser rendering and document-served fonts.
- `tests/pdf/render-setlist-pdf.test.ts`
  - Delete with the legacy renderer.
- `tests/pdf/load-font.test.ts`
  - Delete with the legacy font loader.

## Task 1: Add shared document token and URL helpers

**Files:**
- Create: `lib/pdf/document-token.ts`
- Create: `lib/pdf/document-url.ts`
- Test: `tests/pdf/document-token.test.ts`
- Test: `tests/pdf/document-url.test.ts`

- [ ] **Step 1: Write failing helper tests**

Add tests that expect:
- `signPdfDocumentToken()` to encode `eventId`, `theme`, and expiry
- `verifyPdfDocumentToken()` to reject expired or tampered tokens
- `buildPdfDocumentUrl()` to return an absolute `/events/[eventId]/pdf/document?...` URL
- optional token parameters to round-trip correctly

- [ ] **Step 2: Run the failing helper tests**

Run: `npm run test -- tests/pdf/document-token.test.ts tests/pdf/document-url.test.ts`
Expected: FAIL because the helper modules do not exist yet.

- [ ] **Step 3: Implement the minimal helpers**

Create:
- `lib/pdf/document-token.ts` with `signPdfDocumentToken()` and `verifyPdfDocumentToken()`
- `lib/pdf/document-url.ts` with a single absolute-URL builder used by preview and download code

Implementation notes:
- derive the signing secret from existing server config so no new secret is required for MVP
- keep the token payload intentionally small: `eventId`, `theme`, `exp`
- keep URL generation deterministic so tests and E2E can assert exact values

- [ ] **Step 4: Run the focused helper tests**

Run: `npm run test -- tests/pdf/document-token.test.ts tests/pdf/document-url.test.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 1**

```bash
git add lib/pdf/document-token.ts lib/pdf/document-url.ts tests/pdf/document-token.test.ts tests/pdf/document-url.test.ts
git commit -m "feat: add shared pdf document helpers"
```

## Task 2: Build the printable HTML document and document route

**Files:**
- Modify: `lib/pdf/build-layout.ts`
- Create: `components/pdf-document.tsx`
- Create: `app/(app)/events/[eventId]/pdf/document/page.tsx`
- Test: `tests/pdf/layout.test.ts`
- Test: `tests/components/pdf-document.test.tsx`
- Test: `tests/components/pdf-document-route.test.tsx`

- [ ] **Step 1: Write failing tests for the HTML source document**

Extend and add tests that expect:
- `buildSetlistPdfLayout()` to continue returning page-grouped rows and warnings suitable for document rendering
- `PdfDocument` to render the approved paper structure for `song`, `mc`, `transition`, and `heading`
- the document route to allow normal session access
- the document route to allow valid token access
- invalid or expired tokens to be rejected

- [ ] **Step 2: Run the failing document tests**

Run: `npm run test -- tests/pdf/layout.test.ts tests/components/pdf-document.test.tsx tests/components/pdf-document-route.test.tsx`
Expected: FAIL because the HTML document component and route do not exist yet.

- [ ] **Step 3: Implement the document source of truth**

Update `lib/pdf/build-layout.ts` only as needed so the document renderer has clean page, row, and warning data.

Create:
- `components/pdf-document.tsx`
- `app/(app)/events/[eventId]/pdf/document/page.tsx`

Implementation notes:
- `PdfDocument` owns the real paper markup and print rules, including `@page` and page-break behavior
- the route must return only paper markup, with no app chrome
- session auth is the default path for preview embedding
- token auth is the internal path for PDF generation
- keep theme handling identical to preview/download: invalid query values fall back to `light`

- [ ] **Step 4: Run the focused document tests**

Run: `npm run test -- tests/pdf/layout.test.ts tests/components/pdf-document.test.tsx tests/components/pdf-document-route.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit Task 2**

```bash
git add lib/pdf/build-layout.ts components/pdf-document.tsx app/'(app)'/events/'[eventId]'/pdf/document/page.tsx tests/pdf/layout.test.ts tests/components/pdf-document.test.tsx tests/components/pdf-document-route.test.tsx
git commit -m "feat: add html source pdf document"
```

## Task 3: Rebuild the preview page around the real document

**Files:**
- Modify: `app/(app)/events/[eventId]/pdf/page.tsx`
- Modify: `components/pdf-preview-page.tsx`
- Modify: `components/pdf-preview-inspector.tsx`
- Delete: `components/pdf-sheet-preview.tsx`
- Test: `tests/components/pdf-preview-page.test.tsx`
- Test: `tests/components/pdf-preview-page-route.test.tsx`

- [ ] **Step 1: Write failing preview-shell tests**

Update preview tests so they expect:
- the left column to embed the document route via `iframe` or `object`
- the embedded URL to come from `buildPdfDocumentUrl()`
- theme switching to update both the embedded document URL and the download URL
- the old direct paper rows (`M01`, `[ MC ]`, page stacks) to no longer render in the preview shell itself

- [ ] **Step 2: Run the failing preview tests**

Run: `npm run test -- tests/components/pdf-preview-page.test.tsx tests/components/pdf-preview-page-route.test.tsx`
Expected: FAIL because the preview shell still renders the old `PdfSheetPreview` component.

- [ ] **Step 3: Implement the embedded-document preview**

Update:
- `app/(app)/events/[eventId]/pdf/page.tsx`
- `components/pdf-preview-page.tsx`
- `components/pdf-preview-inspector.tsx`

Delete:
- `components/pdf-sheet-preview.tsx`

Implementation notes:
- preserve the Stitch-style workspace shell and inspector
- give the embedded document a stable accessible name such as `紙面プレビュー`
- keep the current preview page URL shape: `/events/[eventId]/pdf?theme=...`
- pass warnings into the inspector exactly as before

- [ ] **Step 4: Run the focused preview tests**

Run: `npm run test -- tests/components/pdf-preview-page.test.tsx tests/components/pdf-preview-page-route.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit Task 3**

```bash
git add app/'(app)'/events/'[eventId]'/pdf/page.tsx components/pdf-preview-page.tsx components/pdf-preview-inspector.tsx tests/components/pdf-preview-page.test.tsx tests/components/pdf-preview-page-route.test.tsx
git rm components/pdf-sheet-preview.tsx
git commit -m "feat: embed real pdf document in preview"
```

## Task 4: Generate PDF from the shared document URL

**Files:**
- Create: `lib/pdf/generate-pdf-from-document.ts`
- Modify: `app/api/events/[eventId]/pdf/route.ts`
- Modify: `lib/env.ts`
- Modify: `wrangler.jsonc`
- Test: `tests/pdf/generate-pdf-from-document.test.ts`
- Test: `tests/api/pdf-route.test.ts`
- Test: `tests/env/env.test.ts`

- [ ] **Step 1: Write failing runtime and API tests**

Add tests that expect:
- `generatePdfFromDocument()` to choose Cloudflare Browser Rendering when the binding is available
- `generatePdfFromDocument()` to fall back to Playwright locally
- the API route to sign a document token, build the document URL, and call the generator facade
- the API route to preserve the current filename and attachment behavior

- [ ] **Step 2: Run the failing runtime and API tests**

Run: `npm run test -- tests/pdf/generate-pdf-from-document.test.ts tests/api/pdf-route.test.ts tests/env/env.test.ts`
Expected: FAIL because the generation facade does not exist and the API still imports `renderSetlistPdf()`.

- [ ] **Step 3: Implement the HTML-source PDF generation path**

Create:
- `lib/pdf/generate-pdf-from-document.ts`

Update:
- `app/api/events/[eventId]/pdf/route.ts`
- `lib/env.ts`
- `wrangler.jsonc`

Implementation notes:
- use a single facade API such as `generatePdfFromDocument({ documentUrl })`
- production path: Cloudflare Browser Rendering opens the document URL and returns `page.pdf()` bytes
- local/test path: dynamic-import Playwright, open the same document URL, and call `page.pdf()`
- keep binary response headers unchanged from the user’s point of view
- do not reintroduce a second layout source anywhere in the PDF pipeline

- [ ] **Step 4: Run the focused runtime and API tests**

Run: `npm run test -- tests/pdf/generate-pdf-from-document.test.ts tests/api/pdf-route.test.ts tests/env/env.test.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 4**

```bash
git add lib/pdf/generate-pdf-from-document.ts app/api/events/'[eventId]'/pdf/route.ts lib/env.ts wrangler.jsonc tests/pdf/generate-pdf-from-document.test.ts tests/api/pdf-route.test.ts tests/env/env.test.ts
git commit -m "feat: generate pdfs from shared document html"
```

## Task 5: Remove the legacy renderer and verify full parity

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `README.md`
- Modify: `tests/e2e/setlist-flow.spec.ts`
- Delete: `lib/pdf/render-setlist-pdf.ts`
- Delete: `lib/pdf/load-font.ts`
- Delete: `tests/pdf/render-setlist-pdf.test.ts`
- Delete: `tests/pdf/load-font.test.ts`

- [ ] **Step 1: Write the final failing flow assertions**

Update E2E so it expects:
- preview to expose an embedded document URL under `/events/[eventId]/pdf/document`
- the download endpoint to keep returning a valid PDF
- the preview theme and download theme to stay aligned end-to-end

- [ ] **Step 2: Run the failing E2E flow**

Run: `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`
Expected: FAIL until the final integration and cleanup are complete.

- [ ] **Step 3: Remove obsolete renderer code and refresh docs**

Delete:
- `lib/pdf/render-setlist-pdf.ts`
- `lib/pdf/load-font.ts`
- `tests/pdf/render-setlist-pdf.test.ts`
- `tests/pdf/load-font.test.ts`

Update:
- `package.json`
- `package-lock.json`
- `README.md`
- `tests/e2e/setlist-flow.spec.ts`

Implementation notes:
- remove `pdf-lib` and `fontkit` dependencies only after the app and tests no longer reference them
- document that preview and download now share the same HTML source
- document any Browser Rendering setup needed in Cloudflare

- [ ] **Step 4: Run the full verification suite**

Run: `npm run test`
Expected: PASS

Run: `npm run lint`
Expected: PASS

Run: `npm run typecheck`
Expected: PASS

Run: `npm run build`
Expected: PASS

Run: `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts`
Expected: PASS

Run: `npm run cf:check`
Expected: PASS or only non-blocking Cloudflare dry-run warnings with exit code 0

- [ ] **Step 5: Commit Task 5**

```bash
git add package.json package-lock.json README.md tests/e2e/setlist-flow.spec.ts
git rm lib/pdf/render-setlist-pdf.ts lib/pdf/load-font.ts tests/pdf/render-setlist-pdf.test.ts tests/pdf/load-font.test.ts
git commit -m "refactor: unify preview and download pdf rendering"
```
