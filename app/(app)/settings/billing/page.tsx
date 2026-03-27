import { redirect } from "next/navigation";
import {
  auth,
  getAuthSession,
  getRequestHeaders,
  requireAuthSession,
} from "@/lib/auth";
import { env } from "@/lib/env";
import { getCurrentPlan } from "@/lib/subscription";
import { PRO_MONTHLY_PRICE_LABEL } from "@/lib/stripe/plans";
import { getDashboardThemeStyles } from "@/components/dashboard-shell";
import { UpgradeCard } from "@/components/upgrade-card";
import type { AppPlan } from "@/lib/stripe/plans";

export const dynamic = "force-dynamic";

type BillingPageContentProps = {
  currentPlan: AppPlan;
  isStripeConfigured: boolean;
  isAuthenticated?: boolean;
  subscription: {
    status: string;
    plan?: string;
    billingInterval?: string | null;
    periodEnd?: Date | null;
    seats?: number | null;
  } | null;
};

async function openBillingPortalAction() {
  "use server";

  if (!env.isStripeConfigured) {
    throw new Error("Billing is not configured.");
  }

  const session = await requireAuthSession();
  const response = await auth.api.createBillingPortal({
    body: {
      referenceId: session.user.id,
      customerType: "user",
      returnUrl: new URL("/settings/billing", env.BETTER_AUTH_URL).toString(),
      disableRedirect: true,
    },
    headers: await getRequestHeaders(),
  });

  redirect(response.url);
}

export default async function BillingPage() {
  const session = await getAuthSession();
  const currentPlan = await getCurrentPlan();

  return (
    <BillingPageContent
      currentPlan={currentPlan.plan}
      isStripeConfigured={currentPlan.billingConfigured}
      isAuthenticated={Boolean(session?.user.id)}
      subscription={currentPlan.activeSubscription}
    />
  );
}

export function BillingPageContent({
  currentPlan,
  isStripeConfigured,
  isAuthenticated = true,
  subscription,
}: BillingPageContentProps) {
  const isPro = currentPlan === "pro";
  const theme = getDashboardThemeStyles("dark");

  return (
    <main className={`${theme.page} min-h-screen px-4 py-5 sm:px-6 lg:px-8 lg:py-8`}>
      <section className="mx-auto max-w-5xl space-y-8">
        <header className={`space-y-3 border-b-4 ${theme.border} pb-6`}>
          <p className={`font-mono text-xs font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
            設定
          </p>
          <h1 className="font-mono text-4xl font-black tracking-[-0.08em]">
            プラン管理
          </h1>
          <p className={`max-w-2xl text-sm leading-7 ${theme.mutedText}`}>
            現在のプラン確認と、テンプレート保存のアップグレード導線をまとめています。
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className={`border-2 ${theme.border} ${theme.panel} p-8`}>
            <p className={`font-mono text-xs font-semibold uppercase tracking-[0.28em] ${theme.mutedText}`}>
              現在のプラン
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <h2 className="font-mono text-5xl font-black tracking-[-0.08em]">
                {isPro ? "Pro" : "Free"}
              </h2>
              <span className={`${theme.pill} px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]`}>
                {isPro ? PRO_MONTHLY_PRICE_LABEL : "基本機能込み"}
              </span>
              {subscription ? (
                <span className={`${theme.pill} px-3 py-1 text-xs font-medium`}>
                  {subscription.status === "active" ? "有効中" : subscription.status}
                </span>
              ) : null}
            </div>
            <p className={`mt-4 text-sm leading-7 ${theme.mutedText}`}>
              {isPro
                ? "このアカウントではテンプレート保存が有効です。"
                : "イベント作成と既存テンプレートの呼び出しは無料のまま利用でき、テンプレート保存だけを Pro で解放します。"}
            </p>

            <p className={`${theme.panelAlt} ${theme.text} mt-4 border-2 ${theme.accentBorder} px-4 py-3 text-sm`}>
              Stripe test mode の設定が未完了でも画面確認できるようにしています。
            </p>
          </section>

          <UpgradeCard
            plan={currentPlan}
            billingConfigured={isStripeConfigured}
            isAuthenticated={isAuthenticated}
            currentTheme="dark"
            openBillingPortalAction={openBillingPortalAction}
            upgradeLabel="Proへアップグレード"
            billingPortalLabel="お支払い設定を開く"
            loginLabel="ログインしてアップグレード"
            loginHref="/login"
          />
        </div>
      </section>
    </main>
  );
}
