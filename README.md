# Setlist PDF Service

Setlist PDF Service is a Next.js app for managing Japanese live-show setlists, duplicating past events, exporting print-ready PDFs, and saving reusable Pro templates.

The app is prepared for Cloudflare Workers deployment with OpenNext, Better Auth, Stripe, and a Turso/libSQL database.

## PDF Rendering Model

Preview and download now share the same HTML document source.

- `/events/[eventId]/pdf` renders the operator-facing preview shell.
- `/events/[eventId]/pdf/document` renders the print document itself.
- `/api/events/[eventId]/pdf` opens that document URL in a headless browser and returns the PDF download.

That keeps theme selection, pagination, and paper output aligned end-to-end instead of maintaining separate preview and download renderers.

## Visual Validation Checklist

Use this manual spot-check pass before shipping PDF/editor polish changes:

- Dark PDF preview: low density, medium density, high density single-page, very high density multi-page.
- Downloaded PDF output: the same four density cases above.
- Light-theme spot checks: confirm structure, spacing, and pagination still read correctly.
- Dark editor comparison: match the Stitch dark editor reference for layout, contrast, and density.

## What You Can Do

- Sign up and sign in with email and password.
- Create a new event and edit its metadata and setlist.
- Duplicate an existing event as a starting point for the next show.
- Export the current setlist to PDF.
- Save a completed event as a reusable template on Pro.
- Recreate a new event from a saved template.
- Open the upgrade entrypoint from the billing page.

## Local Setup

The app is designed to run locally without Stripe. SQLite and Better Auth both use development defaults, so you can get started quickly on a fresh machine.

```bash
npm install
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`.

The landing page links to registration and login. After signing in, you can create events, duplicate them, and export PDFs without any paid setup.

## Free-Tier Friendly Workflow

- Create an account on `/register`.
- Sign in on `/login`.
- Create an event from `/events`.
- Duplicate an event from the sidebar to branch a new draft.
- Export the PDF from the event editor.
- Visit `/settings/billing` to see the upgrade entrypoint.

When you open the PDF preview, the preview shell embeds the same `/events/[eventId]/pdf/document` route that the download endpoint converts into a PDF.

Stripe is optional for local development. If Stripe keys are missing, the app still runs and shows the billing UI in a safe test-friendly state.

## Cloudflare Deployment

Recommended production stack:

- Cloudflare Workers via OpenNext
- Turso for the application database
- Better Auth for email/password auth
- Stripe for Pro billing
- Cloudflare Browser Rendering for PDF generation

Install dependencies and build the Worker bundle:

```bash
npm install
npm run cf:build
```

Preview the Cloudflare bundle locally:

```bash
cp .dev.vars.example .dev.vars
npm run preview
```

Before the first production deploy, set these secrets in Cloudflare:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Browser Rendering setup notes:

- `wrangler.jsonc` already binds Browser Rendering as `BROWSER`.
- Enable Browser Rendering for the Cloudflare account/environment that will run this Worker.
- Local development and test flows fall back to bundled Playwright, while deployed PDF generation uses the Cloudflare `BROWSER` binding when available.

Then deploy with:

```bash
npm run deploy
```

`wrangler.jsonc` is already configured for OpenNext. If you want to rename the Worker, update the `name` field before deploy.

## Pro Template Flow

If you want to test template saving locally, insert or configure an active Pro subscription in the local database, then open an event and use the template save form. The templates page lets you create a new event from a saved template.

## Scripts

- `npm run dev` - start the development server.
- `npm run db:migrate` - apply database migrations to the local SQLite database.
- `npm run test` - run the Vitest suite.
- `npm run build` - build the app for production.
- `npm run cf:build` - build the Cloudflare Worker bundle with OpenNext.
- `npm run preview` - preview the Cloudflare Worker locally with Wrangler.
- `npm run deploy` - deploy the app to Cloudflare Workers.
- `npm run cf:check` - run an OpenNext build and a Wrangler dry-run deploy check.
- `npm run test:e2e -- tests/e2e/setlist-flow.spec.ts` - run the Playwright MVP flow.

## E2E Notes

Playwright runs against `http://localhost:3000` and starts a production `next start` server after migrations and build. That keeps Better Auth, server actions, the embedded document preview, and PDF export behavior aligned with the deployed app instead of relying on `next dev`.

## Environment

Optional values for Stripe and production auth are read from the environment when you want to enable billing.

- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `BETTER_AUTH_SECRET`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

You can leave the Stripe variables unset for local development and still work through the full free-tier event flow.
