import type { Subscription } from "@better-auth/stripe";
import { auth, getAuthSession, getRequestHeaders, type Session } from "./auth";
import { env } from "./env";
import { APP_PLAN_NAMES, type AppPlan } from "./stripe/plans";

export type CurrentPlan = {
  plan: AppPlan;
  isPro: boolean;
  activeSubscription: Subscription | null;
  billingConfigured: boolean;
  isTestMode: boolean;
};

export type SessionWithPlan = {
  session: Session;
  currentPlan: CurrentPlan;
};

export function resolveCurrentPlan(
  subscriptions: Pick<Subscription, "plan">[],
): AppPlan {
  return subscriptions.some(
    (subscription) =>
      subscription.plan.toLowerCase() === APP_PLAN_NAMES.pro,
  )
    ? APP_PLAN_NAMES.pro
    : APP_PLAN_NAMES.free;
}

function getFreePlan(): CurrentPlan {
  return {
    plan: APP_PLAN_NAMES.free,
    isPro: false,
    activeSubscription: null,
    billingConfigured: env.isStripeConfigured,
    isTestMode: env.isTest || env.STRIPE_SECRET_KEY?.startsWith("sk_test_") === true,
  };
}

async function getCurrentPlanForUser(userId: string): Promise<CurrentPlan> {
  const subscriptions = await auth.api.listActiveSubscriptions({
    query: {
      referenceId: userId,
      customerType: "user",
    },
    headers: await getRequestHeaders(),
  });

  const plan = resolveCurrentPlan(subscriptions);
  const activeSubscription =
    subscriptions.find(
      (subscription) =>
        subscription.plan.toLowerCase() === APP_PLAN_NAMES.pro,
    ) ?? null;

  return {
    plan,
    isPro: plan === APP_PLAN_NAMES.pro,
    activeSubscription,
    billingConfigured: env.isStripeConfigured,
    isTestMode: env.isTest || env.STRIPE_SECRET_KEY?.startsWith("sk_test_") === true,
  };
}

export async function getCurrentPlan(): Promise<CurrentPlan> {
  const session = await getAuthSession();

  if (!session?.user.id) {
    return getFreePlan();
  }

  return getCurrentPlanForUser(session.user.id);
}

export async function getAuthSessionWithPlan(): Promise<SessionWithPlan | null> {
  const session = await getAuthSession();

  if (!session?.user.id) {
    return null;
  }

  return {
    session,
    currentPlan: await getCurrentPlanForUser(session.user.id),
  };
}

export async function requireAuthSessionWithPlan(): Promise<SessionWithPlan> {
  const authSession = await getAuthSessionWithPlan();

  if (!authSession) {
    throw new Error("Unauthorized.");
  }

  return authSession;
}
