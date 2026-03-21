import type { StripePlan } from "@better-auth/stripe";

export const APP_PLAN_NAMES = {
  free: "free",
  pro: "pro",
} as const;

export type AppPlan = (typeof APP_PLAN_NAMES)[keyof typeof APP_PLAN_NAMES];

export const PRO_MONTHLY_PRICE_LABEL = "$9 / month";

export function getStripeSubscriptionPlans(priceId: string): StripePlan[] {
  return [
    {
      name: APP_PLAN_NAMES.pro,
      priceId,
    },
  ];
}
