# Setlist PDF Service

Setlist PDF Service is a Next.js app for managing Japanese live-show setlists, duplicating past events, exporting print-ready PDFs, and saving reusable Pro templates.

The app is prepared for Cloudflare Workers deployment with OpenNext, Better Auth, Stripe, and a Turso/libSQL database.

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

Stripe is optional for local development. If Stripe keys are missing, the app still runs and shows the billing UI in a safe test-friendly state.

## Cloudflare Deployment

Recommended production stack:

- Cloudflare Workers via OpenNext
- Turso for the application database
- Better Auth for email/password auth
- Stripe for Pro billing

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

Playwright runs against `http://localhost:3000` and starts a production `next start` server after migrations and build. That keeps Better Auth, server actions, and PDF export behavior aligned with the deployed app instead of relying on `next dev`.

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
