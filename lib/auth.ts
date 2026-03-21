import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db, dbReady } from "./db/client";
import { schema } from "./db/schema";
import { env } from "./env";
import { getStripeSubscriptionPlans } from "./stripe/plans";

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");
const shouldCreateStripeCustomers = env.isStripeConfigured && !env.isTest;

export const auth = betterAuth({
  appName: "Setlist PDF Service",
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [new URL(env.BETTER_AUTH_URL).origin],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET ?? "whsec_placeholder",
      createCustomerOnSignUp: shouldCreateStripeCustomers,
      subscription: {
        enabled: true,
        plans: getStripeSubscriptionPlans(
          env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "price_placeholder_pro_monthly",
        ),
      },
    }),
  ],
  hooks: {
    before: createAuthMiddleware(async () => {
      await dbReady;
    }),
  },
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = typeof auth.$Infer.Session.user;

export async function getRequestHeaders() {
  return new Headers(await headers());
}

export async function getAuthSession() {
  return auth.api.getSession({
    headers: await getRequestHeaders(),
  });
}

export async function requireAuthSession() {
  const session = await getAuthSession();

  if (!session?.user.id) {
    throw new Error("Unauthorized.");
  }

  return session;
}
